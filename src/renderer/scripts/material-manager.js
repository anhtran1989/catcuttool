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
        animation_id: null,
        category_id: "",
        category_name: "",
        type: "",
        duration: 0,
        material_type: "video",
        path: "",
        platform: "all",
        resource_id: "",
        source_platform: 0,
        start: 0,
        icon: "fas fa-ban"
      });
    }

    newAnimations.forEach(newAnimation => {
      // Kiểm tra xem animation đã tồn tại chưa dựa trên animation_id
      const existingIndex = materialAnimations.findIndex(a => 
        (a.animation_id === newAnimation.animation_id && a.animation_id !== null) || 
        (a.name === newAnimation.name && a.type === newAnimation.type)
      );
      
      if (existingIndex >= 0) {
        // Cập nhật animation đã tồn tại
        materialAnimations[existingIndex] = {
          ...materialAnimations[existingIndex],
          ...newAnimation
        };
      } else {
        // Thêm animation mới
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
    // Biểu tượng dựa trên loại animation
    const typeIcons = {
      "in": "fas fa-sign-in-alt",
      "out": "fas fa-sign-out-alt",
      "group": "fas fa-object-group"
    };
    
    // Biểu tượng dựa trên tên cụ thể
    const nameIcons = {
      "Thu phóng 1": "fas fa-search-plus",
      "Thu phóng 2": "fas fa-expand",
      "Hố đen": "fas fa-dot-circle",
      "Tan rã": "fas fa-puzzle-piece",
      "Lật trang": "fas fa-book-open",
      "Làm mờ": "fas fa-eye-slash",
      "Cổ điển": "fas fa-film",
      "Xoay 3D": "fas fa-cube"
    };
    
    // Ưu tiên biểu tượng dựa trên tên, nếu không có thì dùng biểu tượng dựa trên loại
    return nameIcons[name] || typeIcons[type] || "fas fa-magic"; // Default icon
  }

  /**
   * Khởi tạo danh sách material animations mặc định
   */
  function initializeDefaultMaterialAnimations() {
    materialAnimations = [
      {
        name: "None",
        animation_id: null,
        category_id: "",
        category_name: "",
        type: "",
        duration: 0,
        material_type: "video",
        path: "",
        platform: "all",
        resource_id: "",
        source_platform: 0,
        start: 0,
        icon: "fas fa-ban"
      },
      {
        name: "Thu phóng 1",
        animation_id: "6740868384637850120",
        category_id: "6824",
        category_name: "Vào",
        type: "in",
        duration: 500000,
        material_type: "video",
        path: "",
        platform: "all",
        resource_id: "6740868384637850120",
        source_platform: 1,
        start: 0,
        icon: "fas fa-search-plus"
      },
      {
        name: "Thu phóng 2",
        animation_id: "6779083172429697544",
        category_id: "6826",
        category_name: "Kết hợp",
        type: "group",
        duration: 3766667,
        material_type: "video",
        path: "",
        platform: "all",
        resource_id: "6779083172429697544",
        source_platform: 1,
        start: 500000,
        icon: "fas fa-expand"
      },
      {
        name: "Hố đen",
        animation_id: "7294461821170225666",
        category_id: "6825",
        category_name: "Ra",
        type: "out",
        duration: 733333,
        material_type: "video",
        path: "",
        platform: "all",
        resource_id: "7294461821170225666",
        source_platform: 1,
        start: 4600000,
        icon: "fas fa-dot-circle"
      }
    ];
    
    console.log("Initialized default material animations");
  }
  
  /**
   * Tạo các dropdown menu cho material animations
   * @param {HTMLElement} container Element chứa dropdown
   * @param {string} type Loại animation (in, out, group)
   * @param {Function} onSelect Callback khi chọn animation
   */
  function createAnimationDropdown(container, type, onSelect) {
    if (!container) return;
    
    // Lấy danh sách animations theo loại
    let animations = [];
    switch (type) {
      case "in":
        animations = getInAnimations();
        break;
      case "out":
        animations = getOutAnimations();
        break;
      case "group":
        animations = getGroupAnimations();
        break;
      default:
        animations = getMaterialAnimations();
    }
    
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
      const closeDropdown = function(e) {
        if (!dropdown.contains(e.target) && e.target !== button) {
          dropdown.classList.remove("show");
          document.removeEventListener("click", closeDropdown);
        }
      };
      
      document.addEventListener("click", closeDropdown);
    });
  }
  
  /**
   * Thêm các nút hiệu ứng (in, out, group) vào mỗi item (ảnh/video)
   * @param {HTMLElement} item Element chứa ảnh/video
   * @param {Object} data Dữ liệu của ảnh/video
   * @param {Function} onApplyAnimation Callback khi áp dụng animation
   */
  function addAnimationButtons(item, data, onApplyAnimation) {
    if (!item) return;
    
    // Tạo container cho các nút
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "animation-buttons";
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";
    buttonContainer.style.marginTop = "5px";
    
    // Tạo nút hiệu ứng vào (in)
    const inButton = document.createElement("button");
    inButton.className = "btn btn-sm btn-outline-primary";
    inButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Vào';
    
    // Tạo nút hiệu ứng kết hợp (group)
    const groupButton = document.createElement("button");
    groupButton.className = "btn btn-sm btn-outline-secondary";
    groupButton.innerHTML = '<i class="fas fa-object-group"></i> Kết hợp';
    
    // Tạo nút hiệu ứng ra (out)
    const outButton = document.createElement("button");
    outButton.className = "btn btn-sm btn-outline-danger";
    outButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Ra';
    
    // Thêm các nút vào container
    buttonContainer.appendChild(inButton);
    buttonContainer.appendChild(groupButton);
    buttonContainer.appendChild(outButton);
    
    // Tạo các dropdown
    const inDropdown = createAnimationDropdown(buttonContainer, "in", animation => {
      if (typeof onApplyAnimation === "function") {
        onApplyAnimation(data, animation, "in");
      }
    });
    
    const groupDropdown = createAnimationDropdown(buttonContainer, "group", animation => {
      if (typeof onApplyAnimation === "function") {
        onApplyAnimation(data, animation, "group");
      }
    });
    
    const outDropdown = createAnimationDropdown(buttonContainer, "out", animation => {
      if (typeof onApplyAnimation === "function") {
        onApplyAnimation(data, animation, "out");
      }
    });
    
    // Thêm sự kiện click cho các nút
    toggleDropdown(inButton, inDropdown);
    toggleDropdown(groupButton, groupDropdown);
    toggleDropdown(outButton, outDropdown);
    
    // Thêm container vào item
    item.appendChild(buttonContainer);
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
    createAnimationDropdown,
    addAnimationButtons
  };
})(); 