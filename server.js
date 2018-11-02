const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('./api/models/user');
require('./api/models/settings');
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
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
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

app.post('/api/user/update', function(req, res) {
	auth.update(req, res);
});

app.get('/api/user/getall', function(req, res) {
	auth.getall(req, res);
});

app.get('/api/artist/found', function(req, res) {
	artist.getfound(req, res);
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


