// npm packages
var fs = require("fs");

// google api on nodejs
var google = require('googleapis');

// gogole credentials
var clientSecret = process.env.clientSecret; //'tQ36Hj8XNInjkUQxfiKAq-12';
var clientId = process.env.clientId; //'209381867443-tdr820sp28osnl86c154m39i58njed5c.apps.googleusercontent.com';
var redirectUri = process.env.redirectUri; // http://localhost:3000

// oauth
var OAuth2 = google.auth.OAuth2;
oauth2Client = new OAuth2(clientId, clientSecret, redirectUri)

// module.exports = {
//   verifyUser
// };
