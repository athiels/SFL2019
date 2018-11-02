var mongoose = require( 'mongoose' );

var settingsSchema = new mongoose.Schema({
	id: {
		type: String,
    	unique: true,
		required: true
	},
  	foundartists: {
    	type: Array
  	}
});

var Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
 
