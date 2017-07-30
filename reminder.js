'use strict';
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var WebClient = require('@slack/client').WebClient;

var token = process.env.SLACK_API_TOKEN || '';
var web = new WebClient(token, {logLevel: 'info'});

var {Reminder} = require('./Models/models.js');
var {User} = require('./Models/models.js');

User.findOne().then((user) => {
  Reminder.find().then(function(events) {
    // console.log(events);
    var today = [];
    var tomorrow = [];
    events.forEach(function(item) {
      var currentTime = new Date().getTime();
      var eventTime = new Date(item.event.start.dateTime).getTime();
      if ((Math.abs(currentTime - eventTime) / 3600000) < 24) {
        today.push(item);
      } else if ((Math.abs(currentTime - eventTime) / 3600000) < 48) {
        tomorrow.push(item);
      }
    });

    var newToday = today.map((event) => {
      return new Promise((resolve, reject) => web.chat.postMessage(event.slackDmId, `You have a comming event today: ${event.event.summary}`, function() {
        // resolve();
      }))
    });

    var newTomorrow = tomorrow.map((event) => {
      return new Promise((resolve, reject) => web.chat.postMessage(event.slackDmId, `You have a comming event tomorrow: ${event.event.summary}`, function() {
        reolve();
      }))
    });
    Promise.all(newToday.concat(newTomorrow)).then(() => {
      // process.exit(0);
    });

  })
})
