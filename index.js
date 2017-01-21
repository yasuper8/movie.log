
var server = require('./server'),
    handlers = require('./handlers'),
    router = require('./router'),
    handle = { };

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    controllers = require('./controllers'),
    mongoose = require('mongoose'),
    session = require('express-session');

var db = require('./models');
var User = require('./models/user');

var config = require('./config'),
    http = require('http'),
    url = require('url');


// Serve static files from the `/public` directory:
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// middleware (new addition)
// set session options
// app.use(session({
//   saveUninitialized: true,
//   resave: true,
//   secret: 'SuperSecretCookie',
//   cookie: { maxAge: 30 * 60 * 1000 } // 30 minute cookie lifespan (in milliseconds)
// }));



// middleware
// app.use(express.static('public'));
app.use(session({
 saveUninitialized: true,
 resave: true,
 secret: 'SuperSecretCookie',
 cookie: { maxAge: 30 * 60 * 1000 } // 30 minute cookie lifespan (in milliseconds)
}));
// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({extended: true}));
// mongoose.connect('mongodb://localhost/movieLog-app-node');


// get signup route
app.get('/signup', function (req, res) {
 res.render(__dirname + '/views/signup.ejs');
});

// post sign up route
app.post('/users', function (req, res) {
 console.log(req.body)
 // use the email and password to authenticate here
 User.createSecure(req.body.name, req.body.email, req.body.password, req.profileUrl, function (err, newUser) {
   req.session.userId = newUser._id;
   res.redirect('/profile');
 });
});


// get login route
app.get('/login', function (req, res) {
 res.render(__dirname + '/views/login.ejs');
});

// show user profile page
app.get('/profile', function (req, res) {
  // find the user currently logged in
  User.findOne({_id: req.session.userId}, function (err, currentUser) {
    res.render(__dirname + '/views/profile.ejs', {user: currentUser})
  });
});


//A post sessions route to store our session data
app.post('/sessions', function(req, res) {
  db.User.authenticate(req.name, req.body.email, req.body.password, req.profileUrl, function(err, user) {
    if (user) {
        req.session.userId = user._id;
        res.redirect('/profile');
    } else {
      res.redirect('/login'); //do something meaninful here to alert bad password or un
    }
  });
});


// Show user profile page
app.get('/profile', function(req, res) {
  // find the user currently logged in
  User.findOne({
      _id: req.session.userId
  }, function(err, currentUser) {
      res.render('user-show.ejs', {
          user: currentUser
      })

  });
});


handle["/signup"] = handlers.signup;
handle["/login"] = handlers.login;
handle["/users"] = handlers.users;
handle["/"] = handlers.home;
handle["/record"] = handlers.record;
handle["/upload"] = handlers.upload;
handle._static = handlers.serveStatic;

server.start(router.route, handle);
