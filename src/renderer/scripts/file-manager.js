/**
 * File Manager - Handles file operations and thumbnails
 */
const FileManager = (function () {
  /**
   * Initialize file manager
   */
  function init() {
    setupFileUploadHandlers();
  }

  /**
   * Set up file upload event handlers
   */
  function setupFileUploadHandlers() {
    const uploadArea = document.querySelector(".upload-area");
    const fileInput = document.getElementById("file-upload");

    // Handle click on upload area
    uploadArea.addEventListener("click", function (e) {
      // Don't trigger if the click was on the Browse Files button (label)
      if (
        !e.target.classList.contains("upload-button") &&
        !e.target.closest(".upload-button")
      ) {
        // Check if we're running in Electron
        if (window.electron) {
          openElectronFileDialog();
        } else {
          fileInput.click();
        }
      }
    });

    // Handle click on Browse Files button
    const browseButton = document.querySelector(".upload-button");
    if (browseButton) {
      browseButton.addEventListener("click", function (e) {
        e.preventDefault();
        // Check if we're running in Electron
        if (window.electron) {
          openElectronFileDialog();
        } else {
          fileInput.click();
        }
      });
    }

    // Handle drag and drop
    uploadArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.add("active");
    });

    uploadArea.addEventListener("dragleave", function (e) {
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove("active");
    });

    uploadArea.addEventListener("drop", function (e) {
      console.log("File drop event triggered");
      e.preventDefault();
      e.stopPropagation();
      uploadArea.classList.remove("active");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        console.log("Files dropped: " + files.length);
        handleFiles(files);
      }
    });

    // Handle file selection
    fileInput.addEventListener("change", function (e) {
      console.log("File input change event triggered");
      const files = this.files;
      if (files.length > 0) {
        console.log("Files selected: " + files.length);
        handleFiles(files);
      }
    });
  }

  /**
   * Open Electron's file dialog
   */
  async function openElectronFileDialog() {
    try {
      const filePaths = await window.electron.selectFiles();
      if (filePaths && filePaths.length > 0) {
        const fileDetails = await window.electron.getFileDetails(filePaths);
        processElectronFiles(fileDetails);
      }
    } catch (error) {
      console.error("Error selecting files with Electron:", error);
    }
  }

  /**
   * Process files selected through Electron
   * @param {Array} fileDetails - Array of file details
   */
  function processElectronFiles(fileDetails) {
    console.log("Processing Electron files:", fileDetails);

    // Process each file
    for (const fileDetail of fileDetails) {
      // Only process image and video files
      if (
        fileDetail.type.startsWith("image/") ||
        fileDetail.type.startsWith("video/")
      ) {
        // Create a thumbnail with the real file path
        createElectronThumbnail(fileDetail);
      } else {
        console.log("Unsupported file type:", fileDetail.type);
      }
    }
  }

  /**
   * Handle uploaded files
   * @param {FileList} files - List of files to process
   */
  function handleFiles(files) {
    // Get the file input element if it's not already defined in this scope
    const fileInput = document.getElementById("file-upload");
    if (!fileInput) {
      console.error("Could not find file-upload element");
      return;
    }

    if (files && files.length > 0) {
      console.log("Processing " + files.length + " files");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check if the file is an image or video
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          console.log("Creating thumbnail for: " + file.name);
          // Store the file path if available (for local files)
          let filePath = "";
          if (file.path) {
            // Use the original file path directly
            filePath = file.path;
          } else if (file.webkitRelativePath) {
            filePath = file.webkitRelativePath;
          } else {
            // For files without paths, just use the filename
            filePath = file.name;
          }

          // Format the path for CapCut
          filePath = formatPathForCapcut(filePath);
          console.log("File path:", filePath);
          createThumbnail(file, filePath);
        } else {
          console.log("Unsupported file type: " + file.type);
        }
      }

      // Reset the file input to allow uploading the same file again
      setTimeout(() => {
        fileInput.value = "";
        console.log("File input reset");
      }, 100);
    } else {
      console.log("No files to process");
    }
  }

  /**
   * Create thumbnail for a file
   * @param {File} file - File object
   * @param {string} originalPath - Original file path
   */
  function createThumbnail(file, originalPath) {
    console.log("Starting thumbnail creation for: " + file.name);

    const reader = new FileReader();

    reader.onload = function (e) {
      console.log("FileReader loaded successfully");

      // Get the thumbnailList element if it's not already defined in this scope
      const thumbnailList = document.getElementById("thumbnail-list");
      if (!thumbnailList) {
        console.error("Could not find thumbnail-list element");
        return;
      }

      const thumbnailItem = document.createElement("div");
      thumbnailItem.className = "thumbnail-item";
      thumbnailItem.draggable = true;

      // Format the path for compatibility with CapCut using our dedicated function
      let formattedPath = formatPathForCapcut(originalPath);

      // Store the original file path as a data attribute
      thumbnailItem.dataset.originalPath = formattedPath;
      thumbnailItem.dataset.path = formattedPath; // Thêm data-path để dễ tìm kiếm

      // Add index number
      const thumbnailIndex = document.createElement("div");
      thumbnailIndex.className = "thumbnail-index";
      thumbnailIndex.textContent = thumbnailList.children.length + 1;

      let thumbnail;

      if (file.type.startsWith("image/")) {
        console.log("Creating image thumbnail");
        thumbnail = document.createElement("img");
        thumbnail.src = e.target.result;
      } else if (file.type.startsWith("video/")) {
        console.log("Creating video thumbnail");
        thumbnail = document.createElement("video");
        thumbnail.src = e.target.result;
        // Add poster image for video if you have one
        thumbnail.setAttribute("controls", "true");
      }

      const thumbnailInfo = document.createElement("div");
      thumbnailInfo.className = "thumbnail-info";

      const fileName = document.createElement("p");
      fileName.textContent = file.name;

      const fileSize = document.createElement("p");
      fileSize.textContent = formatFileSize(file.size);

      // Create a hidden input for the path
      const pathInput = document.createElement("input");
      pathInput.type = "hidden";
      pathInput.className = "path-input";
      pathInput.value = formattedPath;

      // Create time duration input container
      const durationContainer = document.createElement("div");
      durationContainer.className = "duration-container";

      // Create duration label
      const durationLabel = document.createElement("label");
      durationLabel.className = "duration-label";
      durationLabel.textContent = "Time:";

      // Create duration input
      const durationInput = document.createElement("input");
      durationInput.type = "number";
      durationInput.className = "duration-input";
      durationInput.value = 5; // Default 5 seconds
      durationInput.min = 1;
      durationInput.max = 60;
      durationInput.step = 1;

      // Add event listener to update total duration when changed
      durationInput.addEventListener("change", function () {
        updateTotalDuration();
      });

      // Create duration unit label
      const durationUnit = document.createElement("span");
      durationUnit.className = "duration-unit";
      durationUnit.textContent = "seconds";

      // Add all duration elements
      durationContainer.appendChild(durationLabel);
      durationContainer.appendChild(durationInput);
      durationContainer.appendChild(durationUnit);

      // Create effects container
      const effectsContainer = document.createElement("div");
      effectsContainer.className = "effects-container";

      // Create effects button
      const effectsButton = document.createElement("div");
      effectsButton.className = "effects-button";
      effectsButton.innerHTML = '<i class="fas fa-magic"></i>';
      effectsButton.onclick = function (e) {
        e.stopPropagation();
        UIManager.toggleEffectsDropdown(this);
      };

      // Create selected effect display
      const selectedEffect = document.createElement("div");
      selectedEffect.className = "selected-effect";
      selectedEffect.innerHTML = '<i class="fas fa-ban"></i> None';

      effectsContainer.appendChild(effectsButton);
      effectsContainer.appendChild(selectedEffect);

      thumbnailInfo.appendChild(fileName);
      thumbnailInfo.appendChild(fileSize);
      thumbnailInfo.appendChild(pathInput); // Add the hidden path input
      thumbnailInfo.appendChild(durationContainer);
      thumbnailInfo.appendChild(effectsContainer);

      thumbnailItem.appendChild(thumbnailIndex);
      thumbnailItem.appendChild(thumbnail);
      thumbnailItem.appendChild(thumbnailInfo);
      
      // Thêm các button animation (Vào, Kết hợp, Ra) cho thumbnail
      if (typeof MaterialManager !== 'undefined' && MaterialManager.addAnimationButtons) {
        console.log("Adding animation buttons to thumbnail");
        MaterialManager.addAnimationButtons(thumbnailItem, {
          filePath: formattedPath,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }, applyAnimation);
      } else {
        console.warn("MaterialManager not available or addAnimationButtons not defined");
      }

      // If there's already at least one item in the list, add transition element before this one
      if (thumbnailList.children.length > 0) {
        const transitionsContainer = createTransitionsElement();
        thumbnailList.appendChild(transitionsContainer);
      }

      thumbnailList.appendChild(thumbnailItem);
      console.log("Thumbnail added to list");
      
      // Add drag event listeners
      if (typeof DragDropManager !== 'undefined' && DragDropManager.setupDragListeners) {
        DragDropManager.setupDragListeners(thumbnailItem);
      }

      // Update the total duration
      updateTotalDuration();
    };

    reader.onerror = function (error) {
      console.error("Error reading file:", error);
    };

    try {
      reader.readAsDataURL(file);
      console.log("Started reading file as data URL");
    } catch (error) {
      console.error("Exception while reading file:", error);
    }
  }

  /**
   * Create thumbnail for Electron files
   * @param {Object} fileDetail - File details from Electron
   */
  function createElectronThumbnail(fileDetail) {
    console.log("Creating thumbnail for Electron file:", fileDetail.name);

    // Get the thumbnailList element
    const thumbnailList = document.getElementById("thumbnail-list");
    if (!thumbnailList) {
      console.error("Could not find thumbnail-list element");
      return;
    }

    const thumbnailItem = document.createElement("div");
    thumbnailItem.className = "thumbnail-item";
    thumbnailItem.draggable = true;

    // Store the real file path
    const realPath = fileDetail.path;
    thumbnailItem.dataset.originalPath = realPath;

    // Add index number
    const thumbnailIndex = document.createElement("div");
    thumbnailIndex.className = "thumbnail-index";
    thumbnailIndex.textContent = thumbnailList.children.length + 1;

    let thumbnail;

    // Create URL from file path or use a placeholder
    if (fileDetail.type.startsWith("image/")) {
      thumbnail = document.createElement("img");
      // For Electron, we can use the file:// protocol to load local images
      thumbnail.src = "file://" + realPath;
    } else if (fileDetail.type.startsWith("video/")) {
      thumbnail = document.createElement("video");
      thumbnail.src = "file://" + realPath;
      thumbnail.setAttribute("controls", "true");
    }

    const thumbnailInfo = document.createElement("div");
    thumbnailInfo.className = "thumbnail-info";

    const fileName = document.createElement("p");
    fileName.textContent = fileDetail.name;

    const fileSize = document.createElement("p");
    fileSize.textContent = formatFileSize(fileDetail.size);

    // Create a hidden input to store the path
    const pathInput = document.createElement("input");
    pathInput.type = "hidden";
    pathInput.className = "path-input";
    pathInput.value = realPath;

    // Create time duration input container
    const durationContainer = document.createElement("div");
    durationContainer.className = "duration-container";

    // Create duration label
    const durationLabel = document.createElement("label");
    durationLabel.className = "duration-label";
    durationLabel.textContent = "Time:";

    // Create duration input
    const durationInput = document.createElement("input");
    durationInput.type = "number";
    durationInput.className = "duration-input";
    durationInput.value = 5; // Default 5 seconds
    durationInput.min = 1;
    durationInput.max = 60;
    durationInput.step = 1;

    // Add event listener to update total duration when changed
    durationInput.addEventListener("change", function () {
      updateTotalDuration();
    });

    // Create duration unit label
    const durationUnit = document.createElement("span");
    durationUnit.className = "duration-unit";
    durationUnit.textContent = "seconds";

    // Add all duration elements
    durationContainer.appendChild(durationLabel);
    durationContainer.appendChild(durationInput);
    durationContainer.appendChild(durationUnit);

    // Create effects container
    const effectsContainer = document.createElement("div");
    effectsContainer.className = "effects-container";

    // Create effects button
    const effectsButton = document.createElement("div");
    effectsButton.className = "effects-button";
    effectsButton.innerHTML = '<i class="fas fa-magic"></i>';
    effectsButton.onclick = function (e) {
      e.stopPropagation();
      UIManager.toggleEffectsDropdown(this);
    };

    // Create selected effect display
    const selectedEffect = document.createElement("div");
    selectedEffect.className = "selected-effect";
    selectedEffect.innerHTML = '<i class="fas fa-ban"></i> None';

    effectsContainer.appendChild(effectsButton);
    effectsContainer.appendChild(selectedEffect);

    thumbnailInfo.appendChild(fileName);
    thumbnailInfo.appendChild(fileSize);
    thumbnailInfo.appendChild(pathInput); // Add the hidden path input
    thumbnailInfo.appendChild(durationContainer);
    thumbnailInfo.appendChild(effectsContainer);

    thumbnailItem.appendChild(thumbnailIndex);
    thumbnailItem.appendChild(thumbnail);
    thumbnailItem.appendChild(thumbnailInfo);
    
    // Thêm các button animation (Vào, Kết hợp, Ra) cho thumbnail
    if (typeof MaterialManager !== 'undefined' && MaterialManager.addAnimationButtons) {
      MaterialManager.addAnimationButtons(thumbnailItem, {
        filePath: realPath,
        fileName: fileDetail.name,
        fileType: fileDetail.type,
        fileSize: fileDetail.size
      }, applyAnimation);
    }

    // If there's already at least one item in the list, add transition element before this one
    if (thumbnailList.children.length > 0) {
      const transitionsContainer = createTransitionsElement();
      thumbnailList.appendChild(transitionsContainer);
    }

    thumbnailList.appendChild(thumbnailItem);
    console.log("Thumbnail added to list");

    // Add drag event listeners
    DragDropManager.setupDragListeners(thumbnailItem);

    // Update the total duration
    updateTotalDuration();
  }

  /**
   * Create transitions element
   * @returns {HTMLElement} Transitions container element
   */
  function createTransitionsElement() {
    const transitionsContainer = document.createElement("div");
    transitionsContainer.className = "transitions-container";

    // Create transition button
    const transitionButton = document.createElement("div");
    transitionButton.className = "transition-button";
    transitionButton.innerHTML = '<i class="fas fa-exchange-alt"></i>';
    transitionButton.onclick = function (e) {
      e.stopPropagation();
      UIManager.toggleTransitionsDropdown(this);
    };

    // Create selected transition display
    const selectedTransition = document.createElement("div");
    selectedTransition.className = "selected-transition";
    selectedTransition.innerHTML = '<i class="fas fa-cut"></i> Cut';

    // Khởi tạo tất cả các thuộc tính mặc định cho transition
    selectedTransition.dataset.effectId = "";
    selectedTransition.dataset.isOverlap = "false";
    selectedTransition.dataset.duration = "0";
    selectedTransition.dataset.categoryId = "";
    selectedTransition.dataset.categoryName = "";
    selectedTransition.dataset.path = "";
    selectedTransition.dataset.platform = "";
    selectedTransition.dataset.resourceId = "";
    selectedTransition.dataset.sourcePlatform = "0";

    // Create transitions dropdown (we'll use the global one instead)
    const transitionsDropdown = document.createElement("div");
    transitionsDropdown.className = "transitions-dropdown";

    transitionsContainer.appendChild(transitionButton);
    transitionsContainer.appendChild(selectedTransition);
    transitionsContainer.appendChild(transitionsDropdown);

    return transitionsContainer;
  }

  /**
   * Function to add a total duration counter to thumbnail container
   */
  function addTotalDurationCounter() {
    // Check if duration counter already exists
    if (!document.getElementById("total-duration-container")) {
      const thumbnailContainer = document.querySelector(".thumbnail-container");

      const totalDurationContainer = document.createElement("div");
      totalDurationContainer.id = "total-duration-container";
      totalDurationContainer.className = "total-duration-container";

      const totalDurationLabel = document.createElement("span");
      totalDurationLabel.className = "total-duration-label";
      totalDurationLabel.textContent = "Total Duration: ";

      const totalDurationValue = document.createElement("span");
      totalDurationValue.id = "total-duration-value";
      totalDurationValue.className = "total-duration-value";
      totalDurationValue.textContent = "0 seconds";

      totalDurationContainer.appendChild(totalDurationLabel);
      totalDurationContainer.appendChild(totalDurationValue);

      // Insert after the "Uploaded Files" heading
      const heading = thumbnailContainer.querySelector("h2");
      heading.parentNode.insertBefore(
        totalDurationContainer,
        heading.nextSibling
      );
    }
  }

  /**
   * Update total duration of all thumbnails
   */
  function updateTotalDuration() {
    // Make sure duration counter exists
    addTotalDurationCounter();

    // Get thumbnailList if it's not already defined in this scope
    const thumbnailList = document.getElementById("thumbnail-list");
    if (!thumbnailList) {
      console.error("Could not find thumbnail-list element");
      return;
    }

    // Calculate total duration
    let totalDuration = 0;
    const durationInputs = thumbnailList.querySelectorAll(".duration-input");
    durationInputs.forEach((input) => {
      totalDuration += parseInt(input.value) || 0;
    });

    // Update the displayed value
    const totalDurationValue = document.getElementById("total-duration-value");
    if (totalDurationValue) {
      totalDurationValue.textContent = totalDuration + " seconds";
    }
  }

  /**
   * Format file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Format paths for CapCut compatibility
   * @param {string} path - Original file path
   * @returns {string} Formatted path for CapCut
   */
  function formatPathForCapcut(path) {
    if (!path) return "";

    // Replace backslashes with forward slashes and ensure double slashes
    let formattedPath = path.replace(/\\/g, "//");

    // Fix Windows paths with drive letters (C:)
    if (/^[A-Za-z]:/.test(formattedPath)) {
      formattedPath = formattedPath.replace(/^([A-Za-z]:)(?:\/)?/, "$1//");
    }

    return formattedPath;
  }

  /**
   * Apply animation to a file
   * @param {Object} fileData - File data
   * @param {Object} animation - Animation to apply
   * @param {string} animationType - Type of animation (in, out, group)
   */
  function applyAnimation(fileData, animation, animationType) {
    console.log(`Applying ${animationType} animation to file:`, fileData.fileName);
    console.log('Animation details:', animation);
    
    // Tìm thumbnail item dựa trên file path
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    let targetItem = null;
    
    for (const item of thumbnailItems) {
      if (item.dataset.path === fileData.filePath) {
        targetItem = item;
        break;
      }
    }
    
    if (!targetItem) {
      console.error('Could not find thumbnail item for file:', fileData.fileName);
      return;
    }
    
    // Cập nhật giao diện để hiển thị animation đã chọn
    const animationTypeDisplay = {
      'in': 'Vào',
      'out': 'Ra',
      'group': 'Kết hợp'
    };
    
    // Tạo hoặc cập nhật badge hiển thị animation
    let animationBadge = targetItem.querySelector(`.animation-badge-${animationType}`);
    
    if (!animationBadge) {
      animationBadge = document.createElement('div');
      animationBadge.className = `animation-badge animation-badge-${animationType}`;
      targetItem.querySelector('.thumbnail-info').appendChild(animationBadge);
    }
    
    if (animation.name === 'None') {
      // Nếu chọn None, xóa badge
      if (animationBadge) {
        animationBadge.remove();
      }
    } else {
      // Cập nhật nội dung badge
      animationBadge.innerHTML = `<i class="${animation.icon || 'fas fa-magic'}"></i> ${animationTypeDisplay[animationType]}: ${animation.name}`;
      animationBadge.style.backgroundColor = animationType === 'in' ? '#e8f4ff' : 
                                           animationType === 'out' ? '#ffebeb' : '#f0f0f0';
      animationBadge.style.color = animationType === 'in' ? '#4a90e2' : 
                                 animationType === 'out' ? '#ff5e4c' : '#666';
    }
    
    // Hiển thị thông báo
    if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
      if (animation.name === 'None') {
        UIManager.showNotification(`Đã xóa hiệu ứng ${animationTypeDisplay[animationType]} cho ${fileData.fileName}`, 'info');
      } else {
        UIManager.showNotification(`Đã áp dụng hiệu ứng ${animationTypeDisplay[animationType]} "${animation.name}" cho ${fileData.fileName}`, 'success');
      }
    }
  }

  // Public API
  return {
    init,
    handleFiles,
    createThumbnail,
    createElectronThumbnail,
    createTransitionsElement,
    updateTotalDuration,
    formatPathForCapcut,
    formatFileSize,
    applyAnimation
  };
})();
