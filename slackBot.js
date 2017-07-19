var { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
var { authorize } = require('./calendar/auth')

var token = process.env.SLACK_BOT_TOKEN;

var rtm = new RtmClient(token, { logLevel: 'info' });
var web = new WebClient(token, { logLevel: 'info' });
rtm.start();

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  if(message.subtype !== "bot_message"){
    decodeHumanLan(message)
    .then(function( resp ){
      var data = resp.data;
      if(data.result.actionIncomplete){
        rtm.sendMessage(data.result.fulfillment.speech, message.channel);
      } else {
          botDoesWebReply(message.channel, data);
        };
      })
      .catch(function(e){console.log("ERROR: " + e);});
  };
});

var axios = require('axios');

var decodeHumanLan = function(message) {
  return axios.get('https://api.api.ai/api/query', {
    params: {
      v: 20150910,
      query: message.text,
      lang: "en",
      timezone: "2017-07-17T16:40:09-0700",
      sessionId: message.user
    },
    headers: {
      Authorization: 'Bearer ' + process.env.API_AI_TOKEN
    }
  })
};

var botDoesWebReply = function(channel, data) {
  web.chat.postMessage(
    channel,
    "Created reminder for " + data.result.parameters.task + " on " + data.result.parameters.date,
    {
      "attachments": [
        {
          "title": "Confirm?",
          "fallback": "Confirm?",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
              {
                "name": "Confirm",
                "text": "Confirm",
                "type": "button",
                "style": "primary",
                "value": "true"
              },
              {
                "name": "Confirm",
                "text": "Cancel",
                "type": "button",
                "style": "danger",
                "value": "false"
              }
            ]
          }
        ]
      },
    function (err, res) {
      if(err){console.log(err);}
      else {
        console.log("res: ", res);
      }
    }
  );
};
