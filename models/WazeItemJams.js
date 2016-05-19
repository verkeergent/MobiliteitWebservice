/**
 * Created by floriangoeteyn on 25-Feb-16.
 */
var mongoose = require('mongoose');

var WazeItemJamSchema = new mongoose.Schema({

  country:{type:String, default:""},
  city:{type:String, default:""},
  type:{type:String, default:""},
  uuid:{type:String, default:""},
  roadType:{type:Number, default:""},
  street:{type:String, default:""},
  pubMillis:{type:Number, default:""},
  line:[{location:[{x:{type:Number, default:0}, y:{type:Number, default:0}}]}],
  level:{type:Number, default:""},
  speed:{type:Number, default:""},
  length:{type:Number, default:""},
  delay:{type:Number, default:""},
  startNode:{type:String, default:""},
  endNode:{type:String, default:""},
  turnLine:{type:Number, default:""},
  turnType:{type:Number, default:""},
  blockingAlertUuid:{type:Number, default:""}

}, {collection:'wazeitemjams'});

mongoose.model('WazeItemJam', WazeItemJamSchema);
