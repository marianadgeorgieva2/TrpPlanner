var myPlacesDictionary = {},
	dictionary = {};

myPlacesDictionary.addNewPlace = function( place ) {
	dictionary[ place._coords ] = place;
}

myPlacesDictionary.getPlace = function( coords ) {
	return dictionary[ coords ];
}

myPlacesDictionary.getAllPlaces = function( coords ) {
	return dictionary;
}