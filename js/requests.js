var requests = {},
	API_KEY = 'D4XFXTfaT3iTBWYMWxpCNDhB-Acuijdj';

requests.getAllPlaces = function( successCallback ) {
	$.ajax({
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-places?apiKey=' + API_KEY,
		success: function( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data );
			}
		},
		error: function() {
			toastr.error( 'Something went wrong! Try again later!', null, toastrOptions );
		}
	});
};


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
		},
		error: function() {
			toastr.error( 'Something went wrong! Try again later!', null, toastrOptions );
		}
	});
};

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
		},
		error: function() {
			toastr.error( 'Something went wrong! Try again later!', null, toastrOptions );
		}
	});
};

requests.deletePlace = function( id, successCallback ) {
	$.ajax( {
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-places/' + id + '?apiKey=' + API_KEY,
		type: "DELETE",
		async: true,
		timeout: 300000,
		success: function ( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data );
			}
		},
		error: function() {
			toastr.error( 'Something went wrong! Try again later!', null, toastrOptions );
		}
	});
};



requests.getRoute = function( loc, successCallback ) {
	$.ajax({
		url: 'https://router.project-osrm.org/route/v1/driving/' + loc,
		data: {
			overview: 'full',
			steps: false,
			//compression: false,
			alternatives: false
		},
		dataType: 'json',
		success: function ( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data.routes  );
			}
		},
		error: function() {
			toastr.error( 'Something went wrong! Try again later!', null, toastrOptions );
		}
	});
};


// routes

requests.addNewRoute = function( routeEnds, routeName, successCallback ) {
	$.ajax({
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-routes?apiKey=' + API_KEY,
		data: JSON.stringify( { routeEnds : routeEnds, routeName: routeName } ),
		type: 'POST',
		contentType: 'application/json',
		success: function( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data );
			}
		},
		error: function() {
			toastr.error( 'Something went wrong! Try again later!', null, toastrOptions );
		}
	});
};

requests.getAllRoutes = function( successCallback ) {
	$.ajax({
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-routes?apiKey=' + API_KEY,
		success: function( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data );
			}
		},
		error: function() {
			toastr.error( 'Something went wrong! Try again later!', null, toastrOptions );
		}
	});
};

requests.deleteRoute = function( id, successCallback ) {
	$.ajax( {
		url: 'https://api.mlab.com/api/1/databases/fav-trip-planner/collections/my-routes/' + id + '?apiKey=' + API_KEY,
		type: "DELETE",
		async: true,
		timeout: 300000,
		success: function ( data ) {
			if( typeof successCallback === 'function' ) {
				successCallback( data );
			}
		},
		error: function() {
			toastr.error( 'Something went wrong! Try again later!', null, toastrOptions );
		}
	});
};



