function writeMIFHeader(depth, width) {
	return `DEPTH = ${depth};\r\nWIDTH = ${width};\r\nADDRESS_RADIX = HEX;\r\nDATA_RADIX = BIN; `;
}
module.exports = writeMIFHeader;