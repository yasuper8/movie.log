
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
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: 'SuperSecretCookie',
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minute cookie lifespan (in milliseconds)
}));


app.get('/record', function homepage(req, res) {
  res.sendFile(__dirname + '/views/record.html');
});

app.get('/', function homepage(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// login route with placeholder response
app.get('/login', function (req, res) {
  res.render(__dirname + '/views/login.ejs');
});

// signup route (renders signup view)
app.get('/signup', function (req, res) {
  res.render(__dirname + '/views/signup.ejs');
});

// show user profile page
app.get('/profile', function (req, res) {
  // find the user currently logged in
  User.findOne({_id: req.session.userId}, function (err, currentUser) {
    res.render(__dirname + '/views/user-show.ejs', {user: currentUser})
  });
});

// Show user profile page
app.get('/profile', function(req, res) {
  // find the user currently logged in
  User.findOne({
      _id: req.session.userId
  }, function(err, currentUser) {
      res.render('index.ejs', {
          user: currentUser
      })

  });
});

// A create user route - creates a new user with a secure password
app.post('/users', function (req, res) {
  console.log('request body: ', req.body);
  res.json("it worked!");
});

// Sign up route - creates a new user with a secure password
app.post('/users', function(req, res) {
  // use the email and password to authenticate here
  db.User.createSecure(req.body.email, req.body.password, req.body.name, req.body.profileUrl, function(err, user) {
    res.json(user);
  });
});

//A post sessions route to store our session data
app.post('/sessions', function(req, res) {
  db.User.authenticate(req.body.email, req.body.password, function(err, user) {
    if (user) {
        req.session.userId = user._id;
        res.redirect('/profile');
    } else {
      res.redirect('/login'); //do something meaninful here to alert bad password or un
    }
  });
});

handle["/"] = handlers.home;
handle["/home"] = handlers.home;
handle["/upload"] = handlers.upload;
handle._static = handlers.serveStatic;

server.start(router.route, handle);
