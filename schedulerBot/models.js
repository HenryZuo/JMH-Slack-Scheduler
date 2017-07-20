var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

var User = mongoose.model('User', {
  slackId:{
    type: String,
    required: true
  },
  slackDmId: {
    type: String,
    required: true
  },
  google: {},
  date: String,
  action: String
});

var Reminder = mongoose.model('Reminder', {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: Date,
  task: {
    type: String,
    required: true
  },
})

module.exports = {
  User,
  Reminder
};
