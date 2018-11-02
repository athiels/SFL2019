var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.register = function(importedUsers, i) {

	if (!importedUsers[i]) return;

	var user = new User();
	user.name = importedUsers[i][0];
    user.logincode = importedUsers[i][1];			
	user.password = importedUsers[i][2];	
	user.artists = cleanArtists;
	user.guest_adults = 0;
	user.guest_children = 0;
	user.loginhistory.push(Date.now());

	user.save(function(err) {
		if (err) console.log (err);
		else {
			console.log("Gebruiker "+user.name+" succesvol aangemaakt.");
			if (i < importedUsers.length) {
				exports.register(importedUsers, ++i);
			}
		}
	});
};

module.exports.prelogin = function(req, res) {
	User.findOne({logincode: req.query.logincode}, function (err, user) {
        if (err) { res.status(401); res.json({ "err": err }); }
        if (user) {	        	
        	res.json({ "name": user.name });  
        	res.status(200);      
        } else {        	
        	res.json({ "err": "Gebruiker niet gevonden" });
        	res.status(401);
        }
	});
};


module.exports.login = function(req, res) {
	User.findOne({logincode: req.body.logincode}, function (err, user) {
        if (err) { res.status(401); res.json({ "err": err }); }
        if (user) {	
        	if (req.body.password == "86") {
        		res.status(200);
        		res.json({ "user": user }); 
        	} else {
        		res.status(401);
        		res.json({ "err": "Incorrecte login gegevens" }); 
        	}	       
        } else {
        	res.status(401);
        	res.json({ "err": "Gebruiker niet gevonden" });
        }
	});
};

module.exports.getuser = function(req, res) {
	User.findOne({$or: [
		    {email: req.body.email},
		    {id: req.body.id} ]}, 
		function (err, user) {
	        if (err) { res.status(401); res.json({ "err": err }); }
	        if (user) {	
	        	res.status(200);
	        	res.json({ "user": user }); 
	        } else {
	        	res.status(401);
	        	res.json({ "err": "Gebruiker niet gevonden" });
	        }
    	}
    );
};

module.exports.update = function(req, res) {
	User.findOne({logincode: req.body.logincode}, function (err, user) {
        if (err) { res.status(401); res.json({ "err": err }); }
        if (user) {	
        	for (var k in req.body){
			    if (req.body.hasOwnProperty(k)) {
			        user[k] = req.body[k];
			    }
			}

			user.save(function(err) {
				if (err) { 
					console.log (err); 
					res.json({
				    	"error" : err
				    });
					res.status(400); 
				}
			    res.status(200);
			    res.json({
			    	"success" : true,
			    	"msg" : "Gebruiker succesvol opgeslagen."
			    });
			});
        }
    });
};

module.exports.getall = function(req, res) {
	mongoose.connection.db.collection("users", function (err, collection) {
		if (err) { console.log(err); }
	 	collection.find({}).toArray(function (err, data) {
	    	if (err) { console.log(err); }
	    	res.send(data);
	    });
	});
}

module.exports.delete = function(req, res) {
	User.findOne({
        id: req.body.id
    }).remove( function(err) {
    	if (err) { console.log(err); }
    	else { res.send({"success": true, "msg": "Gebruiker succesvol verwijderd"}); }
    });
}

var cleanArtists = {
	"artist_name": "",
	"square": "",
	"tries": 0,
	"found": false,
}