'use strict'
var WebClient = require('@slack/client').WebClient;
var RtmClient = require('@slack/client').RtmClient;
var bodyParser = require('body-parser');
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var axios = require('axios');
var token = process.env.SLACK_API_TOKEN || '';
var web = new WebClient(token, {
  logLevel: 'info'
});
var rtm = new RtmClient(token, {
  logLevel: 'info'
});
var {
  User
} = require('./Models/models.js');
var {
  Reminder
} = require('./Models/models.js');
var moment = require('moment');

// var googleEvent = {};

var attachment = {
  "attachments": [{
    "fallback": "You are unable to choose a game",
    "callback_id": "reminder",
    "color": "#3AA3E3",
    "attachment_type": "default",
    "actions": [{
      "name": "confirm",
      "text": "Confirm",
      "type": "button",
      "value": "true"
    }, {
      "name": "confirm",
      "text": "Cancel",
      "type": "button",
      "value": "false"
    }]
  }]
};
var dropdown = {
  "text": "Would you like to play a game?",
  "response_type": "in_channel",
  "attachments": [{
    "text": "Choose a game to play",
    "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
    "color": "#3AA3E3",
    "attachment_type": "default",
    "callback_id": "game_selection",
    "actions": [{
      "name": "games_list",
      "text": "Pick a game...",
      "type": "select",
      "options": [{
        "text": "Hearts",
        "value": "hearts"
      }, {
        "text": "Bridge",
        "value": "bridge"
      }, {
        "text": "Checkers",
        "value": "checkers"
      }, {
        "text": "Chess",
        "value": "chess"
      }, {
        "text": "Poker",
        "value": "poker"
      }, {
        "text": "Falken's Maze",
        "value": "maze"
      }, {
        "text": "Global Thermonuclear War",
        "value": "war"
      }]
    }]
  }]
};
rtm.start();
// function ifBusy(event, accessToken) {
//   axios.post(`https://www.googleapis.com/calendar/v3/freeBusy?access_token=${accessToken}`, event).then((resp) => {
//     console.log(resp.data);
//   })
//
// }
// rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
//   // console.log(message);
//   var event = {
//     "timeMax": "2017-07-21T15:00:00-07:00",
//     "timeMin": "2017-07-21T14:00:00-07:00",
//     "items": [
//       {
//         "id": "tangziou@gmail.com"
//       }
//     ],
//     "timeZone": "America/Los_Angeles"
//   };
//   var accessToken = "ya29.GluOBLHwPOiPYxUwvAe9KY1x-QuFCyQSjVVW4e-1c2XESAH7vZka8dogEFWx2QKFEJSWWfIN8EpxkMpEqSQQxG6VuJUd9Fn24f_U95IY64fYdN6iYp9O8Cr9E_Zw";
//   ifBusy(event, accessToken);
//   return;
//   // axios.post(`https://www.googleapis.com/calendar/v3/freeBusy?access_token=${accessToken}`, event).then((resp) => {
//   //   console.log(resp.data);
//   //   return resp;
//   // });
// });

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  // console.log(message);
  if (!message.text || message.bot_id) {
    return;
  }

  var reg = /<@\w+>/g;
  var userInfo = [{
    displayName: message.user,
    email: rtm.dataStore.getUserById(message.user).profile.email
  }];
  message.text = message.text.replace(reg, function (target) {
    var userId = target.slice(2, -1);
    const AttUser = rtm.dataStore.getUserById(userId);
    // console.log(userId, '-------  ', user);
    userInfo.push({
      displayName: AttUser.profile.first_name || AttUser.profile.real_name,
      email: AttUser.profile.email
    })
    return AttUser.profile.first_name || AttUser.profile.real_name; // user.profile.email
  })

  axios.get(`https://api.api.ai/api/query?v=20150910`, {
    "headers": {
      "Authorization": 'Bearer ' + process.env.AI_TOKEN
    },
    "params": {
      "query": message.text,
      "sessionId": message.user,
      "lang": 'en',
      "timezone": "2017-07-17T16:03:07-0700"
    }
  }).then(function (response) {
    rtm.sendMessage(response.data.result.fulfillment.speech, message.channel);
    return response;
  }).then((response) => {
    // console.log('/////////////////');
    // console.log(message);
    // console.log(response.data.result.parameters);
    if (response.data.result.parameters.time && response.data.result.parameters.date) {
      var m = moment((response.data.result.parameters.date + ' ' + response.data.result.parameters.time));
      var googleEvent = {
        'start': {
          'dateTime': m.format(),
          'timeZone': 'America/Los_Angeles'
        },
        'end': {
          'dateTime': m.add(1, 'hours').format(),
          'timeZone': 'America/Los_Angeles'
        },
        'location': response.data.result.parameters['geo-city'],
        'summary': response.data.result.parameters.action[0],
        "attendees": userInfo
      };
      var itemMapping = googleEvent.attendees.map((item) => {
        return {
          "id": item.email
        }
      });
      var timeChecker = {
        "timeMax": googleEvent.end.dateTime,
        "timeMin": googleEvent.start.dateTime,
        "items": itemMapping,
        "timeZone": googleEvent.start.timeZone
      };
      // console.log(googleEvent);
      // console.log(timeChecker);
      module.exports = {
        googleEvent: googleEvent,
        timeChecker: timeChecker
      };
      // console.log(googleEvent.attendees);
      // console.log('reached the button');
      return web.chat.postMessage(message.channel, `Would you allow to create this event?`, attachment)
    } else {
      return web.chat.postMessage(message.channel, `Cannot identify your command please type again`)
    }
  }).then(function (x) {
    console.log('msg has sent');
  }).catch(function (err) {
    console.log('errrrr haha', err);
  });
});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  // console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  // console.log('Reaction removed:', reaction);
});

module.exports = {
  web,
  rtm
}
