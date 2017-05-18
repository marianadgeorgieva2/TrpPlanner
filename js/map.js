var map = {},
	$doc = $( document );

eventy.eventEnable( map );


map.init = function() {
	this.baseInit();
	this.geocoderInit();

	this.addNewPlaceEventListener();
	this.enlargePopupEventListener();
	this.closePopupEventListener();
	this.editPlaceEventListener();
	this.updatePlaceEventListeners();
	this.deletePlaceEventListener();

	this.showPlacesEventListener();
	this.showAllPlacesEventListener();

	this.startNewRouteEventListener();
	this.clearMapEventListener();

	this.saveRouteEventListener();
};

// map + tile layer
// all markers layers
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

// search field in the right
map.geocoderInit = function() {
	var _this = this,
		geocoder = L.Control.geocoder({
	        defaultMarkGeocode: false
	    })
	    .on( 'markgeocode', function( e ) {
	        var lastLocation = _this._lastLocation,
	        	center = e.geocode.center,
	        	marker = map.getRouteEndMarker( center );

	        map._searchPlaces.addLayer( marker );

	        if( lastLocation ) {
	        	map._circleLayer.clearLayers();
	        	map.getRouteWithBoxes( lastLocation.lng + ',' + lastLocation.lat + ';' + center.lng + ',' + center.lat );

	        	if( showHelpMessage ) {
	        		toastr.info( 'Now you can see the shortest route between the two places and the closest places.', null, helpOptions );
	        		toastr.info( 'You can continue building your route by typing in another place in the search field.', null, helpOptions );
	        		toastr.info( 'Now let\'s save the route. Click on the "Save route" menu item at the bottom.', null, helpOptions );
	        	}
	        }
	        else {
	        	map.drawSinglePointCircle( center );

	        	if( showHelpMessage ) {
	        		toastr.info( 'Great! In the circle you can see all places closer than given distance.', null, helpOptions );

	        		toastr.info( 'Click on the marker to add it to the saved places.', null, helpOptions );
	        	}
	        }

	        _this._lastLocation = center;
	        _this._routeEndsLocations.push( center );
	    })
	    .addTo( _this._map );
};

// get the marker used for displaying route ends
map.getRouteEndMarker = function( center ) {
	return L.marker( center, {
				draggable: false,
				icon: map.getCustomIcon(),
				riseOnHover: true
			}).bindPopup( map.getWaypointMarkerPopup( center ) );
}

// display the route end markers for given route end points
map.showAllRouteEndsMarkers = function ( routeEnds ) {
	var marker = null;

	for( var i in routeEnds ) {
		marker = map.getRouteEndMarker( routeEnds[ i ] );

		map._searchPlaces.addLayer( marker );

	}
	map._lastLocation = routeEnds[ i ];
	map._routeEndsLocations.push( routeEnds[ i ] );
}

// get a route by given locations and display it on the map
// with boxes for closest places
map.getRouteWithBoxes = function( loc ) {
	requests.getRoute( loc, function successCallback2( routes ) {
		for( var i in routes ) {
			map.drawRoutePolylineAndBoxes( routes[ i ].geometry, routes[ i ].distance );
		}
	});
};

// draw a route polyline and boxes
map.drawRoutePolylineAndBoxes = function ( route, routeDistance ) {
	var routePolyline = new L.Polyline( L.PolylineUtil.decode( route ), { color: "#138d90" } ), // OSRM polyline decoding
		boxes = L.RouteBoxer.box( routePolyline, this._distance ),
		bounds = new L.LatLngBounds( [] ),
		boxpolys = new Array( boxes.length ),
		boxesLayer = L.featureGroup( [] ),
		currentRectangle = null,
		reachablePlaces = [];

	for ( var i in boxes ) {
		currentRectangle = L.rectangle( boxes[ i ], { color: "#138d90", opacity: 0.1, weight: 1 } ).addTo( boxesLayer );
		bounds.extend( boxes[ i ] );

		reachablePlaces = reachablePlaces.concat( map.getReachablePlaces( currentRectangle ) );
	}

	// update the current route distance in the box in the right
	boxesLayer.on( 'click', function() {
		map.updateCurrentRouteDistanceLabel( routeDistance );
	} );

	// update the whole route distance in the box in the right
	map.updateRouteDistanceLabel( routeDistance );

	this._myPlacesLayer.addLayer ( L.featureGroup( reachablePlaces ) );

	this._routesLayer.addLayer ( L.featureGroup( [ routePolyline, boxesLayer ] ) );

	this._map.fitBounds( bounds );
};

// draw a circle around given point
// radius = the distance selected in the menu
map.drawSinglePointCircle = function ( point ) {
	var radius = this._distance * 1000, // in metres
		circle = L.circle( point, { radius: radius } );

	this._circleLayer.addLayer ( L.featureGroup( [ circle ] ) );
	this._myPlacesLayer.addLayer ( L.featureGroup( map.getReachablePlaces( circle ) ) );
	this._map.fitBounds( this._circleLayer.getBounds() );
};

// update the current route in the right route distance control after click on the route
map.updateCurrentRouteDistanceLabel = function( distance ) {
	$( '.current-route-distance-info' ).html( ( distance / 1000 ).toFixed( 3 ) + 'km' );
};

