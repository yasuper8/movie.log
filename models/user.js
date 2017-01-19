var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: String,
  email: String,
  profileUrl: String,
});

// if you want to look up videos by this user, simply search all videos with the _user: user._id .


var User = mongoose.model('User', UserSchema);
module.exports = User;
