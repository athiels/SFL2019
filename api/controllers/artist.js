var mongoose = require('mongoose');
var Settings = mongoose.model('Settings');

module.exports.getfound = function(req, res) {
	Settings.findOne({
		id: 0
   	}, function (err, settings) {
		if (err) { 
			res.status(401);
			res.json({ "err": err });  
			return
		}
		res.json({ "foundartists": settings.foundartists });  
        res.status(200);
	});
};
