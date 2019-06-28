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
const toMIFLine				= require(`${appDir}/scripts/auxiliary/toMIFLine`);


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Global Controller
////////////////////////////////////////////////////////////////////////////////

class GlobalController {
    constructor () {
		this.controlsEnabled	= true;
		this.outputFile			= null;
		this.outputFilename		= null;
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

		// Escape Key Event Listener
		// Closes window when Escape Key is Pressed and Released
		window.onkeyup = this.escKeyPressed.bind(this);
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
		}
	}

	convertBitmapFile(file) {
		var bmpBuffer		= fs.readFileSync(file.path);	// Reads file
		var parsedFilename	= file.path;
		var decodedBMP;
		var grayscalePalletVector;
		var outputBuffer;
		var outputFilename;

		// console.log(bmpBuffer);

		// Decode BMP file
		decodedBMP = this.decode(bmpBuffer);
		// console.log(decodedBMP);

		if (decodedBMP === false) return;	// Exit in case of failure

		this.setParsedImage(parsedFilename);

		// Convert to 8-bit Grayscale Array
		grayscalePalletVector = this.convertToGrayscale(decodedBMP.palette);

		// Convert 8-bit Grayscale Array to Buffer
		outputBuffer = this.convertToBuffer(grayscalePalletVector);

		// Get Output Filename
		outputFilename = this.getOutputFilename(parsedFilename);

		// Set Output for File Saving
		this.setOutput(outputBuffer, outputFilename);
	}

	decode(buffer) {
		try {
			var buffer = BMP.decode(buffer);
			if (buffer.bitPP == 8) {
				return buffer;
			} else {
				console.error("Not an 8-bit BMP File.");
				alert("Not an 8-bit BMP File.");
				return false;
			}
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

	convertToGrayscale (palletVector) {
		return palletVector.map(el => {
			return (((el.red + el.green + el.blue) / 3) | 0);
		});
	}

	convertToBuffer (vector) {
		var output = "";
		for (var i in vector) {
			output = `${output}${toMIFLine(vector[i])}\r\n`;
		}
		return output;
	}

	getOutputFilename (filename) {
		return `${filename.slice(
			filename.lastIndexOf("\\") + 1,
			filename.toLowerCase().lastIndexOf(".bmp")
		)}.mif`;
	}

	escKeyPressed (event) {
		if (event.key == "Escape") {
			close();
		}
	}

	setOutput (buffer, filename) {
		// Visualize Buffer on page
		document.getElementById(_DS.outputString).innerHTML = buffer;

		// Set Output File and Filename to Program
		this.outputFile = new Blob([buffer], {type: "text/plain;charset=utf-8"});
		this.outputFilename = filename;		

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