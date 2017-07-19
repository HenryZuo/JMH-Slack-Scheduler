var google = require('googleapis');

function listCalEvents(oauth2Client) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: oauth2Client,
    calendarId: 'primary',
    maxResults: 3
  }, function(err, response){
    var events = null;
    if (err) {
      console.log(err);
    };
    var events = response.items;
  });
};

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  };
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
};

module.exports = {
  listCalEvents: listCalEvents
};
