const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
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

  // Initialize handlers after window is created
  setupIpcHandlers();
  fileHandler.init(mainWindow);
  projectManager.init(mainWindow);
  templateManager.init(mainWindow);

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// Setup IPC handlers
function setupIpcHandlers() {
  if (!mainWindow) {
    console.error("Main window not initialized");
    return;
  }

  ipcMain.handle("read-json-file", async (event, filename) => {
    try {
      const possiblePaths = [
        path.join(__dirname, "../renderer/scripts", filename),
        path.join(__dirname, "../renderer/resources", filename),
        path.join(__dirname, "../renderer", filename),
        path.join(process.cwd(), filename),
      ];

      console.log("Possible paths for", filename, ":", possiblePaths);

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          console.log("Found file at:", filePath);
          const data = fs.readFileSync(filePath, "utf8");
          return JSON.parse(data);
        }
      }

      throw new Error(
        `File not found: ${filename}. Checked paths: ${possiblePaths.join(
          ", "
        )}`
      );
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw error;
    }
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});
