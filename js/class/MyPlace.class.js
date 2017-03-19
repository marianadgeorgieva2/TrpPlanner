

var MyPlace = function( options ){
	this._id = options.id;
	this.coords = options.coords;

	myPlacesDictionary.addNewPlace( this );
}


MyPlace.prototype.getMarker = function() {
	return L.marker( wp.latLng, {
		draggable: true,
	}).bindPopup( 'hgdhjgdh' );
}