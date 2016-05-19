/**
 * Created by floriangoeteyn on 06-Apr-16.
 */
var mongoose = require('mongoose');

var ParkingItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  latitude: Number,
  longitude: Number,
  address: String,
  parkingStatus: {
    availableCapacity: Number,
    totalCapacity: Number,
    lastModifiedDate: String
  }

}, {collection:'parkingitems'});

mongoose.model('ParkingItem', ParkingItemSchema);
