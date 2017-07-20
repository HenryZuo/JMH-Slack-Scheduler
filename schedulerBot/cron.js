'use strict';

console.log('HELLO I AM RUNNING');
var bot_token = process.env.SLACK_BOT_TOKEN || '';
var WebClient = require('@slack/client').WebClient;

var web = new WebClient(bot_token);

var { User } = require('./models');
var { Reminder } = require('./models')
// var { web } = require('./index')
User.findOne()
    .then(function(user){
      web.chat.postMessage(user.slackDmId,
        'Current time is ' + new Date(),
        function() {
          process.exit(0);
        });
    });

let todayDate = new Date();
let reminderOneDayBefore;
User.find()
    .then(function(user){
      Reminder.findOne(user.slackId)
              .then(function(date){
                console.log(date)
              })
    });
