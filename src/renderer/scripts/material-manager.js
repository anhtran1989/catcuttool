/**
 * Material Animation Manager - Quản lý và cập nhật danh sách material animations
 */
const MaterialManager = (function () {
  // Danh sách các material animations đã được lưu
  let materialAnimations = [];

  /**
   * Lấy danh sách material animations hiện tại
   * @returns {Array} Danh sách material animations
   */
  function getMaterialAnimations() {
    return materialAnimations;
  }

  /**
   * Lấy danh sách material animations theo loại (in, out, group)
   * @param {string} type Loại animation cần lọc (in, out, group)
   * @returns {Array} Danh sách material animations theo loại
   */
  function getMaterialAnimationsByType(type) {
    if (!type) return materialAnimations;
    
    // Lọc animations theo loại và thêm tùy chọn None vào đầu danh sách
    const noneOption = materialAnimations.find(a => a.name === "None");
    const filteredAnimations = materialAnimations.filter(a => a.type === type);
    
    return noneOption ? [noneOption, ...filteredAnimations] : filteredAnimations;
  }

  /**
   * Lấy danh sách material animations hiệu ứng vào (in)
   * @returns {Array} Danh sách hiệu ứng vào
   */
  function getInAnimations() {
    return getMaterialAnimationsByType("in");
  }

  /**
   * Lấy danh sách material animations hiệu ứng ra (out)
   * @returns {Array} Danh sách hiệu ứng ra
   */
  function getOutAnimations() {
    return getMaterialAnimationsByType("out");
  }

  /**
   * Lấy danh sách material animations hiệu ứng kết hợp (group)
   * @returns {Array} Danh sách hiệu ứng kết hợp
   */
  function getGroupAnimations() {
    return getMaterialAnimationsByType("group");
  }

  /**
   * Cập nhật danh sách material animations từ file draft_content.json
   * @param {Object} draftContent Nội dung của file draft_content.json
   */
  function updateFromDraftContent(draftContent) {
    try {
      if (!draftContent || !draftContent.materials || !draftContent.materials.material_animations) {
        console.error("Invalid draft content format");
        return;
      }

      const newAnimations = [];
      
      // Duyệt qua các material_animations trong draft content
      draftContent.materials.material_animations.forEach(material => {
        if (material.animations && Array.isArray(material.animations)) {
          // Duyệt qua các animations trong mỗi material_animation
          material.animations.forEach(animation => {
            newAnimations.push({
              name: animation.name,
              animation_id: animation.id,
              category_id: animation.category_id || "",
              category_name: animation.category_name || "",
              type: animation.type || "", // in, out, group
              duration: animation.duration || 0,
              material_type: animation.material_type || "video",
              path: animation.path || "",
              platform: animation.platform || "all",
              resource_id: animation.resource_id || animation.id,
              source_platform: animation.source_platform || 1,
              start: animation.start || 0,
              icon: getIconForMaterialAnimation(animation.type, animation.name)
            });
          });
        }
      });

      // Cập nhật danh sách material animations
      mergeMaterialAnimations(newAnimations);
      
      console.log(`Updated material animations list: ${materialAnimations.length} animations available`);
    } catch (error) {
      console.error("Error updating material animations from draft content:", error);
    }
  }

  /**
   * Cập nhật hoặc thêm mới material animations vào danh sách
   * @param {Array} newAnimations Danh sách material animations mới
   */
  function mergeMaterialAnimations(newAnimations) {
    if (!Array.isArray(newAnimations)) return;

    // Luôn đảm bảo có tùy chọn "None"
    const hasNone = materialAnimations.some(a => a.name === "None");
    if (!hasNone) {
      materialAnimations.push({
        name: "None",
        animation_id: "none",
        type: "all",
        icon: "fas fa-ban"
      });
    }

    // Thêm hoặc cập nhật các animation mới
    newAnimations.forEach(newAnimation => {
      const existingIndex = materialAnimations.findIndex(a => 
        a.animation_id === newAnimation.animation_id && a.type === newAnimation.type
      );
      
      if (existingIndex >= 0) {
        // Cập nhật animation đã tồn tại
        materialAnimations[existingIndex] = {
          ...materialAnimations[existingIndex],
          ...newAnimation
        };
      } else {
        // Thêm mới animation
        materialAnimations.push(newAnimation);
      }
    });
  }

  /**
   * Lấy biểu tượng phù hợp cho material animation dựa trên loại và tên
   * @param {string} type Loại animation (in, out, group)
   * @param {string} name Tên animation
   * @returns {string} Class của biểu tượng
   */
  function getIconForMaterialAnimation(type, name) {
    if (!type) return "fas fa-magic";
    
    const nameLower = (name || "").toLowerCase();
    
    // Xác định icon dựa trên loại animation
    switch (type) {
      case "in":
        return nameLower.includes("fade") ? "fas fa-sign-in-alt" : "fas fa-arrow-right";
      case "out":
        return nameLower.includes("fade") ? "fas fa-sign-out-alt" : "fas fa-arrow-left";
      case "group":
        return "fas fa-object-group";
      default:
        return "fas fa-magic";
    }
  }

  /**
   * Khởi tạo danh sách material animations mặc định
   */
  function initializeDefaultMaterialAnimations() {
    const defaultAnimations = [
      {
        name: "None",
        animation_id: "none",
        type: "all",
        icon: "fas fa-ban"
      },
      {
        name: "Fade In",
        animation_id: "fade_in",
        type: "in",
        icon: "fas fa-sign-in-alt"
      },
      {
        name: "Slide In",
        animation_id: "slide_in",
        type: "in",
        icon: "fas fa-arrow-right"
      },
      {
        name: "Zoom In",
        animation_id: "zoom_in",
        type: "in",
        icon: "fas fa-search-plus"
      },
      {
        name: "Fade Out",
        animation_id: "fade_out",
        type: "out",
        icon: "fas fa-sign-out-alt"
      },
      {
        name: "Slide Out",
        animation_id: "slide_out",
        type: "out",
        icon: "fas fa-arrow-left"
      },
      {
        name: "Zoom Out",
        animation_id: "zoom_out",
        type: "out",
        icon: "fas fa-search-minus"
      },
      {
        name: "Group Fade",
        animation_id: "group_fade",
        type: "group",
        icon: "fas fa-object-group"
      },
      {
        name: "Group Slide",
        animation_id: "group_slide",
        type: "group",
        icon: "fas fa-object-group"
      }
    ];
    
    // Thêm các animation mặc định vào danh sách
    mergeMaterialAnimations(defaultAnimations);
  }

  /**
   * Tạo các dropdown menu cho material animations
   * @param {HTMLElement} container Element chứa dropdown
   * @param {string} type Loại animation (in, out, group)
   * @param {Function} onSelect Callback khi chọn animation
   */
  function createAnimationDropdown(container, type, onSelect) {
    if (!container) return null;
    
    // Lấy danh sách animation theo loại
    const animations = getMaterialAnimationsByType(type);
    
    // Tạo dropdown menu
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu animation-dropdown";
    
    // Thêm các mục animation vào dropdown
    animations.forEach(animation => {
      const item = document.createElement("a");
      item.className = "dropdown-item";
      item.setAttribute("data-animation-id", animation.animation_id || "");
      item.setAttribute("data-animation-type", animation.type || "");
      
      // Tạo icon nếu có
      if (animation.icon) {
        const icon = document.createElement("i");
        icon.className = animation.icon;
        icon.style.marginRight = "8px";
        item.appendChild(icon);
      }
      
      // Thêm tên animation
      const text = document.createTextNode(animation.name);
      item.appendChild(text);
      
      // Xử lý sự kiện click
      item.addEventListener("click", function() {
        if (typeof onSelect === "function") {
          onSelect(animation);
        }
        
        // Đóng dropdown
        dropdownMenu.classList.remove("show");
      });
      
      dropdownMenu.appendChild(item);
    });
    
    // Thêm dropdown vào container
    container.appendChild(dropdownMenu);
    
    return dropdownMenu;
  }

  /**
   * Hiển thị dropdown khi click vào nút
   * @param {HTMLElement} button Nút được click
   * @param {HTMLElement} dropdown Dropdown cần hiển thị
   */
  function toggleDropdown(button, dropdown) {
    if (!button || !dropdown) return;
    
    button.addEventListener("click", function(event) {
      event.stopPropagation();
      dropdown.classList.toggle("show");
      
      // Định vị dropdown dưới nút
      const rect = button.getBoundingClientRect();
      dropdown.style.position = "absolute";
      dropdown.style.top = `${rect.bottom}px`;
      dropdown.style.left = `${rect.left}px`;
      
      // Đóng dropdown khi click ngoài
      function closeDropdown(e) {
        if (!dropdown.contains(e.target) && e.target !== button) {
          dropdown.classList.remove("show");
          document.removeEventListener("click", closeDropdown);
        }
      }
      
      document.addEventListener("click", closeDropdown);
    });
  }

  /**
   * Thêm các button animation (Vào, Kết hợp, Ra) vào thumbnail
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyAnimation - Callback function to apply animation
   */
  function addAnimationButtons(thumbnailItem, fileData, onApplyAnimation) {
    if (!thumbnailItem) return;
    
    // Tạo container cho các button
    const animationButtonsContainer = document.createElement('div');
    animationButtonsContainer.className = 'animation-buttons';
    
    // Tạo button Vào (In animation)
    const inButton = document.createElement('button');
    inButton.className = 'animation-in-button';
    inButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Vào';
    inButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'in', fileData, onApplyAnimation);
    };
    
    // Tạo button Kết hợp (Group animation)
    const groupButton = document.createElement('button');
    groupButton.className = 'animation-group-button';
    groupButton.innerHTML = '<i class="fas fa-object-group"></i> Kết hợp';
    groupButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'group', fileData, onApplyAnimation);
    };
    
    // Tạo button Ra (Out animation)
    const outButton = document.createElement('button');
    outButton.className = 'animation-out-button';
    outButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Ra';
    outButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'out', fileData, onApplyAnimation);
    };
    
    // Thêm các button vào container
    animationButtonsContainer.appendChild(inButton);
    animationButtonsContainer.appendChild(groupButton);
    animationButtonsContainer.appendChild(outButton);
    
    // Tìm phần tử media (img hoặc video) trong thumbnail item
    const mediaElement = thumbnailItem.querySelector('img') || thumbnailItem.querySelector('video');
  
    if (mediaElement) {
      // Tạo container để chứa các nút animation phía trên media
      const animationContainer = document.createElement('div');
      animationContainer.className = 'animation-container';
      
      // Thêm container nút vào animation container
      animationContainer.appendChild(animationButtonsContainer);
      
      // Tìm phần tử cha của media để chèn animation container vào đúng vị trí
      const mediaParent = mediaElement.parentElement;
      
      // Chèn animation container vào trước media element
      if (mediaParent) {
        mediaParent.insertBefore(animationContainer, mediaElement);
      } else {
        // Fallback nếu không tìm thấy mediaParent
        thumbnailItem.appendChild(animationButtonsContainer);
      }
    } else {
      // Nếu không tìm thấy media element, thêm vào thumbnail item như bình thường
      thumbnailItem.appendChild(animationButtonsContainer);
    }
  }

  /**
   * Hiển thị dropdown chọn animation
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {string} animationType - Loại animation (in, group, out)
   * @param {Object} fileData - File data
   * @param {Function} onApplyAnimation - Callback function to apply animation
   */
  function showAnimationDropdown(thumbnailItem, animationType, fileData, onApplyAnimation) {
    // Đóng tất cả các dropdown đang mở
    const existingDropdowns = document.querySelectorAll('.animation-dropdown');
    existingDropdowns.forEach(dropdown => dropdown.remove());
    
    // Tạo dropdown mới
    const dropdown = document.createElement('div');
    dropdown.className = 'animation-dropdown show';
    
    // Tính toán vị trí hiển thị dropdown
    const buttonRect = event.target.closest('button').getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Đặt vị trí cố định cho dropdown
    dropdown.style.position = 'fixed';
    dropdown.style.zIndex = '10000'; // Đảm bảo dropdown hiển thị trên cùng
    
    // Tạo tiêu đề cho dropdown
    const header = document.createElement('div');
    header.className = 'animation-dropdown-header';
    const animationTypeDisplay = {
      'in': 'Hiệu ứng Vào',
      'out': 'Hiệu ứng Ra',
      'group': 'Hiệu ứng Kết hợp'
    };
    header.textContent = animationTypeDisplay[animationType];
    dropdown.appendChild(header);
    
    // Lấy danh sách animation theo loại
    let animations = [];
    if (animationType === 'in') {
      animations = getInAnimations();
    } else if (animationType === 'out') {
      animations = getOutAnimations();
    } else if (animationType === 'group') {
      animations = getGroupAnimations();
    }
    
    // Tạo container cho danh sách animation
    const animationList = document.createElement('div');
    animationList.className = 'animation-list';
    
    // Thêm tùy chọn None
    const noneItem = document.createElement('div');
    noneItem.className = 'animation-dropdown-item';
    noneItem.innerHTML = '<i class="fas fa-ban"></i> None';
    noneItem.onclick = function(e) {
      e.stopPropagation();
      onApplyAnimation(fileData, { name: 'None', icon: 'fas fa-ban' }, animationType);
      dropdown.remove();
    };
    animationList.appendChild(noneItem);
    
    // Thêm các animation vào dropdown
    animations.forEach(animation => {
      const item = document.createElement('div');
      item.className = 'animation-dropdown-item';
      item.innerHTML = `<i class="${animation.icon || 'fas fa-magic'}"></i> ${animation.name}`;
      item.onclick = function(e) {
        e.stopPropagation();
        onApplyAnimation(fileData, animation, animationType);
        dropdown.remove();
      };
      animationList.appendChild(item);
    });
    
    // Thêm danh sách animation vào dropdown
    dropdown.appendChild(animationList);
    
    // Thêm dropdown vào document body
    document.body.appendChild(dropdown);
    
    // Tính toán vị trí sau khi đã thêm vào DOM để có kích thước thực
    const dropdownRect = dropdown.getBoundingClientRect();
    
    // Kiểm tra và điều chỉnh vị trí để tránh tràn ra ngoài viewport
    // Kiểm tra phía dưới
    if (buttonRect.bottom + dropdownRect.height > viewportHeight) {
      dropdown.style.top = `${buttonRect.top - dropdownRect.height}px`;
    } else {
      dropdown.style.top = `${buttonRect.bottom + 5}px`;
    }
    
    // Kiểm tra phía phải
    if (buttonRect.left + dropdownRect.width > viewportWidth) {
      dropdown.style.left = `${viewportWidth - dropdownRect.width - 10}px`;
    } else {
      dropdown.style.left = `${buttonRect.left}px`;
    }
    
    // Thêm sự kiện click ngoài dropdown để đóng
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && 
            !e.target.closest('.animation-in-button') && 
            !e.target.closest('.animation-group-button') && 
            !e.target.closest('.animation-out-button')) {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 100); // Delay nhỏ để tránh đóng dropdown ngay lập tức
  }

  /**
   * Khởi tạo MaterialManager
   */
  function init() {
    // Khởi tạo danh sách material animations mặc định
    initializeDefaultMaterialAnimations();
    
    console.log("Material Animation Manager initialized");
  }

  // Public API
  return {
    init,
    getMaterialAnimations,
    getInAnimations,
    getOutAnimations,
    getGroupAnimations,
    updateFromDraftContent,
    mergeMaterialAnimations,
    addAnimationButtons,
    showAnimationDropdown
  };
})();
