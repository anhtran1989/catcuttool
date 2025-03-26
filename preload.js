const { contextBridge, ipcRenderer } = require('electron');

// Expose selected APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // File system operations
  selectFiles: () => ipcRenderer.invoke('select-files'),
  getFileDetails: (filePaths) => ipcRenderer.invoke('get-file-details', filePaths),
  
  // Get app path
  getPlatform: () => process.platform,
  
  // Add any other necessary methods here
}); 