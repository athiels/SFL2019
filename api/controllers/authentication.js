var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.register = function(importedUsers, i) {

	if (!importedUsers[i]) return;

	var user = new User();
	user.name = importedUsers[i][0];
    user.logincode = importedUsers[i][1];			
	user.password = importedUsers[i][2];	
	user.artists = createArtistJson(importedUsers[i]);
	user.guest_adults = 0;
	user.guest_children = 0;

	//if (user.logincode == 'thiels') 
	user.activated = true;

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
        	if (user.activated) {
        		res.json({ "name": user.name });  
        		res.status(200);  
        	} else {
        		res.json({ "err": "Account nog niet geactiveerd. <br>Gelieve eerst de puzzel te maken en dan een foto naar het SFL-Team te sturen." });
        		res.status(401);
        	}  	
        	    
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
        	if (req.body.password.toString().toUpperCase() == user.password) {
        		user.artists = "";
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
	User.findOne( {logincode: req.body.logincode}, function (err, user) {
	        if (err) { res.status(401); res.json({ "err": err }); }
	        if (user) {	
	        	user.artists = "";
	        	res.status(200);
	        	res.json({ "user": user }); 
	        } else {
	        	res.status(401);
	        	res.json({ "err": "Gebruiker niet gevonden" });
	        }
    	}
    );
};

module.exports.getdetails = function(req, res) {
	User.findOne( {logincode: req.query.logincode}, function (err, user) {
	        if (err) { res.status(401); res.json({ "err": err }); }
	        if (user) {	
	        	for (i=0; i<user.artists.length; i++){
	        		user.artists[i].square = "";
	        	}
	        	res.status(200);
	        	res.json({ "user": user }); 
	        } else {
	        	res.status(401);
	        	res.json({ "err": "Gebruiker niet gevonden" });
	        }
    	}
    );
};

module.exports.getall = function(req, res) {
	User.find( {}, function (err, users) {
	        if (err) { res.status(401); res.json({ "err": err }); }
	        if (users) {	
	        	res.status(200);
	        	res.json({ "users": users }); 
	        } else {
	        	res.status(401);
	        	res.json({ "err": "Gebruikers niet gevonden" });
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

module.exports.delete = function(req, res) {
	User.findOne({
        id: req.body.id
    }).remove( function(err) {
    	if (err) { console.log(err); }
    	else { res.send({"success": true, "msg": "Gebruiker succesvol verwijderd"}); }
    });
}

var artistnames = ["Adele","Amy Winehouse","Beyonce","Daft Punk","David Bowie","Deathmou5","Eddy Wally","Gorillaz","Iggy Pop","Jan Tempst","Jimi Hendrix","Kurt Curbain","Mick Jagger", "Nervo", "Pharrell Williams", "Prince", "Queen", "Sia"];

function createArtistJson(line) {
	var artists = Array();
	for (a=0;a<artistnames.length;a++) {
		var artist = {
			"artist_name": artistnames[a],
			"square": line[a+3],
			"tries": 0,
			"found": false
		}
		artists.push(artist);
	}
	return artists;
}