/**
 * Created by floriangoeteyn on 29-Feb-16.
 */
var express = require('express');
var router = express.Router();

var request = require("request");
var _ = require("underscore");
var passport = require('../config/passport');

var User = require('../models/User');

var parkingItems;

var url = process.env.API_PARKING_URL;

getItems();
setInterval(getItems, 10000);

function getItems() {
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      parkingItems=[];
      var allitems = body;
      for(var element in allitems){
        var parkingItem = allitems[element];
        var availableCapacity = parkingItem.parkingStatus.availableCapacity;
        var totalCapacity = parkingItem.parkingStatus.totalCapacity;

        if((availableCapacity*100)/totalCapacity<11){
          parkingItems.push(parkingItem);
        }else{
          passport.resetRemovedId(parkingItem.id);
        }
      }
    }
  });
}


router.get('/', passport.isAuthenticated, function (req, res, next) {
    if (isAllowed(req, res)) {
      res.setHeader('Content-Type', 'application/json');

      var removedItems = parkingItems.filter(function (item) {
        return req.user.removedItemIds.indexOf(item.id.toString()) > -1;
      });

      var filteredItems = _.difference(parkingItems, removedItems);

      res.json({parkingItems: filteredItems});
    }
    else {
      res.render('index', {user: req.user, message: "You are not allowed to view the parking items, please check your permissions."});
    }
  }
);

router.delete('/:item_id', passport.isAuthenticated, function (req, res) {
  if (isAllowed(req, res)) {
    passport.removeItem(req, res, parkingItems);
  }else {
    res.render('index', {user: req.user, message: "You are not allowed to view the parking items, please check your permissions."});
  }
});

router.put('/:item_id', passport.isAuthenticated, function (req, res) {
  if (isAllowed(req, res)) {
    passport.undeRemoveItem(req, res);
  }else {
    res.render('index', {user: req.user, message: "You are not allowed to view the parking items, please check your permissions."});
  }
});


function isAllowed(req, res) {
  return !!_.contains(req.user.permissions, _.find(req.user.permissions, function (permission) {
    return permission.items == "parkingItems" && permission.allowed;
  }));
}


module.exports = router;
