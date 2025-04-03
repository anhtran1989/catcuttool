/**
 * Template Manager - Handles template operations
 */
const TemplateManager = (function () {
  // State variables to track selected template and modified media
  let templates = [];
  let selectedTemplate = null;
  let modifiedMediaFiles = new Map();

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
      
      // Store template video path if available
      if (template.templateVideo) {
        templateItem.setAttribute("data-video", template.templateVideo);
      }

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

      // Add click event to preview template
      templateItem.addEventListener("click", function () {
        // Remove selected class from all items
        document.querySelectorAll(".template-item").forEach((item) => {
          item.classList.remove("selected");
        });

        // Add selected class to clicked item
        this.classList.add("selected");
        
        // Show template preview popup if video is available
        const videoPath = this.getAttribute("data-video");
        const templateName = this.getAttribute("data-name");
        const templatePath = this.getAttribute("data-path");
        
        if (videoPath) {
          showTemplatePreviewPopup(videoPath, templateName, templatePath);
        } else {
          // If no video, just select the template
          UIManager.showNotification("Không tìm thấy video mẫu cho template này", "warning");
        }
      });

      // Add double click event to import template (now handled by the import button in popup)
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
   * Show template preview popup with video
   * @param {string} videoPath - Path to the template video
   * @param {string} templateName - Name of the template
   * @param {string} templatePath - Path to the template folder
   */
  function showTemplatePreviewPopup(videoPath, templateName, templatePath) {
    // Remove any existing popup
    const existingPopup = document.getElementById("template-preview-popup");
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement("div");
    popup.id = "template-preview-popup";
    popup.className = "popup-overlay";

    // Convert video path to loadable URL
    let videoSrc = videoPath;
    if (window.electron) {
      videoSrc = `file:///${videoPath.replace(/\\/g, "/")}`;
    }

    // Create popup content
    popup.innerHTML = `
      <div class="template-preview-container">
        <div class="popup-header">
          <h2>Xem trước mẫu: ${templateName}</h2>
          <button class="close-button"><i class="fas fa-times"></i></button>
        </div>
        <div class="popup-content">
          <video controls autoplay>
            <source src="${videoSrc}" type="video/mp4">
            Trình duyệt của bạn không hỗ trợ video HTML5.
          </video>
        </div>
        <div class="popup-footer">
          <button id="close-preview-button" class="secondary-button">
            <i class="fas fa-times"></i> Đóng
          </button>
          <button id="import-template-button" class="primary-button">
            <i class="fas fa-check"></i> Sử dụng mẫu này
          </button>
        </div>
      </div>
    `;

    // Add popup to document
    document.body.appendChild(popup);

    // Setup event handlers
    popup.querySelector(".close-button").addEventListener("click", function() {
      popup.remove();
    });
    
    popup.querySelector("#close-preview-button").addEventListener("click", function() {
      popup.remove();
    });

    popup.querySelector("#import-template-button").addEventListener("click", function() {
      importTemplate(templatePath, templateName);
      popup.remove();
    });

    // Close popup when clicking outside the content
    popup.addEventListener("click", function(e) {
      if (e.target === popup) {
        popup.remove();
      }
    });
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

    // First, load and display the template media files
    displayTemplateMedia(templatePath, templateName);

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
   * Display all media files from the selected template
   * @param {string} templatePath - Path to the template
   * @param {string} templateName - Name of the template
   */
  function displayTemplateMedia(templatePath, templateName) {
    // Remove any existing template media display
    const existingMediaDisplay = document.getElementById("template-media-display");
    if (existingMediaDisplay) {
      existingMediaDisplay.remove();
    }
    
    // Create media display container
    const mediaDisplay = document.createElement("div");
    mediaDisplay.id = "template-media-display";
    mediaDisplay.className = "template-media-display";
    
    // Create header with template name
    const header = document.createElement("div");
    header.className = "template-media-header";
    header.innerHTML = `
      <h3>File media trong template: ${templateName}</h3>
      <p>Các file media này sẽ được dùng trong dự án của bạn</p>
    `;
    
    // Create container for media items
    const mediaContainer = document.createElement("div");
    mediaContainer.className = "template-media-container";
    
    // Loading state
    mediaContainer.innerHTML = `
      <div class="template-media-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải file media...</p>
      </div>
    `;
    
    // Add header and container to the display
    mediaDisplay.appendChild(header);
    mediaDisplay.appendChild(mediaContainer);
    
    // Add the display to the template section
    const templateSection = document.querySelector(".tab-content#custom-tab");
    templateSection.appendChild(mediaDisplay);
    
    // Scroll to the media display
    mediaDisplay.scrollIntoView({ behavior: "smooth", block: "end" });
    
    // Request media files from the main process
    if (window.electron) {
      window.electron.send("get-template-media", { templatePath });
      
      // Set up listener for media files response (only once)
      const setupMediaListener = () => {
        window.electron.receive("template-media-loaded", function(data) {
          const { success, mediaFiles, message } = data;
          
          if (success) {
            renderTemplateMedia(mediaContainer, mediaFiles, templatePath);
          } else {
            mediaContainer.innerHTML = `
              <div class="template-media-empty">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message || "Không tìm thấy file media nào trong template này"}</p>
              </div>
            `;
          }
        });
      };
      
      // Only set up the listener if it doesn't exist yet
      if (!window.templateMediaListenerSetup) {
        setupMediaListener();
        window.templateMediaListenerSetup = true;
      }
    } else {
      // For browser testing, use mock data
      setTimeout(() => {
        const mockMediaFiles = [
          { name: "background.jpg", path: "/mock/path/background.jpg", type: "image" },
          { name: "intro.mp4", path: "/mock/path/intro.mp4", type: "video" },
          { name: "overlay.png", path: "/mock/path/overlay.png", type: "image" },
          { name: "music.mp3", path: "/mock/path/music.mp3", type: "audio" }
        ];
        
        renderTemplateMedia(mediaContainer, mockMediaFiles, "/mock/path");
      }, 1000);
    }
  }

  /**
   * Render template media files
   * @param {HTMLElement} container - Container element
   * @param {Array} mediaFiles - List of media files
   * @param {string} templatePath - Path to the template
   */
  function renderTemplateMedia(container, mediaFiles, templatePath) {
    // Clear loading state
    container.innerHTML = "";
    
    if (!mediaFiles || mediaFiles.length === 0) {
      container.innerHTML = `
        <div class="template-media-empty">
          <i class="fas fa-exclamation-circle"></i>
          <p>Không tìm thấy file media nào trong template này</p>
        </div>
      `;
      return;
    }
    
    // Save selected template info
    selectedTemplate = {
      path: templatePath,
      originalMediaFiles: [...mediaFiles]
    };
    
    // Create a temporary container while processing files
    const tempContainer = document.createDocumentFragment();
    let loadedCount = 0;
    const totalCount = mediaFiles.length;
    
    // Add placeholder for progress
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "template-media-loading";
    loadingIndicator.innerHTML = `
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải ${loadedCount}/${totalCount} file media...</p>
    `;
    container.appendChild(loadingIndicator);
    
    // Create each media item
    mediaFiles.forEach(file => {
      const mediaItem = document.createElement("div");
      mediaItem.className = "template-media-item";
      mediaItem.setAttribute("data-path", file.path);
      mediaItem.setAttribute("data-name", file.name);
      mediaItem.setAttribute("data-type", file.type);
      
      // Check if this file has been modified
      const isModified = modifiedMediaFiles.has(file.path);
      if (isModified) {
        mediaItem.classList.add("modified");
      }
      
      let mediaContent = "";
      let filePath = "";
      
      // Function to process the file after checking existence if needed
      const processFile = (fileUrl) => {
        // Double-check file type based on extension
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        let fileType = file.type;
        
        // If file.type and extension don't match, use extension to determine type
        if ((fileType === 'video' && ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) ||
            (fileType === 'image' && ['.mp4', '.webm', '.mov', '.avi'].includes(ext)) ||
            (fileType === 'audio' && !['.mp3', '.wav', '.ogg', '.aac'].includes(ext))) {
          
          console.log(`Correcting file type for ${file.name} from ${fileType} to match extension ${ext}`);
          
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
            fileType = 'image';
          } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
            fileType = 'video';
          } else if (['.mp3', '.wav', '.ogg', '.aac'].includes(ext)) {
            fileType = 'audio';
          }
          
          // Update the attribute
          mediaItem.setAttribute("data-type", fileType);
        }
        
        // If this file was replaced, use the replacement URL
        if (isModified) {
          fileUrl = modifiedMediaFiles.get(file.path).previewUrl;
        }
        
        // Create appropriate media element based on type
        if (fileType === "image") {
          mediaContent = `
            <div class="media-preview">
              <img src="${fileUrl}" alt="${file.name}" onerror="this.src='${PLACEHOLDER_IMAGE}'; console.error('Không thể tải hình ảnh:', '${fileUrl}');">
            </div>
            <div class="media-replace-overlay">
              <i class="fas fa-upload"></i>
              <span>Thay thế</span>
            </div>
          `;
        } else if (fileType === "video") {
          mediaContent = `
            <div class="media-preview video-preview">
              <video src="${fileUrl}" muted onerror="console.error('Không thể tải video:', '${fileUrl}');"></video>
              <div class="video-play-button">
                <i class="fas fa-play"></i>
              </div>
            </div>
            <div class="media-replace-overlay">
              <i class="fas fa-upload"></i>
              <span>Thay thế</span>
            </div>
          `;
        } else if (fileType === "audio") {
          mediaContent = `
            <div class="media-preview audio-preview">
              <i class="fas fa-music"></i>
            </div>
            <div class="media-replace-overlay">
              <i class="fas fa-upload"></i>
              <span>Thay thế</span>
            </div>
          `;
        } else {
          mediaContent = `
            <div class="media-preview file-preview">
              <i class="fas fa-file"></i>
            </div>
            <div class="media-replace-overlay">
              <i class="fas fa-upload"></i>
              <span>Thay thế</span>
            </div>
          `;
        }
        
        mediaItem.innerHTML = `
          ${mediaContent}
          <div class="media-info">
            <p title="${file.name}">${file.name}</p>
            ${file.duration ? `<p class="media-duration">${formatDuration(file.duration)}</p>` : ''}
            <p class="media-type">${getMediaTypeText(fileType)}</p>
            ${isModified ? '<span class="media-modified-badge">Đã thay thế</span>' : ''}
          </div>
        `;
        
        // Add click event for videos to play/pause
        if (fileType === "video") {
          const videoPreview = mediaItem.querySelector(".video-preview");
          if (videoPreview) {
            videoPreview.addEventListener("click", function(e) {
              // Prevent triggering the replacement overlay
              e.stopPropagation();
              
              const video = this.querySelector("video");
              if (!video) return;
              
              const playButton = this.querySelector(".video-play-button");
              
              if (video.paused) {
                // Try to play video, handle errors if any
                try {
                  const playPromise = video.play();
                  
                  if (playPromise !== undefined) {
                    playPromise.then(_ => {
                      // Playback started successfully
                      playButton.style.display = "none";
                    }).catch(error => {
                      console.error("Error playing video:", error);
                      UIManager.showNotification("Không thể phát video này", "error");
                    });
                  }
                } catch (error) {
                  console.error("Error when playing video:", error);
                }
              } else {
                video.pause();
                playButton.style.display = "flex";
              }
            });
          }
          
          // Show play button when video ends
          const video = mediaItem.querySelector("video");
          if (video) {
            video.addEventListener("loadedmetadata", function() {
              console.log("Video loaded successfully:", file.name);
            });
            
            video.addEventListener("error", function(e) {
              console.error("Error loading video:", file.name, e.target.error);
            });
            
            video.addEventListener("ended", function() {
              const playButton = mediaItem.querySelector(".video-play-button");
              if (playButton) playButton.style.display = "flex";
            });
          }
        }
        
        // Add click event for replacing media
        mediaItem.addEventListener("click", function() {
          replaceMedia(this, file);
        });
        
        // Add to fragment
        tempContainer.appendChild(mediaItem);
        
        // Update loading progress
        loadedCount++;
        loadingIndicator.innerHTML = `
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải ${loadedCount}/${totalCount} file media...</p>
        `;
        
        // When all files are processed, update the container
        if (loadedCount === totalCount) {
          // Clear the container and add all items
          container.innerHTML = '';
          container.appendChild(tempContainer);
          
          // Add export button if not already present
          addExportButton(container);
        }
      };
      
      // Process file paths differently based on source
      if (file.source === 'draft_content') {
        // For files from draft_content.json
        if (file.path.startsWith('C:') || file.path.startsWith('/') || file.path.startsWith('\\')) {
          // Absolute path
          filePath = file.path;
        } else {
          // Relative path - combine with template path
          filePath = joinPaths(templatePath, file.path);
        }
      } else {
        // For files from direct folder scan
        filePath = file.path;
      }
      
      // Convert to file URL for Electron
      let fileUrl = "";
      if (window.electron) {
        // Add file:// protocol and normalize path
        fileUrl = `file:///${filePath.replace(/\\/g, "/")}`;
        fileUrl = fileUrl.replace(/\/+/g, "/").replace("file:////", "file:///");
      } else {
        fileUrl = file.path || "";
      }
      
      // Process the file with the generated URL
      processFile(fileUrl);
    });
  }

  /**
   * Add export button to the media display
   * @param {HTMLElement} container - The media container element
   */
  function addExportButton(container) {
    // Check if export button already exists
    if (document.getElementById('export-modified-template')) {
      return;
    }
    
    // Create export button container
    const exportButtonContainer = document.createElement('div');
    exportButtonContainer.className = 'template-export-actions';
    
    // Add export button
    exportButtonContainer.innerHTML = `
      <button id="export-modified-template" class="primary-button" ${modifiedMediaFiles.size === 0 ? 'disabled' : ''}>
        <i class="fas fa-file-export"></i> Xuất template với file media đã thay thế
      </button>
    `;
    
    // Add to container's parent
    container.parentNode.appendChild(exportButtonContainer);
    
    // Add event listener
    document.getElementById('export-modified-template').addEventListener('click', function() {
      if (modifiedMediaFiles.size === 0) {
        UIManager.showNotification('Vui lòng thay thế ít nhất một file media trước', 'warning');
        return;
      }
      
      exportModifiedTemplate();
    });
  }
  
  /**
   * Handle replacing a media file
   * @param {HTMLElement} mediaItem - The media item element
   * @param {Object} fileInfo - Original file information
   */
  function replaceMedia(mediaItem, fileInfo) {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    
    // Set accepted file types based on the original file type
    const fileType = mediaItem.getAttribute('data-type');
    if (fileType === 'image') {
      fileInput.accept = 'image/*';
    } else if (fileType === 'video') {
      fileInput.accept = 'video/*';
    } else if (fileType === 'audio') {
      fileInput.accept = 'audio/*';
    }
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        
        // Check if file type matches the original
        const selectedFileType = getFileTypeFromName(selectedFile.name);
        if (selectedFileType !== fileType) {
          UIManager.showNotification(`Vui lòng chọn file ${getMediaTypeText(fileType).toLowerCase()} để thay thế`, 'error');
          return;
        }
        
        // Show loading state
        mediaItem.classList.add('loading');
        mediaItem.innerHTML = `
          <div class="media-loading-overlay">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang xử lý...</span>
          </div>
          ${mediaItem.innerHTML}
        `;
        
        // Handle the file based on if we're in Electron or browser
        if (window.electron) {
          // In Electron, we need to copy the file to a temporary location
          const originalPath = fileInfo.path;
          
          // Send the file to the main process
          window.electron.send('prepare-replacement-media', {
            originalPath,
            newFilePath: selectedFile.path,
            fileName: selectedFile.name,
            fileType
          });
          
          // Listen for the response
          window.electron.receive('replacement-media-ready', function(data) {
            const { success, tempFilePath, previewUrl, message } = data;
            
            if (success) {
              // Add to modified media map
              modifiedMediaFiles.set(originalPath, {
                originalPath,
                newFilePath: tempFilePath,
                previewUrl,
                fileType,
                fileName: selectedFile.name
              });
              
              // Update UI
              updateMediaItemAfterReplacement(mediaItem, fileInfo, previewUrl);
              
              // Enable export button
              const exportButton = document.getElementById('export-modified-template');
              if (exportButton) {
                exportButton.removeAttribute('disabled');
              }
              
              UIManager.showNotification(`Đã thay thế file ${fileInfo.name} thành công`, 'success');
            } else {
              // Remove loading state
              const loadingOverlay = mediaItem.querySelector('.media-loading-overlay');
              if (loadingOverlay) {
                loadingOverlay.remove();
              }
              mediaItem.classList.remove('loading');
              
              UIManager.showNotification(message || 'Không thể thay thế file', 'error');
            }
          });
        } else {
          // In browser, we can use FileReader for preview
          const reader = new FileReader();
          reader.onload = function(e) {
            const previewUrl = e.target.result;
            
            // Add to modified media map
            modifiedMediaFiles.set(fileInfo.path, {
              originalPath: fileInfo.path,
              newFilePath: null, // Browser mode doesn't have real file paths
              previewUrl,
              fileType,
              fileName: selectedFile.name
            });
            
            // Update UI
            updateMediaItemAfterReplacement(mediaItem, fileInfo, previewUrl);
            
            // Enable export button
            const exportButton = document.getElementById('export-modified-template');
            if (exportButton) {
              exportButton.removeAttribute('disabled');
            }
            
            UIManager.showNotification(`Đã thay thế file ${fileInfo.name} thành công (chế độ browser)`, 'success');
          };
          
          reader.onerror = function() {
            // Remove loading state
            const loadingOverlay = mediaItem.querySelector('.media-loading-overlay');
            if (loadingOverlay) {
              loadingOverlay.remove();
            }
            mediaItem.classList.remove('loading');
            
            UIManager.showNotification('Không thể đọc file', 'error');
          };
          
          reader.readAsDataURL(selectedFile);
        }
      }
    });
    
    // Trigger file selection dialog
    fileInput.click();
  }
  
  /**
   * Update media item UI after replacement
   * @param {HTMLElement} mediaItem - The media item element
   * @param {Object} fileInfo - Original file information
   * @param {string} previewUrl - URL for the new media preview
   */
  function updateMediaItemAfterReplacement(mediaItem, fileInfo, previewUrl) {
    // Remove loading state
    const loadingOverlay = mediaItem.querySelector('.media-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
    mediaItem.classList.remove('loading');
    
    // Mark as modified
    mediaItem.classList.add('modified');
    
    // Update preview based on file type
    const fileType = mediaItem.getAttribute('data-type');
    
    if (fileType === 'image') {
      const imgElement = mediaItem.querySelector('img');
      if (imgElement) {
        imgElement.src = previewUrl;
      }
    } else if (fileType === 'video') {
      const videoElement = mediaItem.querySelector('video');
      if (videoElement) {
        videoElement.src = previewUrl;
      }
    }
    
    // Add modified badge if not already present
    const infoContainer = mediaItem.querySelector('.media-info');
    if (infoContainer && !infoContainer.querySelector('.media-modified-badge')) {
      const badge = document.createElement('span');
      badge.className = 'media-modified-badge';
      badge.textContent = 'Đã thay thế';
      infoContainer.appendChild(badge);
    }
  }
  
  /**
   * Get file type from file name based on extension
   * @param {string} fileName - Name of the file
   * @returns {string} - File type (image, video, audio, or other)
   */
  function getFileTypeFromName(fileName) {
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
      return 'image';
    } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
      return 'video';
    } else if (['.mp3', '.wav', '.ogg', '.aac'].includes(ext)) {
      return 'audio';
    } else {
      return 'other';
    }
  }
  
  /**
   * Export the modified template with replaced media files
   */
  function exportModifiedTemplate() {
    if (!selectedTemplate || modifiedMediaFiles.size === 0) {
      UIManager.showNotification('Không có file media nào được thay thế', 'warning');
      return;
    }
    
    // Show loading notification
    UIManager.showNotification('Đang chuẩn bị xuất template...', 'info', 0);
    
    if (window.electron) {
      // Send data to main process
      window.electron.send('export-modified-template', {
        templatePath: selectedTemplate.path,
        modifiedFiles: Array.from(modifiedMediaFiles.values())
      });
      
      // Listen for export result
      window.electron.receive('template-export-result', function(data) {
        const { success, message } = data;
        
        UIManager.dismissNotification();
        
        if (success) {
          UIManager.showNotification(message || 'Template đã được xuất thành công với file media đã thay thế', 'success');
          
          // Reset modified files after successful export
          modifiedMediaFiles.clear();
          
          // Disable export button
          const exportButton = document.getElementById('export-modified-template');
          if (exportButton) {
            exportButton.setAttribute('disabled', 'disabled');
          }
          
          // Reload the template to show updated content
          loadTemplates();
        } else {
          UIManager.showNotification(message || 'Không thể xuất template', 'error');
        }
      });
    } else {
      // Browser mode - just simulate
      setTimeout(() => {
        UIManager.dismissNotification();
        UIManager.showNotification('Template đã được xuất thành công với file media đã thay thế (chế độ browser)', 'success');
        
        // Reset modified files after successful export
        modifiedMediaFiles.clear();
        
        // Disable export button
        const exportButton = document.getElementById('export-modified-template');
        if (exportButton) {
          exportButton.setAttribute('disabled', 'disabled');
        }
      }, 2000);
    }
  }

  /**
   * Join two paths together considering platform-specific path separators
   * @param {string} basePath - Base path
   * @param {string} relativePath - Relative path to join
   * @returns {string} - Combined path
   */
  function joinPaths(basePath, relativePath) {
    console.log("Joining paths:", { basePath, relativePath });
    
    // Kiểm tra nếu relativePath đã là đường dẫn tuyệt đối
    if (relativePath.startsWith('C:') || relativePath.startsWith('/') || relativePath.startsWith('\\')) {
      console.log("Returning absolute path:", relativePath);
      return relativePath;
    }
    
    // Xác định dấu phân cách đường dẫn dựa trên hệ điều hành
    const separator = window.electron && window.electron.getPlatform() === 'win32' ? '\\' : '/';
    
    // Chuẩn hóa các đường dẫn
    const normalizedBase = basePath.endsWith(separator) ? 
      basePath.slice(0, -1) : basePath;
    
    // Đối với đường dẫn tương đối từ draft_content.json, thử nhiều cách khác nhau
    
    // Loại bỏ các ký tự / hoặc \ ở đầu nếu có
    let normalizedRelative = relativePath;
    while (normalizedRelative.startsWith('/') || normalizedRelative.startsWith('\\')) {
      normalizedRelative = normalizedRelative.slice(1);
    }
    
    // Tạo đường dẫn kết hợp
    const combinedPath = `${normalizedBase}${separator}${normalizedRelative}`;
    console.log("Combined path:", combinedPath);
    
    return combinedPath;
  }

  /**
   * Format duration from milliseconds to readable format
   * @param {number} duration - Duration in milliseconds
   * @returns {string} - Formatted duration string
   */
  function formatDuration(duration) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get human-readable media type text
   * @param {string} type - Media type
   * @returns {string} - Human-readable type text
   */
  function getMediaTypeText(type) {
    switch (type) {
      case 'image':
        return 'Hình ảnh';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Âm thanh';
      default:
        return 'Tệp';
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
    showTemplatePreviewPopup,
    displayTemplateMedia,
    replaceMedia,
    exportModifiedTemplate
  };
})();
