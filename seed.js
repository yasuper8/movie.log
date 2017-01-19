var db = require('./models');

var user_lists = [
  {
    name: "Yasuyoshi Sakamoto",
    email: "yasu@mail.com",
    profileUrl: "http://i.imgur.com/Rwv0BRw.jpg"
  },
  {
    name: "Linda Conner",
    email: "linda@mail.com",
    profileUrl: "http://i.imgur.com/h9b3eZe.jpg"
  }
];



db.User.remove({}, function(err, user) {
  if(err) {
    console.log('Error occurred in remove', err);
  } else {
    console.log('Removed all users');
    db.User.create(user_lists, function(err, user) {
      if (err) { return console.log('err', err); }
      console.log('Created ' + user.length + ' users');
      process.exit();
    });
  }
});
