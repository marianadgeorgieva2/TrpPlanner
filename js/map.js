var map = {},
	$doc = $( document );


map.init = function() {
	map.baseInit();
	map.routingControlInit();

	map.addNewPlaceEventListener();
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
	var greenIcon = map.getCustomIcon(),
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
			geocoder: L.Control.Geocoder.nominatim(),
			createMarker: function( i, wp ) {
				return L.marker( wp.latLng, {
					draggable: true,
					icon: greenIcon
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
}


// create a marker icon from an img saved in the imgs folder
map.getCustomIcon = function() {
	var CustomIcon = L.Icon.extend({
			options: {
				iconSize: [ 38, 55 ]
			}
	});

	return new CustomIcon( { iconUrl: 'img/green-marker.png' } );
}


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
}
