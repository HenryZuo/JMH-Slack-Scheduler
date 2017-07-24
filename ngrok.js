// Server
var express = require('express');
var app = express();

// npm packages

// bodyparser
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// talk to calendar
var { login, addTask, addMeeting } = require('./gCalFunctions');

// routes
app.get('/', function (req, res) {
  res.send("default");
});

app.get('/googlecburl', function (req, res) {
  var code = req.query.code;
  console.log("req.query: ", req.query);
});

app.post('/slackpostrequest', function (req, res) {
  var payload = JSON.parse(req.body.payload);
  if(payload.token !== "dLuXLX37tAGJ8vrhlwRut8fq"){
    res.status(400).send("not sent from slack");
    return
  };
  var value = JSON.parse(payload.actions[0].value);
  switch (payload.actions[0].name) {
    case "redirect_to_google_registration":
      login(value, function(){
        res.end();
      });
      break;
    case "add_task":
      if(value.confirm){
        addTask(payload, value, function(err){
          if(err){res.end()} else {
            res.send("Scheduled "+value.task+" on "+value.date+"!");
          };
        });
      } else {
        res.send("Canceled!");
      };
      break;
    case "add_meeting":
      if(value.confirm){
        addMeeting(value, function(){
          res.send("Scheduled "+value.subject+" with "+value.invitee+" on "+value.date+" at "+value.time+"!");
        });
      } else {
        res.send("Canceled!");
      };
      break;
    default:
      res.end();
      break;
  };
});

app.listen(8080, console.log("ngrok 8080 listening!"));

var ngrok  = require('ngrok');
ngrok.connect(8080, function (err, url) {
  if(!err){
    console.log("ngrok running on ", url);
  } else {
    console.log(err);
  }
});

module.exports = {
  app
}
