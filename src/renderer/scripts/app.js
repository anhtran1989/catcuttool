/**
 * Ứng dụng CapCut Tool - Main App
 * Khởi tạo và điều phối các module của ứng dụng
 */

// Global variable to store current project
let currentProject = {
  name: "",
  path: "",
};

// Global variable to store templates
let templates = [];

// Create a placeholder image data URL for templates without images
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189be7daa7f%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A15pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189be7daa7f%22%3E%3Crect%20width%3D%22300%22%20height%3D%22180%22%20fill%3D%22%23373940%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22110.5%22%20y%3D%2297.5%22%3ECapCut%20Template%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  // Initialize UI manager
  UIManager.init();

  // Initialize dropdown manager
  DropdownManager.init();

  // Initialize file manager
  FileManager.init();

  // Initialize material manager
  MaterialManager.init();

  // Initialize template manager
  TemplateManager.init();

  // Initialize export manager
  ExportManager.init();

  // Initialize drag and drop functionality
  DragDropManager.init();

  // Effect manager và Transition manager đã được khởi tạo trong module-loader-bridge.js
  
  // Chờ các module được tải xong trước khi sử dụng
  setTimeout(() => {
    // Các module đã được tải trong module-loader-bridge.js
    // và dữ liệu được tải từ file draft_content_2.json thông qua DataLoader
    console.log("App ready, modules should be loaded from DataLoader");
    
    // Các dropdown đã được tạo trong callback onDataLoaded của DataLoader
  }, 500);

  // Set the default tab
  document.getElementById("template-tab").style.display = "block";

  // Load saved settings from localStorage
  UIManager.loadSavedSettings();

  // Add IPC listeners for Electron
  setupElectronListeners();
});

/**
 * Đọc file draft_content_2.json và cập nhật danh sách effects/transitions/materials
 */
function loadEffectsAndTransitions() {
  try {
    // Kiểm tra xem DataLoader đã được khởi tạo chưa
    if (window.DataLoaderModule) {
      console.log("Using DataLoader to load effects and transitions from draft_content_2.json");
      
      // Đăng ký callback để nhận dữ liệu khi tải xong
      window.DataLoaderModule.onDataLoaded((data) => {
        console.log("Data loaded from DataLoader");
        
        // Cập nhật effects
        if (window.EffectManagerModule && window.EffectManagerModule.setEffects) {
          const effects = window.DataLoaderModule.getEffects();
          window.EffectManagerModule.setEffects(effects);
          console.log(`${effects.length} effects loaded from DataLoader`);
        }
        
        // Cập nhật transitions
        if (window.TransitionManagerModule && window.TransitionManagerModule.setTransitions) {
          const transitions = window.DataLoaderModule.getTransitions();
          window.TransitionManagerModule.setTransitions(transitions);
          console.log(`${transitions.length} transitions loaded from DataLoader`);
        }
        
        // Cập nhật material animations
        if (window.MaterialManager && window.MaterialManager.updateFromDraftContent) {
          const materialAnimations = window.DataLoaderModule.getMaterialAnimations();
          // Truyền dữ liệu cho MaterialManager
          window.MaterialManager.updateFromDraftContent({
            materials: {
              material_animations: materialAnimations
            }
          });
          console.log(`${materialAnimations.length} material animations loaded from DataLoader`);
        }
      });
      
      // Tải dữ liệu từ file draft_content_2.json
      window.DataLoaderModule.loadData();
    } else {
      console.warn("DataLoader not initialized yet, cannot load effects and transitions");
    }
  } catch (error) {
    console.error("Error loading effects and transitions:", error);
  }
}

/**
 * Cập nhật nội dung từ file draft_content_2.json khi có thay đổi
 */
