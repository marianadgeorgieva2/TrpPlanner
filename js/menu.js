var menu  = {},
	$doc = $( document ),
	showHelpMessage = false, // if true we will show help messages on every step of the workflow
	helpOptions = { // options for help toastr notifications
		timeOut: 0,
		extendedTimeOut: 0,
		positionClass: 'toast-bottom-left',
		closeButton: true
	};


menu.init = function() {
	this.getAllPlaces();

	menu.hideStartScreenEventListener();

	menu.getAllRoutes();
	menu.toggleRoutesMenuEventListener();
	menu.showRouteFromTheMenu();
	menu.deleteRouteEventListener();
	menu.startWithHelpEventListener();
}

menu.hideStartScreenEventListener = function() {
	$doc.on( 'click',  '.start-button', function() {
		menu.hideStartScreen();
	} );
}

menu.startWithHelpEventListener = function() {
	$doc.on( 'click',  '.help-button', function() {
		menu.hideStartScreen();

		showHelpMessage = true;

		toastr.info( 'Let\'s start searching for places. Type in a city name in the top right search field.', null, helpOptions );

		// open the search places input after 1 sec
		setTimeout( function() {
			$( '.leaflet-control-geocoder' ).addClass( 'leaflet-control-geocoder-expanded' );
		}, 1000 );
	} );
}

menu.hideStartScreen = function() {
	$( '.start-screen' ).addClass( 'hidden' );
	$( '#top-controls' ).removeClass( 'hidden' );
	$( '#bottom-controls' ).removeClass( 'hidden' );
}


menu.getAllPlaces = function() {
	var currenPlace = {};

	requests.getAllPlaces( function successCallback( data ) {
		for( var i in data ) {
			currenPlace = new MyPlace( data[ i ] );
		}
	});
}

menu.getAllRoutes = function() {
	var currenRoute = {};

	requests.getAllRoutes( function successCallback( data ) {
		menu.updateRoutesMenu( data );
	});
}

menu.updateRoutesMenu = function( routes ) {
	var currentRoute = null,
		markup = '';

	for( var i in routes ) {
		currentRoute = routes[ i ];

		if( currentRoute.routeEnds.length ) {
			markup += getSingleRouteMenuElementMarkup( currentRoute );
		}
	}

	$( '.routes-menu' ).html( markup );
}

function getSingleRouteMenuElementMarkup( route ) {
	return '<li id="' + route._id.$oid + '" class="route-menu-item" data-route-ends="' +
							getRouteEndsMarkup( route.routeEnds ) + '">' + route.routeName +
							'<span title="delete" class="delete-route"></span>'
						'</li>';
}

function getRouteEndsMarkup( routeEnds ) {
	var markup = '';

	for( var i in routeEnds ) {
		markup += routeEnds[ i ].lng + ',' + routeEnds[ i ].lat + ';';
	}

	return markup.substring( 0, markup.length - 1 ); // remove the last ;
}

menu.toggleRoutesMenuEventListener = function() {
	var $routesMenu = $( '.routes-menu' );

	$doc.on( 'click', '.all-routes', function() {
		$routesMenu.toggleClass( 'hidden' );
	});

	$doc.on( 'click', '.all-routes, .routes-menu', function( e ) {
		e.stopPropagation();
	});

	$doc.on( 'click', function() {
		$routesMenu.addClass( 'hidden' );
	});
}

menu.showRouteFromTheMenu = function() {
	var routeEnds = null,
		routeEndsArr = [],
		routeEndsLatLngs = [];

	$doc.on( 'click', '.route-menu-item', function() {
		routeEnds = $( this ).data( 'route-ends' );
		routeEndsArr = routeEnds.split( ';' );

		routeEndsLatLngs = routeEndsArr.map( function( el ) {
			var coords = el.split( ',' ).reverse();

			return {
				lat: coords[ 0 ],
				lng: coords[ 1 ]
			}
		});

		map.clearMap();
		map.showAllRouteEndsMarkers( routeEndsLatLngs );


		if( routeEndsLatLngs.length === 1 ) {
			map.drawSinglePointCircle( routeEndsLatLngs[ 0 ] );
		}
		else {
			map.getRouteWithBoxes( routeEnds );
		}

		$( '.routes-menu' ).addClass( 'hidden' );
	});
}

menu.deleteRouteEventListener = function() {
	$doc.on( 'click', '.delete-route', function() {
		var $routeListItem = $( this ).parents( 'li' ),
			routeId = $routeListItem.attr( 'id' );

		requests.deleteRoute( routeId, function successCallback() {
			$routeListItem.remove();
		});
	});
}

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

		$( '.places-distance' ).val( distanceInKm ).trigger( 'change' );
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
	var $routeNameContainer = $( '.route-name-container' ),
		$routeNameInput = $( '.route-name-input' );

	$doc.on( 'click', '.save-route', function() {
		$routeNameContainer.removeClass( 'hidden' );
		$routeNameInput.focus();

		if( showHelpMessage ) {
			toastr.info( 'Add a name to your route.', null, helpOptions );
		}
	});

	$doc.on( 'change', '.route-name-input', function() {
		var routeName = $( this ).val();

		if( ! map._routeEndsLocations.length ) {
			$routeNameContainer.addClass( 'hidden' );
			toastr.info( 'Click on the search icon to start a route!' );
			toastr.info( 'There is no route loaded on the map!' );
			return;
		}

		if( routeName ) {
			requests.addNewRoute( map._routeEndsLocations, routeName, function successCallback ( route ) {
				toastr.success( 'New route saved successfully!' );
				$routeNameContainer.addClass( 'hidden' );
				$( '.routes-menu' ).append( getSingleRouteMenuElementMarkup( route ) );

				if( showHelpMessage ) {
					toastr.info( 'You can find your route in the "My routes" list at the bottom.', null, helpOptions );
					toastr.info( 'Go to the top and click on "Clear map".', null, helpOptions );
				}
			} );
		}
	})
};