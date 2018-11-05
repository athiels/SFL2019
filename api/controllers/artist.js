	 var mongoose = require('mongoose');
var User = mongoose.model('User');

var artistnames = ["Adele","Amy Winehouse","Beyonce","Daft Punk","David Bowie","Deathmou5","Eddy Wally","Gorillaz","Iggy Pop","Jan Tempst","Jimi Hendrix","Kurt Curbain","Mick Jagger", "Nervo", "Pharrell Williams", "Prince", "Queen", "Sia"];
module.exports.get = function(req, res) {
	User.findOne( {logincode: req.query.logincode}, function (err, user) {
		if (err) { 				
			res.json({ "err": err });  
			res.status(401);
			return;
		}
		if (user) {
			for (ua=0;ua<user.artists.length;ua++) {			
				if (!user.artists[ua].found) {
					user.artists[ua].square = "";
				}			
			}
			res.json({ "user": user });  
	        res.status(200);
		}
	});
};


module.exports.submitSquare = function(req, res) {
	User.findOne( {logincode: req.body.logincode}, function (err, user) {
		if (err) { 				
			res.json({ "err": err });  
			res.status(401);
			return;
		}
		for (a=0;a<user.artists.length;a++) {
			if (user.artists[a].artist_name == req.body.artist_name) {
				if (user.artists[a].square == req.body.artist_square.toString().toUpperCase()) {
					user.artists[a].found = true;
				}
				user.artists[a].tries = parseInt(user.artists[a].tries)+1;
				user.markModified('artists');
				user.save(function(err) {
					if (err) { 
						console.log (err); 
						res.json({"error" : err});
						res.status(400); 
					}	

					if (user.artists[a].square == req.body.artist_square.toString().toUpperCase()) {	
						var score = (4 - parseInt(user.artists[a].tries));
						if (score < 1) var scoreText = "1 punt"; 
						else var scoreText = score + " punten";
						res.json({
					    	"success" : true,
					    	"msg" : req.body.artist_name + " gevonden na "+user.artists[a].tries+" keer!<br><span class='green'>" + scoreText + '!</span>'
					    });
					    res.status(200);
					} else {	
						var remainingTries = (3 - parseInt(user.artists[a].tries));
						var errMsg = req.body.artist_name + " staat niet op puzzelstukje " + req.body.artist_square.toString().toUpperCase();
						if (remainingTries > 0) {
							errMsg += '<br><br>Resterende kansen: '+remainingTries;
						} else {
							errMsg += '<br><br>Je kan het puzzelstukje nog ingeven, <br>maar je zal er geen punten meer voor krijgen.<br>';
						}
					    res.json({
					    	"success" : false,
					    	"err" : errMsg
					    });
					    res.status(200);
					}
				});
				return;
			}
		}
	});
};


module.exports.highscores = function(req, res) {
	User.find({}, function (err, users) {
		if (err) { 			
			res.json({ "err": err });  
			res.status(401);
			return;
		}

		var scores = Array();
		for (i=0;i<users.length;i++) {
			var userScore = Array();
			userScore[0] = users[i].name;
			userScore[1] = 0;
			for (a=0;a<users[i].artists.length;a++) {
				if (users[i].artists[a].found) {
					var score = (4 - parseInt(users[i].artists[a].tries));
					if (score < 1) score = 1;
					userScore[1] += score;					
				}
			}
			scores.push(userScore);
		}
		scores.sort(sortFunction);
		res.json({"highscores" : scores});
	});
};

module.exports.foundartists = function(req, res) {
	User.find({}, function (err, users) {
		if (err) { 			
			res.json({ "err": err });  
			res.status(401);
			return;
		}

		var userScore = 0;
		var scores = Array();
		for (i=0;i<users.length;i++) {
			var foundartists = Array();
			foundartists[0] = users[i].name;
			foundartists[1] = 0;
			for (a=0;a<users[i].artists.length;a++) {
				if (users[i].artists[a].found) {
					foundartists[1]++;
					if (users[i].logincode == req.query.logincode) {
						var score = (4 - parseInt(users[i].artists[a].tries));
						if (score < 1) score = 1;						
						userScore += score;
					}			
				}
			}
			scores.push(foundartists);
		}
		scores.sort(sortFunction);
		res.json({
			"highscores" : scores,
			"userscore" : userScore
		});
	});
};



function sortFunction(a, b) {
    if (a[1] === b[1]) {
        return (a[0] < b[0]) ? -1 : 1;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}