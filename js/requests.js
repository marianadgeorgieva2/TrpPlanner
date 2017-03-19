var requests = {},
	API_KEY = 'D4XFXTfaT3iTBWYMWxpCNDhB-Acuijdj';

requests.getAllListCollections = function() {
	$.ajax({
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections?apiKey=' + API_KEY,  
		success: function( data ) {
			console.log( data ); 
		}
	});
}


requests.addNewPlace = function( coords ) {
	$.ajax({
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-places?apiKey=' + API_KEY,
		data: JSON.stringify( { coords : coords } ),
		type: 'POST',
		contentType: 'application/json',
		success: function( data ) {
			console.log( data ); 
		}
	});
}