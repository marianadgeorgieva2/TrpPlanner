var menu  = {},
	$doc = $( document );


menu.init = function() {
	this.getAllPlaces();
} 


menu.getAllPlaces = function() {
	var currenPlace = {};

	requests.getAllPlaces( function successCallback( data ) {
		for( var i in data ) {
			currenPlace = new MyPlace( data[ i ] );
		}

		map.showMyPlaces();
	});
}