// update the whole route label
map.updateRouteDistanceLabel = function( distance ) {
	var $distanceInfo = $( '.route-distance-info' ),
		distanceInfoVal = $distanceInfo.html().replace( 'km', '' ),
		currentDistance = distanceInfoVal ? parseFloat( distanceInfoVal ) : 0;

	$( '.route-distance-info' ).html( ( distance / 1000 + currentDistance ).toFixed( 3 ) + 'km' );
};


// get all the places ( from my places ) that are inside given shape
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

// clear the map and open the search field
map.startNewRouteEventListener = function() {
	$doc.on( 'click', '.start-new-route', function() {
		map.clearMap();

		$( '.leaflet-control-geocoder-icon' ).click();
	});
};

// event listener for removing all layers from the map
map.clearMapEventListener = function() {
	$doc.on( 'click', '.start-new-route, .clear-map', function() {
		map.clearMap();

		if( showHelpMessage ) {
			toastr.info( 'Click on the "Show all places" in the center of the top menu. Now you can see all saved places.' );
			toastr.info( 'Now let\s start a new route. Click on the "Close places distance" button in the top menu.' );
		}
	});
};

// remove all layers from the map
map.clearMap = function() {
	map._myPlacesLayer.clearLayers();
	map._routesLayer.clearLayers();
	map._circleLayer.clearLayers();
	map._searchPlaces.clearLayers();
	map._lastLocation = undefined;
	map._routeEndsLocations = [];

	map.clearRouteDistancesMarkup();
};

// clear the numbers in the route distance control
map.clearRouteDistancesMarkup = function() {
	$( '.current-route-distance-info' ).html( '' );
	$( '.route-distance-info' ).html( '' );
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
				iconSize: [ 30, 30 ],
				iconAnchor: [ 15, 30 ],
				popupAnchor: [ 0, -40 ]
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

					toastr.success( 'Added a new place!', null, toastrOptions );

					if( showHelpMessage ) {
						toastr.info( 'Drag the marker to update its location.', null, helpOptions );
						toastr.info( 'Click on the marker to open its popup.', null, helpOptions );
						toastr.info( 'Now click on the "More info" button.', null, helpOptions );
					}
				});
		}
		else {
			toastr.error( 'You already have a place on this location!', null, toastrOptions );
		}
	});
};


// show all saved places
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

// open the big popup containing the place info
map.enlargePopupEventListener = function() {
	var myPlace = null,
		$popup = $( '.big-popup' ),
		$textarea = null;

	$doc.on( 'click', '.my-place-popup', function() {
		myPlace = myPlacesDictionary.getPlace( $( this ).data( 'coords' ) );

		$popup.html( myPlace.getMarkerBigPopupContent() ).removeClass( 'hidden' );

		if( showHelpMessage ) {
			toastr.info( 'You can add some description and change the marker icon from here.', null, helpOptions );
			toastr.info( 'Click on the pencil icon in the bottom right corner to enable the edit view.', null, helpOptions );
		}


		// update the height of the text area based on its content
		setTimeout( function() {
			$textarea = $popup.find( 'textarea' );
		    $textarea.height( $textarea[ 0 ].scrollHeight );
		}, 1);
	});
};

// close the big place info popup
map.closePopupEventListener = function() {
	var $popup = $( '.big-popup' );

	$doc.on( 'click', '.close-popup', function() {
		$popup.addClass( 'hidden' );

		if( showHelpMessage ) {
			toastr.info( 'Now let\'s continue with your route. Go to the search field and type in another place.', null, helpOptions );
		}
	});

	$doc.on( 'click', '.my-place-big-popup, .leaflet-popup', function( e ) {
		e.stopPropagation();
	});

	$doc.on( 'click', function() {
		if( ! $popup.hasClass( 'hidden' ) ) {
			$popup.addClass( 'hidden' );

			if( showHelpMessage ) {
				toastr.info( 'Now let\'s continue with your route. Go to the search field and type in another place.', null, helpOptions );
			}
		}
	});
};

// event listener for the edit icon in the place big popup
map.editPlaceEventListener = function() {
	$doc.on( 'click', '.edit-place-icon', function() {
		$( '.my-place-big-popup' ).toggleClass( 'edit-view' );

		if( showHelpMessage ) {
			toastr.info( 'Let\s change the icon of the marker. Go to the web, find an image, copy its url and paste it here.', null, helpOptions );
		}
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

			if( showHelpMessage ) {
				toastr.info( 'Great! Now close the popup to see your marker icon updated.', null, helpOptions );
			}
		});
	});

	map.addEventListener( 'update-marker-coords', function( e ) {
		requests.updatePlace( e.id, 'coords', e.coords, function successCallback () {
			toastr.success( 'Marker location updated!', null, toastrOptions );
		});
	});
};

// delete current place
map.deletePlaceEventListener = function() {
	var placeId = null,
		place = null;

	$doc.on( 'click', '.delete-place-icon', function() {
		if( window.confirm( 'Are you sure you want to delete this place?' ) ) {
			placeId = $( '.my-place-big-popup' ).attr( 'id' );
			place = myPlacesDictionary.getPlace( $( '.my-place-big-popup' ).data( 'coords' ) );

			requests.deletePlace( placeId, function successCallback() {
				toastr.success( 'Deleted!', null, toastrOptions );

				$( '.big-popup' ).addClass( 'hidden' );
				map._map.removeLayer( place.getCurrentMarker() );
				place = undefined;
			} );
		}
	});
};

