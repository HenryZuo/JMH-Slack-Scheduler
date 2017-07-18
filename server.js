

/**
 * Example for creating and working with the Slack RTM API.
 */

/* eslint no-console:0 */

var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var axios = require('axios');
var token = process.env.SLACK_API_TOKEN || '';

var rtm = new RtmClient(token, { logLevel: 'debug' });
rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log('Message:', message.text);
  axios.get(`https://api.api.ai/api/query?v=20150910`, {
    "headers": {
      "Authorization": 'Bearer ffdb629d730d4e6aa6a1440b0a423538'
    },
    "params": {
      "query": message.text,
      "sessionId": message.user,
      "lang": 'en'
      // "timezone": "2017-07-17T16:03:07-0700"
    }
  })
  .then(function(response) {
      console.log('/////////////', response.data.result.fulfillment);
      rtm.sendMessage(JSON.stringify(response.data.result.fulfillment.speech), message.channel);
  })

});

rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  console.log('Reaction removed:', reaction);
});
// app.listen(3000, console.log("Port 3000 is listening!"))
