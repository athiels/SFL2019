function hasNumber(string) {
	return /\d/.test(string);
}

function checkInput(productionId) {
	if (!hasNumber(productionId)) {
		productionId = 0;
	}
	return productionId;
}

var notificationCounter = 0;
function addNotification(text, cl, prefix, id) {
	++notificationCounter;
	var notif_id = "notif_"+notificationCounter;
	if (id) notif_id = id;
	var msg = '<p id="'+notif_id+'" class="' + cl + '">';
	if (prefix) { msg += prefix + ": "; }
	msg += text + '</p>';
	$("#notifications").append(msg);
	removeExcessNotifications();
	return notif_id;
}

function removeNotification(notif_id) {
	$("#"+notif_id).remove();
}

function removeExcessNotifications() {
	if ($("#notifications p").length > 7) {
		$("#notifications p").first().remove();
	}
	$("#notifications p.deleteOnNext").remove();
}

function clearNotifications() {
	$("#notifications p").remove();
}

function setCookie(cname, cvalue, ctime) {
	if (ctime) {
		var time = Date.now();
		time += ctime;
		time = new Date(time);
	} else {
		var now = new Date();
		time = now.getTime();
		now.setHours(24);
		now.setMinutes(59);
		now.setSeconds(59);
		time = new Date(now);
	}	
	document.cookie = cname + "=" + cvalue + '; expires=' + time + '; path=/';
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setPreviousPage(page) { sessionStorage.setItem("previousPage", page); }
function getPreviousPage() { return sessionStorage.getItem("previousPage"); }

function confirm(title, msg, confirm, cancel) {
	$.confirm({
	    title: title,
	    content: msg,
	    buttons: {
	        Ja: function () {
	            confirm();
	        },
	        Nee: function () {
	        	if (cancel) cancel();
	        }
	    }
	});
	return false;
}

function alert(msg, img, cb) {
	var alert = $.alert({
		theme: 'supervan',
	    title: img || " ",
	    content: msg,
	    confirm: function(){
	        if (cb) cb();
	    },
	    onContentReady: function () {
	        $(document).keypress(function(event) {
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if (keycode == '13') {
					alert.close();
				}
			});
	    },
	});
}

function validateForm() {

	$(".validationFailed").removeClass("validationFailed");

	var validated = true;
	$(".required").each(function() {
		if (!$(this).val()) {
			$(this).addClass("validationFailed");
			var field = $("label[for='" + $(this).attr('id') + "']").text().replace("*","").trim();
			addNotification('"' + field + '" is een verplicht veld.<br>', "failed");
			validated = false;
		}
	});
	return validated;
}

$('html').on('click', '.emptyInput', function() {
	$(this).prev('input').val("");
	$(this).prev('input').change();
});

function gri(max) {
  return Math.floor(Math.random() * Math.floor(max));
}