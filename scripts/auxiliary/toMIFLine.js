function toMIFLine(number) {
	var string = number.toString(2);
	while (string.length < 8) {
		string = `0${string}`;	// Zero pad
	}
	return string;
}
module.exports = toMIFLine;