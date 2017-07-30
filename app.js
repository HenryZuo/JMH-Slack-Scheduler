var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var axios = require('axios');
var {web} = require('./server.js');
var {rtm} = require('./server.js');
var {User} = require('./Models/models.js');
var {Reminder} = require('./Models/models.js');
var moment = require('moment');

var dropdown = {
  "text": "Please select a new time",
  "response_type": "in_channel",
  "attachments": [
    {
      "text": "Choose a time to schedule",
      "fallback": "If you could read this message, you'd be choosing a new time.",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "callback_id": "time",
      "actions": [
        {
          "name": "time",
          "text": "Pick another time...",
          "type": "select",
          "options": [
            {
              "text": "08:00:00",
              "value": "8"
            }, {
              "text": "09:00:00",
              "value": "9"
            }, {
              "text": "10:00:00",
              "value": "10"
            }, {
              "text": "11:00:00",
              "value": "11"
            }, {
              "text": "12:00:00",
              "value": "12"
            }, {
              "text": "13:00:00",
              "value": "13"
            }, {
              "text": "14:00:00",
              "value": "14"
            }, {
              "text": "15:00:00",
              "value": "15"
            }, {
              "text": "16:00:00",
              "value": "16"
            }, {
              "text": "17:00:00",
              "value": "17"
            }
          ]
        }
      ]
    }
  ]
};

