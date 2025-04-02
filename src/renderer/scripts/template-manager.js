/**
 * Template Manager - Handles template operations
 */
const TemplateManager = (function () {
  /**
   * Initialize template manager
   */
  function init() {
    setupTemplateEventHandlers();
  }

  /**
   * Set up template-related event handlers
   */
  function setupTemplateEventHandlers() {
    const templateSearch = document.getElementById("template-search");
    const refreshTemplatesButton = document.getElementById("refresh-templates");
    const importTemplateButton = document.getElementById("import-template");
    const openTemplateFolderButton = document.getElementById(
      "open-template-folder"
    );
    const templateGrid = document.getElementById("template-grid");

    // Template functionality
    if (refreshTemplatesButton) {
      refreshTemplatesButton.addEventListener("click", function () {
        loadTemplates();
      });
    }

    if (importTemplateButton) {
      importTemplateButton.addEventListener("click", function () {
        if (templateGrid.querySelector(".template-item.selected")) {
          const selectedTemplate = templateGrid.querySelector(
            ".template-item.selected"
          );
          const templatePath = selectedTemplate.getAttribute("data-path");
          const templateName = selectedTemplate.getAttribute("data-name");
          importTemplate(templatePath, templateName);
        } else {
          UIManager.showNotification("Vui lòng chọn một mẫu trước", "error");
        }
      });
    }

    if (openTemplateFolderButton) {
      openTemplateFolderButton.addEventListener("click", function () {
        const templatePath =
          localStorage.getItem("templatePath") ||
          document.getElementById("template-path").value;
        if (templatePath) {
          openTemplateFolder(templatePath);
        } else {
          UIManager.showNotification(
            "Vui lòng thiết lập đường dẫn mẫu trong cài đặt trước",
            "error"
          );
        }
      });
    }

    if (templateSearch) {
      templateSearch.addEventListener("input", function () {
        filterTemplates();
      });
    }

    // Add template-related IPC listeners
    if (window.electron) {
      window.electron.receive("templates-loaded", function (data) {
        const { success, templates: loadedTemplates, message } = data;

        if (success) {
          templates = loadedTemplates;
          renderTemplates(loadedTemplates);
        } else {
          templateGrid.innerHTML = `<div class="template-empty">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>${message || "Không thể tải mẫu"}</p>
                        <button id="create-template-folder" class="folder-button">
                            <i class="fas fa-folder-plus"></i> Tạo thư mục mẫu
                        </button>
                    </div>`;

          const createTemplateFolderButton = document.getElementById(
            "create-template-folder"
          );
          if (createTemplateFolderButton) {
            createTemplateFolderButton.addEventListener("click", function () {
              openTemplateFolder(templatePath);
            });
          }

          UIManager.showNotification(message || "Không thể tải mẫu", "error");
        }
      });

      // Add listener for folder open result
      window.electron.receive("folder-open-result", function (data) {
        const { success, message } = data;
        UIManager.showNotification(message, success ? "success" : "error");

        // Reload templates after opening folder
        if (success) {
          setTimeout(() => {
            loadTemplates();
          }, 1000);
        }
      });

      // Add listener for template import result
      window.electron.receive("template-imported", function (data) {
        const { success, message } = data;

        if (success) {
          UIManager.showNotification(
            message || "Mẫu đã được nhập thành công",
            "success"
          );
        } else {
          UIManager.showNotification(message || "Không thể nhập mẫu", "error");
        }
      });
    }
  }

  /**
   * Load templates from the template folder
   */
  function loadTemplates() {
    const templateGrid = document.getElementById("template-grid");
    const templatePathInput = document.getElementById("template-path");

    // Remove any previous status message
    const existingStatus = document.querySelector(".template-status");
    if (existingStatus) {
      existingStatus.remove();
    }

    // Clear existing templates
    templates = [];
    templateGrid.innerHTML = "";

    // Show loading state
    templateGrid.innerHTML =
      '<div class="template-empty"><i class="fas fa-spinner fa-spin"></i><p>Đang tải mẫu...</p></div>';

    const templatePath =
      localStorage.getItem("templatePath") || templatePathInput.value;

    if (!templatePath) {
      templateGrid.innerHTML =
        '<div class="template-empty">' +
        '<i class="fas fa-exclamation-circle"></i>' +
        "<p>Vui lòng thiết lập đường dẫn mẫu trong cài đặt trước</p>" +
        '<button id="open-settings-from-empty" class="settings-button">Mở cài đặt</button>' +
        "</div>";

      const openSettingsButton = document.getElementById(
        "open-settings-from-empty"
      );
      if (openSettingsButton) {
        openSettingsButton.addEventListener("click", function () {
          document.getElementById("settings-popup").style.display = "flex";
        });
      }
      return;
    }

    if (window.electron) {
      window.electron.send("load-templates", { templatePath });
    } else {
      // For browser testing, use mock data
      setTimeout(() => {
        const mockTemplates = [
          {
            name: "Summer Vibes",
            path: "C:\\Template Capcut\\Summer Vibes",
            category: "trending",
            coverImage: PLACEHOLDER_IMAGE, // Using placeholder in browser mode
          },
          {
            name: "Epic Intro",
            path: "C:\\Template Capcut\\Epic Intro",
            category: "new",
            coverImage: PLACEHOLDER_IMAGE,
          },
          {
            name: "Travel Montage",
            path: "C:\\Template Capcut\\Travel Montage",
            category: "trending",
            coverImage: PLACEHOLDER_IMAGE,
          },
          {
            name: "Smooth Transitions",
            path: "C:\\Template Capcut\\Smooth Transitions",
            category: "new",
            coverImage: PLACEHOLDER_IMAGE,
          },
        ];

        templates = mockTemplates;
        renderTemplates(mockTemplates);
      }, 1000);
    }
  }

  /**
   * Render templates in the template grid
   * @param {Array} templatesList - List of templates to render
   */
  function renderTemplates(templatesList) {
    const templateGrid = document.getElementById("template-grid");

    if (!templatesList || templatesList.length === 0) {
      templateGrid.innerHTML =
        '<div class="template-empty"><i class="fas fa-folder-open"></i><p>Không tìm thấy mẫu nào. Hãy thêm mẫu vào thư mục mẫu.</p></div>';
      return;
    }

    // Clear the grid
    templateGrid.innerHTML = "";

    // Render each template as a list item
    templatesList.forEach((template) => {
      const templateItem = document.createElement("div");
      templateItem.className = "template-item";
      templateItem.setAttribute("data-name", template.name);
      templateItem.setAttribute("data-path", template.path);

      // For browser testing or if path is unavailable, use a placeholder
      let imageSrc;

      // In Electron context, we need to convert the file path to a loadable URL
      if (window.electron && template.coverImage) {
        // Convert the file path to a protocol that Electron can load
        imageSrc = `file:///${template.coverImage.replace(/\\/g, "/")}`;
      } else {
        // Use placeholder in browser context or if no image
        imageSrc = template.coverImage || PLACEHOLDER_IMAGE;
      }

      // Create template structure - simplified version
      templateItem.innerHTML = `
                <div class="template-preview">
                    <img src="${imageSrc}" alt="${template.name}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                </div>
                <div class="template-info">
                    <h3>${template.name}</h3>
                </div>
            `;

      // Add click event to select template
      templateItem.addEventListener("click", function () {
        // Remove selected class from all items
        document.querySelectorAll(".template-item").forEach((item) => {
          item.classList.remove("selected");
        });

        // Add selected class to clicked item
        this.classList.add("selected");
      });

      // Add double click event to import template
      templateItem.addEventListener("dblclick", function () {
        const templatePath = this.getAttribute("data-path");
        const templateName = this.getAttribute("data-name");
        importTemplate(templatePath, templateName);
      });

      // Add to the grid
      templateGrid.appendChild(templateItem);
    });

    // Add notice showing number of templates
    const statusElement = document.createElement("div");
    statusElement.className = "template-status";
    statusElement.innerHTML = `<p>Đã tìm thấy ${templatesList.length} mẫu</p>`;
    templateGrid.insertAdjacentElement("afterend", statusElement);
  }

  /**
   * Filter templates based on search term
   */
  function filterTemplates() {
    const templateSearch = document.getElementById("template-search");
    const searchTerm = templateSearch.value.toLowerCase();

    // Filter templates based on search term only
    const filteredTemplates = templates.filter((template) => {
      return template.name.toLowerCase().includes(searchTerm);
    });

    // Render filtered templates
    renderTemplates(filteredTemplates);
  }

  /**
   * Import template into a new project
   * @param {string} templatePath - Path to the template
   * @param {string} templateName - Name of the template
   */
  function importTemplate(templatePath, templateName) {
    if (!templatePath || !templateName) {
      UIManager.showNotification("Invalid template information", "error");
      return;
    }

    const targetPath =
      localStorage.getItem("targetPath") ||
      document.getElementById("target-path").value;

    if (!targetPath) {
      UIManager.showNotification(
        "Please set the target path in settings first",
        "error"
      );
      return;
    }

    if (window.electron) {
      window.electron.send("import-template", {
        templatePath,
        templateName,
        targetPath,
      });
    } else {
      // For browser testing
      setTimeout(() => {
        UIManager.showNotification(
          `Template "${templateName}" imported successfully (demo mode)`,
          "success"
        );
      }, 1000);
    }
  }

  /**
   * Open template folder in file explorer
   * @param {string} templatePath - Path to the template folder
   */
  function openTemplateFolder(templatePath) {
    if (window.electron) {
      window.electron.send("open-template-folder", { templatePath });
    } else {
      // For browser testing
      alert(`Browser mode: Would open folder at: ${templatePath}`);
    }
  }

  // Public API
  return {
    init,
    loadTemplates,
    renderTemplates,
    filterTemplates,
    importTemplate,
    openTemplateFolder,
  };
})();
