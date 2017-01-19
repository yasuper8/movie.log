var mongoose = require("mongoose");

mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost/signup" );

var User = require('./user.js');
module.exports.User = User;
