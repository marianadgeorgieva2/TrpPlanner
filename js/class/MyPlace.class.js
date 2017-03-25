

var MyPlace = function( options ) {
	this._id = options._id;
	this._coords = options.coords;
	this._title = options.title;
	this._info = options.info;
	this._img = options.img;

	myPlacesDictionary.addNewPlace( this );
};


MyPlace.prototype.getMarker = function() {
	return L.marker( this._coords, {
		draggable: true,
	}).bindPopup( this.getMarkerPopupContent() );
};


MyPlace.prototype.getMarkerPopupContent = function() {
	return '<div class="my-place-popup" data-coords="' + this._coords + '">' +
							'<h4 class="popup-title">' + ( this._title ? this._title : 'My Place' ) + '</h4>' +
							'<img src="img/zoom.svg" />' +
						'</div>';
}

MyPlace.prototype.getMarkerBigPopupContent = function() {
	return '<div class="my-place-big-popup" data-coords="' + this._coords + '">' +
							'<input class="place-title" value="' + ( this._title ? this._title : 'My Place' ) + '">' +
							'<textarea class="place-info">' + ( this._info ? this._info : '' ) + '</textarea>' +
							'<input class="place-img" value="' + ( this._img ? this._img : '' ) + '">' +
						'</div>' +
						'<div class="close-popup"></div>';
}