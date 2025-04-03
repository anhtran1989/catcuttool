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
  
  // Xử lý tải video mẫu
  ipcMain.on("load-template-video", handleLoadTemplateVideo);
  
  // Xử lý lấy tất cả file media từ thư mục mẫu
  ipcMain.on("get-template-media", handleGetTemplateMedia);
  
  // Xử lý kiểm tra sự tồn tại của file
  ipcMain.handle("check-file-exists", handleCheckFileExists);
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
      
      // Kiểm tra tệp video mẫu template.mp4
      const templateVideoPath = path.join(folderPath, "template.mp4");
      const hasTemplateVideo = fs.existsSync(templateVideoPath);

      // Bỏ qua mẫu không có ảnh bìa
      if (!fs.existsSync(coverImagePath)) {
        continue;
      }

      templates.push({
        name: folder,
        path: folderPath,
        coverImage: coverImagePath,
        templateVideo: hasTemplateVideo ? templateVideoPath : null
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

/**
 * Xử lý tải video mẫu
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 */
async function handleLoadTemplateVideo(event, data) {
  try {
    const { videoPath } = data;

    // Kiểm tra tệp tồn tại
    if (!fs.existsSync(videoPath)) {
      mainWindow.webContents.send("template-video-loaded", {
        success: false,
        message: `Không tìm thấy tệp video: ${videoPath}`,
      });
      return;
    }

    // Trả về đường dẫn đến tệp video
    mainWindow.webContents.send("template-video-loaded", {
      success: true,
      videoPath: videoPath,
      message: "Đã tải video mẫu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi tải video mẫu:", error);
    mainWindow.webContents.send("template-video-loaded", {
      success: false,
      message: `Lỗi khi tải video mẫu: ${error.message}`,
    });
  }
}

/**
 * Xử lý lấy tất cả file media từ thư mục mẫu
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 */
async function handleGetTemplateMedia(event, data) {
  try {
    const { templatePath } = data;

    // Kiểm tra đường dẫn tồn tại
    if (!fs.existsSync(templatePath)) {
      mainWindow.webContents.send("template-media-loaded", {
        success: false,
        message: `Không tìm thấy thư mục mẫu: ${templatePath}`,
      });
      return;
    }

    // Mảng chứa tất cả các file media
    const mediaFiles = [];
    
    // Đường dẫn đến file draft_content.json
    const draftContentPath = path.join(templatePath, "draft_content.json");
    
    // Kiểm tra nếu file draft_content.json tồn tại
    if (fs.existsSync(draftContentPath)) {
      try {
        console.log("Đọc file draft_content.json:", draftContentPath);
        
        // Đọc và phân tích file draft_content.json
        const fileContent = fs.readFileSync(draftContentPath, 'utf8');
        if (fileContent.trim().length === 0) {
          console.error("File draft_content.json rỗng");
          throw new Error("File draft_content.json rỗng");
        }
        
        const draftContentData = JSON.parse(fileContent);
        
        // In ra cấu trúc của draftContentData để debug
        console.log("Draft Content Materials:", 
          draftContentData?.materials ? Object.keys(draftContentData.materials) : "Không có materials");
        
        // Kiểm tra nếu có thuộc tính materials
        if (draftContentData && draftContentData.materials) {
          // Xử lý danh sách videos
          if (draftContentData.materials.videos && Array.isArray(draftContentData.materials.videos)) {
            console.log(`Tìm thấy ${draftContentData.materials.videos.length} videos trong draft_content`);
            
            draftContentData.materials.videos.forEach(video => {
              if (video && video.path) {
                const filePath = video.path;
                const fileName = path.basename(filePath);
                
                // Chuẩn hóa đường dẫn
                let normalizedPath = filePath;
                let exists = false;
                
                if (path.isAbsolute(filePath)) {
                  // Đường dẫn tuyệt đối
                  exists = fs.existsSync(filePath);
                  normalizedPath = filePath;
                } else {
                  // Đường dẫn tương đối - thử với template path
                  const absolutePath = path.join(templatePath, filePath);
                  exists = fs.existsSync(absolutePath);
                  normalizedPath = filePath; // Vẫn giữ đường dẫn tương đối
                }
                
                // Xác định loại file dựa trên phần mở rộng
                const ext = path.extname(fileName).toLowerCase();
                let fileType = 'file';
                
                if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
                  fileType = 'image';
                } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
                  fileType = 'video';
                } else if (['.mp3', '.wav', '.ogg', '.aac'].includes(ext)) {
                  fileType = 'audio';
                } else {
                  // Nếu không xác định được qua phần mở rộng thì dùng thuộc tính type
                  fileType = video.type === 'image' ? 'image' : 'video';
                }
                
                // Lưu lại thông tin về file (kể cả khi không tồn tại)
                mediaFiles.push({
                  name: fileName,
                  path: normalizedPath,
                  type: fileType,
                  duration: video.duration || 0,
                  source: 'draft_content',
                  exists: exists
                });
                
                console.log(`Tìm thấy file ${fileName}, type=${fileType}, exists=${exists}`);
              }
            });
          }
          
          // Xử lý danh sách audios nếu có
          if (draftContentData.materials.audios && Array.isArray(draftContentData.materials.audios)) {
            console.log(`Tìm thấy ${draftContentData.materials.audios.length} audios trong draft_content`);
            
            draftContentData.materials.audios.forEach(audio => {
              if (audio && audio.path) {
                const filePath = audio.path;
                const fileName = path.basename(filePath);
                
                // Chuẩn hóa đường dẫn
                let normalizedPath = filePath;
                let exists = false;
                
                if (path.isAbsolute(filePath)) {
                  // Đường dẫn tuyệt đối
                  exists = fs.existsSync(filePath);
                  normalizedPath = filePath;
                } else {
                  // Đường dẫn tương đối - thử với template path
                  const absolutePath = path.join(templatePath, filePath);
                  exists = fs.existsSync(absolutePath);
                  normalizedPath = filePath; // Vẫn giữ đường dẫn tương đối
                }
                
                // Lưu lại thông tin về file (kể cả khi không tồn tại)
                mediaFiles.push({
                  name: fileName,
                  path: normalizedPath,
                  type: 'audio',
                  duration: audio.duration || 0,
                  source: 'draft_content',
                  exists: exists
                });
                
                console.log(`Tìm thấy file ${fileName}, type=audio, exists=${exists}`);
              }
            });
          }
        }
      } catch (error) {
        console.error("Lỗi khi đọc file draft_content.json:", error);
        // Nếu có lỗi khi đọc draft_content.json, tiếp tục quét thư mục
      }
    } else {
      console.log("Không tìm thấy file draft_content.json trong", templatePath);
    }
    
    // Nếu không có media files từ draft_content.json, tìm kiếm trong thư mục
    if (mediaFiles.length === 0) {
      console.log("Không tìm thấy media trong draft_content.json, quét thư mục...");
      
      // Hàm quét file đệ quy
      function scanDirectory(dirPath, isRoot = false) {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item.name);
          
          if (item.isDirectory()) {
            // Bỏ qua một số thư mục đặc biệt nếu đang ở thư mục gốc
            if (isRoot && (item.name === 'draft_info' || item.name === '.draft_thumb')) {
              continue;
            }
            scanDirectory(itemPath);
          } else {
            // Kiểm tra phần mở rộng của file
            const ext = path.extname(item.name).toLowerCase();
            let type = 'file';
            
            // Xác định loại file dựa vào phần mở rộng
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
              type = 'image';
            } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
              type = 'video';
            } else if (['.mp3', '.wav', '.ogg', '.aac'].includes(ext)) {
              type = 'audio';
            }
            
            // Thêm vào danh sách media (trừ một số file đặc biệt)
            if (item.name !== 'draft_cover.jpg' && item.name !== 'template.mp4' && 
                !item.name.startsWith('.') && type !== 'file') {
              mediaFiles.push({
                name: item.name,
                path: itemPath,
                type: type,
                source: 'file_scan',
                exists: true
              });
            }
          }
        }
      }
      
      // Bắt đầu quét từ thư mục gốc của mẫu
      try {
        scanDirectory(templatePath, true);
      } catch (error) {
        console.error("Lỗi khi quét thư mục:", error);
      }
    }
    
    // Lọc ra các file tồn tại để hiển thị
    const existingMediaFiles = mediaFiles.filter(file => file.exists);
    
    if (existingMediaFiles.length === 0) {
      mainWindow.webContents.send("template-media-loaded", {
        success: false,
        message: "Không tìm thấy file media nào tồn tại trong thư mục mẫu",
      });
      return;
    }
    
    mainWindow.webContents.send("template-media-loaded", {
      success: true,
      mediaFiles: existingMediaFiles,
      message: `Đã tìm thấy ${existingMediaFiles.length} file media`,
    });
  } catch (error) {
    console.error("Lỗi khi lấy file media từ mẫu:", error);
    mainWindow.webContents.send("template-media-loaded", {
      success: false,
      message: `Lỗi khi lấy file media: ${error.message}`,
    });
  }
}

/**
 * Xử lý kiểm tra sự tồn tại của file
 * @param {Event} event - Sự kiện IPC
 * @param {Object} data - Dữ liệu từ renderer process
 * @returns {Object} - Kết quả kiểm tra
 */
async function handleCheckFileExists(event, data) {
  try {
    const { filePath, basePath } = data;
    
    // Kiểm tra đường dẫn truyền vào
    if (!filePath) {
      return { exists: false, message: "Không có đường dẫn được cung cấp" };
    }
    
    // Kiểm tra nếu đường dẫn tuyệt đối
    if (path.isAbsolute(filePath)) {
      const exists = fs.existsSync(filePath);
      return { exists, filePath, absolutePath: filePath };
    }
    
    // Kiểm tra đường dẫn tương đối
    if (basePath) {
      const absolutePath = path.join(basePath, filePath);
      const exists = fs.existsSync(absolutePath);
      return { exists, filePath, absolutePath };
    }
    
    return { exists: false, message: "Không thể kiểm tra đường dẫn tương đối không có basePath" };
  } catch (error) {
    console.error("Lỗi khi kiểm tra file:", error);
    return { exists: false, error: error.message };
  }
}

module.exports = {
  init,
};