app.use(bodyParser.urlencoded({extended: false}));
function checkingTime(obj) {
  var list = Object.keys(obj);
  var ifOK = true;
  for (var key in obj) {
    if (obj[key].busy.length !== 0) {
      ifOK = false;
    }
  }
  return ifOK;
}
function checkAndPost(user) {
  if (!user.google) {
    console.log(1);
    rtm.sendMessage(`please visit ${process.env.DOMAIN}/connect?user=${user._id} to setup Google`, user.slackDmId);
  } else {
    console.log(2);
    axios.post(`https://www.googleapis.com/calendar/v3/freeBusy?access_token=${user.google.access_token}`, user.timeChecker).then((resp) => {
      // console.log(resp.data);

      // var busyMembers = Object.keys(resp.data.calendars);
      // var ifOK = true;
      // for (var key in resp.data.calendars) {
      //   // console.log(key); //// cao ni ma de bug
      //   // console.log(resp.data.calendars[`${key}`].busy);
      //   if (resp.data.calendars[`${key}`].busy.length !== 0)
      //     ifOK = false;
      //   }
      if (checkingTime(resp.data.calendars)) {
        rtm.sendMessage('time is fine with everybody', user.slackDmId);
        axios.post(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${user.google.access_token}`, user.event).then(function(response) {
          rtm.sendMessage('You have added an event to your calendar', user.slackDmId);
        }).catch(function(err) {
          console.log('failed to post your calendar');
        });
      } else {
        web.chat.postMessage(user.slackDmId, `There is a timing conflict. Please pick another time `, dropdown);
      }
      // return resp.data.calendars['tangziou@gmail.com'].busy;
    }).catch(function(err) {
      console.log('backup plan for token');
      console.log('err is ', err);
      rtm.sendMessage(`please visit ${process.env.DOMAIN}/connect?user=${user._id} to setup Google`, user.slackDmId);
    });

  }
}

app.post('/slack/interactive', function(req, res) {
  var googleEvent = require('./server.js').googleEvent;
  var timeChecker = require('./server.js').timeChecker;
  var payload = JSON.parse(req.body.payload);
  if (payload.actions[0].type === 'select') {
    var newTimePeriod = payload.actions[0].selected_options[0].value;

    console.log(payload.actions[0].selected_options[0]);
    res.send(`You selected at ${newTimePeriod}:00:00 :white_check_mark:`);
    // console.log('body ', payload.actions[0].selected_options[0].value);
    User.findOne().then((user) => {
      user.timeChecker.timeMin = moment(user.timeChecker.timeMin).set('hour', parseInt(newTimePeriod)).format();
      user.timeChecker.timeMax = moment(user.timeChecker.timeMin).add(1, 'hours').format();
      user.event.start.dateTime = user.timeChecker.timeMin;
      user.event.end.dateTime = user.timeChecker.timeMax;
      return user.save();
    }).then((user) => {
      axios.post(`https://www.googleapis.com/calendar/v3/freeBusy?access_token=${user.google.access_token}`, user.timeChecker).then((resp) => {
        if (checkingTime(resp.data.calendars)) {
          rtm.sendMessage('time is fine with everybody this time!', user.slackDmId);
          axios.post(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${user.google.access_token}`, user.event).then(function(response) {
            rtm.sendMessage('You have added an event to your calendar', user.slackDmId);
          }).catch(function(err) {
            console.log('failed to post your calendar');
          });
        } else {
          web.chat.postMessage(user.slackDmId, `There is a timing conflict. Please pick another time `, dropdown);
        }
      }).catch(function(err) {
        console.log('backup plan for token 2');
        console.log('err is ', err);
        rtm.sendMessage(`please visit ${process.env.DOMAIN}/connect?user=${user._id} to setup Google`, user.slackDmId);
      });
    }).catch(function(err) {
      console.log('mongodb has a connection problem');
    })

  }
  if (payload.actions[0].value === 'true') {
    res.send('Allow to accesss your google calendar :white_check_mark:');
    var newReminder = new Reminder({slackId: payload.user.id, slackDmId: payload.channel.id, event: googleEvent});
    newReminder.save();
    User.findOne({slackId: payload.user.id}).then(function(user) {
      if (!user) {
        return new User({slackId: payload.user.id, slackDmId: payload.channel.id, event: googleEvent, timeChecker: timeChecker}).save();
      }
      user.event = googleEvent;
      user.timeChecker = timeChecker;
      return user.save();
    }).then(checkAndPost).catch(function(err) {
      console.log('mongoose err');
    });

  }
  if (payload.actions[0].value === 'false') {
    res.send('Cancelled :x:');
  }
})

////////////////google Authorization part
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var getGoogleAuth = function() {
  return new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.DOMAIN + '/connect/callback');
}

app.get('/connect', function(req, res) {
  var oauth2Client = getGoogleAuth();
  var userId = req.query.user;
  if (!userId) {
    res.status(400).send('missing user id')
  } else {
    User.findById(userId).then(function(user) {
      if (!user) {
        res.status(400).send('cannot find user')
      } else {
        var url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          prompt: 'consent',
          scope: [
            'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/calendar'
          ],
          state: userId
        });
        res.redirect(url);
      }
    }).catch(function(err) {
      console.log('err there');
    });
  }
})
app.get('/connect/callback', function(req, res) {
  var oauth2Client = getGoogleAuth();
  oauth2Client.getToken(req.query.code, function(err, tokens) {
    if (err)
      res.status(500).json({error: err});
    else {
      oauth2Client.setCredentials(tokens);
      var plus = google.plus('v1');
      plus.people.get({
        auth: oauth2Client,
        userId: 'me'
      }, function(err, googleUser) {
        if (err)
          res.status(500).json({error: err});
        else {
          User.findById(req.query.state).then(function(mongoUser) {
            mongoUser.google = tokens;
            mongoUser.google.profile_id = googleUser.id;
            mongoUser.google.profile_name = googleUser.displayName;
            return mongoUser.save();
          }).then(function(user) {
            console.log('after saving credential to mongoDB');
            console.log(user.google.access_token);
            axios.post(`https://www.googleapis.com/calendar/v3/freeBusy?access_token=${user.google.access_token}`, user.timeChecker).then((resp) => {
              console.log('checking with freebusy is ok');
              var busyMembers = Object.keys(resp.data.calendars);
              var ifOK = true;
              for (var key in resp.data.calendars) {
                // console.log(key); //// cao ni ma de bug
                // console.log(resp.data.calendars[`${key}`].busy);
                if (resp.data.calendars[`${key}`].busy.length !== 0)
                  ifOK = false;
                }
              if (ifOK) {
                rtm.sendMessage('time is fine with everybody', user.slackDmId);
                axios.post(`https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${user.google.access_token}`, user.event).then(function(response) {
                  rtm.sendMessage('You have added an event to your calendar', user.slackDmId);
                  res.redirect('https://calendar.google.com');
                }).catch(function(err) {
                  console.log('failed to post your calendar');
                });
              } else {
                res.send('there is a time conflict, please go back to your slack to reschedule')
                web.chat.postMessage(user.slackDmId, `There is a timing conflict. Please pick another time `, dropdown);
              }
              // return resp.data.calendars['tangziou@gmail.com'].busy;
            })
          }).catch(function(err) {
            console.log('mongoDB has some issues');
          })

        }
      })
    }
  })

})

app.listen(3000, console.log("Port 3000 is listening!"));
