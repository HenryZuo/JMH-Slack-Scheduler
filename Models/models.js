var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('err', function() {
  console.log('there is a problem to connecting mongoose');
})
mongoose.connection.on('connected', function() {
  console.log('mongoose connection is good');
})

var userSchema = new Schema({
  slackId: {
    type: String,
    required: true
  },
  slackDmId: {
    type: String,
    required: true
  },
  google: {},
  event: {},
  timeChecker: {}
});

var reminderSchema = new Schema({
  slackId: {
    type: String,
    required: true
  },
  slackDmId: {
    type: String,
    required: true
  },
  event: {}
});

var User = mongoose.model('User', userSchema);
var Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = {
  User: User,
  Reminder: Reminder
}
