var map = {},
	$doc = $( document );


map.init = function() {
	this.baseInit();
	this.routingControlInit();

	this.addNewPlaceEventListener();
	this.enlargePopupEventListener();
	map.closePopupEventListener();
	map.editPlaceEventListener();
	map.updatePlaceEventListener();
}

// map and tile layer
map.baseInit = function() {
	var mapTileLayer = L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

	this._map = L.map( 'map' ).setView( [ 51.505, -0.09 ], 13 );

	mapTileLayer.addTo( this._map );
}

// the control in the right for searching routes
map.routingControlInit = function() {
	var customIcon = map.getCustomIcon(),
		routingControl = L.Routing.control({
			waypoints: [
				L.latLng(57.74, 11.94),
				L.latLng(57.6792, 11.949)
			],
			routeWhileDragging: true,
			showAlternatives: true,
			lineOptions: {
				styles: [ { color: '#ffb74c', opacity: 0.8, weight: 6 } ],
				addWaypoints: false
			},
			fitSelectedRoutes: true,
			geocoder: L.Control.Geocoder.nominatim(),
			createMarker: function( i, wp ) {
				return L.marker( wp.latLng, {
					draggable: true,
					icon: customIcon,
					riseOnHover: true
				}).bindPopup( map.getWaypointMarkerPopup( wp.latLng ) );
			}
		});

	routingControl.addTo( this._map );

	// routingControl.on('routesfound', function(e) {
	// 	var routes = e.routes;
	// 	console.log('Found ' + routes.length + ' route(s).');
	// });


	// routingControl.on('routeselected', function(e) {
	// 	var route = e.route;
	// 	console.log('Showing route between waypoints:\n' + JSON.stringify(route.inputWaypoints, null, 2));
	// });
}

// get a popup with add to places button
map.getWaypointMarkerPopup = function( latlng ) {
	var popup = L.popup()
		.setLatLng( latlng )
			.setContent( '<button class="add-to-my-places" type="button" data-coords="[' + latlng.lat + ',' + latlng.lng + ']">Add to My Places</button>' );

	return popup;
};


// create a marker icon from an img saved in the imgs folder
map.getCustomIcon = function() {
	var CustomIcon = L.Icon.extend({
			options: {
				iconSize: [ 60, 60 ],
				iconAnchor: [ 30, 60 ]
			}
	});

	return new CustomIcon( { iconUrl: 'img/search-marker.svg' } );
};


// event listener for the 'add to my places' button in
// the waypoints popup
map.addNewPlaceEventListener = function() {
	$doc.on( 'click', '.add-to-my-places', function() {
		var coords = $( this ).data( 'coords' );

		// check if we already have a olace on this coordinates
		if( ! myPlacesDictionary.getPlace( coords ) ) {
			requests.addNewPlace( 
				coords,
				function success( data ) {
					var newPlace = new MyPlace( data );
				} );
		}
		else {
			toastr.error( 'You already have a place on this location!' );
		}
	});
};

map.showMyPlaces = function() {
	var allPlaces = myPlacesDictionary.getAllPlaces(),
		markers = [],
		layer = {};

	for( var i in allPlaces ) {
		markers.push( allPlaces[ i ].getMarker() );
	}

	layer = L.featureGroup( markers )
	    .addTo( this._map );

	this._map.fitBounds( layer.getBounds() );
};

map.enlargePopupEventListener = function() {
	var myPlace = null;

	$doc.on( 'click', '.my-place-popup', function() {
		myPlace = myPlacesDictionary.getPlace( $( this ).data( 'coords' ) );

		$( '.big-popup' ).html( myPlace.getMarkerBigPopupContent() ).removeClass( 'hidden' );
	});
};

map.closePopupEventListener = function() {
	$doc.on( 'click', '.close-popup', function() {
		$( '.big-popup' ).addClass( 'hidden' );
	});
};

// event listener for the edit icon in the place big popup
map.editPlaceEventListener = function() {
	$doc.on( 'click', '.edit-place-icon', function() {
		$( '.my-place-big-popup' ).toggleClass( 'edit-view' );
	});
}

// event listeners for all place fields
map.updatePlaceEventListener = function() {
	$doc.on( 'change', '.place-title', function() {
		requests.updatePlace( $( '.my-place-big-popup' ).attr( 'id' ), 'title', $( this ).val() );
	});

	$doc.on( 'change', '.place-info', function() {
		requests.updatePlace( $( '.my-place-big-popup' ).attr( 'id' ), 'info', $( this ).val() );
	});

	$doc.on( 'change', '.place-img', function() {
		var imgVal = $( this ).val();

		requests.updatePlace( $( '.my-place-big-popup' ).attr( 'id' ), 'img', imgVal );
		$( '.place-img-preview' ).attr( 'src', imgVal );
	});
}