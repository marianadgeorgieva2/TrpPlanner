

var MyPlace = function( options ) {
	this._id = options._id;
	this._coords = options.coords;

	myPlacesDictionary.addNewPlace( this );
}


MyPlace.prototype.getMarker = function() {
	return L.marker( this._coords, {
		draggable: true,
	}).bindPopup( 'hgdhjgdh' );
}