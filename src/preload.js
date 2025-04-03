/**
 * Preload Script - Bridge between Main Process and Renderer Process
 */

// Thiết lập biến môi trường mặc định là browser mode
const ENV = {
  isElectron: false,
};

// Thiết lập browser mode trước tiên
setupBrowserMode();

// Chỉ thực hiện kiểm tra và thiết lập Electron mode sau đó
try {
  // Chúng ta cần phải tránh bất kỳ import nào ở mức global scope
  if (typeof window !== "undefined") {
    if (
      window.electron ||
      (window.process &&
        window.process.versions &&
        window.process.versions.electron)
    ) {
      console.log("Detected real Electron environment!");
      ENV.isElectron = true;
      setupElectronMode();
    } else {
      console.log(
        "Not running in real Electron - continuing with browser mode"
      );
    }
  }
} catch (error) {
  console.log("Error checking environment:", error);
}

/**
 * Setup browser mode (mock) implementations
 */
function setupBrowserMode() {
  console.log("Setting up browser mode");

  // Create mock implementations
  window.electron = {
    readJsonFile: async (filename) => {
      console.log("Browser mode: Mock readJsonFile for", filename);
      return {
        materials: {
          videos: [],
          transitions: [],
          video_effects: [],
          speeds: [],
          placeholder_infos: [],
          vocal_separations: [],
        },
        tracks: [],
        duration: 0,
        uuid: "demo-uuid",
      };
    },
    selectFiles: async () => {
      console.log("Browser mode: Mock selectFiles");
      alert(
        "File selection requires Electron. This is a demo in browser mode."
      );
      return [];
    },
    getFileDetails: async (filePaths) => {
      console.log("Browser mode: Mock getFileDetails for", filePaths);
      return [];
    },
    getPlatform: () => {
      console.log("Browser mode: Mock getPlatform");
      return "browser";
    },
    send: (channel, data) => {
      console.log(
        "Browser mode: Mock send for channel",
        channel,
        "with data",
        data
      );
    },
    receive: (channel, func) => {
      console.log("Browser mode: Mock receive for channel", channel);
      // Đối với các channel phổ biến, thiết lập mock handlers
      if (channel === "folder-selected") {
        window.mockReceiveHandlers = window.mockReceiveHandlers || {};
        window.mockReceiveHandlers[channel] = func;
      }
    },
  };

  console.log("Browser mode electron API initialized");
}

/**
 * Setup Electron mode with real implementations
 * This function is only called when we're definitely in Electron
 */
function setupElectronMode() {
  try {
    // Dynamically import Electron modules only when we're sure we're in Electron
    const { contextBridge, ipcRenderer } = require("electron");

    contextBridge.exposeInMainWorld("electron", {
      readJsonFile: (filename) =>
        ipcRenderer.invoke("read-json-file", filename),
      selectFiles: () => ipcRenderer.invoke("select-files"),
      getFileDetails: (filePaths) =>
        ipcRenderer.invoke("get-file-details", filePaths),
      getPlatform: () => process.platform,
      send: (channel, data) => {
        const validChannels = [
          "select-folder",
          "create-project",
          "save-project-file",
          "load-templates",
          "import-template",
          "open-template-folder",
        ];
        if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
        }
      },
      receive: (channel, func) => {
        const validChannels = [
          "folder-selected",
          "project-created",
          "save-file-result",
          "templates-loaded",
          "template-imported",
          "folder-open-result",
        ];
        if (validChannels.includes(channel)) {
          ipcRenderer.removeAllListeners(channel);
          ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
      },
    });

    console.log("Electron mode successfully initialized");
  } catch (error) {
    console.error("Failed to initialize Electron mode:", error);
    // Browser mode is already set up, so no fallback needed
  }
}
