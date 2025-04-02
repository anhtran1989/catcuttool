/**
 * Preload Script - Cầu nối bảo mật giữa Main Process và Renderer Process
 * Giúp cho việc giao tiếp giữa các quá trình diễn ra an toàn thông qua contextBridge
 */
const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

/**
 * Expose selected APIs to the renderer process
 * Cung cấp các API được kiểm soát cho quá trình Renderer thông qua đối tượng "electron"
 * Đảm bảo chỉ những tính năng cần thiết được phơi bày để đảm bảo an toàn
 */
contextBridge.exposeInMainWorld("electron", {
  readJsonFile: (filename) => {
    try {
      // Tìm file trong các thư mục có thể có
      const possiblePaths = [
        // Thử trong thư mục scripts (cùng cấp với export-manager.js)
        path.join(__dirname, "renderer", "scripts", filename),
        // Thử trong thư mục resources
        path.join(__dirname, "renderer", "resources", filename),
        // Thử trong thư mục renderer
        path.join(__dirname, "renderer", filename),
        // Thử trong thư mục gốc của ứng dụng
        path.join(process.cwd(), filename),
      ];

      // Log các đường dẫn đang thử để debug
      console.log("Possible paths for", filename, ":", possiblePaths);

      // Kiểm tra từng đường dẫn có thể có
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
  },
  /**
   * File System Operations - Các API xử lý hệ thống tệp
   */
  // Hiển thị hộp thoại chọn nhiều tệp và trả về đường dẫn được chọn
  selectFiles: () => ipcRenderer.invoke("select-files"),
  // Lấy thông tin chi tiết (tên, kích thước, loại) của các tệp từ đường dẫn
  getFileDetails: (filePaths) =>
    ipcRenderer.invoke("get-file-details", filePaths),

  /**
   * System Information - Thông tin hệ thống
   */
  // Trả về thông tin nền tảng hệ điều hành đang chạy
  getPlatform: () => process.platform,

  /**
   * IPC Communication Methods - Các phương thức giao tiếp giữa quá trình
   */
  // Gửi dữ liệu từ Renderer sang Main process qua một kênh cụ thể
  send: (channel, data) => {
    // Chỉ cho phép sử dụng các kênh giao tiếp được phép (whitelist)
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
  // Nhận dữ liệu từ Main process gửi về Renderer process
  receive: (channel, func) => {
    // Chỉ lắng nghe các kênh giao tiếp được phép (whitelist)
    const validChannels = [
      "folder-selected",
      "project-created",
      "save-file-result",
      "templates-loaded",
      "template-imported",
      "folder-open-result",
    ];
    if (validChannels.includes(channel)) {
      // Xóa tất cả trình lắng nghe hiện có để tránh đăng ký nhiều lần
      ipcRenderer.removeAllListeners(channel);
      // Thêm trình lắng nghe mới với hàm callback được cung cấp
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