function updateDraftContent() {
  try {
    console.log("Updating draft content from draft_content_2.json");
    
    // Kiểm tra xem DataLoader đã được khởi tạo chưa
    if (window.DataLoaderModule) {
      // Tải lại dữ liệu từ file draft_content_2.json
      window.DataLoaderModule.loadData()
        .then(data => {
          console.log("Data reloaded from draft_content_2.json");
          
          // Cập nhật effects
          if (window.EffectManagerModule && window.EffectManagerModule.setEffects) {
            const effects = window.DataLoaderModule.getEffects();
            window.EffectManagerModule.setEffects(effects);
            console.log(`${effects.length} effects updated from DataLoader`);
          }
          
          // Cập nhật transitions
          if (window.TransitionManagerModule && window.TransitionManagerModule.setTransitions) {
            const transitions = window.DataLoaderModule.getTransitions();
            window.TransitionManagerModule.setTransitions(transitions);
            console.log(`${transitions.length} transitions updated from DataLoader`);
          }
          
          // Cập nhật material animations
          if (window.MaterialManager && window.MaterialManager.updateFromDraftContent) {
            const materialAnimations = window.DataLoaderModule.getMaterialAnimations();
            window.MaterialManager.updateFromDraftContent({
              materials: {
                material_animations: materialAnimations
              }
            });
            console.log(`${materialAnimations.length} material animations updated from DataLoader`);
          }
          
          // Cập nhật danh sách thumbnails
          if (data && FileManager && FileManager.updateThumbnails) {
            FileManager.updateThumbnails(data);
            console.log("Thumbnails updated from draft_content_2.json");
          }
          
          // Cập nhật global dropdowns
          if (window.UIManager) {
            if (typeof window.UIManager.createGlobalEffectsDropdown === 'function') {
              window.UIManager.createGlobalEffectsDropdown();
              console.log('Global effects dropdown updated');
            }
            
            if (typeof window.UIManager.createGlobalTransitionsDropdown === 'function') {
              window.UIManager.createGlobalTransitionsDropdown();
              console.log('Global transitions dropdown updated');
            }
          }
        })
        .catch(error => {
          console.error("Error reloading data from draft_content_2.json:", error);
        });
    } else {
      console.warn("DataLoader not initialized yet, cannot update draft content");
      
      // Fallback: Tải file draft_content.json cho thumbnails
      fetch('./draft_content.json')
        .then(response => response.json())
        .then(data => {
          if (data && FileManager && FileManager.updateThumbnails) {
            FileManager.updateThumbnails(data);
            console.log("Thumbnails updated from draft_content.json (fallback)");
          }
        })
        .catch(error => {
          console.warn("Could not load draft_content.json (fallback):", error);
        });
    }
  } catch (error) {
    console.error("Error in updateDraftContent:", error);
  }
}

/**
 * Set up listeners for Electron IPC events
 */
function setupElectronListeners() {
  // Check if electron object exists and has the receive method
  if (window.electron && typeof window.electron.receive === 'function') {
    try {
      // Listen for folder selection results
      window.electron.receive("folder-selected", function (data) {
        try {
          const { path, inputId } = data;
          const inputElement = document.getElementById(inputId);
          if (inputElement) {
            inputElement.value = path;
          } else {
            console.warn(`Element with ID ${inputId} not found for folder selection`);
          }

          // Also update localStorage when selecting folder
          if (inputId === "default-path") {
            localStorage.setItem("defaultPath", path);
          } else if (inputId === "target-path") {
            localStorage.setItem("targetPath", path);
          } else if (inputId === "template-path") {
            localStorage.setItem("templatePath", path);
            // Refresh templates if the template path was updated
            if (typeof TemplateManager !== 'undefined' && TemplateManager.loadTemplates) {
              TemplateManager.loadTemplates();
            }
          }
        } catch (error) {
          console.error("Error handling folder selection:", error);
        }
      });

      // Listen for project creation results
      window.electron.receive("project-created", function (data) {
        const { success, message } = data;
        if (success) {
          UIManager.showNotification(message, "success");
          document.getElementById("project-name").value = ""; // Clear the project name after successful creation

          // Reset all content when project is created successfully
          // Skip additional notification since we already show success message
          UIManager.resetContent(true);
        } else {
          UIManager.showNotification(message, "error");
        }
      });

      // Listen for file save results
      window.electron.receive("save-file-result", function (data) {
        const { success, message } = data;
        if (success) {
          UIManager.showNotification(message, "success");
          
          // Nếu file được lưu là draft_content.json hoặc các file liên quan, 
          // cập nhật danh sách effects và transitions
          if (data.filePath && (data.filePath.includes('draft_content'))) {
            updateDraftContent();
          }
        } else {
          UIManager.showNotification(message, "error");
        }
      });
      
      // Listen for file change events (when draft_content.json được cập nhật)
      window.electron.receive("file-changed", function (data) {
        const { filePath } = data;
        // Nếu file thay đổi là draft_content.json hoặc các file liên quan
        if (filePath && (filePath.includes('draft_content'))) {
          updateDraftContent();
        }
      });
    } catch (error) {
      console.error("Error setting up Electron listeners:", error);
    }
  } else {
    console.warn("Electron IPC API not available or incomplete");
  }
}

/**
 * Create CapCut project - clones the default folder to target location
 * @param {string} projectName - Name of the project
 * @param {string} defaultPath - Path to the default template folder
 * @param {string} targetPath - Path where the project should be created
 */
function createCapcutProject(projectName, defaultPath, targetPath) {
  console.log(
    `Creating project: ${projectName}, from: ${defaultPath}, to: ${targetPath}`
  );

  // Always get the latest paths from localStorage if available
  const latestDefaultPath = localStorage.getItem("defaultPath") || defaultPath;
  const latestTargetPath = localStorage.getItem("targetPath") || targetPath;

  // Send request to Electron to create the project
  window.electron.send("create-project", {
    projectName: projectName,
    defaultPath: latestDefaultPath,
    targetPath: latestTargetPath,
  });
}
