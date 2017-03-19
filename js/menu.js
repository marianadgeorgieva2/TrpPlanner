var menu  = {},
	$doc = $( document );


menu.init = function() {
	this.getAllPlaces();
} 


menu.getAllPlaces = function() {
	requests.getAllPlaces( function successCallback( data ) {
		console.log( data );
	});
}