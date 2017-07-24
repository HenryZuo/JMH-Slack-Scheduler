var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

var Schema = mongoose.Schema

var userSchema = new Schema({
    slackID: {type: String, required: true},
    googleTokens: Object
});

var User = mongoose.model('User', userSchema);

module.exports = {
  User
};
