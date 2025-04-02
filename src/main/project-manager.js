const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;

/**
 * Khởi tạo quản lý dự án
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
  // Xử lý tạo dự án mới
  ipcMain.on("create-project", handleCreateProject);
}

/**
 * Xử lý tạo dự án mới
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 */
async function handleCreateProject(event, data) {
  try {
    const { projectName, defaultPath, targetPath } = data;

    // Kiểm tra đường dẫn nguồn tồn tại
    if (!fs.existsSync(defaultPath)) {
      mainWindow.webContents.send("project-created", {
        success: false,
        message: `Default folder not found: ${defaultPath}`,
      });
      return;
    }

    // Kiểm tra và tạo thư mục đích nếu cần
    if (!fs.existsSync(targetPath)) {
      try {
        fs.mkdirSync(targetPath, { recursive: true });
      } catch (err) {
        mainWindow.webContents.send("project-created", {
          success: false,
          message: `Failed to create target directory: ${err.message}`,
        });
        return;
      }
    }

    // Tạo đường dẫn đến thư mục dự án mới
    const projectDir = path.join(targetPath, projectName);

    // Kiểm tra tồn tại
    if (fs.existsSync(projectDir)) {
      mainWindow.webContents.send("project-created", {
        success: false,
        message: `A project with the name "${projectName}" already exists`,
      });
      return;
    }

    // Tạo thư mục dự án
    fs.mkdirSync(projectDir, { recursive: true });

    // Sao chép nội dung từ mẫu
    copyFolderRecursiveSync(defaultPath, projectDir);

    mainWindow.webContents.send("project-created", {
      success: true,
      message: `Project "${projectName}" created successfully`,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    mainWindow.webContents.send("project-created", {
      success: false,
      message: `Error creating project: ${error.message}`,
    });
  }
}

/**
 * Hàm sao chép đệ quy nội dung thư mục
 * @param {string} source - Đường dẫn thư mục nguồn
 * @param {string} target - Đường dẫn thư mục đích
 */
function copyFolderRecursiveSync(source, target) {
  // Kiểm tra nguồn tồn tại
  if (!fs.existsSync(source)) {
    return;
  }

  // Tạo thư mục đích nếu chưa tồn tại
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Đọc danh sách tệp và thư mục trong nguồn
  const files = fs.readdirSync(source);

  // Sao chép từng tệp/thư mục
  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    // Nếu là thư mục thì gọi đệ quy
    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      // Sao chép tệp
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

module.exports = {
  init,
};
