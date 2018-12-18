const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('./api/models/user');
const auth = require('./api/controllers/authentication');
const artist = require('./api/controllers/artist');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const port = process.env.VT_PORT || 80;
const server = app.listen(port);
console.log("App is listening on port "+port);
server.timeout = 1000 * 60 * 10; // 10 minutes

// Database config
console.log('mongodb://'+process.env.SFL_DB_USERNAME+':'+process.env.SFL_DB_PASSWORD+'@ds141872.mlab.com:41872/sfl19');
mongoose.connect('mongodb://'+process.env.SFL_DB_USERNAME+':'+process.env.SFL_DB_PASSWORD+'@ds141872.mlab.com:41872/sfl19', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to Database");
    console.log("Server started.");

});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/puzzel', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/html/puzzel.html'));
});

app.get('/api/user/prelogin', function(req, res) {
	auth.prelogin(req, res);
});

app.post('/api/user/login', function(req, res) {
	auth.login(req, res);
});

app.post('/api/user/get', function(req, res) {
	auth.getuser(req, res);
});

app.get('/api/user/details', function(req, res) {
	auth.getdetails(req, res);
});

app.post('/api/user/update', function(req, res) {
	auth.update(req, res);
});

app.get('/api/user/getall', function(req, res) {
	auth.getall(req, res);
});

app.get('/api/artist/get', function(req, res) {
	artist.get(req, res);
});

app.post('/api/artist/new', function(req, res) {
	artist.new(req, res);
});

app.post('/api/artist/submit', function(req, res) {
	artist.submitSquare(req, res);
});

app.get('/api/artist/highscores', function(req, res) {
	artist.highscores(req, res);
});

app.get('/api/artist/foundartists', function(req, res) {
	artist.foundartists(req, res);
});

function uploadUsers() {
	var importedUsers = Array();
	fs.readFile('public/users.csv', 'utf8', function(err, data) {
		var lines = data.split(/\r?\n/);
		var users = Array();
		for (i=0; i<lines.length; i++) {
			var line = lines[i].split(";");
	 		importedUsers.push(line);
		}
		auth.register(importedUsers, 0);
	});
}
//uploadUsers();



// var User = mongoose.model('User');

// User.find({}, function (err, users) {
// 	logincodes = Array();
// 	for(a=0;a<users.length;a++) {
// 		logincodes.push(users[a].logincode);
// 	}
// 	newSquare(logincodes, 0);	
// });

// function newSquare(logincodes, i) {
// 	if (i<logincodes.length) {
// 		User.findOne({"logincode": logincodes[i]}, function (err, user) {
// 			if (user) {
// 				for(a=0;a<user.artists.length;a++) {
// 					if (user.artists[a].artist_name == "Iggy Pop") {
// 						user.artists[a].square = "D8";		
// 						console.log(user.artists[a].square);			
// 					}
// 				}
// 				user.markModified('artists') 
// 				user.save(function(err) {
// 					if (err) console.log (err);
// 					else {
// 						console.log("Gebruiker "+user.name+" succesvol geupdated.");
// 						newSquare(logincodes, ++i);
// 					}
// 				});
// 			}
// 		});
// 	} else {
// 		console.log("Klaar");
// 	}
// }