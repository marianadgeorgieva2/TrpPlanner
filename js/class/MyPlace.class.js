

var MyPlace = function( options ) {
	this._id = options._id.$oid;
	this._coords = options.coords;
	this._title = options.title;
	this._info = options.info;
	this._img = options.img;

	myPlacesDictionary.addNewPlace( this );
};

MyPlace.prototype.setMarkerIcon = function() {
	var defaultIconSrc = 'img/fav-marker.svg',
		markerImg = new Image(),
		imgWidth = 0,
		imgHeight = 0,
		markerIcon = null,
		currentMarker = this._currentMarker,
		imgElemMarkup = '';

	markerImg.src = ( this._img ? this._img : defaultIconSrc );
	markerImg.onload = function() {
		markerImg = utils.limitImageSize( markerImg, 40, markerImg.width, markerImg.height );

		imgWidth = this.width;
		imgHeight = this.height;

		imgElemMarkup = $( '<div>' ).append( $( markerImg ).clone() ).html();

		markerIcon = L.divIcon({
			className: 'my-place-icon',
			html: imgElemMarkup,
			iconSize: [ imgWidth, imgHeight ],
			iconAnchor: [ imgWidth/2, imgHeight ],
			popupAnchor: [ 0, -imgHeight - 10 ]
		});

		currentMarker.setIcon( markerIcon );

	};

	markerImg.onerror = function() {

	};
};


MyPlace.prototype.getMarker = function() {
	var _this = this,
		marker = L.marker( this._coords, {
			draggable: true,
		}).bindPopup( this.getMarkerPopupContent() ),
		newLocation = null;


	marker.on( 'dragend', function( e ) {
		newLocation = e.target._latlng;

		map.triggerEvent( 'update-marker-coords', { id: _this._id, coords: newLocation } );

		_this.setCoords( newLocation );
	});

	this._currentMarker = marker;

	this.setMarkerIcon();

	return this._currentMarker;
};

MyPlace.prototype.updateMarkerPopup = function() {
	this._currentMarker.bindPopup( this.getMarkerPopupContent() );
};


MyPlace.prototype.getMarkerPopupContent = function() {
	return '<div class="my-place-popup" data-coords="' + this._coords + '">' +
							'<h4 class="popup-title">' + ( this._title ? this._title : 'My Place' ) + '</h4>' +
							'<img src="img/zoom.svg" />' +
						'</div>';
};

MyPlace.prototype.getMarkerBigPopupContent = function() {
	return '<div id="' + this._id + '" class="my-place-big-popup" data-coords="' + this._coords + '">' +
							'<input class="place-title" value="' + ( this._title ? this._title : 'My Place' ) + '" placeholder="Title">' +
							'<textarea class="place-info" placeholder="Info">' + ( this._info ? this._info : '' ) + '</textarea>' +
							'<input class="place-img" placeholder="Image URL" value="' + ( this._img ? this._img : '' ) + '">' +
							( this._img ? '<img class="place-img-preview" src="' + this._img + '" />' : '' ) +
							'<div class="edit-place-icon"></div>' +
							'<div class="delete-place-icon"></div>' +
						'</div>' +
						'<div class="close-popup"></div>';
};


MyPlace.prototype.setImg = function( img ) {
	this._img = img;
};

MyPlace.prototype.setInfo = function( info ) {
	this._info = info;
};

MyPlace.prototype.setTitle = function( title ) {
	this._title = title;
};

MyPlace.prototype.setCoords = function( coords ) {
	this._coords = coords;
}

MyPlace.prototype.getCurrentMarker = function() {
	return this._currentMarker;
};

MyPlace.prototype.getCoords = function() {
	return this._coords;
};