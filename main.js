const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools for debugging in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// IPC handlers for file system operations
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Media Files', extensions: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

// Handle getting real file paths
ipcMain.handle('get-file-details', (event, filePaths) => {
  return filePaths.map(filePath => {
    const stats = fs.statSync(filePath);
    return {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      type: getFileType(filePath)
    };
  });
});

// Handle folder selection
ipcMain.on('select-folder', async (event, data) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled) {
    mainWindow.webContents.send('folder-selected', {
      path: result.filePaths[0],
      inputId: data.inputId
    });
  }
});

// Handle project creation
ipcMain.on('create-project', async (event, data) => {
  try {
    const { projectName, defaultPath, targetPath } = data;
    
    // Check if default path exists
    if (!fs.existsSync(defaultPath)) {
      mainWindow.webContents.send('project-created', {
        success: false,
        message: `Default folder not found: ${defaultPath}`
      });
      return;
    }
    
    // Check if target directory exists
    if (!fs.existsSync(targetPath)) {
      try {
        fs.mkdirSync(targetPath, { recursive: true });
      } catch (err) {
        mainWindow.webContents.send('project-created', {
          success: false,
          message: `Failed to create target directory: ${err.message}`
        });
        return;
      }
    }
    
    // Create project folder with given name
    const projectDir = path.join(targetPath, projectName);
    
    // Check if project already exists
    if (fs.existsSync(projectDir)) {
      mainWindow.webContents.send('project-created', {
        success: false,
        message: `A project with the name "${projectName}" already exists`
      });
      return;
    }
    
    // Create project directory
    fs.mkdirSync(projectDir, { recursive: true });
    
    // Copy all files from default path to new project folder
    copyFolderRecursiveSync(defaultPath, projectDir);
    
    mainWindow.webContents.send('project-created', {
      success: true,
      message: `Project "${projectName}" created successfully`
    });
  } catch (error) {
    console.error('Error creating project:', error);
    mainWindow.webContents.send('project-created', {
      success: false,
      message: `Error creating project: ${error.message}`
    });
  }
});

