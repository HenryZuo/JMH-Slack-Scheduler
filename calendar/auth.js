
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');


var clientSecret = process.env.client_secret; //'tQ36Hj8XNInjkUQxfiKAq-12';
var clientId = process.env.clientId; //'209381867443-tdr820sp28osnl86c154m39i58njed5c.apps.googleusercontent.com';
var redirectUri = process.env.redirectUri;

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);
var url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent'
});
