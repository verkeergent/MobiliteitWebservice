/**
 * Created by floriangoeteyn on 24-Feb-16.
 */
var mongoose = require('mongoose');

var TwitterItemSchema = new mongoose.Schema({

  locatie:[{x:{type:Number, default:0}, y:{type:Number, default:0}}],
  user:[{username:{type:String, default:""}, userimage:{type:String, default:""}}],
  text:{type:String, default:""},
  pubMillis:{type:Number, default:null},
  mediaurl:{type:String, default:""}

}, {collection: 'twitteritems'});

mongoose.model('TwitterItem', TwitterItemSchema);
