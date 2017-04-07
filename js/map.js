var map = {},
	$doc = $( document );

eventy.eventEnable( map );


map.init = function() {
	this.baseInit();
	// this.routingControlInit();
	map.geocoderInit();

	this.addNewPlaceEventListener();
	this.enlargePopupEventListener();
	map.closePopupEventListener();
	map.editPlaceEventListener();
	map.updatePlaceEventListeners();
	map.deletePlaceEventListener();

	map.showPlacesEventListener();
	map.showAllPlacesEventListener();

	map.startNewRouteEventListener();
	map.clearMapEventListener();

	map.saveRouteEventListener();
};

// map and tile layer
map.baseInit = function() {
	var mapTileLayer = L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

	this._map = L.map( 'map' ).setView( [ 51.505, -0.09 ], 13 );

	this._distance = 10;

	this._routeEndsLocations = []; // all serached places from the current route

	this._searchPlaces = L.featureGroup( [] );
	this._routesLayer = L.featureGroup( [] );
	this._myPlacesLayer = L.featureGroup( [] );
	this._circleLayer = L.featureGroup( [] );

	this._map.addLayer( this._searchPlaces );
	this._map.addLayer( this._routesLayer );
	this._map.addLayer( this._myPlacesLayer );
	this._map.addLayer( this._circleLayer );

	mapTileLayer.addTo( this._map );
};

map.geocoderInit = function() {
	var _this = this,
		geocoder = L.Control.geocoder({
	        defaultMarkGeocode: false
	    })
	    .on( 'markgeocode', function( e ) {
	        var lastLocation = _this._lastLocation,
	        	center = e.geocode.center,
	        	marker = L.marker( center, {
					draggable: false,
					icon: map.getCustomIcon(),
					riseOnHover: true
				}).bindPopup( map.getWaypointMarkerPopup( center ) );

	        map._searchPlaces.addLayer( marker );

	        if( lastLocation ) {
	        	map._circleLayer.clearLayers();
	        	map.getRouteWithBoxes( [ lastLocation.lng + ',' + lastLocation.lat, center.lng + ',' + center.lat ] );
	        }
	        else {
	        	map.drawSinglePointCircle( center );
	        }

	        _this._lastLocation = center;
	        _this._routeEndsLocations.push( center );
	    })
	    .addTo( _this._map );
};

map.getRouteWithBoxes = function( loc ) {
	requests.getRoute( loc, function successCallback2( routes ) {
		for( var i in routes ) {
			map.drawRoutePolylineAndBoxes( routes[ i ].geometry, routes[ i ].distance );
		}
	});
};

map.drawRoutePolylineAndBoxes = function ( route, routeDistance ) {
	var routePolyline = new L.Polyline( L.PolylineUtil.decode( route ) ), // OSRM polyline decoding
		boxes = L.RouteBoxer.box( routePolyline, this._distance ),
		bounds = new L.LatLngBounds( [] ),
		boxpolys = new Array( boxes.length ),
		boxesLayer = L.featureGroup( [] ),
		currentRectangle = null,
		reachablePlaces = [];

	for ( var i in boxes ) {
		currentRectangle = L.rectangle( boxes[ i ], { color: "#ff7800", weight: 1 } ).addTo( boxesLayer );
		bounds.extend( boxes[ i ] );

		reachablePlaces = reachablePlaces.concat( map.getReachablePlaces( currentRectangle ) );
	}

	boxesLayer.on( 'click', function() {
		map.updateCurrentRouteDistanceLabel( routeDistance );
	} );

	map.updateRouteDistanceLabel( routeDistance );

	this._myPlacesLayer.addLayer ( L.featureGroup( reachablePlaces ) );

	this._routesLayer.addLayer ( L.featureGroup( [ routePolyline, boxesLayer ] ) );

	this._map.fitBounds( bounds );
};

map.drawSinglePointCircle = function ( point ) {
	var radius = this._distance * 1000, // in metres
		circle = L.circle( point, { radius: radius } );

	this._circleLayer.addLayer ( L.featureGroup( [ circle ] ) );
	this._myPlacesLayer.addLayer ( L.featureGroup( map.getReachablePlaces( circle ) ) );
	this._map.fitBounds( this._circleLayer.getBounds() );
};

map.updateCurrentRouteDistanceLabel = function( distance ) {
	$( '.current-route-distance-info' ).html( distance / 1000 + 'km' );
};

map.updateRouteDistanceLabel = function( distance ) {
	var $distanceInfo = $( '.route-distance-info' ),
		distanceInfoVal = $distanceInfo.html().replace( 'km', '' ),
		currentDistance = distanceInfoVal ? parseFloat( distanceInfoVal ) : 0;

	$( '.route-distance-info' ).html( ( distance / 1000 + currentDistance ).toFixed( 3 ) + 'km' );
};


map.getReachablePlaces = function( shape ) {
	var myPlaces = myPlacesDictionary.getAllPlaces(),
		layer = {},
		markers = [];

	for( var i in myPlaces ) {
		if( shape.getBounds().contains( myPlaces[ i ].getCoords() ) ) {
			markers.push( myPlaces[ i ].getMarker() );
		}
	}

	return markers;
};

map.startNewRouteEventListener = function() {
	$doc.on( 'click', '.start-new-route', function() {
		map.clearMap();

		$( '.leaflet-control-geocoder-icon' ).click();
	});
};

map.clearMapEventListener = function() {
	$doc.on( 'click', '.start-new-route, .clear-map', function() {
		map.clearMap();
	});
};

