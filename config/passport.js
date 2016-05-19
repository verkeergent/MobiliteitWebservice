// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var passport = require('passport');
var mongoose = require("mongoose");
var _ = require("underscore");

var permissions = [{items: "vgsItems"}, {items: "wazeItems"}, {items: "twitterItems"}, {items: "mailItems"}, {items: "parkingItems"}, {items: "coyoteItems"}];

// load up the user model
var User = mongoose.model("User");

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// =========================================================================
// LOCAL SIGNUP ============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with username
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function (req, username, password, done) {

    // find a user whose username is the same as the forms username
    // we are checking to see if the user trying to login already exists
    User.findOne({'username': username}, function (err, user) {
      // if there are any errors, return the error
      if (err)
        return done(err);

      // check to see if theres already a user with that username
      if (user) {
        return done(null, false, req.flash('signupMessage', 'This username is already taken.'));
      } else {

        // if there is no user with that username
        // create the user
        var newUser = new User();

        // set the user's local credentials
        newUser.username = username;
        newUser.password = newUser.generateHash(password); // use the generateHash function in our user model
        newUser.isAdmin = req.body.isAdmin;

        permissions.forEach(function (p) {
          newUser.permissions.push(p);
        });

        // save the user
        newUser.save(function (err) {
          if (err)
            throw err;
          return done(null, req.user);
        });
      }

    });

  }));


// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with username
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function (req, username, password, done) { // callback with username and password from our form
    // find a user whose username is the same as the forms username
    // we are checking to see if the user trying to login already exists
    User.findOne({'username': username}, function (err, user) {
      // if there are any errors, return the error before anything else
      if (err) {
        console.log(err);
        return done(null, false, req.flash('loginMessage', 'error.'));
      }

      // if no user is found, return the message
      else if (!user)
        return done(null, false, req.flash('loginMessage', 'User not found.')); // req.flash is the way to set flashdata using connect-flash

      // if the user is found but the password is wrong
      else if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Wrong password.')); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, user);
    });
  }
));


passport.use(new BasicStrategy(
  function (username, password, done) {
    User.findOne({username: username}, function (err, user) {
      if (err) {
        return done(err);
      }

      // No user found with that username
      if (!user) {
        return done(null, false);
      }

      // Make sure the password is correct
      user.verifyPassword(password, function (err, isMatch) {
        if (err) {
          return done(err);
        }

        // Password did not match
        if (!isMatch) {
          return done(null, false);
        }

        // Success
        return done(null, user);
      });

    });
  }
));


updatePermissions();
setInterval(updatePermissions, 20000);

function updatePermissions() {
  User.find({}, function (err, users) {

    users.forEach(function(user){

      permissions.forEach(function (permission) {

        if (_.contains(user.permissions, _.find(user.permissions, function (userpermission) {
            return permission.items == userpermission.items;
          }))) {
        }
        else {
          console.log("permission does not appear:\n"+permission.items);
          user.permissions.push(permission);
          user.save(function (err) {
            if (err)
              console.log("updating permissions failed!");
            else
              console.log("user " + user.username + " permissions updated: " + user.permissions);
          })
        }
      });
    });
  });
}

exports.editPassword = function(username, password, done){
  User.findOne({'username': username}, function (err, user) {
    if(user){
      user.password = user.generateHash(password); // use the generateHash function in our user model
      // save the user
      user.save(function (err) {
        if (err)
          throw err;
        return done(user);
      });
    }
  });
};

exports.isAuthenticated = passport.authenticate('basic', {session: false});

exports.removeItem = function (req, res, items) {

  var user = req.user;
  var itemId = req.params.item_id.toString();

  if (!(user.removedItemIds.indexOf(itemId) > -1)) {
    if (_.contains(items, _.find(items, function (item) {
        return ((item.id == req.params.item_id) || (item.uuid == req.params.item_id) || (item.id_str == req.params.item_id));
      }))) {

      user.removedItemIds.push(req.params.item_id);
      var removedItemIds = user.removedItemIds;
      User.update({username: req.user.username}, {removedItemIds: removedItemIds}, function (err, num, raw) {
        if (err) {
          res.send(err);
        }
        else if (!res.headersSent) {
          res.json({message: num + ' removed'});
        }
      });
    }
    else {
      if (!res.headersSent) {
        res.json({message: 'item does not exist'});
      }
    }
  } else {
    if (!res.headersSent) {
      res.json({message: 'item is already removed'});
    }
  }

};


exports.undeRemoveItem = function (req, res) {
  var user = req.user;
  var removedItemIds = user.removedItemIds;

  var index = removedItemIds.indexOf(req.params.item_id);

  if (index > -1) {
    removedItemIds.splice(index, 1);
    User.update({username: req.user.username}, {removedItemIds: removedItemIds}, function (err, num, raw) {
      if (err)
        res.send(err);

      res.json({message: 'undo removing ' + num});
    });
  } else {
    res.json({message: 'undo failed'});
  }
};


exports.resetRemovedId = function(id){
  User.find({}, function (err, users) {
    if(!err) {
      users.forEach(function (user) {

        user.removedItemIds.pull(id);
        user.save(function (err) {
        });
      });
    }
  });
};


exports.findUserById = function (username, done) {
  User.findOne({username: username}, function (err, user) {
    if (!err)
      return done(user);
    else
      return done(err);
  });
};
