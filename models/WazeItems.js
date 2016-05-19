/**
 * Created by floriangoeteyn on 25-Feb-16.
 */

var mongoose = require('mongoose');

var WazeItemSchema = new mongoose.Schema({


}, {collection:'wazeitems'});

mongoose.model('WazeItem', WazeItemSchema);
