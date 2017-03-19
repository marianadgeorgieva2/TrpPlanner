var map = {};


map.init = function() {

	var mapTileLayer = L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

	this._map = L.map( 'map' ).setView( [ 51.505, -0.09 ], 13 );

	mapTileLayer.addTo( this._map );

	map.routingControlInit();
}


map.routingControlInit = function() {
	var greenIcon = map.getCustomIcon(),
		popupContent = map.getWaypointMarkerPopupContent(),
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
				}).bindPopup( popupContent );
			}
		});

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

// get the matkup of the popups of the way points
map.getWaypointMarkerPopupContent = function() {
 	return '<button class="add-to-my-places" type="button">Add to My Places</button>'
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
