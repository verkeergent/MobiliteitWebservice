/**
 * Created by floriangoeteyn on 04-May-16.
 */
var express = require('express');
var router = express.Router();

var request = require("request");
var _ = require("underscore");
var passport = require('../config/passport');

var User = require('../models/User');

var customItems=[];

updateItems();
setInterval(updateItems, 60*1000);

function updateItems() {
  customItems.forEach(function(item){
    var time = new Date(Date.parse(item.time));
    time.setHours(time.getHours()-2);
    var TEN_MINUTES = 10*60 * 1000; /* ms */
    if((new Date)-time>TEN_MINUTES) {
      var index = customItems.indexOf(item);
      customItems.splice(index, 1);
    }
  })
}


router.get('/', passport.isAuthenticated, function (req, res, next) {
      res.setHeader('Content-Type', 'application/json');

      var removedItems = customItems.filter(function (item) {
        return req.user.removedItemIds.indexOf(item.id.toString()) > -1;
      });

      var filteredItems = _.difference(customItems, removedItems);

      res.json({customItems: filteredItems});
  }
);

router.delete('/:item_id', passport.isAuthenticated, function (req, res) {
    passport.removeItem(req, res, customItems);
});


router.put('/', passport.isAuthenticated, function (req, res) {

  var time = (new Date(new Date().getTime() + (2 * 60 * 60 * 1000))).toUTCString();
  var id = "ci"+ new Date().valueOf();
  var title=req.body.title;
  var description = req.body.description;


  var customItem =
  {
    time: time,
    id: id,
    title: title,
    description: description
  };
  customItems.push(customItem);

  res.json({customItems: customItems});
});


router.put('/:item_id', passport.isAuthenticated, function (req, res) {
    passport.undeRemoveItem(req, res);
});


module.exports = router;
