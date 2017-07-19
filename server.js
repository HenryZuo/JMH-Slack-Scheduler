// Server
var express = require('express');
var app = express();

// npm packages
var _ = require('underscore');
var google = require('googleapis');
var open = require("open");

// token storage
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// define oauth2Client
var clientSecret = process.env.clientSecret; //'tQ36Hj8XNInjkUQxfiKAq-12';
var clientId = process.env.clientId; //'209381867443-tdr820sp28osnl86c154m39i58njed5c.apps.googleusercontent.com';
var redirectUri = process.env.redirectUri;
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);
var url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent'
});

// callback url
app.get('/', function (req, res) {
  var code = req.query.code;
  oauth2Client.getToken(code, function (err, tokens) {
    if (!err) {
      oauth2Client.setCredentials(tokens);
      try {
        fs.mkdirSync(TOKEN_DIR);
      } catch (err) {
        if (err.code != 'EEXIST') {
          throw err;
        }
      };
      fs.writeFile(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to ' + TOKEN_PATH);
  });
});

app.listen(3000, console.log("Port 3000 is listening!"))

open(url);

// module.exports = {
//   ngrokURL: ngrokURL
// };


// var calendar = google.calendar('v3');
//   calendar.events.list({
//     auth: oauth2Client,
//     calendarId: 'primary',
//     maxResults: 3
//   }, function(err, response){
//     if (err) {
//       console.log(err);
//     };
//     res.send(response.items);
//   });
//   } else {
//   res.send(err);
//   };
