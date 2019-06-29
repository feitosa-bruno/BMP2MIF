function toMIFLine(pos, number, depth) {
	var string		= Number(number).toString(2);
	var posLimit	= Number(depth).toString(16).length;
	var address		= Number(pos).toString(16).toUpperCase();
	
	while (address.length < posLimit) {
		address = `0${address}`;	// Zero Pad for address
	}
	while (string.length < 8) {
		string = `0${string}`;		// Zero Pad for data
	}
	return `${address} : ${string};`;
}
module.exports = toMIFLine;