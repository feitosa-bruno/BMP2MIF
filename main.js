// Modules to control application life and create native browser window
const Menu 			= require('electron').Menu;
const app 			= require('electron').app;
const appDir		= app.getAppPath();
const MainWindow	= require(`${appDir}/scripts/classes/MainWindow`);


// Main Window Object
let mainWindow = new MainWindow();


// Menu Template
const template = [
	{
		label: 'File',
		submenu: [
			{ label: 'Minimize', role: 'minimize' },
			{ label: 'Reload', role: 'reload' },
			{ label: 'Debug', role: 'toggledevtools', accelerator: 'F12' },
			{ type: 'separator' },
			{
				label: 'Close',
				click() {
					app.quit()
				},
				accelerator: 'CmdOrCtrl+Q'
			}
		]
	},
];

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.once('ready', () => {
	mainWindow.create()
	Menu.setApplicationMenu(Menu.buildFromTemplate(template))
})


// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow.window === null) {
		mainWindow.create()
	}
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
