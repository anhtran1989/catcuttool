function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload.js"),
    },
  });

  // Set environment variable for preload script
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.executeJavaScript(`
      window.isElectron = true;
    `);
  });

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
}
