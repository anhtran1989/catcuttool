const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;

/**
 * Khởi tạo trình xử lý file
 * @param {BrowserWindow} window - Cửa sổ chính của ứng dụng
 */
function init(window) {
  mainWindow = window;
  setupEventListeners();
}

/**
 * Thiết lập các trình lắng nghe sự kiện
 */
function setupEventListeners() {
  // Xử lý chọn nhiều tệp media
  ipcMain.handle("select-files", handleSelectFiles);

  // Lấy thông tin chi tiết của các tệp được chọn
  ipcMain.handle("get-file-details", handleGetFileDetails);

  // Xử lý chọn thư mục
  ipcMain.on("select-folder", handleSelectFolder);

  // Xử lý lưu tệp dự án
  ipcMain.on("save-project-file", handleSaveProjectFile);
}

/**
 * Xử lý chọn nhiều tệp media
 * @returns {Array} Mảng đường dẫn tệp đã chọn
 */
async function handleSelectFiles() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Media Files",
        extensions: ["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi"],
      },
    ],
  });

  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
}

/**
 * Lấy thông tin chi tiết của các tệp được chọn
 * @param {Event} event - Sự kiện IPC
 * @param {Array} filePaths - Mảng đường dẫn tệp cần lấy thông tin
 * @returns {Array} Mảng đối tượng chứa thông tin chi tiết của từng tệp
 */
function handleGetFileDetails(event, filePaths) {
  return filePaths.map((filePath) => {
    const stats = fs.statSync(filePath);
    return {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      type: getFileType(filePath),
    };
  });
}

/**
 * Xử lý chọn thư mục
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 */
async function handleSelectFolder(event, data) {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });

  if (!result.canceled) {
    mainWindow.webContents.send("folder-selected", {
      path: result.filePaths[0],
      inputId: data.inputId,
    });
  }
}

/**
 * Xử lý lưu tệp dự án
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 */
function handleSaveProjectFile(event, data) {
  try {
    const { projectPath, fileName, content } = data;

    // Chuẩn hóa đường dẫn phù hợp với hệ điều hành
    const normalizedPath = path.normalize(projectPath);

    // Kiểm tra và tạo thư mục dự án nếu cần
    if (!fs.existsSync(normalizedPath)) {
      fs.mkdirSync(normalizedPath, { recursive: true });
    }

    // Tạo đường dẫn đầy đủ
    const filePath = path.join(normalizedPath, fileName);

    // Ghi nội dung vào tệp
    fs.writeFileSync(filePath, content, "utf8");

    mainWindow.webContents.send("save-file-result", {
      success: true,
      message: `File saved successfully to: ${filePath}`,
    });
  } catch (error) {
    console.error("Error saving project file:", error);
    mainWindow.webContents.send("save-file-result", {
      success: false,
      message: `Error saving file: ${error.message}`,
    });
  }
}

/**
 * Xác định loại tệp dựa trên phần mở rộng
 * @param {string} filePath - Đường dẫn tệp cần kiểm tra
 * @returns {string} MIME type của tệp
 */
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  const videoExts = [".mp4", ".mov", ".avi", ".mkv", ".webm"];

  if (imageExts.includes(ext)) {
    return "image/" + ext.substring(1);
  } else if (videoExts.includes(ext)) {
    return "video/" + ext.substring(1);
  }
  return "application/octet-stream";
}

module.exports = {
  init,
};
