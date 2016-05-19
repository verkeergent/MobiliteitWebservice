/**
 * Created by floriangoeteyn on 02-May-16.
 */
var express = require('express');
var router = express.Router();

var request = require("request");
var _ = require("underscore");
var passport = require('../config/passport');
var fs = require('fs');

var scenarios=[];
var vgsAlerts=[];

getItems();
setInterval(getItems, 30000);

var url = process.env.API_VGS_URL;

function getItems() {

  vgsAlerts.forEach(function(alert){
    var alertdate = new Date(alert.date);
    var FOUR_DAYS = 4 *24* 60 * 60* 1000;
    if(new Date(new Date().getTime() + (2 * 60 * 60 * 1000))-alertdate<FOUR_DAYS){
      var index = vgsAlerts.indexOf(alert);
      if(index>-1)
        vgsAlerts.splice(index, 1);
    }
  });

  request({
    url: url,
    json: true
  }, function (error, response, body) {


    if (!error && response.statusCode === 200) {

      when(
        function(done) {

          body.forEach(function(newscenario){

            var oldScenarioarray = scenarios.filter(function( oldscenario ) {
              return oldscenario.id == newscenario.id;
            });

            var oldScenario=null;
            if(oldScenarioarray.length>0) {
              oldScenario = oldScenarioarray[0];
            }

            if(oldScenario!=null && newscenario.state!=oldScenario.state){

              var vgsAlert={
                id: "vgs"+newscenario.id.toString(),
                name: newscenario.name,
                description: newscenario.description,
                state: newscenario.state,
                type: newscenario.type,
                date: (new Date(new Date().getTime() + (2 * 60 * 60 * 1000))).toUTCString()
              };

              vgsAlerts.push(vgsAlert);
            }
          });

          done();
        }
      ).then(function() {
        // all are done
        scenarios=body;
      });

    }
  });
}

var when = function() {
  var args = arguments;  // the functions to execute first
  return {
    then: function(done) {
      var counter = 0;
      for(var i = 0; i < args.length; i++) {
        // call each function with a function to call on done
        args[i](function() {
          counter++;
          if(counter === args.length) {  // all functions have notified they're done
            done();
          }
        });
      }
    }
  };
};

router.get('/', passport.isAuthenticated, function (req, res, next) {
    if (isAllowed(req, res)) {
      res.setHeader('Content-Type', 'application/json');

      var removedItems = vgsAlerts.filter(function (item) {
        return req.user.removedItemIds.indexOf(item.id.toString()) > -1;
      });

      var filteredItems = _.difference(vgsAlerts, removedItems);

      res.json({vgsItems: filteredItems});
      //res.json({vgsItems: vgsAlerts});
    }
    else {
      res.render('index', {user: req.user, message: "You are not allowed to view the VGS items, please check your permissions."});
    }
  }
);

router.delete('/:item_id', passport.isAuthenticated, function (req, res) {
  if (isAllowed(req, res)) {
    passport.removeItem(req, res, vgsAlerts);
  }else {
    res.render('index', {user: req.user, message: "You are not allowed to view the VGS items, please check your permissions."});
  }
});

router.put('/:item_id', passport.isAuthenticated, function (req, res) {
  if (isAllowed(req, res)) {
    passport.undeRemoveItem(req, res);
  }else {
    res.render('index', {user: req.user, message: "You are not allowed to view the VGS items, please check your permissions."});
  }
});

function isAllowed(req, res) {
  return !!_.contains(req.user.permissions, _.find(req.user.permissions, function (permission) {
    return permission.items == "vgsItems" && permission.allowed;
  }));
}

module.exports = router;
