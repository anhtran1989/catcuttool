const { app, BrowserWindow } = require("electron");
const path = require("path");
const fileHandler = require("./file-handler");
const projectManager = require("./project-manager");
const templateManager = require("./template-manager");

let mainWindow;

/**
 * Hàm khởi tạo cửa sổ chính của ứng dụng
 */
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

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  // Mở DevTools trong môi trường phát triển
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Khởi tạo các trình xử lý sự kiện
  fileHandler.init(mainWindow);
  projectManager.init(mainWindow);
  templateManager.init(mainWindow);

  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});
