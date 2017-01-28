// require express and other modules
// TODO: Which file is called first, this one or index.js? There seems to be some unecessary files in here.
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



// middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

// Serve static files from the `/public` directory:

// parse incoming urlencoded form data
// and populate the req.body object

app.get('/', function homepage(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// signup route with placeholder response
// app.get('/signup', function (req, res) {
//   res.send('signup coming soon');
// });

// login route with placeholder response
app.get('/login', function (req, res) {
  res.send('login coming soon');
});


// signup route (renders signup view)
app.get('/signup', function (req, res) {
  res.render('/views/signup.ejs');
});
//
//

// listen on port 3000
app.listen(3000, function () {
  console.log('server started on locahost:3000');
});

function start(route, handle) {

    function onRequest(request, response) {

        var pathname = url.parse(request.url).pathname,
            postData = '';

        request.setEncoding('utf8');

        request.addListener('data', function(postDataChunk) {
            postData += postDataChunk;
        });

        request.addListener('end', function() {
            route(handle, pathname, response, postData);
        });
    }

    http.createServer(onRequest).listen(config.port);
}

exports.start = start;


//
//
// function start(route, handle) {
//
//     function onRequest(request, response) {
//
//         var pathname = url.parse(request.url).pathname,
//             postData = '';
//
//         request.setEncoding('utf8');
//
//         request.addListener('data', function(postDataChunk) {
//             postData += postDataChunk;
//         });
//
//         request.addListener('end', function() {
//             route(handle, pathname, response, postData);
//         });
//     }
//
//     http.createServer(onRequest).listen(config.port);
// }
//
// exports.start = start;
//
// // MIDDLEWARE
//

//
// //renders signup and signin pages
// app.set('view engine', 'ejs');
//



/**********
 * ROUTES *
 **********/


 /*
 * HTML Endpoints
 */

//  app.get('/users', function homepage(req, res) {
//     res.render('index');
//  });
//


// Old server port
// /**********
//  * SERVER *
//  **********/
//
// // listen on port 3000
// app.listen(process.env.PORT || 3000, function() {
//   console.log('Express server is up and running on http://localhost:3000/');
// });

// old code
// //RecordRTC
// var RecordRTC = require('recordrtc');
// var Whammy = RecordRTC.Whammy;
// var WhammyRecorder = RecordRTC.WhammyRecorder;
// var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
// var video = new Whammy.Video(100);
// var recorder = new StereoAudioRecorder(stream, options);
