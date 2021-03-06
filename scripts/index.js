////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Requirements
////////////////////////////////////////////////////////////////////////////////

const BMP					= require("bmp-js");
const fs					= require("fs");
const FileSaver				= require("file-saver");
const appDir				= require('electron').remote.app.getAppPath();
const _DS					= require(`${appDir}/scripts/DOM_info`)._DS;
const _HTMLClasses			= require(`${appDir}/scripts/DOM_info`)._HTMLClasses;
const Stopwatch				= require(`${appDir}/scripts/classes/Stopwatch`);
const CNNFilter				= require(`${appDir}/scripts/classes/CNNFilter`);
const toMIFLine				= require(`${appDir}/scripts/auxiliary/toMIFLine`);
const toHEXLine				= require(`${appDir}/scripts/auxiliary/toHEXLine`);
const writeMIFHeader		= require(`${appDir}/scripts/auxiliary/writeMIFHeader`);


let imageConversionStopwatch = new Stopwatch("Image Conversion");
let CNNFilterApplication = new Stopwatch("CNN Filter Application");
const _W0 = [
	[ 1, -1, -1],
	[-1,  0,  0],
	[-1, -1,  0]
];
const _W1 = [
	[ 0,  0,  1],
	[ 1,  1,  0],
	[ 0,  0,  0]
];


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Global Controller
////////////////////////////////////////////////////////////////////////////////

class GlobalController {
    constructor () {
		this.controlsEnabled		= true;
		this.outputFile				= null;
		this.outputFilename			= null;
		this.bmpBuffer				= null;
		this.decodedBMP				= null;
		this.grayscaleVector	= null;
		this.outputBuffer			= null;
		this.parsedFilename			= "";
		this.CNNFilter				= null;
		this.tests					= null;
		this.filteredTests			= null;
    }

	setupEventListeners () {
        // File Selection Event Listener
        // Flagged whenever there is a change in the selected file
        // Event Callback Function is called handleFileSelect
        // 'this' is tied to the GlobalController object via the 'bind(this)'
        document
        .getElementById(_DS.fileInput)
        .addEventListener('change', this.handleFileSelect.bind(this), false);

		// Output Downloader Event Listener
        // Flagged whenever .mif File Save is clicked
        // Event Callback Function is called saveOutputFile
        // 'this' is tied to the GlobalController object via the 'bind(this)'
        document
        .getElementById(_DS.fileOutput)
        .addEventListener('click', this.saveOutputFile.bind(this), false);
	}

	toggleControls(state) {
		if (this.controlsEnabled != state) {
			var buttonElement = document.getElementById(_DS.fileOutput);
			buttonElement.disabled = !state;
			buttonElement.classList.toggle(_HTMLClasses.disabledButton);
			this.controlsEnabled = state;
		}
	}

	initialize () {
		this.setupEventListeners();
		this.toggleControls(false);
	}

    handleFileSelect (event) {
		var file = event.target.files[0];		// User File

		if (!(file instanceof File)) {
			// alert("File Input Failed");
			return;
		} else {
			this.convertBitmapFile(file);
			
			this.applyCNNFilter(this.decodedBMP);
		}
	}

	convertBitmapFile(file) {
		imageConversionStopwatch.start();

		this.bmpBuffer		= fs.readFileSync(file.path);	// Reads file
		this.parsedFilename	= file.path;

		// console.log(this.bmpBuffer);

		// Decode BMP file
		this.decodedBMP = this.decode(this.bmpBuffer);
		// console.log(decodedBMP);

		if (this.decodedBMP === false) return;	// Exit in case of failure

		this.setParsedImage(this.parsedFilename);

		// Convert to 8-bit Grayscale Array
		this.grayscaleVector = this.convertToGrayscale(this.decodedBMP);

		// Convert 8-bit Grayscale Array to Buffer
		this.outputBuffer = this.convertToBuffer(this.grayscaleVector, this.decodedBMP);

		// Set Output Filename
		this.outputFilename = this.getOutputFilename(this.parsedFilename);

		// Set Output for File Saving
		this.setOutput(this.outputBuffer);

		imageConversionStopwatch.stop();
	}

	applyCNNFilter (decodedBMP) {
		this.CNNFilter = new CNNFilter(decodedBMP, _W0, _W1);
		this.CNNFilter.initializeImageMatrix();
	
		this.tests = [];
		for (var i = 0; i < 1000.; i++) {
			CNNFilterApplication.start();
			this.CNNFilter.process();
			this.tests.push(CNNFilterApplication.stop("silent"));
		}
		console.log(Math.min(...this.tests));
		console.log(Math.max(...this.tests));
		console.log(this.tests.reduce((a, b) => a+b, 0)/this.tests.length);
		console.log(this.tests.length);
		this.filteredTests = this.tests.filter((value) =>{
			return (value < Math.max(...this.tests)) && (value > Math.min(...this.tests))
		});
		console.log(Math.min(...this.filteredTests));
		console.log(Math.max(...this.filteredTests));
		console.log(this.filteredTests.reduce((a, b) => a+b, 0)/this.filteredTests.length);
		console.log(this.filteredTests.length);
		this.filteredTests = this.filteredTests.filter((value) =>{
			return (value < Math.max(...this.filteredTests)) && (value > Math.min(...this.filteredTests))
		});
		console.log(Math.min(...this.filteredTests));
		console.log(Math.max(...this.filteredTests));
		console.log(this.filteredTests.reduce((a, b) => a+b, 0)/this.filteredTests.length);
		console.log(this.filteredTests.length);		
	}

	decode(buffer) {
		try {
			return BMP.decode(buffer);
		} catch (err) {
			console.error(`Error: ${err.message}`);
			alert(`Error: ${err.message}`);
			return false;
		}
	}

	setParsedImage (filename) {
		var imageElement = document.getElementById(_DS.inputImage);
		imageElement.src = filename;
		imageElement.alt = filename.slice(filename.lastIndexOf("\\") + 1);
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

	convertToBuffer (vector, decoded) {
		var depth = ((decoded.width * decoded.height) | 0);
		var output = `${writeMIFHeader(depth, 8)}`;
		output = `${output}\r\n\r\nCONTENT\r\nBEGIN\r\n\r\n`;
		for (var i in vector) {
			output = `${output}${toMIFLine(i, vector[i], depth)}\r\n`;
			// output = `${output}${toHEXLine(vector[i])}\r\n`;
		}
		output = `${output}\r\nEND;`;
		return output;
	}

	getOutputFilename (filename) {
		return `${filename.slice(
			filename.lastIndexOf("\\") + 1,
			filename.toLowerCase().lastIndexOf(".bmp")
		)}.mif`;
	}

	setOutput (buffer) {
		// // Visualize Buffer on page
		// document.getElementById(_DS.outputString).innerHTML = buffer;

		// Set Output File and Filename to Program
		this.outputFile = new Blob([buffer], {type: "text/plain;charset=utf-8"});

		// Enable Controls
		this.toggleControls(true);
	}

	saveOutputFile () {
		console.log("Saving .mif File...");
		if (this.outputFile !== null && this.outputFilename !== null)
			FileSaver.saveAs(this.outputFile, this.outputFilename);
	}
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Initialization
////////////////////////////////////////////////////////////////////////////////

let ctrl		= new GlobalController();

ctrl.initialize();
