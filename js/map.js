var map = {};

map.init = function() {
	var mapTileLayer = L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}),
		routingControl = L.Routing.control({
		    waypoints: [
		        L.latLng(57.74, 11.94),
		        L.latLng(57.6792, 11.949)
		    ],
		    routeWhileDragging: true,
		    geocoder: L.Control.Geocoder.nominatim()
		});

	this._map = L.map( 'map' ).setView( [ 51.505, -0.09 ], 13 );

	mapTileLayer.addTo( this._map );
	routingControl.addTo( this._map );

	routingControl.on('routesfound', function(e) {
        var routes = e.routes;
        console.log('Found ' + routes.length + ' route(s).');
    });


    routingControl.on('routeselected', function(e) {
        var route = e.route;
        console.log('Showing route between waypoints:\n' + JSON.stringify(route.inputWaypoints, null, 2));
    });
}