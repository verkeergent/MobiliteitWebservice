/**
 * Created by floriangoeteyn on 26-Apr-16.
 */
var express = require('express');
var router = express.Router();
var _ = require("underscore");
var fs = require("fs");
var qs = require('querystring');

var Users = require('../models/User');
var passport = require('../config/passport');

router.get('/api',isAdmin, function (req, res) {

  var keys;
  try {
    keys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));
  } catch (ignored) {
  }


  res.render('settings.ejs', {twitterkeys: keys.twitterkeys,
                              twitteraccounts: keys.twitteraccounts,
                              coyotelogin: keys.coyotelogin,
                              coyotepassword: keys.coyotepassword,
                              wazeurl: keys.wazeurl });
});


router.post('/api', isAdmin, function(req, res) {

  var consumerkeys = req.body.consumerkey;
  var consumersecrets = req.body.consumersecret;
  var consumertokenkeys = req.body.consumertokenkey;
  var consumertokensecrets = req.body.consumertokensecret;
  var twitteraccountnames = req.body.twitteraccountname;

  var newtwitteraccount = req.body.newtwitteraccount;

  var coyotelogin= req.body.coyotelogin;
  var coyotepassword= req.body.coyotepassword;

  var wazeurl = req.body.wazeurl;

  var twitteraccounts=[];

  if(newtwitteraccount!=null)
    twitteraccounts.push({name:newtwitteraccount});

  for(var i=0; i<twitteraccountnames.length; i++) {
    twitteraccounts.push(
      {
        name:twitteraccountnames[i]
        /*keys: {
          consumerkey: consumerkeys[i],
          consumersecret: consumersecrets[i],
          consumertokenkey: consumertokenkeys[i],
          consumertokensecret: consumertokensecrets[i]
        }*/
      }
    );
  }
  var twitterkeys = {
    consumerkey: consumerkeys,
    consumersecret: consumersecrets,
    consumertokenkey: consumertokenkeys,
    consumertokensecret: consumertokensecrets
  };

  var keys = {
    twitterkeys: twitterkeys,
    twitteraccounts: twitteraccounts,
    coyotelogin: coyotelogin,
    coyotepassword: coyotepassword,
    wazeurl: wazeurl
  };
  console.log();

  fs.writeFile("keys.json", JSON.stringify(keys), "utf8");

  res.render('settings.ejs', {
    message: "Settings saved.",
    twitterkeys: keys.twitterkeys,
    twitteraccounts: keys.twitteraccounts,
    coyotelogin: keys.coyotelogin,
    coyotepassword: keys.coyotepassword,
    wazeurl: keys.wazeurl });

});

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  } else {
    res.render('index', {user: req.user, message: "You must be signed in as admin to change the settings."});
  }
}


module.exports = router;
