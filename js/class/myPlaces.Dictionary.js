var myPlacesDictionary = {};

myPlacesDictionary.addNewPlace = function( place ) {
	myPlacesDictionary[ place._id ] = place;
}