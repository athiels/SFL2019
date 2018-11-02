var allLabels = new Array();
function addLabel(labelObj) { allLabels.push(labelObj); }
function removeLabel(id) { 
	for (i=0;i<allLabels.length;i++) {
		if (allLabels[i].id == id) { 
			allLabels.splice(i, 1);
			addNotification("Productienummer "+id+" werd verwijderd.", "success");
		}
	}
}
function getAllLabels() { return allLabels; }

function getTotalWeight() { 
	var totalWeight = 0;
	for (i=0;i<allLabels.length;i++) {
		totalWeight += parseFloat(allLabels[i].weight);
	}
	return totalWeight; 
}

function hasAlreadyBeenAdded(labelObj) {
	for (i=0;i<allLabels.length;i++) {
		if (allLabels[i].id == labelObj.id) { return true }
	}
	return false;
}

function hasSameDeliveryAddress(labelObj) {
	if (!allLabels.length) { return true; }
	var firstOrder = allLabels[0];
	var newOrder = labelObj;	
	if (//(firstOrder.cust_name == newOrder.cust_name) &&
		(firstOrder.address == newOrder.address) &&
		(firstOrder.city == newOrder.city) &&
		(firstOrder.postcode == newOrder.postcode) &&
		(firstOrder.country_id == newOrder.country_id)) {
			return true;
		}
	
	return false;
}

var shippingMethodIndex = "";
function setShippingMethodIndex(methodIndex) { shippingMethodIndex = methodIndex; }
function getShippingMethodIndex() { return shippingMethodIndex; }

var shippingQty = 0;
function setShippingQty(qty) { shippingQty = qty; }
function getShippingQty() { return shippingQty; }

function createScOrderId() {
	var productionIds = "";
	for (i=0;i<allLabels.length;i++) {
		productionIds += "_" + allLabels[i].id;
	}
	var user = getUser();
	return (user.id + "@" + allLabels[0].order_id + productionIds).substring(0, 49);
}

function createLabelJson(qty, shippingMethod) {
	var parcelData = allLabels[0];
	var parcels = new Array();
	
	var productionIds = "";
	for (i=0;i<allLabels.length;i++) {
		productionIds += "_" + allLabels[i].id;
	}

	var user = getUser();
	var weight = parseFloat(parcelData.weight).toFixed(3);
	if (weight < 1) { weight = 1; }

	for (a=0;a<qty;a++) {		
		obj = {
			"name": "T.a.v. " + parcelData.receiver_name,
			"company_name": parcelData.company,
			"address": parcelData.address,			
			"city": parcelData.city,
			"postal_code": parcelData.zipcode,
			"telephone": parcelData.cust_telephone,
			"request_label": true,
			"email": parcelData.cust_email,
			"data": [],
			"country": parcelData.country_id,
			"shipment": {
				"id": shippingMethod.id
			},
			"weight": shippingMethod.max_weight-1,
			"order_number": createScOrderId(),
			"insured_value": 0,
			// Sender data
			"from_name":" - ",
			"from_company_name": " ",
			"from_address_1": "Langevelde poort",
			"from_address_2": "Poort 0",
			"from_house_number": "0",
			"from_city": "Zele",
			"from_postal_code": "9240",
			"from_country": "BE",
			"from_telephone": "",
			"from_email": ""
		}
		if (parcelData.house_number) obj.house_number = parcelData.house_number;
		parcels.push(obj);
	}	
	var jsonParcels = { "parcels": parcels };
	console.log(jsonParcels);
	return jsonParcels;
}

function createPrintLabelJson(data) {
	
	var parcelsArray = new Array();
	for (i=0;i<data.length;i++) {
		parcelsArray.push(data[i].id);
	}
	
	parcels = { "parcels" : parcelsArray };
	var jsonPrintParcels = { "label": parcels };
	return jsonPrintParcels;
}

var mailInfo = {
	"name" : "",	
	"address" : "",	
	"order_id" : "",
	"trackingCodes" : "",	
	"deliveryMethod" : "",	
	"receiverAddress" : Array(),
	"products" : "",	
	"trackingUrls" : ""
}

