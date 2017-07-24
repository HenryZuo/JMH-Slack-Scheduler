
var botHandleRegistration = function(web, channel, mongoUser){
  var userStr = JSON.stringify(mongoUser)
  web.chat.postMessage(
    channel,
    "",
    {
      "attachments": [
        {
        "title": "Your Google calendar is not connected to me yet!",
        "fallback": "Your Google calendar is not connected to me yet!",
        "callback_id": "google_account_registration",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
            {
              "name": "redirect_to_google_registration",
              "text": "Connect now!",
              "type": "button",
              "style": "primary",
              "value": userStr
            }
          ]
        }
      ]
    }
  );
};

var botHandleMessage = function(rtm, web, message){
  decodeHumanLan(message)
  .then(function( resp ){
    var data = resp.data;
    if((data.result.action === 'input.welcome') || (data.result.actionIncomplete)){
      rtm.sendMessage(data.result.fulfillment.speech, message.channel);
    } else {
        var intent = data.result.metadata.intentName;
        switch (intent) {
          case "add_task":
            botAddTask(web, message.channel, data);
            break;
          case "add_meeting":
            botAddMeeting(web, message.channel, data);
            break;
          default:
            break;
        };
      };
    })
  .catch(function(e){console.log("ERROR in function botHandleMessage: " + e);});
};

// not exported --------------------------------------
var botAddTask = function(web, channel, data) {
  var strValueConfirm = JSON.stringify({
    confirm: true,
    task: data.result.parameters.task,
    date: data.result.parameters.date
  });
  web.chat.postMessage(
    channel,
    "Create reminder for " + data.result.parameters.task + " on " + data.result.parameters.date,
    {
      "attachments": [
        {
          "title": "Confirm?",
          "fallback": "Confirm?",
          "callback_id": "confirm_reminder",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
              {
                "name": "add_task",
                "text": "Confirm",
                "type": "button",
                "style": "primary",
                "value": strValueConfirm
              },
              {
                "name": "add_task",
                "text": "Cancel",
                "type": "button",
                "style": "danger",
                "value": JSON.stringify({confirm: false})
              }
            ]
          }
        ]
      },
    function (err, res) {
      if(err){console.log(err);}
      else {
        console.log(res);
      }
    }
  );
};

var botAddMeeting = function(web, channel, data){
  var params = data.result.parameters;
  var strValueConfirm = JSON.stringify({
    confirm: true,
    subject: params.subject,
    date: params.date,
    invitee: params.invitee,
    time: params.time
  });
  web.chat.postMessage(
    channel,
    "Schedule " + params.subject + " with " + params.invitee + " on " + params.date + " at " + params.time,
    {
      "attachments": [
        {
          "title": "Confirm?",
          "fallback": "Confirm?",
          "callback_id": "confirm_reminder",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
              {
                "name": "add_meeting",
                "text": "Confirm",
                "type": "button",
                "style": "primary",
                "value": strValueConfirm
              },
              {
                "name": "add_meeting",
                "text": "Cancel",
                "type": "button",
                "style": "danger",
                "value": JSON.stringify({confirm: false})
              }
            ]
          }
        ]
      },
    function (err, res) {
      if(err){console.log(err);}
      else {
        console.log(res);
      }
    }
  );
};

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

module.exports = {
  botHandleRegistration,
  botHandleMessage
};
