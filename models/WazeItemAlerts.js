/**
 * Created by floriangoeteyn on 25-Feb-16.
 */
var mongoose = require('mongoose');

var WazeItemAlertSchema = new mongoose.Schema({

  country:{type:String, default:""},
  city:{type:String, default:""},
  reportRating:{type:Number, default:""},
  reliability:{type:Number, default:""},
  type:{type:String, default:""},
  uuid:{type:String, default:""},
  jamUuid:{type:String, default:""},
  roadType:{type:Number, default:""},
  magvar:{type:Number, default:""},
  subtype:{type:String, default:""},
  street:{type:String, default:""},
  imageUrl:{type:String, default:""},
  reportDescription:{type:String, default:""},
  location:[{x:{type:Number, default:0}, y:{type:Number, default:0}}],
  pubMillis:{type:Number, default:""}

}, {collection:'wazeitemalerts'});

mongoose.model('WazeItemAlert', WazeItemAlertSchema);
