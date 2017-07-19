'use strict';

console.log('HELLO I AM RUNNING');

var { User } = require('./models');
var { web } = require('./index')
User.findOne()
    .then(function(user){
      web.chat.postMessage(user.slackDmId, 'Current time is ' + new Date() )
      function(
        process.exit(0)

      )
    })
