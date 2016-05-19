var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var mongoose = require('mongoose');

require('./models/User');
require('./config/passport');

var routes = require('./routes/index');
var users = require('./routes/users');
var twitterItems = require('./routes/twitterItems');
var wazeItems = require('./routes/wazeItems');
var parkingItems = require('./routes/parkingItems');
var mailItems = require('./routes/mailItems');
var coyoteItems = require('./routes/coyoteItems');
var vgsItems = require('./routes/vgsItems');
var customItems = require('./routes/customItems');
var auth = require('./routes/auth');
var settings = require('./routes/settings');



//pingt de app elke 45 minuten om hem wakker te houden (voor gratis versie)
require('heroku-self-ping')("http://mobiliteitgent.herokuapp.com/");



var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

//mongodb database connection
mongoose.connect('mongodb://localhost/mobiliteit');

mongoose.connection.on('open', function (ref) {
  console.log('Connected to mongo server. Ready state: ' + mongoose.connection.readyState);
});
mongoose.connection.on('error', function (err) {
  console.log('Connection to mongo server failed.');
  console.log(err);
});


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: 'true'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon(__dirname + '/public/logo.ico'));


app.use(session({secret: 'mobiliteit', resave: false, saveUninitialized: false})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

var methodOverride = require('method-override');

app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride());


app.use('/', routes);
app.use('/twitterItems', twitterItems);
app.use('/wazeItems', wazeItems);
app.use('/parkingItems', parkingItems);
app.use('/mailItems', mailItems);
app.use('/coyoteItems', coyoteItems);
app.use('/customItems', customItems);
app.use('/vgsItems', vgsItems);
app.use('/settings', settings);
app.use('/', auth);
app.use('/', users);


//require('./routes/users.js')(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
app.use(function (err, req, res, next) {
  if (!res.headersSent) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  }

});

module.exports = app;
