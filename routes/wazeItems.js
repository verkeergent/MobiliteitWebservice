/**
 * Created by floriangoeteyn on 29-Feb-16.
 */
var express = require('express');
var router = express.Router();

var request = require("request");
var http = require('http');
var passport = require('../config/passport');
var _ = require("underscore");

var fs = require('fs');

var wazeItems;

var wazeAlerts = [];
var wazeJams = [];

var roadblockgroups = [];
var roadblockalerts = [];

var wazeRoadblocks = [];

//var url = process.env.API_WAZE_URL;

getWazeItems();
setInterval(getWazeItems, 20000);

function getWazeItems() {
  var keys;
  try {
    keys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));
  } catch (ignored) {
  }

  var url = keys==null?process.env.API_WAZE_URL:keys.wazeurl;

  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      wazeItems = body;
      var jams = wazeItems.jams;
      var alerts = wazeItems.alerts;
      var roadblocks = [];
      var filteredjams = [];
      for (var jamitem in jams) {
        var jam = jams[jamitem];
        if (jam.blockingAlertUuid != null) {
          var blockingAlert = alerts.filter(function (alert) {
            return alert.uuid == jam.blockingAlertUuid;
          })[0];
          blockingAlert.line = jam.line;
          blockingAlert.length = jam.length;
          blockingAlert.roadType = jam.roadType;
          roadblocks.push(blockingAlert);
        }
        else {
          filteredjams.push(jam);
        }
      }
      roadblockgroups = [];
      roadblockalerts = [];
      wazeAlerts = wazeItems.alerts;
      wazeJams = filteredjams;
      wazeRoadblocks = roadblocks;
/*
      for(var rbid in wazeRoadblocks){
        var roadblock = wazeRoadblocks[rbid];
        var result = wazeAlerts.filter(function( alert ) {
          return alert.uuid == roadblock.uuid;
        });
        wazeAlerts.splice(wazeAlerts.indexOf(result)[0], 1);
      }
      linkalerts();*/

    }
  });
}
/*
function linkalerts() {
  if(wazeRoadblocks.length>0){
    var roadblock = wazeRoadblocks[0];
    var linkedroadblocks = findLinkedroadblocks(roadblock);
    roadblockgroups.push(linkedroadblocks);
    wazeRoadblocks.splice(0, 1);
    linkalerts();
  }else{
    createRoadblockAlerts();
  }
}

function findLinkedroadblocks(roadblock){
  var linkedroadblocks =[];
  linkedroadblocks.push(roadblock);
  for(var element in wazeRoadblocks){
    var roadblock2 = wazeRoadblocks[element];
    for(var loc in roadblock.line){
      var location = roadblock.line[loc];
      if(roadblock2.line.indexOf(location)>-1){
        linkedroadblocks.push(roadblock2);
        var index = wazeRoadblocks.indexOf(roadblock2);
        wazeRoadblocks.splice(index, 1);
      }
    }
  }
  return linkedroadblocks;
}


function createRoadblockAlerts(){
  for(var rbgId in roadblockgroups){
    var roadblockgroup = roadblockgroups[rbgId];
    var firstRoadblock = roadblockgroup[0];
    roadblockgroup.splice(0, 1);
    for(var rbid in roadblockgroup){
      var roadblock = roadblockgroup[rbid];
      for(var locid in roadblock.line){
        var location = roadblock.line[locid];

        if(!(firstRoadblock.line.indexOf(location)>-1)){
          firstRoadblock.line.push(location);
        }
      }
      //roadblockalerts.push(firstRoadblock);
      wazeAlerts.push(firstRoadblock);
    }
  }
}*/


router.get('/', passport.isAuthenticated, function (req, res, next) {
    if (isAllowed(req, res)) {
      res.setHeader('Content-Type', 'application/json');

      var removedAlerts = wazeAlerts.filter(function (item) {

        if(req.user.removedItemIds.indexOf(item.uuid) > -1){
          if(item.type == "ROAD_CLOSED"){
            item.removed = true;
            return false;
          }
          else{
            return true;
          }
        }
        else
          return false;

        //return req.user.removedItemIds.indexOf(item.uuid) > -1;
      });

      var removedJams = wazeJams.filter(function (item) {
        return req.user.removedItemIds.indexOf(item.uuid) > -1;
      });

      var filteredAlerts = _.difference(wazeAlerts, removedAlerts);
      var filteredJams = _.difference(wazeJams, removedJams);

      res.json({alerts: filteredAlerts, jams: filteredJams});
    }
    else {
      res.render('index', {user: req.user, message: "You are not allowed to view the waze items, please check your permissions."});
    }
  }
);


router.delete('/:item_id', passport.isAuthenticated, function (req, res, error) {
  if (isAllowed(req, res)) {
    passport.removeItem(req, res, wazeAlerts);
    passport.removeItem(req, res, wazeJams);
  }
  else {
    res.render('index', {user: req.user, message: "You are not allowed to view the waze items, please check your permissions."});
  }
});


router.put('/:item_id', passport.isAuthenticated, function (req, res) {
  if (isAllowed(req, res)) {
    passport.undeRemoveItem(req, res);
  }
  else {
    res.render('index', {user: req.user, message: "You are not allowed to view the waze items, please check your permissions."});
  }
});


function isAllowed(req, res) {
  return !!_.contains(req.user.permissions, _.find(req.user.permissions, function (permission) {
    return permission.items == "wazeItems" && permission.allowed;
  }));
}

module.exports = router;