map.clearMap = function() {
	map._myPlacesLayer.clearLayers();
	map._routesLayer.clearLayers();
	map._circleLayer.clearLayers();
	map._searchPlaces.clearLayers();
	map._lastLocation = undefined;
	map._routeEndsLocations = [];
};

// the control in the right for searching routes
// map.routingControlInit = function() {
// 	var _this = this,
// 		customIcon = map.getCustomIcon(),
// 		routingControl = L.Routing.control({
// 			waypoints: [
// 				L.latLng( 42.69757, 23.32254 )
// 			],
// 			routeWhileDragging: true,
// 			showAlternatives: true,
// 			lineOptions: {
// 				styles: [ { color: '#ffb74c', opacity: 0.8, weight: 6 } ],
// 				addWaypoints: false
// 			},
// 			fitSelectedRoutes: true,
// 			geocoder: L.Control.Geocoder.nominatim(),
// 			createMarker: function( i, wp ) {
// 				_this._map.panTo( wp.latLng );

// 				return L.marker( wp.latLng, {
// 					draggable: true,
// 					icon: customIcon,
// 					riseOnHover: true
// 				}).bindPopup( map.getWaypointMarkerPopup( wp.latLng ) );
// 			}
// 		});

// 	routingControl.addTo( this._map );

// 	routingControl.on( 'routesfound', function(e) {
// 		var routes = e.routes;

// 		map._currentRoutes = routes;
// 	});


// 	// routingControl.on('routeselected', function(e) {
// 	// 	var route = e.route;
// 	// 	console.log('Showing route between waypoints:\n' + JSON.stringify(route.inputWaypoints, null, 2));
// 	// });
// }

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
				iconAnchor: [ 30, 60 ],
				popupAnchor: [ 0, -70 ]
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

					map._myPlacesLayer.addLayer( newPlace.getMarker() );

					toastr.success( 'Added a new place!' );
				});
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

	this._myPlacesLayer.addLayer( layer );
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
};

// event listeners for all place fields
map.updatePlaceEventListeners = function() {
	$doc.on( 'change', '.place-title', function() {
		var $popup = $( '.my-place-big-popup' ),
			title = $( this ).val(),
			myPlace = myPlacesDictionary.getPlace( $popup.data( 'coords' ) );

		requests.updatePlace( $( '.my-place-big-popup' ).attr( 'id' ), 'title', title, function successCallback() {
			myPlace.setTitle( title );
			myPlace.updateMarkerPopup();
		});
	});

	$doc.on( 'change', '.place-info', function() {
		var $popup = $( '.my-place-big-popup' ),
			info = $( this ).val(),
			myPlace = myPlacesDictionary.getPlace( $popup.data( 'coords' ) );

		requests.updatePlace( $popup.attr( 'id' ), 'info', info, function successCallback() {
			myPlace.setInfo( info );
		});
	});

	$doc.on( 'change', '.place-img', function() {
		var $popup = $( '.my-place-big-popup' ),
			imgVal = $( this ).val(),
			myPlace = myPlacesDictionary.getPlace( $popup.data( 'coords' ) );

		requests.updatePlace( $popup.attr( 'id' ), 'img', imgVal, function successCallback() {
			$( '.place-img-preview' ).attr( 'src', imgVal );
			myPlace.setImg( imgVal );
			myPlace.setMarkerIcon();
		});
	});

	map.addEventListener( 'update-marker-coords', function( e ) {
		requests.updatePlace( e.id, 'coords', e.coords, function successCallback () {
			toastr.success( 'Marker location updated!' );
		});
	});
};

map.deletePlaceEventListener = function() {
	var placeId = null,
		place = null;

	$doc.on( 'click', '.delete-place-icon', function() {
		if( window.confirm( 'Are you sure you want to delete this place?' ) ) {
			placeId = $( '.my-place-big-popup' ).attr( 'id' );
			place = myPlacesDictionary.getPlace( $( '.my-place-big-popup' ).data( 'coords' ) );

			requests.deletePlace( placeId, function successCallback() {
				toastr.success( 'Deleted!' );

				$( '.big-popup' ).addClass( 'hidden' );
				map._map.removeLayer( place.getCurrentMarker() );
				place = undefined;
			} );
		}
	});
};

map.showPlacesEventListener = function() {
	var $showPlacesMenu = $( '.show-places-menu' );

	$doc.on( 'click', '.show-places', function() {
		$showPlacesMenu.toggleClass( 'hidden' );
	});

	$doc.on( 'change', '.places-distance', function() {
		var value = $( this ).val();

		if( value ) {
			map._distance = value;
		}
	});

	$doc.on( 'click', '.places-distance-time-element', function() {
		var distanceInKm = $( this ).data( 'km' );

		$( '.places-distance' ).val( distanceInKm );
	});

	$doc.on( 'click', '.show-places-menu, .show-places', function( e ) {
		e.stopPropagation();
	});

	$doc.on( 'click', function() {
		$showPlacesMenu.addClass( 'hidden' );
	});
};

map.showAllPlacesEventListener = function() {
	$doc.on( 'click', '.show-all-places', function() {
		map.showMyPlaces();
	});
};

map.saveRouteEventListener = function() {
	$doc.on( 'click', '.save-route', function() {
		console.log( map._routeEndsLocations );

		requests.addNewRoute( map._routeEndsLocations, function successCallback () {
			toastr.success( 'New route saved successfully!' );
		} );
	});
};