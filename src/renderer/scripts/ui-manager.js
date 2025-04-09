/**
 * UI Manager - Handles UI interactions and elements
 */
const UIManager = (function () {
  // Tab switching functionality
  function initTabSwitching() {
    const navItems = document.querySelectorAll(".nav-item");
    const tabContents = document.querySelectorAll(".tab-content");

    navItems.forEach((item, index) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();

        // Hide all tab contents
        tabContents.forEach((tab) => {
          tab.style.display = "none";
        });

        // Show the corresponding tab content
        if (index === 0) {
          document.getElementById("template-tab").style.display = "block";
        } else if (index === 1) {
          document.getElementById("custom-tab").style.display = "block";
          
          // Remove any pagination controls if they exist
          const existingPagination = document.querySelector(".template-pagination");
          if (existingPagination) {
            existingPagination.remove();
          }
          
          // Load templates when switching to the template tab
          if (typeof TemplateManager !== 'undefined' && TemplateManager.loadTemplates) {
            TemplateManager.loadTemplates();
          }
        }
      });
    });
  }

  // Settings popup functionality
  function initSettingsPopup() {
    const settingsButton = document.getElementById("settings-button");
    const settingsPopup = document.getElementById("settings-popup");
    const closeSettingsButton = document.getElementById("close-settings");
    const saveSettingsButton = document.getElementById("save-settings");

    // Settings popup event listeners
    settingsButton.addEventListener("click", function (e) {
      e.preventDefault();
      settingsPopup.style.display = "flex";
    });

    closeSettingsButton.addEventListener("click", function () {
      settingsPopup.style.display = "none";
    });

    // Close popup when clicking outside of it
    window.addEventListener("click", function (e) {
      if (e.target === settingsPopup) {
        settingsPopup.style.display = "none";
      }
    });

    // Save settings button
    saveSettingsButton.addEventListener("click", function () {
      // Save settings logic
      const defaultPath = document.getElementById("default-path").value;
      const targetPath = document.getElementById("target-path").value;
      const templatePath = document.getElementById("template-path").value;

      // Validate paths
      if (!defaultPath || !targetPath || !templatePath) {
        showNotification("Please set all path settings", "error");
        return;
      }

      // Save to localStorage for persistence
      localStorage.setItem("defaultPath", defaultPath);
      localStorage.setItem("targetPath", targetPath);
      localStorage.setItem("templatePath", templatePath);

      showNotification("Settings saved successfully", "success");
      settingsPopup.style.display = "none";
    });
  }

  // Load saved settings from localStorage
  function loadSavedSettings() {
    const defaultPathInput = document.getElementById("default-path");
    const targetPathInput = document.getElementById("target-path");
    const templatePathInput = document.getElementById("template-path");

    const savedDefaultPath = localStorage.getItem("defaultPath");
    const savedTargetPath = localStorage.getItem("targetPath");
    const savedTemplatePath = localStorage.getItem("templatePath");

    if (savedDefaultPath) {
      defaultPathInput.value = savedDefaultPath;
    }

    if (savedTargetPath) {
      targetPathInput.value = savedTargetPath;
    }

    if (savedTemplatePath) {
      templatePathInput.value = savedTemplatePath;
    }
  }

  // Browse folder buttons
  function initBrowseButtons() {
    const browseDefaultPathButton = document.getElementById(
      "browse-default-path"
    );
    const browseTargetPathButton =
      document.getElementById("browse-target-path");
    const browseTemplatePathButton = document.getElementById(
      "browse-template-path"
    );

    // Function to browse for folders - default path
    browseDefaultPathButton.addEventListener("click", function () {
      if (window.electron) {
        window.electron.send("select-folder", { inputId: "default-path" });
      } else {
        alert("This feature requires Electron to work with the file system.");
      }
    });

    // Function to browse for folders - target path
    browseTargetPathButton.addEventListener("click", function () {
      if (window.electron) {
        window.electron.send("select-folder", { inputId: "target-path" });
      } else {
        alert("This feature requires Electron to work with the file system.");
      }
    });

    // Function to browse for folders - template path
    browseTemplatePathButton.addEventListener("click", function () {
      if (window.electron) {
        window.electron.send("select-folder", { inputId: "template-path" });
      } else {
        alert("This feature requires Electron to work with the file system.");
      }
    });
  }

  // Project creation button
  function initProjectCreationButton() {
    const createProjectButton = document.getElementById(
      "create-project-button"
    );

    createProjectButton.addEventListener("click", function () {
      const projectNameInput = document.getElementById("project-name");
      const projectName = projectNameInput.value.trim();
      if (!projectName) {
        alert("Please enter a project name");
        return;
      }

      // Get paths from local storage to ensure we use the latest saved values
      const defaultPath =
        localStorage.getItem("defaultPath") ||
        document.getElementById("default-path").value;
      const targetPath =
        localStorage.getItem("targetPath") ||
        document.getElementById("target-path").value;

      // Save the current project info
      currentProject.name = projectName;

      // Use proper path separator based on platform
      if (window.electron && window.electron.getPlatform() === "win32") {
        // For Windows, use backslash separator
        currentProject.path = targetPath + "\\" + projectName;
      } else {
        // For other platforms, use forward slash
        currentProject.path = targetPath + "/" + projectName;
      }

      console.log(
        "Project created - Name:",
        currentProject.name,
        "Path:",
        currentProject.path
      );

      // Check if the paths exist
      if (window.electron) {
        createCapcutProject(projectName, defaultPath, targetPath);
      } else {
        alert(
          "This feature requires Electron to work with the file system. Running in browser mode for demo purposes."
        );
        // Mock success for browser testing
        showNotification("Project created successfully!", "success");
        projectNameInput.value = "";
        // Reset all content in browser mode as well, skip additional notification
        resetContent(true);
      }
    });
  }

  // Reset button
  function initResetButton() {
    const resetButton = document.getElementById("reset-button");
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        // Show confirmation dialog
        if (
          confirm(
            "Are you sure you want to reset all content? This will clear all uploaded files and settings."
          )
        ) {
          resetContent();
        }
      });
    }
  }

  // Function to reset all content (thumbnails, transitions, effects)
  function resetContent(skipNotification = false) {
    // Clear the thumbnail list
    const thumbnailList = document.getElementById("thumbnail-list");
    if (thumbnailList) {
      thumbnailList.innerHTML = "";
    }

    // Reset the file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
    }

    // Reset the total duration counter
    const totalDurationValue = document.getElementById("total-duration-value");
    if (totalDurationValue) {
      totalDurationValue.textContent = "0 seconds";
    }

    // Reset upload area appearance
    const uploadArea = document.querySelector(".upload-area");
    if (uploadArea) {
      // Remove any active states or custom classes
      uploadArea.classList.remove("active");
    }

    // Hide any open dropdowns
    DropdownManager.closeAllDropdowns();

    // Hide export button or disable it
    const exportButton = document.getElementById("export-button");
    if (exportButton) {
      exportButton.disabled = false;
      exportButton.style.opacity = "1";
    }

    console.log("All content has been reset");

    // Show a small confirmation message if not skipped
    if (!skipNotification) {
      showNotification(
        "Content has been reset. You can add new files.",
        "info"
      );
    }
  }

  // Function to show notification
  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add close button
    const closeBtn = document.createElement("span");
    closeBtn.className = "notification-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", function () {
      document.body.removeChild(notification);
    });

    notification.appendChild(closeBtn);
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }

  // Function to dismiss all notifications
  function dismissNotification() {
    // Remove all existing notifications
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  // Global effects dropdown
  let globalEffectsDropdown = null;
  let currentThumbnailItem = null;
  let currentEffectsButton = null;
  let currentSelectedEffect = null;

  // Function to create a single global effects dropdown
  function createGlobalEffectsDropdown() {
    // Remove any existing global dropdown
    if (document.getElementById("global-effects-dropdown")) {
      document.getElementById("global-effects-dropdown").remove();
    }

    // Create the dropdown
    const dropdown = document.createElement("div");
    dropdown.id = "global-effects-dropdown";
    dropdown.className = "effects-dropdown";

    // Lấy danh sách effects từ EffectManager
    let effectOptions = [];

    // Lấy effects từ EffectManager nếu có
    if (EffectManager && typeof EffectManager.getEffects === 'function') {
      const managerEffects = EffectManager.getEffects();
      if (Array.isArray(managerEffects) && managerEffects.length > 0) {
        effectOptions = managerEffects;
      } else {
        // Nếu không có effects từ EffectManager, thêm None mặc định
        effectOptions = [{
          name: "None",
          icon: "fas fa-ban"
        }];
      }
    } else {
      // Nếu không có EffectManager, thêm None mặc định
      effectOptions = [{
        name: "None",
        icon: "fas fa-ban"
      }];
    }

    // Add effect options to the dropdown
    effectOptions.forEach((option) => {
      const effectOption = document.createElement("div");
      effectOption.className = "effect-option";
      effectOption.innerHTML = `<i class="${option.icon || 'fas fa-star'}"></i> ${option.name}`;
      effectOption.dataset.name = option.name;
      effectOption.dataset.effectId = option.effect_id || "";
      effectOption.dataset.duration = option.duration || "3000000";

      effectOption.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (currentSelectedEffect) {
          // Update the selected effect display
          const optionName = this.dataset.name;
          const iconClass = option.icon || 'fas fa-star';
          currentSelectedEffect.innerHTML = `<i class="${iconClass}"></i> ${optionName}`;
          currentSelectedEffect.dataset.effectId = this.dataset.effectId;
          currentSelectedEffect.dataset.duration = this.dataset.duration;
          
          // Show or hide effect duration input based on selection
          if (optionName === "None") {
            hideEffectDurationInput(currentSelectedEffect);
          } else {
            showEffectDurationInput(currentSelectedEffect);
          }
          
          // Close the dropdown
          hideEffectsDropdown();
        }
      };
      dropdown.appendChild(effectOption);
    });

    // Add the dropdown to the document body
    document.body.appendChild(dropdown);

    // Store the dropdown for later use
    globalEffectsDropdown = dropdown;

    return dropdown;
  }

  // Function to show the effects dropdown for a specific thumbnail
  function showEffectsDropdown(button) {
    // Get the thumbnail item
    const thumbnailItem = button.closest(".thumbnail-item");
    const selectedEffect = button.nextElementSibling;

    // Update global references
    currentThumbnailItem = thumbnailItem;
    currentEffectsButton = button;
    currentSelectedEffect = selectedEffect;

    // Make sure we have the global dropdown
    if (!globalEffectsDropdown) {
      globalEffectsDropdown = createGlobalEffectsDropdown();
    }

    // Update the selected state in dropdown
    const currentEffectName = selectedEffect.textContent
      .trim()
      .replace(/^\S+\s+/, "");
    const currentEffectId = selectedEffect.dataset.effectId || "";

    const options = globalEffectsDropdown.querySelectorAll(".effect-option");
    options.forEach((option) => {
      const optionName = option.dataset.name;
      const optionEffectId = option.dataset.effectId || "";

      // Mark as selected if name matches or if effect_id matches (when available)
      const isSelected =
        optionName === currentEffectName ||
        (currentEffectId && optionEffectId === currentEffectId);

      option.classList.toggle("selected", isSelected);
    });

    // Show or hide duration input based on current effect
    if (currentEffectName !== "None") {
      // If effect is selected, make sure duration input is shown
      showEffectDurationInput(selectedEffect);
    } else {
      // If no effect (None) is selected, hide duration input
      hideEffectDurationInput(selectedEffect);
    }

    // Position and show the dropdown
    positionEffectsDropdown(thumbnailItem);
    globalEffectsDropdown.classList.add("show");
  }

  // Function to hide the effects dropdown
  function hideEffectsDropdown() {
    if (globalEffectsDropdown) {
      globalEffectsDropdown.classList.remove("show");
    }

    // Clear references
    currentThumbnailItem = null;
    currentEffectsButton = null;
    currentSelectedEffect = null;
  }

  // Function to position the effects dropdown over a thumbnail
  function positionEffectsDropdown(thumbnailItem) {
    if (!globalEffectsDropdown) return;

    const thumbnailRect = thumbnailItem.getBoundingClientRect();

    // Style the dropdown
    globalEffectsDropdown.style.position = "fixed";
    globalEffectsDropdown.style.zIndex = "10000";
    globalEffectsDropdown.style.width = thumbnailRect.width + "px";
    globalEffectsDropdown.style.height = thumbnailRect.height + "px";
    globalEffectsDropdown.style.left = thumbnailRect.left + "px";
    globalEffectsDropdown.style.top = thumbnailRect.top + "px";
    globalEffectsDropdown.style.maxHeight = "none";

    // If there's not enough space in the viewport, adjust max height
    if (thumbnailRect.height > window.innerHeight * 0.8) {
      globalEffectsDropdown.style.maxHeight = window.innerHeight * 0.8 + "px";
    }
  }

  // Function to toggle effects dropdown
  function toggleEffectsDropdown(button) {
    // Check if this button's dropdown is already shown
    if (
      currentEffectsButton === button &&
      globalEffectsDropdown &&
      globalEffectsDropdown.classList.contains("show")
    ) {
      // If already open, close it
      hideEffectsDropdown();
    } else {
      // Close transitions dropdowns
      document
        .querySelectorAll(".transitions-dropdown.show")
        .forEach((item) => {
          item.classList.remove("show");
        });

      // Show this dropdown
      showEffectsDropdown(button);
    }
  }

  // Function to display effect duration input
  function showEffectDurationInput(selectedElement) {
    const thumbnailItem = selectedElement.closest(".thumbnail-item");

    // Check if duration input container already exists
    let effectDurationContainer = thumbnailItem.querySelector(
      ".effect-duration-container"
    );

    if (!effectDurationContainer) {
      // Create effect duration input container
      effectDurationContainer = document.createElement("div");
      effectDurationContainer.className = "effect-duration-container";

      // Create duration label
      const durationLabel = document.createElement("label");
      durationLabel.className = "duration-label";
      durationLabel.textContent = "Effect Duration:";

      // Create duration input
      const durationInput = document.createElement("input");
      durationInput.type = "number";
      durationInput.className = "effect-duration-input";
      durationInput.value =
        parseInt(selectedElement.dataset.duration || "3000000") / 1000000; // Convert from microseconds to seconds
      durationInput.min = 0.5;
      durationInput.max = 10;
      durationInput.step = 0.1;

      // Add event listener to update effect duration when changed
      durationInput.addEventListener("change", function () {
        // Store duration in microseconds
        selectedElement.dataset.duration = (
          parseFloat(this.value) * 1000000
        ).toString();
      });

      // Create duration unit label
      const durationUnit = document.createElement("span");
      durationUnit.className = "duration-unit";
      durationUnit.textContent = "seconds";

      // Add all duration elements
      effectDurationContainer.appendChild(durationLabel);
      effectDurationContainer.appendChild(durationInput);
      effectDurationContainer.appendChild(durationUnit);

      // Insert after the effects container
      const effectsContainer = selectedElement.closest(".effects-container");
      effectsContainer.parentNode.insertBefore(
        effectDurationContainer,
        effectsContainer.nextSibling
      );
    } else {
      // Update existing duration input
      const durationInput = effectDurationContainer.querySelector(
        ".effect-duration-input"
      );
      if (durationInput) {
        durationInput.value =
          parseInt(selectedElement.dataset.duration || "3000000") / 1000000;
      }
      effectDurationContainer.style.display = "flex";
    }
  }

  // Function to hide effect duration input
  function hideEffectDurationInput(selectedElement) {
    const thumbnailItem = selectedElement.closest(".thumbnail-item");
    const effectDurationContainer = thumbnailItem.querySelector(
      ".effect-duration-container"
    );

    if (effectDurationContainer) {
      effectDurationContainer.style.display = "none";
    }
  }

  // Global transitions dropdown
  let globalTransitionsDropdown = null;
  let currentTransitionButton = null;
  let currentSelectedTransition = null;
  let currentTransitionThumbnailItem = null;

  // Function to create a single global transitions dropdown
  function createGlobalTransitionsDropdown() {
    // Remove any existing global dropdown
    if (document.getElementById("global-transitions-dropdown")) {
      document.getElementById("global-transitions-dropdown").remove();
    }

    // Create the dropdown
    const dropdown = document.createElement("div");
    dropdown.id = "global-transitions-dropdown";
    dropdown.className = "transitions-dropdown effects-dropdown"; // Using effects-dropdown style

    // Lấy danh sách transitions từ TransitionManager
    let transitionOptions = [];

    // Nếu TransitionManager tồn tại và có getTransitions
    if (TransitionManager && typeof TransitionManager.getTransitions === 'function') {
      transitionOptions = TransitionManager.getTransitions();
    } else {
      // Fallback nếu không có TransitionManager
      transitionOptions = [
        {
          name: "Cut",
          icon: "fas fa-cut",
          effect_id: null,
          is_overlap: false,
          duration: 0,
          category_id: "",
          category_name: "",
          path: "",
          platform: "",
          resource_id: "",
          source_platform: 0,
        },
        {
          name: "Giảm dần zoom",
          icon: "fas fa-search-minus",
          effect_id: "7262258307128103425",
          is_overlap: true,
          duration: 800000,
          category_id: "25835",
          category_name: "Đang thịnh hành",
          path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7262258307128103425/e4cafc076ecab223a39a26fe6f05b6db",
          platform: "all",
          resource_id: "7262258307128103425",
          source_platform: 1,
        },
        {
          name: "Tín hiệu trục trặc 2",
          icon: "fas fa-bolt",
          effect_id: "7343854374147330562",
          is_overlap: false,
          duration: 666666,
          category_id: "25835",
          category_name: "Đang thịnh hành",
          path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7343854374147330562/bc6d04c47df8aa910544fdf657419ab7",
          platform: "all",
          resource_id: "7343854374147330562",
          source_platform: 1,
        },
        {
          name: "Ba lát",
          icon: "fas fa-th",
          effect_id: "7252631917437129218",
          is_overlap: true,
          duration: 800000,
          category_id: "25835",
          category_name: "Đang thịnh hành",
          path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7252631917437129218/e47aeeef97032d11bf767bd290881da4",
          platform: "all",
          resource_id: "7252631917437129218",
          source_platform: 1,
        },
        {
          name: "Lấp lánh",
          icon: "fas fa-star",
          effect_id: "7361758943661527569",
          is_overlap: true,
          duration: 933333,
          category_id: "25835",
          category_name: "Đang thịnh hành",
          path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7361758943661527569/da913924bc6975821de103b371d540ff",
          platform: "all",
          resource_id: "7361758943661527569",
          source_platform: 1,
        },
        {
          name: "Thổi ra",
          icon: "fas fa-expand-arrows-alt",
          effect_id: "7362947185249358353",
          is_overlap: true,
          duration: 800000,
          category_id: "25835",
          category_name: "Đang thịnh hành",
          path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7362947185249358353/9d6a02b47846369cec6d19a35826570d",
          platform: "all",
          resource_id: "7362947185249358353",
          source_platform: 1,
        },
        {
          name: "Trượt xuống",
          icon: "fas fa-arrow-down",
          effect_id: "7309454269982183938",
          is_overlap: true,
          duration: 533333,
          category_id: "25835",
          category_name: "Đang thịnh hành",
          path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7309454269982183938/9c54ccb7b27ab98f7c3bb03a5d4acc4b",
          platform: "all",
          resource_id: "7309454269982183938",
          source_platform: 1,
        },
      ];
    }

    // Add transition options to the dropdown
    transitionOptions.forEach((option) => {
      const transitionOption = document.createElement("div");
      transitionOption.className = "effect-option"; // Using effect-option style
      transitionOption.innerHTML = `<i class="${option.icon || 'fas fa-exchange-alt'}"></i> ${option.name}`;

      // Lưu trữ đầy đủ thông tin cho mỗi transition
      transitionOption.dataset.name = option.name;
      transitionOption.dataset.icon = option.icon || 'fas fa-exchange-alt';
      transitionOption.dataset.effectId = option.effect_id || "";
      transitionOption.dataset.isOverlap = option.is_overlap;
      transitionOption.dataset.duration = option.duration;
      transitionOption.dataset.categoryId = option.category_id || "";
      transitionOption.dataset.categoryName = option.category_name || "";
      transitionOption.dataset.path = option.path || "";
      transitionOption.dataset.platform = option.platform || "";
      transitionOption.dataset.resourceId = option.resource_id || "";
      transitionOption.dataset.sourcePlatform = option.source_platform || 0;

      transitionOption.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (currentSelectedTransition) {
          // Update the selected transition display
          const optionName = this.dataset.name;
          const iconClass = this.dataset.icon;
          currentSelectedTransition.innerHTML = `<i class="${iconClass}"></i> ${optionName}`;

          // Lưu tất cả thông tin transition vào selected element
          currentSelectedTransition.dataset.effectId = this.dataset.effectId;
          currentSelectedTransition.dataset.isOverlap = this.dataset.isOverlap;
          currentSelectedTransition.dataset.duration = this.dataset.duration;
          currentSelectedTransition.dataset.categoryId =
            this.dataset.categoryId;
          currentSelectedTransition.dataset.categoryName =
            this.dataset.categoryName;
          currentSelectedTransition.dataset.path = this.dataset.path;
          currentSelectedTransition.dataset.platform = this.dataset.platform;
          currentSelectedTransition.dataset.resourceId =
            this.dataset.resourceId;
          currentSelectedTransition.dataset.sourcePlatform =
            this.dataset.sourcePlatform;

          // Close the dropdown
          hideTransitionsDropdown();
        }
      };
      dropdown.appendChild(transitionOption);
    });

    // Add the dropdown to the document body
    document.body.appendChild(dropdown);

    // Store the dropdown for later use
    globalTransitionsDropdown = dropdown;

    return dropdown;
  }

  // Function to show the transitions dropdown for a specific transition
  function showTransitionsDropdown(button) {
    // Get the transition container
    const transitionsContainer = button.closest(".transitions-container");
    const selectedTransition = transitionsContainer.querySelector(
      ".selected-transition"
    );
    const thumbnailItem = transitionsContainer.parentElement;

    // Update global references
    currentTransitionThumbnailItem = thumbnailItem;
    currentTransitionButton = button;
    currentSelectedTransition = selectedTransition;

    // Make sure we have the global dropdown
    if (!globalTransitionsDropdown) {
      globalTransitionsDropdown = createGlobalTransitionsDropdown();
    }

    // Update the selected state in dropdown
    const currentTransitionName = selectedTransition.textContent
      .trim()
      .replace(/^\S+\s+/, "");
    const currentEffectId = selectedTransition.dataset.effectId || "";

    const options =
      globalTransitionsDropdown.querySelectorAll(".effect-option");
    options.forEach((option) => {
      const optionName = option.dataset.name;
      const optionEffectId = option.dataset.effectId || "";

      // Mark as selected if name matches or if effect_id matches (when available)
      const isSelected =
        optionName === currentTransitionName ||
        (currentEffectId && optionEffectId === currentEffectId);

      option.classList.toggle("selected", isSelected);
    });

    // Position and show the dropdown
    positionTransitionsDropdown(transitionsContainer);
    globalTransitionsDropdown.classList.add("show");
  }

  // Function to hide the transitions dropdown
  function hideTransitionsDropdown() {
    if (globalTransitionsDropdown) {
      globalTransitionsDropdown.classList.remove("show");
    }

    // Clear references
    currentTransitionThumbnailItem = null;
    currentTransitionButton = null;
    currentSelectedTransition = null;
  }

  // Function to position the transitions dropdown over a transition container
  function positionTransitionsDropdown(transitionsContainer) {
    if (!globalTransitionsDropdown) return;

    const containerRect = transitionsContainer.getBoundingClientRect();

    // Style the dropdown
    globalTransitionsDropdown.style.position = "fixed";
    globalTransitionsDropdown.style.zIndex = "10000";
    globalTransitionsDropdown.style.width = "250px";
    globalTransitionsDropdown.style.maxHeight = "350px";

    // Position to the right of the transition container
    globalTransitionsDropdown.style.left = containerRect.right + 10 + "px";
    globalTransitionsDropdown.style.top = containerRect.top + "px";

    // Check if dropdown would go off-screen to the right
    const dropdownRect = globalTransitionsDropdown.getBoundingClientRect();
    if (dropdownRect.right > window.innerWidth) {
      // Position to the left of the transition container
      globalTransitionsDropdown.style.left =
        containerRect.left - dropdownRect.width - 10 + "px";
    }

    // Check if dropdown would go off-screen at the bottom
    if (dropdownRect.bottom > window.innerHeight) {
      globalTransitionsDropdown.style.top =
        window.innerHeight - dropdownRect.height - 10 + "px";
    }
  }

  // Function to toggle transitions dropdown
  function toggleTransitionsDropdown(button) {
    // Check if this button's dropdown is already shown
    if (
      currentTransitionButton === button &&
      globalTransitionsDropdown &&
      globalTransitionsDropdown.classList.contains("show")
    ) {
      // If already open, close it
      hideTransitionsDropdown();
    } else {
      // Close effects dropdowns
      document.querySelectorAll(".effects-dropdown.show").forEach((item) => {
        if (item.id !== "global-transitions-dropdown") {
          item.classList.remove("show");
        }
      });

      // Hide effects dropdown if it's open
      if (
        globalEffectsDropdown &&
        globalEffectsDropdown.classList.contains("show")
      ) {
        hideEffectsDropdown();
      }

      // Show this dropdown
      showTransitionsDropdown(button);
    }
  }

  /**
   * Cập nhật danh sách effects, transitions và material animations từ các file JSON riêng biệt
   * @param {string} type Loại dữ liệu cần cập nhật ('effects', 'transitions', 'materials')
   * @param {Object} data Nội dung của file JSON tương ứng
   */
  function updateEffectsAndTransitions(type, data) {
    try {
      if (!type || !data) {
        console.warn("Missing type or data for updateEffectsAndTransitions");
        return;
      }

      switch (type) {
        case 'effects':
          // Cập nhật effects từ draft_content_effect.json
          if (EffectManager && typeof EffectManager.updateFromDraftContent === 'function') {
            EffectManager.updateFromDraftContent(data);
            console.log("Effects updated from draft_content_effect.json");
          }
          break;

        case 'transitions':
          // Cập nhật transitions từ draft_content_transition.json
          if (TransitionManager && typeof TransitionManager.updateFromDraftContent === 'function') {
            TransitionManager.updateFromDraftContent(data);
            console.log("Transitions updated from draft_content_transition.json");
          }
          break;

        case 'materials':
          // Cập nhật material animations từ draft_content_material.json
          if (MaterialManager && typeof MaterialManager.updateFromDraftContent === 'function') {
            MaterialManager.updateFromDraftContent(data);
            console.log("Material animations updated from draft_content_material.json");
          }
          break;

        default:
          console.warn(`Unknown update type: ${type}`);
          return;
      }

      // Tạo lại các dropdown để hiển thị danh sách đã cập nhật
      createGlobalEffectsDropdown();
      createGlobalTransitionsDropdown();
    } catch (error) {
      console.error("Error updating effects and transitions:", error);
    }
  }

  // Initialize all UI components
  function init() {
    initTabSwitching();
    initSettingsPopup();
    initBrowseButtons();
    initProjectCreationButton();
    initResetButton();
  }

  // Public API
  return {
    init,
    loadSavedSettings,
    showNotification,
    dismissNotification,
    resetContent,
    createGlobalEffectsDropdown,
    createGlobalTransitionsDropdown,
    toggleEffectsDropdown,
    toggleTransitionsDropdown,
    showEffectDurationInput,
    hideEffectDurationInput,
    updateEffectsAndTransitions
  };
})();
