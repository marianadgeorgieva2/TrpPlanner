var menu  = {},
	$doc = $( document );


menu.init = function() {
	this.getAllPlaces();

	menu.hideStartScreen();

	menu.getAllRoutes();
	menu.toggleRoutesMenuEventListener();
	menu.showRouteFromTheMenu();
	menu.deleteRouteEventListener();
}

menu.hideStartScreen = function() {
	var $startScreen = $( '.start-screen' );

	$doc.on( 'click', function() {
		$startScreen.addClass( 'hidden' );
	} );
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

			markup += '<li id="' + currentRoute._id.$oid + '" class="route-menu-item" data-route-ends="' +
							getRouteEndsMarkup( currentRoute.routeEnds ) + '">Route' +
							'<span title="delete" class="delete-route"></span>'
						'</li>';
		}
	}

	$( '.routes-menu' ).html( markup );
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
	var routeEnds = null;

	$doc.on( 'click', '.route-menu-item', function() {
		routeEnds = $( this ).data( 'route-ends' );

		map.clearMap();
		map.getRouteWithBoxes( routeEnds );
		map.showAllRouteEndsMarkers( routeEnds );
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