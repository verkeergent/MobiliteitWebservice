/**
 * Created by floriangoeteyn on 25-Feb-16.
 */

var Twitter = require('twit');
var express = require('express');
var _ = require("underscore");
var fs = require('fs');

var passport = require('../config/passport');

var router = express.Router();

var listTweets=[];
var listMentions=[];

if (process.env.CONSUMER_KEY == null) {
  require('../env');
}


getTwitterItems();
setInterval(getTwitterItems, 65000);


function getTwitterItems(){

  var keys;
  try {
    keys = JSON.parse(fs.readFileSync('keys.json', 'utf8'));
  }
  catch (ignored) {
  }

  var users = [];
  var twitterkeys;

  if(keys!=null){
    users = keys.twitteraccounts;
    twitterkeys = keys.twitterkeys;
  }

  var client = new Twitter({
    consumer_key: twitterkeys.consumerkey,
    consumer_secret:twitterkeys.consumersecret,
    access_token:twitterkeys.consumertokenkey,
    access_token_secret:twitterkeys.consumertokensecret
  });

  listTweets=[];
  listMentions=[];


  for(var pos in users) {
    var user = users[pos].name;

    var params = {screen_name: user};

    client.get('statuses/user_timeline', params, function (error, tweets, response) {
      if (!error) {
        tweets.forEach(function(tweet) {
          tweet.isMention=false;
          var datestring = tweet.created_at;
          var date = new Date(Date.parse(datestring));
          var FOUR_HOURS = 4 * 60 * 60 * 1000; /* ms */
          if((new Date)-date<FOUR_HOURS)
            listTweets.push(tweet);
        });
      }
    });
  }

  /*client.stream('statuses/mentions_timeline', params, function(stream) {
    stream.on('data', function(tweet) {
      console.log(tweet.text);
    });

    stream.on('error', function(error) {
    });
  });*/


  client.get('statuses/mentions_timeline', params, function (error, mentions, response) {
    if (!error) {
      mentions.forEach(function(tweet) {
        tweet.isMention=true;
        listMentions.push(tweet);
      });
    }
  });
}

router.get('/', passport.isAuthenticated, function (req, res, next) {
    if (isAllowed(req, res)) {
      res.setHeader('Content-Type', 'application/json');
      var removedTweets = listTweets.filter(function (item) {
        return req.user.removedItemIds.indexOf(item.id_str) > -1;
      });

      var removedMentions = listMentions.filter(function (item) {
        return req.user.removedItemIds.indexOf(item.id_str) > -1;
      });

      var filteredTweets = _.difference(listTweets, removedTweets);
      var filteredMentions = _.difference(listMentions, removedMentions);

      var allitems = filteredTweets.concat(filteredMentions);

      res.json({twitterItems: allitems});
    }
    else {
      res.render('index', {message: "You are not allowed to view the twitter items, please check your permissions."});
    }
  }
);


router.delete('/:item_id', passport.isAuthenticated, function (req, res) {

  if (isAllowed(req, res)) {
    passport.removeItem(req, res, listTweets);
    passport.removeItem(req, res, listMentions);
  }else {
    res.render('index', {message: "You are not allowed to view the twitter items, please check your permissions."});
  }

});

router.put('/:item_id', passport.isAuthenticated, function (req, res) {
  if (isAllowed(req, res)) {
    passport.undeRemoveItem(req, res);
  }else {
    res.render('index', {user: req.user, message: "You are not allowed to view the twitter items, please check your permissions."});
  }
});



function isAllowed(req, res) {
  return !!_.contains(req.user.permissions, _.find(req.user.permissions, function (permission) {
    return permission.items == "twitterItems" && permission.allowed;
  }));
}


module.exports = router;

