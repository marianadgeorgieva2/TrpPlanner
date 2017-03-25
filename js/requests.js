var requests = {},
	API_KEY = 'D4XFXTfaT3iTBWYMWxpCNDhB-Acuijdj';

requests.getAllPlaces = function( successCallback ) {
	$.ajax({
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-places?apiKey=' + API_KEY,  
		success: function( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data );
			} 
		}
	});
}


requests.addNewPlace = function( coords, successCallback ) {
	$.ajax({
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-places?apiKey=' + API_KEY,
		data: JSON.stringify( { coords : coords } ),
		type: 'POST',
		contentType: 'application/json',
		success: function( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data );
			} 
		}
	});
}

requests.updatePlace = function( id, prop, value, successCallback ) {
	var objToSend = {};

	objToSend[ prop ] = value;

	$.ajax({
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-places/' + id + '?apiKey=' + API_KEY,
		data: JSON.stringify( { "$set" : objToSend } ),
		type: "PUT",
		contentType: "application/json",
		success: function( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data );
			}
		}
	});
}