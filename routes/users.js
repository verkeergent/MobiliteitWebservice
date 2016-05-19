var express = require('express');
var router = express.Router();
var _ = require("underscore");

var Users = require('../models/User');
var passport = require('../config/passport');


// api ---------------------------------------------------------------------
// get all todos
router.get('/users', isAdmin, function (req, res) {

  // use mongoose to get all users in the database
  Users.find(function (err, users) {

    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
    if (err)
      res.send(err);

    res.json(users); // return all users in JSON format
  });
});

router.get('/users/:username', isAdmin, function (req, res) {
  var username = req.params.username;
  passport.findUserById(username, function (user) {
    if(user) {
      res.render('profile.ejs', {
        user: user, // get the user out of session and pass to template
        currentuser: req.user
      });
    }
    else{
      res.render('index.ejs', {
        user: req.user, // get the user out of session and pass to template
        message: "User not found"
      });
    }
  });
});


router.post('/users/:username', isAdmin, function (req, res) {
  var username = req.params.username;
  var password = req.body.password;
  passport.editPassword(username, password, function(user){
    /*res.redirect("/users/"+username,{
      user: user,
      currentuser: req.user
    });*/
    res.render('profile.ejs', {
      user: user,
      currentuser: req.user,
      message: "Password saved successfully"
    });
  });
});


router.get('/users/:username/edit',isAdmin, function (req, res) {
  var username = req.params.username;
  passport.findUserById(username, function (user) {
    res.render('useredit', {
      user: user // get the user out of session and pass to template
    });
  });
});


router.post('/users/:username/edit', isAdmin, function (req, res) {
  var username = req.params.username;
  passport.findUserById(username, function (user) {
    if (user != null) {
      user.username = req.body.username;

      if(!user.isAdmin) {
        user.isAdmin = req.body.isAdmin;
      }

      user.permissions.forEach(function(p){
        //if p.items occurs in req.body.permissions
        if(_.contains(req.body.permissions, _.find(req.body.permissions, function(permission){
            return permission== p.items;
          }))){
          //permission is allowed
          p.allowed=true;
        }
        else{
          //otherwise permission is not allowed
          p.allowed=false;
        }
      });

      user.save(function (err) {
        if (err)
          res.send(err);
        else
          res.redirect('/users/'+user.username);
      })
    }
  });
});


router.get('/usersView', isAdmin, function (req, res) {
  res.render('users.ejs');
});


router.get('/profile', isLoggedIn, function (req, res) {
  res.render('profile.ejs', {
    user: req.user, // get the user out of session and pass to template
    currentuser: req.user
  });
});

router.post('/profile', isAdmin, function (req, res) {
  var username = req.user.username;
  var password = req.body.password;
  passport.editPassword(username, password, function(user){
    res.render('profile.ejs', {
      user: user,
      currentuser: req.user,
      message: "Password saved successfully"
    });
  });
});


router.get('/user', passport.isAuthenticated, function (req, res) {
  res.json(req.user);
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.render('index', {user: req.user, message: "You must be signed in to view your profile."});
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  } else {
    res.render('index', {user: req.user, message: "You must be signed in as admin to view users."});
  }
}

module.exports = router;
