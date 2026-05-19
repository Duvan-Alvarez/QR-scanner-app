const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "QR Scanner Desktop",
    backgroundColor: '#0f172a',
  });

  win.setMenu(null);

  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, 'out/index.html')}`;

  win.loadURL(startURL);

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  win.on('closed', () => app.quit());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
