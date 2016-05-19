/**
 * Created by floriangoeteyn on 18-Mar-16.
 */
var express = require('express');
var app = express.Router();

var request = require("request");
var passport = require("passport");
var LocalStrategy   = require('passport-local').Strategy;
var session = require('express-session');


// =====================================
// HOME PAGE (with login links) ========
// =====================================
app.get('/', function(req, res) {
  res.render('index.ejs'); // load the index.ejs file
});

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
app.get('/login', function(req, res) {

  // render the page and pass in any flash data if it exists
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

// process the login form
app.post('/login', passport.authenticate('local-login', {
  successRedirect : '/', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));



// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
app.get('/signup', isAdmin, function(req, res) {
  // render the page and pass in any flash data if it exists
  res.render('signup.ejs', { message: req.flash('signupMessage') });
});

// process the signup form
app.post('/signup', isAdmin, passport.authenticate('local-signup', {
  successRedirect : '/', // redirect to usersView
  failureRedirect : '/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));


// =====================================
// LOGOUT ==============================
// =====================================
app.get('/logout', function(req, res) {
  req.session.destroy();
  req.logout();
  res.redirect('/');
});

function isAdmin(req, res, next) {
  if (req.isAuthenticated()&&req.user.isAdmin) {
    return next();
  }else {
    res.render('index', {message: "You must be signed in as admin to add users."});
  }
}


module.exports = app;
