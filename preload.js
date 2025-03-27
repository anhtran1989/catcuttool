const { contextBridge, ipcRenderer } = require('electron');

// Expose selected APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // File system operations
  selectFiles: () => ipcRenderer.invoke('select-files'),
  getFileDetails: (filePaths) => ipcRenderer.invoke('get-file-details', filePaths),
  
  // Get app path
  getPlatform: () => process.platform,
  
  // IPC communication methods
  send: (channel, data) => {
    // Whitelist channels
    const validChannels = ['select-folder', 'create-project', 'save-project-file', 'load-templates', 'import-template', 'open-template-folder'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    // Whitelist channels
    const validChannels = ['folder-selected', 'project-created', 'save-file-result', 'templates-loaded', 'template-imported', 'folder-open-result'];
    if (validChannels.includes(channel)) {
      // Remove any existing listeners
      ipcRenderer.removeAllListeners(channel);
      // Add new listener
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
}); 