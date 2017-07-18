const express = require('express');
const bodyParser = require('body-parser');
const apiai = require('apiai');
const app = express();
const APIAI_TOKEN = process.env.APIAI_TOKEN;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const apiaiApp = apiai(APIAI_TOKEN);

const Google_Client_Id = process.env.CLIENT_ID;
const Google_Client_Secret = process.env.CLIENT_SECRET;
const Url_Redirect = process.env.REDIRECT_URL;

var readline = require('readline');
var { rtm } = require('./index');

var IncomingWebhook = require('@slack/client').IncomingWebhook;
var url = process.env.SLACK_WEBHOOK_URL || '';
var webhook = new IncomingWebhook(url);

webhook.send('Aloha', function(err, header, statusCode, body) {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log('Received', statusCode, 'from Slack');
  }
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/', function(req, res){
  res.render("HI");
})



app.post('/slack/interactive', function(req, res) { //make request to Google Calendar API
  var payload = JSON.parse(req.body.payload);
  console.log(payload);
  if (payload.actions[0].value === 'true') {
    res.send('Created reminder :white_check_mark:');
  } else {
    res.send('Cancelled :x:');
  }
})


function getGoogleAuth() {
  return new OAuth2(
    Google_Client_Id,
    Google_Client_Secret,
    'http://localhost:5000/google/callback' //send users back to this url
    // process.env.REDIRECT_URL/google/callback
    // Url_Redirect/google/callback
  );
}

const GOOGLE_SCOPES = [
  'https://wwww.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'
]

var google = require('googleapis');
var urlshortener = google.urlshortener('v1');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
var { User } = require('./models');

app.get('/connect', function(req, res){
  var { userId } = req.query;
  if(!userId){
    res.status(400).send('Missing User id')
  } else {
    User.findById(userId)
    .then(function(user){
      if(! user) {
        res.status(404).send("Cannot find user")
      } else {
        //have a user
        var googleAuth = getGoogleAuth();
        var url = googleAuth.generateAuthUrl({
          access_type: 'offline',
          prompt: 'consent'
          scope: GOOGLE_SCOPES,
          state: userId
        });
        res.redirect(url)
      }
    });
  }
})

app.get('/google/callback', function(req, res){
  var googleAuth = getGoogleAuth();
  googleAuth.getToken(req.query.code, function(err, tokens){ //req.query.code --> AUTHENTICATED users
    if(err){
      res.status(500).json({error: err});
    } else {
      googleAuth.setCredentials(tokens);
      var plus - google.plus('v1');
      plus.people.get({ userId: 'me', auth: googleAuth }, function (err, googleUser) {
        if(err){
          res.status(500).json({error: err});
        } else {
          User.findById(req.query.state) //find user created originally created on slack
          .then(function(MongoUser){
            MongoUser.google = tokens; //store everything in there
            MongoUser.google.profile_id = googleUser.id;
            MongoUser.google.profile_name = googleUser.displayName;
            return MongoUser.save(); //save everything in Mongo
          })
          .then(function(MongoUser){
            res.send('You are connected to google calendar')
            rtm.sendMessage('You are connected to Google Calendar', MongoUser.slackDmId)
          })
          res.json({
            code: rqe.query.code,
            state: req.query.state,
            tokens,
            googleUser
          });
        }
      })
    }
  })
});

// var oauth2Client = new OAuth2(
//   Google_Client_Id,
//   Google_Client_Secret,
//   Url_Redirect
// );

// var rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// })

// function getAccessToken (oauth2Client, callback) {
//   //generate conset page url
//   var url = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     // prompt: 'consent',
//     scope:[ //generate a url that asks permission for Google+ and Google Calendar scopes
//       'https://wwww.googleapis.com/auth/plus.me',
//       'https://www.googleapis.com/auth/calendar'
//     ],
//     // state: encodeURIComponent(JSON.stringify({
//     //   auth_id: req.query.auth_id
//     // }))
//     rl.question('Enter code here: ', function(code){
//       if(err){
//         return callback(err);
//       }
//       //set tokens to client
//       oauth2Client.setCredentials(tokens);
//       callback();
//     })
//   });
// }
//

// getAccessToken(oauth2Client, function() {
//   plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile){
//     if(err) {
//       return console.log('an error has occured', err);
//     }
//     console.log(profile.displayName, ':', profile.tagline)
//   })
// })

// var url = oauth2Client.generateAuthUrl({
//   access_type: 'offline',
//   prompt: 'consent',
//   scope:[ //generate a url that asks permission for Google+ and Google Calendar scopes
//     'https://wwww.googleapis.com/auth/plus.me',
//     'https://www.googleapis.com/auth/calendar'
//   ],
//   state: encodeURIComponent(JSON.stringify({
//     auth_id: req.query.auth_id
//   }))
// });







/*
{
"id": "758c3b60-5f72-4e73-a739-bff6b14d1236",
"timestamp": "2017-07-18T18:02:01.684Z",
"lang": "en",
"result": {
"source": "agent",
"resolvedQuery": "remind me to sleep today",
"action": "",
"actionIncomplete": false,
"parameters": {
"action": "sleep",
"date": "2017-07-18",
"task": [
"to"
]
},
"contexts": [],
"metadata": {
"intentId": "297d410b-002f-40c5-b13c-1046f89101a7",
"webhookUsed": "false",
"webhookForSlotFillingUsed": "false",
"intentName": "Remind"
},
"fulfillment": {
"speech": "Yep! I will remind you to sleep on 2017-07-18",
"messages": [
{
"type": 0,
"platform": "slack",
"speech": "Yep! I will remind you to sleep on 2017-07-18"
},
{
"type": 0,
"platform": "slack",
"speech": ""
},
{
"type": 0,
"speech": "Yep! I will remind you to sleep on 2017-07-18"
}
]
},
"score": 1
},
"status": {
"code": 200,
"errorType": "success"
},
"sessionId": "c31cb59a-8869-4126-aea6-2de6295c4991"
}

*/
