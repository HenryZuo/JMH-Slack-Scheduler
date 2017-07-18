const express = require('express');
const bodyParser = require('body-parser');
const apiai = require('apiai');
const app = express();
const APIAI_TOKEN = process.env.APIAI_TOKEN;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const apiaiApp = apiai(APIAI_TOKEN);

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});


app.post('/slack/interactive', function(req, res) {
  var payload = JSON.parse(req.body.payload);
  if (payload.actions[0].value === 'true') {
    res.send('Created reminder :white_check_mark:');
  } else {
    res.send('Cancelled :x:');
  }
})
