var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var axios = require('axios');
var bot_token = process.env.SLACK_BOT_TOKEN || '';
const APIAI_TOKEN = process.env.APIAI_TOKEN;
var rtm = new RtmClient(bot_token, {
  // Sets the level of logging we require
  logLevel: 'error',
  // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
  dataStore: new MemoryDataStore()
});

var WebClient = require('@slack/client').WebClient;
var token = process.env.SLACK_BOT_TOKEN || ''; //see section above on sensitive data
var web = new WebClient(token);
var { User } = require('./models')

let channel;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='general') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// Wait for the client to connect
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
  // Get the user's name
  var user = rtm.dataStore.getUserById(rtm.activeUserId);
  // Get the team's name
  var team = rtm.dataStore.getTeamById(rtm.activeTeamId);
  // Log the slack team name and the bot's name
  console.log('Connected to ' + team.name + ' as ' + user.name);
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(msg) {
  console.log('Message:', msg.text);
  var dm = rtm.dataStore.getDMByUserId(msg.user);
  if (!dm || dm.id !== msg.channel || msg.type !== 'message') {
    console.log('MESSAGE NOT SENT TO DM, IGNORING');
    return;
  };
  User.findOne({ slackId: msg.user })
  .then(function(user){
    if(! user ) {
      return new User({
        slackId: msg.user,
        slackDmId: msg.channel
      }).save();
    }
    return user;
  })
  .then(function(user) {
    console.log("USER IS ", user);
    rtm.sendMessage('Your id is ' + user._id, msg.channel)
    if(!user.google) {
      rtm.sendMessage('Hello, please give permission to your Google Calendar.
      Please Visit http://localhost:5000/connect?user=${user._id} to setup Google Calendar', msg.channel)
      return;
    }
    return;
    axios.get("https://api.api.ai/api/query", {
      params: {
        v: 20150910,
        lang: 'en',
        timezone: '2017-07-17T16:55:33-0700',
        query: msg.text,
        sessionId: msg.user
      },
      headers: {
        Authorization: 'Bearer ' + process.env.APIAI_TOKEN
      },
    }).then(function(res){
      var data = res.data;
      console.log('data',data);
      console.log('THIS IS ACTIONINCOMPLETE', data.result.actionIncomplete);
      if(data.result.actionIncomplete){
        rtm.sendMessage(JSON.stringify(data.result.fulfillment.speech), msg.channel);
      } else {
        web.chat.postMessage(msg.channel,
          `Creating reminder for '${data.result.parameters.action}' on ${data.result.parameters.date}`,
          {
            "attachments": [
              {
                "fallback": "You are unable to choose a reminder",
                "callback_id": "reminder",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                  {
                    "name": "confirm",
                    "text": "Confirm",
                    "type": "button",
                    "value": "true"
                  },
                  {
                    "name": "confirm",
                    "text": "Cancel",
                    "type": "button",
                    "value": "false"
                  }
                ]
              }
            ]
          }
        );
      }

    })
  })

})

rtm.start();

module.exports = {
  rtm
}
