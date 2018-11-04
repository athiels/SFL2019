var user;

if (!user) {
	if (getCookie("user")) {
		user = JSON.parse(getCookie("user"));
	} else {
		var email = getCookie("login");
		if (email) {
			getUserInfo(email);
		}
	}	
}

function getUserInfo(logincode, callback) {
	$.ajax({
		type: 'POST',
		url: '/api/user/get',
		data: JSON.stringify({"logincode": logincode}),
		contentType: "application/json",
		dataType: 'json'
	})
	.done(function(data) {		
		if (data.user) {
			user = data.user;
			setCookie("user", JSON.stringify(user));
			if (callback) {
				callback();	
			}
			return true;
		}
	})
	.fail(function() {
		addNotification('Gegevens van de gebruiker konden niet opgehaald worden.', "fail");
		logout();
	});
}

function getUser() {
	if (user) { return user; }
	else { return JSON.parse(getCookie("user")); }
}

function userIsLoggedIn() {
	var logincode = getCookie("login");
	if (logincode) {
		return true;
	}
	return false;
}

function userIsAdmin() {
	var us = getUser();
	if (us && us.admin) {
		return true;
	}
	return false;
}

function preLogin(logincode, cb) {
	$.getJSON( "/api/user/prelogin?logincode="+logincode, function( data ) {
		cb(data);
	});
}

function login(loginData) {
	$.ajax({
		type: 'POST',
		url: '/api/user/login',
		data: JSON.stringify(loginData),
		contentType: "application/json",
		dataType: 'json'
	})
	.done(function(data) {
		setCookie("login", loginData.logincode);		
		getUserInfo(loginData.logincode, function() {
			$(".wally").fadeOut(500, function() {
				loadContent("home", true);
			});
		});		
	})
	.fail(function() {
		addNotification('De ingevulde gegevens zijn niet correct.', "fail");
	});
}

function logout() {
	document.cookie = 'login=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	loadContent("login", true);
}


