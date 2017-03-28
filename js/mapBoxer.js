var MapBoxer = {};


MapBoxer.init = function() {

  this.map = map;
  this.distance = 10;
  // Waypoints for getting a route of
  var loc = [
    '9.992196,53.553406',
    '9.992196,56.563406'
  ];

  this.route = this.loadRoute( loc, this.drawRoute );
  return this.route;
};

/**
 *  Format an array of LatLng for L.polyline from uncompressed OSRM request
 *
 */
MapBoxer.formArray = function (arr) {
  var narr = [];
  for(var x=0;x<arr.length;x++){
    var _n = arr[x].split(',');
    narr.push([ parseFloat(_n[0]), parseFloat(_n[1])]);
  }
  return narr;
};

/**
 *  Draw the route as a polyline
 *
 **/
MapBoxer.drawRoute = function (route) {

  route = new L.Polyline(L.PolylineUtil.decode(route)); // OSRM polyline decoding

  var boxes = L.RouteBoxer.box(route, this.distance);
  var bounds = new L.LatLngBounds([]);
  var boxpolys = new Array(boxes.length);
  var boxesLayer = L.featureGroup( [] );

  for (var i = 0; i < boxes.length; i++) {
    L.rectangle(boxes[i], {color: "#ff7800", weight: 1}).addTo( boxesLayer );
    bounds.extend(boxes[i]);
  }

  // route.addTo(this.map);
  // this.map.fitBounds(bounds);

  return {
          route: route,
          boxesLayer: boxesLayer
        };

};

/**
 *  Load route from Mapzen OSRM server
 *
 *  compressin must be switched off
 *
 **/
MapBoxer.loadRoute = function (loc) {
  var url = 'https://router.project-osrm.org/route/v1/driving/';
  var _this = this;

  url += loc.join(';');

  var jqxhr = $.ajax({
    url: url,
    data: {
      overview: 'full',
      steps: false,
      //compression: false,
      alternatives: false
    },
    dataType: 'json'
  })
  .done(function(data) {
    return _this.drawRoute( data.routes[0].geometry );
  })
  .fail(function(data) {
    console.log(data);
  });

};
