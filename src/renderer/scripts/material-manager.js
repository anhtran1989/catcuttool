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
   * Lấy danh sách material animations theo loại (in, out, combo)
   * @param {string} type Loại animation cần lọc (in, out, combo)
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
   * Lấy danh sách material animations hiệu ứng kết hợp (combo)
   * @returns {Array} Danh sách hiệu ứng kết hợp
   */
  function getGroupAnimations() {
    return getMaterialAnimationsByType("combo");
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
              type: animation.type || "", // in, out, combo
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

    // Duyệt qua từng animation mới
    newAnimations.forEach(newAnimation => {
      // Kiểm tra xem animation đã tồn tại chưa
      const existingIndex = materialAnimations.findIndex(a => 
        a.animation_id === newAnimation.animation_id || 
        (a.name === newAnimation.name && a.type === newAnimation.type)
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
   * @param {string} type Loại animation (in, out, combo)
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
      case "combo":
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
        name: "Combo Fade",
        animation_id: "combo_fade",
        type: "combo",
        icon: "fas fa-object-group"
      },
      {
        name: "Combo Slide",
        animation_id: "combo_slide",
        type: "combo",
        icon: "fas fa-object-group"
      }
    ];
    
    // Thêm các animation mặc định vào danh sách
    mergeMaterialAnimations(defaultAnimations);
  }

  /**
   * Thêm các button animation (Vào, Kết hợp, Ra) vào thumbnail
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyAnimation - Callback function to apply animation
   */
  function addAnimationButtons(thumbnailItem, fileData, onApplyAnimation) {
    if (!thumbnailItem) return;
    
    // Tạo container cho các nút animation
    const animationButtonsContainer = document.createElement('div');
    animationButtonsContainer.className = 'animation-buttons';

    // Nút Animation Vào (In)
    const inButton = document.createElement('button');
    inButton.className = 'animation-in-button';
    inButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Vào';
    inButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'in', fileData, onApplyAnimation);
    };
    animationButtonsContainer.appendChild(inButton);

    // Nút Animation Kết hợp (Combo)
    const comboButton = document.createElement('button');
    comboButton.className = 'animation-combo-button';
    comboButton.innerHTML = '<i class="fas fa-object-group"></i> Kết hợp';
    comboButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'combo', fileData, onApplyAnimation);
    };
    animationButtonsContainer.appendChild(comboButton);

    // Nút Animation Ra (Out)
    const outButton = document.createElement('button');
    outButton.className = 'animation-out-button';
    outButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Ra';
    outButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'out', fileData, onApplyAnimation);
    };
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
   * @param {string} animationType - Loại animation (in, combo, out)
   * @param {Object} fileData - File data
   * @param {Function} onApplyAnimation - Callback function to apply animation
   */
  function showAnimationDropdown(thumbnailItem, animationType, fileData, onApplyAnimation) {
    // Xóa dropdown cũ nếu có
    const existingDropdowns = document.querySelectorAll('.animation-dropdown');
    existingDropdowns.forEach(dropdown => dropdown.remove());
    
    // Tạo dropdown mới
    const dropdown = document.createElement('div');
    dropdown.className = 'animation-dropdown';

    // Thêm tiêu đề cho dropdown
    const dropdownHeader = document.createElement('div');
    dropdownHeader.className = 'animation-dropdown-header';
    
    let headerText = '';
    switch (animationType) {
      case 'in':
        headerText = 'Hiệu ứng vào';
        break;
      case 'out':
        headerText = 'Hiệu ứng ra';
        break;
      case 'combo':
        headerText = 'Hiệu ứng kết hợp';
        break;
      default:
        headerText = 'Chọn hiệu ứng';
    }
    
    dropdownHeader.textContent = headerText;
    dropdown.appendChild(dropdownHeader);

    // Tạo danh sách hiệu ứng
    const animationList = document.createElement('div');
    animationList.className = 'animation-list';

    // Lấy danh sách hiệu ứng từ MaterialManager dựa vào loại (in, out, combo)
    let animations = [];
    switch (animationType) {
      case 'in':
        animations = getInAnimations();
        break;
      case 'out':
        animations = getOutAnimations();
        break;
      case 'combo':
        animations = getGroupAnimations();
        break;
      default:
        animations = getMaterialAnimations();
    }

    // Thêm tùy chọn 'Không có hiệu ứng'
    const noneItem = document.createElement('div');
    noneItem.className = 'animation-dropdown-item';
    noneItem.innerHTML = '<i class="fas fa-ban"></i> Không có hiệu ứng';
    noneItem.addEventListener('click', () => {
      onApplyAnimation(fileData, 'none', animationType);
      dropdown.classList.remove('show');
      setTimeout(() => dropdown.remove(), 100);
    });
    animationList.appendChild(noneItem);

    // Thêm các hiệu ứng vào danh sách
    animations.forEach(animation => {
      const item = document.createElement('div');
      item.className = 'animation-dropdown-item';
      item.innerHTML = `<i class="${animation.icon}"></i> ${animation.name}`;
      item.addEventListener('click', () => {
        onApplyAnimation(fileData, animation.animation_id, animationType);
        dropdown.classList.remove('show');
        setTimeout(() => dropdown.remove(), 100);
      });
      animationList.appendChild(item);
    });

    dropdown.appendChild(animationList);
    document.body.appendChild(dropdown);

    // Định vị dropdown dựa trên vị trí của nút được nhấp
    const button = thumbnailItem.querySelector(`.animation-${animationType}-button`);
    if (button) {
      const buttonRect = button.getBoundingClientRect();
      const dropdownHeight = dropdown.offsetHeight;
      const dropdownWidth = dropdown.offsetWidth;
      
      // Tính toán vị trí để tránh dropdown bị tràn ra ngoài viewport
      let top = buttonRect.bottom + 5;
      let left = buttonRect.left;
      
      // Kiểm tra nếu dropdown sẽ bị tràn ra dưới viewport
      if (top + dropdownHeight > window.innerHeight) {
        top = buttonRect.top - dropdownHeight - 5;
      }
      
      // Kiểm tra nếu dropdown sẽ bị tràn ra phải viewport
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 5;
      }
      
      dropdown.style.top = `${top}px`;
      dropdown.style.left = `${left}px`;
    }

    // Hiển thị dropdown
    setTimeout(() => {
      dropdown.classList.add('show');
    }, 10);

    // Đóng dropdown khi click ra ngoài
    const closeDropdown = (event) => {
      if (!dropdown.contains(event.target) && event.target !== button) {
        dropdown.classList.remove('show');
        setTimeout(() => {
          dropdown.remove();
          document.removeEventListener('click', closeDropdown);
        }, 100);
      }
    };

    // Thêm một chút delay trước khi thêm event listener để tránh đóng dropdown ngay lập tức
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 100);
  }

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
