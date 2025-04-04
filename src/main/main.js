const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");
const fileHandler = require("./file-handler");
const projectManager = require("./project-manager");
const templateManager = require("./template-manager");

let mainWindow;
let watcher = null;

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

  // Setup file watcher for draft_content files
  setupFileWatcher();

  mainWindow.on("closed", function () {
    // Dừng watcher khi đóng cửa sổ
    if (watcher) {
      watcher.close();
      watcher = null;
    }
    mainWindow = null;
  });
}

/**
 * Thiết lập file watcher để theo dõi thay đổi các file draft_content
 */
function setupFileWatcher() {
  try {
    const rendererDir = path.join(__dirname, "../renderer");
    
    // Mảng các file cần theo dõi
    const filesToWatch = [
      path.join(rendererDir, "draft_content.json"),
      path.join(rendererDir, "draft_content_effect.json"),
      path.join(rendererDir, "draft_content_transition.json")
    ];
    
    console.log("Setting up file watcher for:", filesToWatch);
    
    // Khởi tạo watcher
    watcher = chokidar.watch(filesToWatch, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });
    
    // Xử lý sự kiện thay đổi
    watcher.on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('file-changed', { filePath });
      }
    });
    
    console.log("File watcher initialized successfully");
  } catch (error) {
    console.error("Error setting up file watcher:", error);
  }
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

  // Handler for watching specific files
  ipcMain.handle("watch-files", async (event, files) => {
    try {
      if (!watcher) {
        setupFileWatcher();
      }
      
      if (Array.isArray(files) && files.length > 0) {
        watcher.add(files);
        return { success: true, message: "Files added to watch list" };
      }
      
      return { success: false, message: "No valid files to watch" };
    } catch (error) {
      console.error("Error watching files:", error);
      return { success: false, message: error.message };
    }
  });
  
  // Handler for unwatching specific files
  ipcMain.handle("unwatch-files", async (event, files) => {
    try {
      if (watcher && Array.isArray(files) && files.length > 0) {
        watcher.unwatch(files);
        return { success: true, message: "Files removed from watch list" };
      }
      
      return { success: false, message: "No valid files to unwatch or watcher not initialized" };
    } catch (error) {
      console.error("Error unwatching files:", error);
      return { success: false, message: error.message };
    }
  });

  // Listener for watching draft content files
  ipcMain.on("watch-draft-content", (event) => {
    setupFileWatcher();
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
