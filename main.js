const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
    
    // Check if template path exists
    if (!fs.existsSync(templatePath)) {
      mainWindow.webContents.send('templates-loaded', {
        success: false,
        message: `Template folder not found: ${templatePath}`
      });
      return;
    }
    
    // Get all folders in the template directory
    const folders = fs.readdirSync(templatePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Process each folder to find templates
    const templates = [];
    
    for (const folder of folders) {
      const folderPath = path.join(templatePath, folder);
      
      // Use draft_cover.jpg as the template cover image
      const coverImagePath = path.join(folderPath, 'draft_cover.jpg');
      
      // Skip templates without draft_cover.jpg
      if (!fs.existsSync(coverImagePath)) {
        console.log(`Skipping template "${folder}" - missing draft_cover.jpg`);
        continue;
      }
      
      // Determine category (just a simple example, can be enhanced)
      const category = getTemplateCategory(folder);
      
      templates.push({
        name: folder,
        path: folderPath,
        coverImage: coverImagePath,
        category: category
      });
    }
    
    mainWindow.webContents.send('templates-loaded', {
      success: true,
      templates: templates,
      message: `Found ${templates.length} templates`
    });
    
  } catch (error) {
    console.error('Error loading templates:', error);
    mainWindow.webContents.send('templates-loaded', {
      success: false,
      message: `Error loading templates: ${error.message}`
    });
  }
});

// Helper function to categorize templates (can be enhanced with more sophisticated logic)
function getTemplateCategory(templateName) {
  const lowerName = templateName.toLowerCase();
  
  // Simple categorization based on keywords
  if (lowerName.includes('new') || 
      lowerName.includes('latest') || 
      lowerName.includes('2023') ||
      lowerName.includes('2024')) {
    return 'new';
  } else if (lowerName.includes('trend') || 
             lowerName.includes('popular') || 
             lowerName.includes('viral')) {
    return 'trending';
  }
  
  // If no specific category is detected, default to 'other'
  return 'other';
}

// Handle template import
ipcMain.on('import-template', async (event, data) => {
  try {
    const { templatePath, templateName, targetPath } = data;
    
    // Check if template path exists
    if (!fs.existsSync(templatePath)) {
      mainWindow.webContents.send('template-imported', {
        success: false,
        message: `Template folder not found: ${templatePath}`
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
          message: `Failed to create target directory: ${err.message}`
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
      message: `Template "${templateName}" imported successfully as "${importedProjectName}"`
    });
  } catch (error) {
    console.error('Error importing template:', error);
    mainWindow.webContents.send('template-imported', {
      success: false,
      message: `Error importing template: ${error.message}`
    });
  }
}); 