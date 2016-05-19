var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var permissions = new Schema({
/*
  wazeItems: { type: Boolean, default: true },
  twitterItems: { type: Boolean, default: true },
  parkingItems: { type: Boolean, default: true },
  mailItems: { type: Boolean, default: true },*/

  items:    String,
  allowed:  { type: Boolean, default: true }
},{ _id : false });

// define the schema for our user model
var userSchema = new Schema({
    username:       String,
    password:       String,
    isAdmin:        { type: Boolean, default: false },
    removedItemIds: [String],
    permissions:    [permissions]
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
