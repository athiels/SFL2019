var mongoose = require( 'mongoose' );

var userSchema = new mongoose.Schema({
  logincode: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  activated: {
    type: Boolean,
    default: false,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  artists: {
    type: Array,
    required: true
  },
  guest_adults: {
    type: String,
  },
  guest_children: {
    type: String,
  }
});

var User = mongoose.model('User', userSchema);
module.exports = User;
 
