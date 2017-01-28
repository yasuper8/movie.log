var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VideoSchema = new Schema({
  title: String,
  time_created: Number,
  duration: Number,
  _user: {type: Schema.Types.ObjectId, ref: 'User'}
});

// TODO: You need to call mongoose.model on VideoSchema and then export the return value if you want to use this db model.
