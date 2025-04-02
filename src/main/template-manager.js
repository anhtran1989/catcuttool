const { ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");

let mainWindow;

/**
 * Khởi tạo quản lý mẫu
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
  // Xử lý tải danh sách mẫu
  ipcMain.on("load-templates", handleLoadTemplates);

  // Xử lý nhập mẫu thành dự án mới
  ipcMain.on("import-template", handleImportTemplate);

  // Xử lý mở thư mục mẫu
  ipcMain.on("open-template-folder", handleOpenTemplateFolder);
}

/**
 * Xử lý tải danh sách mẫu
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 */
async function handleLoadTemplates(event, data) {
  try {
    const { templatePath } = data;

    // Kiểm tra đường dẫn tồn tại
    if (!fs.existsSync(templatePath)) {
      mainWindow.webContents.send("templates-loaded", {
        success: false,
        message: `Không tìm thấy thư mục mẫu: ${templatePath}`,
      });
      return;
    }

    // Lọc ra các thư mục
    const folders = fs
      .readdirSync(templatePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Kiểm tra có thư mục nào không
    if (folders.length === 0) {
      mainWindow.webContents.send("templates-loaded", {
        success: false,
        message: `Không tìm thấy thư mục mẫu nào trong: ${templatePath}`,
      });
      return;
    }

    // Xử lý từng thư mục để tìm mẫu hợp lệ
    const templates = [];

    for (const folder of folders) {
      const folderPath = path.join(templatePath, folder);

      // Kiểm tra tệp ảnh bìa draft_cover.jpg
      const coverImagePath = path.join(folderPath, "draft_cover.jpg");

      // Bỏ qua mẫu không có ảnh bìa
      if (!fs.existsSync(coverImagePath)) {
        continue;
      }

      templates.push({
        name: folder,
        path: folderPath,
        coverImage: coverImagePath,
      });
    }

    if (templates.length === 0) {
      mainWindow.webContents.send("templates-loaded", {
        success: false,
        message: `Không tìm thấy mẫu hợp lệ nào (thiếu file draft_cover.jpg)`,
      });
      return;
    }

    mainWindow.webContents.send("templates-loaded", {
      success: true,
      templates: templates,
      message: `Đã tìm thấy ${templates.length} mẫu`,
    });
  } catch (error) {
    console.error("Lỗi khi tải mẫu:", error);
    mainWindow.webContents.send("templates-loaded", {
      success: false,
      message: `Lỗi khi tải mẫu: ${error.message}`,
    });
  }
}

/**
 * Xử lý nhập mẫu thành dự án mới
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 */
async function handleImportTemplate(event, data) {
  try {
    const { templatePath, templateName, targetPath } = data;

    // Kiểm tra đường dẫn mẫu tồn tại
    if (!fs.existsSync(templatePath)) {
      mainWindow.webContents.send("template-imported", {
        success: false,
        message: `Không tìm thấy thư mục mẫu: ${templatePath}`,
      });
      return;
    }

    // Kiểm tra và tạo thư mục đích nếu cần
    if (!fs.existsSync(targetPath)) {
      try {
        fs.mkdirSync(targetPath, { recursive: true });
      } catch (err) {
        mainWindow.webContents.send("template-imported", {
          success: false,
          message: `Không thể tạo thư mục đích: ${err.message}`,
        });
        return;
      }
    }

    // Tạo tên dự án duy nhất để tránh xung đột
    const timestamp = new Date().getTime();
    const importedProjectName = `${templateName}_${timestamp}`;
    const projectDir = path.join(targetPath, importedProjectName);

    // Tạo thư mục dự án
    fs.mkdirSync(projectDir, { recursive: true });

    // Sao chép nội dung từ mẫu sang dự án mới
    copyFolderRecursiveSync(templatePath, projectDir);

    mainWindow.webContents.send("template-imported", {
      success: true,
      message: `Đã nhập mẫu "${templateName}" thành công như "${importedProjectName}"`,
    });
  } catch (error) {
    console.error("Lỗi khi nhập mẫu:", error);
    mainWindow.webContents.send("template-imported", {
      success: false,
      message: `Lỗi khi nhập mẫu: ${error.message}`,
    });
  }
}

/**
 * Xử lý mở thư mục mẫu
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 */
async function handleOpenTemplateFolder(event, data) {
  try {
    const { templatePath } = data;

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(templatePath)) {
      try {
        fs.mkdirSync(templatePath, { recursive: true });
      } catch (error) {
        mainWindow.webContents.send("folder-open-result", {
          success: false,
          message: `Không thể tạo thư mục mẫu: ${error.message}`,
        });
        return;
      }
    }

    // Mở thư mục trong trình quản lý tệp
    shell.openPath(templatePath).then((error) => {
      if (error) {
        mainWindow.webContents.send("folder-open-result", {
          success: false,
          message: `Không thể mở thư mục mẫu: ${error}`,
        });
      } else {
        mainWindow.webContents.send("folder-open-result", {
          success: true,
          message: "Đã mở thư mục mẫu",
        });
      }
    });
  } catch (error) {
    console.error("Error handling folder open request:", error);
    mainWindow.webContents.send("folder-open-result", {
      success: false,
      message: `Lỗi khi mở thư mục mẫu: ${error.message}`,
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
