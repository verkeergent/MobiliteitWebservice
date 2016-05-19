/**
 * Created by floriangoeteyn on 13-Apr-16.
 */
var express = require('express');
var router = express.Router();

var request = require("request");
var http = require('http');
var querystring = require('querystring');

var passport = require('../config/passport');
var _ = require("underscore");
var fs = require('fs');

var coyoteItems;

var url = process.env.API_COYOTE_URL;
var loginurl = process.env.COYOTE_LOGIN_URL;
var cookie;

getCoyoteItems();
setInterval(getCoyoteItems, 20000);


function getCoyoteItems() {

  var keys;
  try {
    keys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));
  } catch (ignored) {
  }

  var login = keys == null ? process.env.COYOTE_LOGIN : keys.coyotelogin;
  var password = keys == null ? process.env.COYOTE_PASSWORD : keys.coyotepassword;

  var form = {
    login: login,
    password: password
  };

  var formData = querystring.stringify(form);

  request.post({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    url: loginurl,
    body: formData
  }, function (err, res, body) {
    cookie = res.headers['set-cookie'];

    request.get({
      headers: {
        'Cookie': cookie
      },
      url: url,
      json: true
    }, function (error, response, body) {
      var alerts = [];
      var traveltimes = [];
      if (!error && response.statusCode === 200) {
        for (var alertname in body.alerts) {
          alerts.push(body.alerts[alertname]);
        }

        for (var travelname in body.Gand) {
          var travelitem = body.Gand[travelname];

          if (travelitem.diff_time > 420) {
            travelitem.road = travelname;
            travelitem.id = travelname.replace(/\s/g, '');
            travelitem.date = (new Date(new Date().getTime() + (2 * 60 * 60 * 1000))).toUTCString();
            traveltimes.push(travelitem);
          }else
          {
            passport.resetRemovedId(travelitem.id);
          }


          for(var travelalertname in travelitem.alerts){
            alerts.push(travelitem.alerts[travelalertname]);
          }

        }
      }
      coyoteItems = {alerts: alerts, traveltimes: traveltimes};
    });
  });
}


router.get('/', passport.isAuthenticated, function (req, res, next) {


  if (isAllowed(req, res)) {
    res.setHeader('Content-Type', 'application/json');

    var removedAlerts = coyoteItems.alerts.filter(function (item) {
      return req.user.removedItemIds.indexOf(item.id) > -1;
    });

    var filteredAlerts = _.difference(coyoteItems.alerts, removedAlerts);

    res.json({coyotealerts: filteredAlerts, coyotetraveltimes: coyoteItems.traveltimes});
  }
  else {
    res.render('index', {user: req.user, message: "You are not allowed to view the Coyote items, please check your permissions."});
  }


  res.json(coyoteItems);
});


router.delete('/:item_id', passport.isAuthenticated, function (req, res, error) {
  if (isAllowed(req, res)) {
    passport.removeItem(req, res, coyoteItems.alerts);
  }
  else {
    res.render('index', {user: req.user, message: "You are not allowed to view the Coyote items, please check your permissions."});
  }
});


router.put('/:item_id', passport.isAuthenticated, function (req, res) {
  if (isAllowed(req, res)) {
    passport.undeRemoveItem(req, res);
  }
  else {
    res.render('index', {user: req.user, message: "You are not allowed to view the Coyote items, please check your permissions."});
  }
});


function isAllowed(req, res) {
  return !!_.contains(req.user.permissions, _.find(req.user.permissions, function (permission) {
    return permission.items == "coyoteItems" && permission.allowed;
  }));
}

module.exports = router;
