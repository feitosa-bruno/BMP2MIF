class CNNFilter {
	constructor (decodedBMP, W0, W1) {
		this.decodedBMP		= decodedBMP;
		this.W0 			= W0;
		this.W1 			= W1;
		this.imageMatrix	= null;
		this.outputMatrix	= null;
		this.width			= decodedBMP.width;
		this.height			= decodedBMP.height;
		this.filterResult	= null;
	}
	
	initializeImageMatrix () {
		var imageVec = this.convertToGrayscale(this.decodedBMP);
		let line = new Array();
		this.imageMatrix = new Array();

		for (var k = 0; k < imageVec.length; k++) {
			if ((k % this.width) != 59) {
				line.push(imageVec[k]);
			} else {
				line.push(imageVec[k]);
				this.imageMatrix.push(new Array(...line));
				line = new Array();
			}
		}
	}

	process () {
		this.outputMatrix = new Array();
		let line = new Array();
		var temp = 0;

		for (var j = 0; j < this.height - 2; j++) {
			for (var i = 0; i < this.width - 2; i++) {
				temp = 
					(
						this.imageMatrix[  j][  i]*this.W0[0][0] + 
						this.imageMatrix[j+1][  i]*this.W0[1][0] + 
						this.imageMatrix[j+2][  i]*this.W0[2][0]
					) +
					(
						this.imageMatrix[  j][i+1]*this.W0[0][1] + 
						this.imageMatrix[j+1][i+1]*this.W0[1][1] + 
						this.imageMatrix[j+2][i+1]*this.W0[2][1]
					) +
					(
						this.imageMatrix[  j][i+2]*this.W0[0][2] + 
						this.imageMatrix[j+1][i+2]*this.W0[1][2] + 
						this.imageMatrix[j+2][i+2]*this.W0[2][2]
					);
				line.push(temp);
			}
			this.outputMatrix.push(new Array(...line));
			line = new Array();
		}

	}

	convertToGrayscale (dcdBuff) {
		var outputVector = [];
		// 4 bytes: ABGR (Alpha, Blue, Green, Red)
		for (var i=0; i < dcdBuff.data.length; i+=4) {
			outputVector.push(
				((dcdBuff.data[i+1] + dcdBuff.data[i+2] + dcdBuff.data[i+3])/3 | 0)
			);
		}
		return outputVector;
	}

}

module.exports = CNNFilter;