// Function to copy folder contents recursively
function copyFolderRecursiveSync(source, target) {
  // Check if source exists
  if (!fs.existsSync(source)) {
    return;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Get all files and folders in source directory
  const files = fs.readdirSync(source);
  
  // Copy each file/folder
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    // Check if it's a directory
    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// Handle saving project files
ipcMain.on('save-project-file', (event, data) => {
  try {
    const { projectPath, fileName, content } = data;
    console.log('Saving project file - Path:', projectPath, 'Filename:', fileName);
    
    // Normalize the path to ensure it's valid for the current OS
    const normalizedPath = path.normalize(projectPath);
    console.log('Normalized path:', normalizedPath);
    
    // Check if project path exists
    if (!fs.existsSync(normalizedPath)) {
      console.error('Project folder does not exist:', normalizedPath);
      
      // Try to create the directory if it doesn't exist
      try {
        fs.mkdirSync(normalizedPath, { recursive: true });
        console.log('Created directory:', normalizedPath);
      } catch (dirError) {
        console.error('Failed to create directory:', dirError);
        mainWindow.webContents.send('save-file-result', {
          success: false,
          message: `Failed to create project directory: ${dirError.message}`
        });
        return;
      }
    }
    
    // Create the full file path
    const filePath = path.join(normalizedPath, fileName);
    console.log('Full file path:', filePath);
    
    // Write the content to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('File saved successfully');
    
    mainWindow.webContents.send('save-file-result', {
      success: true,
      message: `File saved successfully to: ${filePath}`
    });
  } catch (error) {
    console.error('Error saving project file:', error);
    mainWindow.webContents.send('save-file-result', {
      success: false,
      message: `Error saving file: ${error.message}`
    });
  }
});

// Determine file type based on extension
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  
  if (imageExts.includes(ext)) {
    return 'image/' + ext.substring(1);
  } else if (videoExts.includes(ext)) {
    return 'video/' + ext.substring(1);
  }
  return 'application/octet-stream';
}

// Handle template loading
ipcMain.on('load-templates', async (event, data) => {
  try {
    const { templatePath } = data;
    
    console.log('Loading templates from path:', templatePath);
    
    // Check if template path exists
    if (!fs.existsSync(templatePath)) {
      console.error('Template path does not exist:', templatePath);
      mainWindow.webContents.send('templates-loaded', {
        success: false,
        message: `Không tìm thấy thư mục mẫu: ${templatePath}`
      });
      return;
    }
    
    // Get all folders in the template directory
    const items = fs.readdirSync(templatePath);
    console.log('Found items in template path:', items);
    
    const folders = fs.readdirSync(templatePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log('Found folders in template path:', folders);
    
    // Check if there are any folders
    if (folders.length === 0) {
      console.log('No template folders found in:', templatePath);
      mainWindow.webContents.send('templates-loaded', {
        success: false,
        message: `Không tìm thấy thư mục mẫu nào trong: ${templatePath}`
      });
      return;
    }
    
    // Process each folder to find templates
    const templates = [];
    
    for (const folder of folders) {
      const folderPath = path.join(templatePath, folder);
      
      // Use draft_cover.jpg as the template cover image
      const coverImagePath = path.join(folderPath, 'draft_cover.jpg');
      console.log('Checking for cover image at:', coverImagePath);
      
      // Skip templates without draft_cover.jpg
      if (!fs.existsSync(coverImagePath)) {
        console.log(`Bỏ qua mẫu "${folder}" - không tìm thấy draft_cover.jpg`);
        continue;
      }
      
      templates.push({
        name: folder,
        path: folderPath,
        coverImage: coverImagePath
      });
    }
    
    if (templates.length === 0) {
      console.log('No valid templates found (missing draft_cover.jpg in all folders)');
      mainWindow.webContents.send('templates-loaded', {
        success: false,
        message: `Không tìm thấy mẫu hợp lệ nào (thiếu file draft_cover.jpg)`
      });
      return;
    }
    
    console.log('Successfully loaded templates:', templates);
    mainWindow.webContents.send('templates-loaded', {
      success: true,
      templates: templates,
      message: `Đã tìm thấy ${templates.length} mẫu`
    });
    
  } catch (error) {
    console.error('Lỗi khi tải mẫu:', error);
    mainWindow.webContents.send('templates-loaded', {
      success: false,
      message: `Lỗi khi tải mẫu: ${error.message}`
    });
  }
});

// Handle template import
ipcMain.on('import-template', async (event, data) => {
  try {
    const { templatePath, templateName, targetPath } = data;
    
    // Check if template path exists
    if (!fs.existsSync(templatePath)) {
      mainWindow.webContents.send('template-imported', {
        success: false,
        message: `Không tìm thấy thư mục mẫu: ${templatePath}`
      });
      return;
    }
    
    // Check if target directory exists
    if (!fs.existsSync(targetPath)) {
      try {
        fs.mkdirSync(targetPath, { recursive: true });
      } catch (err) {
        mainWindow.webContents.send('template-imported', {
          success: false,
          message: `Không thể tạo thư mục đích: ${err.message}`
        });
        return;
      }
    }
    
    // Create a unique project name to avoid conflicts
    const timestamp = new Date().getTime();
    const importedProjectName = `${templateName}_${timestamp}`;
    const projectDir = path.join(targetPath, importedProjectName);
    
    // Create project directory
    fs.mkdirSync(projectDir, { recursive: true });
    
    // Copy all files from template to new project folder
    copyFolderRecursiveSync(templatePath, projectDir);
    
    mainWindow.webContents.send('template-imported', {
      success: true,
      message: `Đã nhập mẫu "${templateName}" thành công như "${importedProjectName}"`
    });
  } catch (error) {
    console.error('Lỗi khi nhập mẫu:', error);
    mainWindow.webContents.send('template-imported', {
      success: false,
      message: `Lỗi khi nhập mẫu: ${error.message}`
    });
  }
});

// Handle opening template folder
ipcMain.on('open-template-folder', async (event, data) => {
  try {
    const { templatePath } = data;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(templatePath)) {
      console.log('Template directory does not exist, creating:', templatePath);
      try {
        fs.mkdirSync(templatePath, { recursive: true });
        console.log('Template directory created successfully');
      } catch (error) {
        console.error('Failed to create template directory:', error);
        mainWindow.webContents.send('folder-open-result', {
          success: false,
          message: `Không thể tạo thư mục mẫu: ${error.message}`
        });
        return;
      }
    }
    
    // Show the folder in file explorer
    shell.openPath(templatePath)
      .then(error => {
        if (error) {
          console.error('Error opening folder:', error);
          mainWindow.webContents.send('folder-open-result', {
            success: false,
            message: `Không thể mở thư mục mẫu: ${error}`
          });
        } else {
          console.log('Template folder opened successfully');
          mainWindow.webContents.send('folder-open-result', {
            success: true,
            message: 'Đã mở thư mục mẫu'
          });
        }
      });
  } catch (error) {
    console.error('Error handling folder open request:', error);
    mainWindow.webContents.send('folder-open-result', {
      success: false,
      message: `Lỗi khi mở thư mục mẫu: ${error.message}`
    });
  }
}); 