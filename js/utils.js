var utils = {};

utils.limitImageSize = function ( img, maxWidthAndHeight, imgWidth, imgHeight ) {
	var index;

	if( imgWidth > imgHeight  && imgWidth > maxWidthAndHeight ) {
		index = imgWidth / maxWidthAndHeight;

		img.width = maxWidthAndHeight;
		img.height = imgHeight / index;

	}
	else if( imgHeight > maxWidthAndHeight ) {
		index = imgHeight / maxWidthAndHeight;

		img.height = maxWidthAndHeight;
		img.width = imgWidth / index;
	}
	else if( imgWidth === 0 && imgHeight === 0 ) {
		img.height = maxWidthAndHeight;
		img.width = maxWidthAndHeight;
	}

	return img;
};