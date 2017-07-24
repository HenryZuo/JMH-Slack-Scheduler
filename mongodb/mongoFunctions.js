var mongoose = require('mongoose');

// models
var { User } = require('./models');

var userInDB = function(slackID, callback){
  User.findOne({slackID: slackID}).exec()
  .then(function(user){
    callback(user);
  })
  .catch(function(e){
    console.log("ERROR in function userInDB: ", e);
  });
};

var addUserToDB = function(slackID, callback){
  var u = new User({
    slackID: slackID,
    googleTokens: {}
  });
  u.save()
  .then(function(mongoUser){
    callback(mongoUser);
  })
  .catch(function(e){
    console.log("ERROR in function addUserToDB: ", e);
  });
};

module.exports = {
  userInDB,
  addUserToDB
};
