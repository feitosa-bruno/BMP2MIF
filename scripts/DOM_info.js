//  DOM Info

// DOM Message Channels
const _Messages = {
};

// DOM Classes
const _HTMLClasses = {
	disabledButton:			"disabled_button",
};

// DOM Strings
const _DS = {
	// 1. index.html Identifiers
	fileInput:				"input",
	inputImage:				"input_image",
	outputString:			"output",
	fileOutput:				"output_file",
};

const regexFilters = {
	name:		/[^\w\s\ç\Â-\ẽ\-\(\)\,\.]/g,
	address:	/[^\w\s\ç\Â-\ẽ\-\(\)\,\.]/g,
	phone1:		/^[0|\D]*/,
	phone2:		/[^\d]/g,
	string:		/[^\w\s\ç\Â-\ẽ\-\(\)\,\.]/g,
	number:		/[^\d\.]/g,
};

module.exports = {
	_Messages			: _Messages,
	_HTMLClasses		: _HTMLClasses,
	_DS					: _DS,
	regexFilters		: regexFilters,
};