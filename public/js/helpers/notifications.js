Notification.requestPermission(function(status) {
    console.log('Notification permission status:', status);
});

function displayNotification(title, text, icon) {
  if (Notification.permission == 'granted') {
    navigator.serviceWorker.getRegistration().then(function(reg) {
        navigator.serviceWorker.getRegistration().then(function(reg) {
	      var options = {
	        body: text || " ",
	        icon: icon || " ",
	        vibrate: [100, 50, 100],
	        data: {
	          dateOfArrival: Date.now(),
	          primaryKey: 1
	        }
	      };
	      reg.showNotification(title, options);
	    });
    });
  }
}