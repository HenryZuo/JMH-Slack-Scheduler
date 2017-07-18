var { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');

var token = process.env.SLACK_BOT_TOKEN;

var rtm = new RtmClient(token, { logLevel: 'info' });
var web = new WebClient(token, { logLevel: 'info' });
rtm.start();

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

var axios = require('axios');

//curl 'https://api.api.ai/api/query?v=20150910&query=remind%20me%20to%20run%20jupm%20on%20July%2020th&lang=en&sessionId=ee2dd9d8-b8e7-40a1-b49f-fa6dfbcb46da&timezone=2017-07-17T17:23:55-0700' -H 'Authorization:Bearer 2db9897aba764eb6bdcd1d91ec6961fc'

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  var dm = rtm.dataStore.getDMByUserId(message.user);
  if (!dm || dm.id !== message.channel || message.type !== 'message'){
    console.log("not a direct message between bot and user");
  };
  var channel = message.channel;
  var text = message.text;
  axios.get('https://api.api.ai/api/query', {
    params: {
      v: 20150910,
      query: text,
      lang: "en",
      timezone: "2017-07-17T16:40:09-0700",
      sessionId: message.user
    },
    headers: {
      Authorization: 'Bearer ' + process.env.API_AI_TOKEN
    }
  })
  .then(function( resp ){
    var data = resp.data;
    if(data.result.actionIncomplete){
      rtm.sendMessage(data.result.fulfillment.speech, channel);
    } else {
      // rtm.sendMessage('Creating reminder for ' + data.result.parameters.task + ' on ' + data.result.parameters.date, channel);
      web.chat.postMessage(
        channel,
        'Creating reminder for ' + data.result.parameters.task + ' on ' + data.result.parameters.date,
      // {
      //   "text"
      //   "attachments": [
      //     {
      //       "text": "Choose an option",
      //       "fallback": "You are unable to choose a game",
      //       "callback_id": "wopr_game",
      //       "color": "#3AA3E3",
      //       "attachment_type": "default",
      //       "actions": [
      //           {
      //             "name": "Confirm",
      //             "text": "Confirm",
      //             "type": "button",
      //             "value": "true"
      //           },
      //           {
      //             "name": "Confirm",
      //             "text": "Cancel",
      //             "type": "button",
      //             "value": "false"
      //           }
      //         ]
      //       }
      //     ]
      //   },
        function (err, res) {
          if(err){console.log(err);}
          else {console.log("res: ", res);}
        }
      );
      }
    })
    .catch(function(e){console.log("ERROR: "+e);});
});

// { type: 'message',
//   channel: 'D6A0DGJ9G',
//   user: 'U69SFSFNX',
//   text: 'test',
//   ts: '1500333494.027604',
//   source_team: 'T6A0R2E5S',
//   team: 'T6A0R2E5S' }
