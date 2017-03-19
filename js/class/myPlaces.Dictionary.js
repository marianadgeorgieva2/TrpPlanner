var myPlacesDictionary = {};

myPlacesDictionary.addNewPlace = function( place ) {
	myPlacesDictionary[ place._coords ] = place;
}

myPlacesDictionary.getPlace = function( coords ) {
	return myPlacesDictionary[ coords ];
}