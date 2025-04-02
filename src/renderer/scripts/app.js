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

  // Initialize template manager
  TemplateManager.init();

  // Initialize export manager
  ExportManager.init();

  // Initialize drag and drop functionality
  DragDropManager.init();

  // Create global effects dropdown
  UIManager.createGlobalEffectsDropdown();

  // Create global transitions dropdown
  UIManager.createGlobalTransitionsDropdown();

  // Set the default tab
  document.getElementById("template-tab").style.display = "block";

  // Load saved settings from localStorage
  UIManager.loadSavedSettings();

  // Add IPC listeners for Electron
  setupElectronListeners();
});

/**
 * Set up listeners for Electron IPC events
 */
function setupElectronListeners() {
  if (window.electron) {
    // Listen for folder selection results
    window.electron.receive("folder-selected", function (data) {
      const { path, inputId } = data;
      document.getElementById(inputId).value = path;

      // Also update localStorage when selecting folder
      if (inputId === "default-path") {
        localStorage.setItem("defaultPath", path);
      } else if (inputId === "target-path") {
        localStorage.setItem("targetPath", path);
      } else if (inputId === "template-path") {
        localStorage.setItem("templatePath", path);
        // Refresh templates if the template path was updated
        TemplateManager.loadTemplates();
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
      } else {
        UIManager.showNotification(message, "error");
      }
    });
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
