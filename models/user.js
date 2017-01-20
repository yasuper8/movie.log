var mongoose = require("mongoose"),
    bcrypt = require('bcrypt');
var Schema = mongoose.Schema;


// if you want to look up videos by this user, simply search all videos with the _user: user._id .

var UserSchema = new Schema({
  name: String,
  email: String,
  passwordDigest: String,
  profileUrl: String
});


// create a new user with secure (hashed) password
UserSchema.statics.createSecure = function (name, email, password, profileUrl, callback) {
// `this` references our user model, since this function will be called from the model itself
// store it in variable `UserModel` because `this` changes context in nested callbacks

var UserModel = this;

// hash password user enters at sign up
bcrypt.genSalt(function (err, salt) {
  console.log('salt: ', salt);  // changes every time
  bcrypt.hash(password, salt, function (err, hash) {

    // create the new user (save to db) with hashed password
    UserModel.create({
      name: name,
      email: email,
      passwordDigest: hash,
      profileUrl: profileUrl
    }, callback);
  });
});
};



// compare password user enters with hashed password (`passwordDigest`)
UserSchema.methods.checkPassword = function (password) {
  // run hashing algorithm (with salt) on password user enters in order to compare with `passwordDigest`
  return bcrypt.compareSync(password, this.passwordDigest);
};


// authenticate user (when user logs in)
UserSchema.statics.authenticate = function (name, email, password, profileUrl, callback) {
 // find user by email entered at log in
 // remember `this` refers to the User for methods defined on userSchema.statics
 this.findOne({email: email}, function (err, foundUser) {
   console.log(foundUser);

   // throw error if can't find user
   if (!foundUser) {
    console.log('No user with email ' + email);
     callback("Error: no user found", null);  // better error structures are available, but a string is good enough for now
   // if we found a user, check if password is correct
   } else if (foundUser.checkPassword(password)) {
     callback(null, foundUser);
   } else {
     callback("Error: incorrect password", null);
   }
 });
};//end of authenticate


var User = mongoose.model('User', UserSchema);
module.exports = User;