function fillMailInfo() {	
	setLanguage(allLabels[0].language);
	mailInfo.origin = allLabels[0].origin;
	mailInfo.language = allLabels[0].language;
	mailInfo.name = "";
	mailInfo.address = "";
	if (allLabels[0].company) { mailInfo.address += allLabels[0].company + "<br>"; }
	mailInfo.address += "T.a.v. " + allLabels[0].receiver_name + "<br>";
	mailInfo.address += allLabels[0].address + " " + allLabels[0].house_number + "<br>" + allLabels[0].zipcode + " " + allLabels[0].city + "<br>" + allLabels[0].country;
	mailInfo.order_id = allLabels[0].order_id;

	mailInfo.deliveryMethod = translate(shippingMethod.text);
	
	var diff_customers = Array();
	var diff_mail_addresses = Array();

	for (i=0;i<allLabels.length;i++) {	

		if (diff_mail_addresses.indexOf(allLabels[i].cust_email) == -1) {
			diff_mail_addresses.push(allLabels[i].cust_email);
			mailInfo.receiverAddress.push(allLabels[i].cust_email);
		}
		if (diff_customers.indexOf(allLabels[i].cust_name) == -1) {
			diff_customers.push(allLabels[i].cust_name);
			mailInfo.name += allLabels[i].cust_name + ", ";
		}
		mailInfo.products += translate("Ordernumber") + ": " + allLabels[i].order_id + "<br>";
		mailInfo.products += allLabels[i].quantity + " x " +allLabels[i].order_summary + "<br>";
		if (allLabels[i].order_summary_extra) {
			mailInfo.products += translate("Version") + ": " + allLabels[i].order_summary_extra + "<br>";
		}
		if (allLabels[i].cust_reference) {
			mailInfo.products += translate("Customer reference") + ": " + allLabels[i].cust_reference + "<br>";
		}
		if (allLabels[i].weight) {
			mailInfo.products += translate("Weight") + ": " + parseFloat(allLabels[i].weight).toFixed(2) + " kg<br>";
		}
		mailInfo.products += "<br>";
	}
}
function setMailInfo(key, value) { mailInfo[key] = value; }
function getMailInfo() { return mailInfo; }	

function showLabels(jsonPrintLabelData, cb) {
	$.ajax({
		type: 'POST',
		url: '/api/printlabels',
		data: JSON.stringify(jsonPrintLabelData),
		contentType: "application/json",
		dataType: 'json'
	})
	.done(function(data) {
		if (data) {
			labelsUrl = data.label.label_printer;
			if (cb) {
				cb(labelsUrl);
			}
			//window.open(labelsUrl,'_blank');
		}
	})
	.fail(function() {
		addNotification('Er is iets misgelopen bij het aanvragen van de verzendlabels.', "fail");
	});
}


function cancelLabel(selected, i) {
	if (i<selected.length) postCancelLabel(selected, i);
	else { console.log("Refreshing") ; getLabels(); }
}

function postCancelLabel(selected, i) {
	$.ajax({
		type: 'POST',
		url: '/api/cancellabel',
		data: JSON.stringify(selected[i]),
		contentType: "application/json",
		dataType: 'json'
	})
	.done(function(data) {
		if (data.id) {
			addNotification('Label ' + data.id + ' geannuleerd.', "success");			
		} else {
			addNotification(data.message, "", selected[i].id);
		}
		cancelLabel(selected, ++i);		
	})
	.fail(function() {
		addNotification('Er is iets misgelopen bij het annuleren van label '+ selected[i].id, "fail");
		cancelLabel(selected, ++i);
	});
}

function deleteLabel(selected, i) {
	if (i<selected.length) postDeleteLabel(selected, i);
	else { console.log("Refreshing") ; getLabels(); }
}

function postDeleteLabel(selected, i) {
	$.ajax({
		type: 'POST',
		url: '/api/deletelabel',
		data: JSON.stringify(selected[i]),
		contentType: "application/json",
		dataType: 'json'
	})
	.done(function(data) {
		if (data.id) {
			addNotification('Label ' + data.id + ' verwijderd.', "success");			
		} else {
			addNotification(data.message, "", selected[i].id);
		}
		deleteLabel(selected, ++i);		
	})
	.fail(function() {
		addNotification('Er is iets misgelopen bij het verwijderen van label '+ selected[i].id, "fail");
		deleteLabel(selected, ++i);
	});
}

function addActionButton(type, hidden) {
	var hide = "";
	if (hidden) {
		hide = 'style="display: none;"'
	}
	switch (type) {
		case "print":
			$(".actions").append('<button id="printLabel" class="button_highlight right" ' + hide + '><i class="fas fa-print"></i> Printen</button>');
			break;
		case "delete":
			$(".actions").append('<button id="deleteLabel" class="button_main right" ' + hide + '><i class="fas fa-trash"></i> Verwijderen</button>');
			break;
		case "cancel":
			$(".actions").append('<button id="cancelLabel" class="button_sub right" ' + hide + '><i class="fas fa-ban"></i> Annuleren</button>');
			break;
		case "pickuplist":
			$(".actions").append('<button id="createPickupList" class="button_main right" ' + hide + '><i class="fas fa-clipboard-list"></i> Pick-up lijst</button>');
			break;
	}
}

