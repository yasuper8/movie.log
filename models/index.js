var mongoose = require("mongoose");

mongoose.connect( process.env.MONGODB_URI || "mongodb://localhost/movieLog-app-node" );

var User = require('./user.js');
module.exports.User = User;
