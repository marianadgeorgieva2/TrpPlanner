var menu  = {},
	$doc = $( document );


menu.init = function() {
	this.getAllPlaces();

	menu.getAllRoutes();
	menu.toggleRoutesMenuEventListener();
	menu.showRouteFromTheMenu();
} 


menu.getAllPlaces = function() {
	var currenPlace = {};

	requests.getAllPlaces( function successCallback( data ) {
		for( var i in data ) {
			currenPlace = new MyPlace( data[ i ] );
		}

		map.showMyPlaces();
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
		routeLeftEnd = null,
		routeRightEnd = null,
		markup = '';

	for( var i in routes ) {
		currentRoute = routes[ i ];

		if( currentRoute.routeEnds.length ) {
			routeLeftEnd = currentRoute.routeEnds[ 0 ];
			routeRightEnd = currentRoute.routeEnds[ 1 ];

			markup += '<li id="' + currentRoute._id.$oid + '" class="route-menu-item" data-route-ends="' +
				routeLeftEnd.lat + ',' + routeLeftEnd.lng + ';' + routeLeftEnd.lat + ',' + routeLeftEnd.lng + '">Route</li>';
		}
	}

	$( '.routes-menu' ).html( markup );
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

		map.getRouteWithBoxes( routeEnds );
	});
}