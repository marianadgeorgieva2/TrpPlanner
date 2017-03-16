$( document ).ready( function() {
	console.log( 'ajhdjhdj' );

	requests.getAllListCollections();

	var map = L.map('map').setView([51.505, -0.09], 13);

	// http://leaflet-extras.github.io/leaflet-providers/preview/index.html
	var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});

	OpenStreetMap_Mapnik.addTo( map );
})
