var menu  = {},
	$doc = $( document );


menu.init = function() {
	this.getAllPlaces();

	menu.getAllRoutes();
	menu.toggleRoutesMenuEventListener();
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
	var currentRoute = null
		markup = '';

	for( var i in routes ) {
		currentRoute = routes[ i ];

		markup += '<li id="' + currentRoute._id.$oid + '" data-route-ends="' + routes[ i ].routeEnds + '">Route</li>'
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