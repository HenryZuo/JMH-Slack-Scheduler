// npm packages
var google = require('googleapis');
var open = require("open");

// OAuth2
var OAuth2 = google.auth.OAuth2;

// gogole credentials
var clientSecret = process.env.clientSecret; //'tQ36Hj8XNInjkUQxfiKAq-12';
var clientId = process.env.clientId; //'209381867443-tdr820sp28osnl86c154m39i58njed5c.apps.googleusercontent.com';
var redirectUri = process.env.redirectUri; // http://localhost:3000

// mongodb
var { userInDB } = require('./mongodb/mongoFunctions');


var login = function(mongoUser, callback){
  oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
    auth_id: mongoUser._id
  });
  console.log("url: ", url);
  open(url);
  callback();
};

var storeGoogleTokens = function(code){

}

var addTask = function(payload, value, callback) {
  userInDB(payload.user.id, function(mongoUser){
    oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials(mongoUser.googleTokens);
    var calendar = google.calendar('v3');
    calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      resource: {
       "end": {
        "date": value.date
       },
       "start": {
        "date": value.date
       },
       "summary": value.task
      }
    }, function(err, response){
      if(err){
        callback(err);
        console.log("print callRegistration: ", callRegistration);
        callRegistration(payload);
      } else {
        callback();
      };
    });
  });
};

var addMeeting = function(oauth2Client, value, callback) {
  var calendar = google.calendar('v3');
  calendar.events.insert({
    auth: oauth2Client,
    calendarId: 'primary',
    resource: {
     "end": {
      "dateTime": value.date+"T"+value.time+"-07:30",
      "timeZone": "America/Los_Angeles"
     },
     "start": {
      "dateTime": value.date+"T"+value.time+"-07:00",
      "timeZone": "America/Los_Angeles"
     },
     "summary": value.subject
    }
  }, function(err, response){
    if(err){console.log("Error in function addMeeting: ", err);}
    console.log("response: ", response);
    callback();
  });
};

module.exports = {
  login,
  addTask,
  addMeeting
};
