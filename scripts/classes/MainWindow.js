// Modules to control application life and create native browser window
const BrowserWindow		= require('electron').BrowserWindow;
const app				= require('electron').app;
const appDir			= app.getAppPath();

class MainWindow {
	constructor() {
		this.window	= null;
	}

	// Methods
	create() {
		// Create the browser window...
		this.window = new BrowserWindow({
			show: false,
			width: 800,
			height: 600,
			title: 'BMP to MIF',
			webPreferences: {
				nodeIntegration: true
			},
			// frame: false,
			// titleBarStyle: 'hidden',
		});

		// and load the index.html of the app.
		this.window.loadFile('./src/index.html');

		// Wait for everything to load to show (no one caught with pants on hands)
		this.window.once('ready-to-show', () => {
			// maximize it...
			this.window.maximize();
			// and show
			this.window.show();
		});
		
		// Emitted when the window is closed.
		this.window.on('closed', () => {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			this.window = null;

			// Also, close whole app (in case aux windows are open on main window closure)
			app.quit();
		});
	}
}

module.exports = MainWindow;