// run server
var { app } = require('./ngrok');

// connect to Gabumon
var { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
var token = process.env.SLACK_BOT_TOKEN;
var rtm = new RtmClient(token, { logLevel: 'info' });
var web = new WebClient(token, { logLevel: 'info' });
rtm.start();

// mongodb
var { userInDB, addUserToDB, verifyUser } = require('./mongodb/mongoFunctions')

// Gabumon functions
var { botHandleMessage, botHandleRegistration } = require('./gabumonFunctions');

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  if(message.subtype !== "bot_message"){
    userInDB(message.user, function(mongoUser){
      if(mongoUser){
        if(!mongoUser.googleTokens){
          botHandleRegistration(web, message.channel, mongoUser)
        } else {
          botHandleMessage(rtm, web, message);
        };
      } else {
        addUserToDB(message.user, function(mongoUser){
          botHandleRegistration(web, message.channel, mongoUser);
        });
      };
    });
  };
});
