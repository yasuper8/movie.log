// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    controllers = require('./controllers');

// MIDDLEWARE

// Serve static files from the `/public` directory:
app.use(express.static('public'));

// parse incoming urlencoded form data
// and populate the req.body object
app.use(bodyParser.urlencoded({
  extended: true
}));


//renders signup and signin pages
app.set('view engine', 'ejs');


/************
 * DATABASE *
 ************/

var db = require('./models');
var User = require('./models/user');

/**********
 * ROUTES *
 **********/


 /*
 * HTML Endpoints
 */

 app.get('/', function homepage(req, res) {
    res.render('index');
 });

app.get('/', function homepage(req, res) {
  res.sendFile(__dirname + '/views/index.ejs');
});


/**********
 * SERVER *
 **********/

// listen on port 3000
app.listen(process.env.PORT || 3000, function() {
  console.log('Express server is up and running on http://localhost:3000/');
});
