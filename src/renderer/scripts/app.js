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
    // Load effects và transitions từ các file draft_content
    loadEffectsAndTransitions();
    
    // Create global effects dropdown
    if (typeof UIManager.createGlobalEffectsDropdown === 'function') {
      UIManager.createGlobalEffectsDropdown();
    }
    
    // Create global transitions dropdown
    if (typeof UIManager.createGlobalTransitionsDropdown === 'function') {
      UIManager.createGlobalTransitionsDropdown();
    }
  }, 1000); // Chờ 1 giây để đảm bảo các module đã được tải xong

  // Set the default tab
  document.getElementById("template-tab").style.display = "block";

  // Load saved settings from localStorage
  UIManager.loadSavedSettings();

  // Add IPC listeners for Electron
  setupElectronListeners();
});

/**
 * Đọc các file draft_content và cập nhật danh sách effects/transitions/materials
 */
function loadEffectsAndTransitions() {
  try {
    // Đọc file draft_content_effect.json
    fetch('./draft_content_effect.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Cập nhật effects từ file nếu EffectManagerModule đã được khởi tạo
        if (window.EffectManagerModule && window.EffectManagerModule.updateFromDraftContent) {
          window.EffectManagerModule.updateFromDraftContent(data);
          console.log("Effects updated from draft_content_effect.json");
        } else {
          console.warn("EffectManagerModule not initialized yet");
        }
      })
      .catch(error => {
        console.warn("Could not load draft_content_effect.json:", error);
      });

    // Đọc file draft_content_transition.json
    fetch('./draft_content_transition.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Cập nhật transitions từ file nếu TransitionManagerModule đã được khởi tạo
        if (window.TransitionManagerModule && window.TransitionManagerModule.updateFromDraftContent) {
          window.TransitionManagerModule.updateFromDraftContent(data);
          console.log("Transitions updated from draft_content_transition.json");
        } else {
          console.warn("TransitionManagerModule not initialized yet");
        }
      })
      .catch(error => {
        console.warn("Could not load draft_content_transition.json:", error);
      });
      
    // Đọc file draft_content_material.json
    fetch('./draft_content_material.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Cập nhật material animations từ file
        MaterialManager.updateFromDraftContent(data);
        console.log("Material animations updated from draft_content_material.json");
      })
      .catch(error => {
        console.warn("Could not load draft_content_material.json:", error);
      });
  } catch (error) {
    console.error("Error in loadEffectsAndTransitions:", error);
  }
}

/**
 * Cập nhật nội dung từ các file draft_content riêng biệt khi có thay đổi
 */
function updateDraftContent() {
  // Đọc các file riêng biệt
  const effectsPromise = fetch('./draft_content_effect.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error loading effects! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Cập nhật effects
      UIManager.updateEffectsAndTransitions('effects', data);
      return true;
    })
    .catch(error => {
      console.error("Error updating effects content:", error);
      return false;
    });
    
  const transitionsPromise = fetch('./draft_content_transition.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error loading transitions! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Cập nhật transitions
      UIManager.updateEffectsAndTransitions('transitions', data);
      return true;
    })
    .catch(error => {
      console.error("Error updating transitions content:", error);
      return false;
    });
    
  const materialsPromise = fetch('./draft_content_material.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error loading materials! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Cập nhật material animations
      UIManager.updateEffectsAndTransitions('materials', data);
      return true;
    })
    .catch(error => {
      console.error("Error updating materials content:", error);
      return false;
    });
    
  // Đợi tất cả các promise hoàn thành
  Promise.all([effectsPromise, transitionsPromise, materialsPromise])
    .then(results => {
      // Kiểm tra xem có bất kỳ lỗi nào không
      const hasErrors = results.includes(false);
      if (hasErrors) {
        UIManager.showNotification("Some updates failed, check console for details", "warning");
      } else {
        UIManager.showNotification("Effects, transitions, and materials updated successfully", "success");
      }
    });
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
