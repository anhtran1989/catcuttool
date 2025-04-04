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
   * Lấy danh sách hiệu ứng cho một loại cụ thể
   * @param {string} type Loại hiệu ứng (in, out, group)
   * @returns {Array} Danh sách hiệu ứng
   */
  function getMaterialAnimationsByType(type) {
    if (!type) return materialAnimations;
    
    // Đảm bảo type hợp lệ
    if (!['in', 'out', 'group'].includes(type)) {
      console.warn(`Invalid animation type: ${type}. Must be one of: in, out, group`);
      return [];
    }
    
    // Tạo "None" option với cấu trúc giống với material animation thật
    const noneOption = {
      name: "None",
      animation_id: "none",
      id: "none",
      category_id: "",
      category_name: type === 'in' ? "Vào" : (type === 'out' ? "Ra" : "Kết hợp"),
      duration: 0,
      material_type: "video",
      panel: "video",
      path: "",
      platform: "all",
      resource_id: "none",
      source_platform: 1,
      start: 0,
      third_resource_id: "none",
      type: type,
      icon: "fas fa-ban"
    };
    
    console.log(`Getting animations for type: ${type}`);
    console.log(`Total animations available: ${materialAnimations.length}`);
    
    // Lọc chính xác theo type (in, out, group)
    const filteredAnimations = materialAnimations.filter(a => a.type === type);
    console.log(`Found ${filteredAnimations.length} animations of type ${type}`);
    
    return [noneOption, ...filteredAnimations];
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
   * Cập nhật danh sách hiệu ứng từ draft_content.json
   * @param {Object} draftContent Nội dung draft_content.json
   */
  function updateFromDraftContent(draftContent) {
    try {
      if (!draftContent) {
        console.warn("Không tìm thấy dữ liệu trong draft_content.json");
        return;
      }

      const newAnimations = [];
      console.log("Đang xử lý draft content...");

      // Kiểm tra cụ thể cho cấu trúc material_animations
      if (draftContent.materials && draftContent.materials.material_animations) {
        console.log("Tìm thấy cấu trúc material_animations");
        
        // Xử lý cấu trúc material_animations theo mẫu của người dùng
        const materialAnimationsData = draftContent.materials.material_animations;
        
        if (Array.isArray(materialAnimationsData)) {
          materialAnimationsData.forEach(material => {
            console.log(`Xử lý container material_animations với ID: ${material.id}`);
            
            // Kiểm tra nếu material có mảng animations
            if (material.animations && Array.isArray(material.animations)) {
              material.animations.forEach(animation => {
                if (!animation) return;
                
                // Kiểm tra các thuộc tính cần thiết
                if (animation.name && animation.type && (animation.duration !== undefined || animation.id)) {
                  // Kiểm tra type hợp lệ
                  if (['in', 'out', 'group'].includes(animation.type)) {
                    console.log(`Tìm thấy animation: ${animation.name}, Type: ${animation.type}`);
                    
                    // Tạo animation mới
                    const newAnimation = { ...animation };
                    newAnimation.animation_id = animation.id || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    newAnimation.icon = getIconForMaterialAnimation(animation.type, animation.name);
                    newAnimation.parent_id = material.id; // Lưu ID của thành phần cha
                    
                    // Đảm bảo có category_name
                    if (!newAnimation.category_name) {
                      newAnimation.category_name = animation.type === 'in' ? "Vào" : (animation.type === 'out' ? "Ra" : "Kết hợp");
                    }
                    
                    newAnimations.push(newAnimation);
                  }
                }
              });
            }
          });
        } else {
          console.log("material_animations không phải là mảng");
        }
      } else {
        console.log("Không tìm thấy cấu trúc material_animations, sẽ tìm kiếm đệ quy");
        
        // Hàm đệ quy tìm kiếm tất cả các đối tượng có thuộc tính name, type, duration
        function findAnimationsRecursively(obj, path = '') {
          // Nếu không phải object hoặc null, thoát
          if (!obj || typeof obj !== 'object') return;
          
          // Kiểm tra nếu đối tượng hiện tại có các thuộc tính cần thiết của một animation
          if (obj.name && obj.type && (obj.duration !== undefined || obj.id)) {
            // Kiểm tra nếu type hợp lệ
            if (['in', 'out', 'group'].includes(obj.type)) {
              console.log(`Tìm thấy animation tại ${path}: ${obj.name}, Type: ${obj.type}`);
              
              // Tạo animation mới với đầy đủ thông tin
              const newAnimation = { ...obj };
              
              // Đảm bảo các thuộc tính quan trọng luôn có
              newAnimation.animation_id = obj.id || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              newAnimation.icon = getIconForMaterialAnimation(obj.type, obj.name);
              
              // Đảm bảo có category_name nếu không có
              if (!newAnimation.category_name) {
                newAnimation.category_name = obj.type === 'in' ? "Vào" : (obj.type === 'out' ? "Ra" : "Kết hợp");
              }
              
              // Thêm vào danh sách mới
              newAnimations.push(newAnimation);
              return; // Không cần tìm sâu hơn trong đối tượng này
            }
          }
          
          // Nếu là mảng, duyệt qua từng phần tử
          if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              findAnimationsRecursively(item, `${path}[${index}]`);
            });
          } else {
            // Nếu là object, duyệt qua từng thuộc tính
            for (const key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) {
                findAnimationsRecursively(obj[key], path ? `${path}.${key}` : key);
              }
            }
          }
        }

        // Bắt đầu tìm kiếm đệ quy từ gốc của draft_content
        findAnimationsRecursively(draftContent, 'draftContent');
      }
      
      // Nếu vẫn không tìm thấy animations nào, thêm animation mẫu "Nếp gấp"
      if (newAnimations.length === 0) {
        console.log("Không tìm thấy animations nào, thêm animation mẫu 'Nếp gấp'");
        
        // Thêm animation "Nếp gấp" từ ví dụ người dùng cung cấp
        const exampleAnimation = {
          "anim_adjust_params": null,
          "category_id": "6824",
          "category_name": "Vào",
          "duration": 500000,
          "id": "7221443319530787330",
          "material_type": "video",
          "name": "Nếp gấp",
          "panel": "video",
          "path": "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7221443319530787330/727e2d4e66fb0fd66cbd7cae910b5e68",
          "platform": "all",
          "request_id": "202504041330049F35CB9A5511E7A38B85",
          "resource_id": "7221443319530787330",
          "source_platform": 1,
          "start": 0,
          "third_resource_id": "7221443319530787330",
          "type": "in"
        };
        
        const newAnimation = { ...exampleAnimation };
        newAnimation.animation_id = exampleAnimation.id;
        newAnimation.icon = getIconForMaterialAnimation(exampleAnimation.type, exampleAnimation.name);
        
        newAnimations.push(newAnimation);
        console.log("Thêm animation mẫu 'Nếp gấp'");
      }
      
      // Cập nhật danh sách material animations
      console.log(`Tìm thấy tổng cộng ${newAnimations.length} animations để thêm vào`);
      mergeMaterialAnimations(newAnimations);
      
      // Log số lượng animation theo từng loại
      const inAnimations = materialAnimations.filter(a => a.type === 'in');
      const outAnimations = materialAnimations.filter(a => a.type === 'out');
      const groupAnimations = materialAnimations.filter(a => a.type === 'group');
      
      console.log(`Đã cập nhật danh sách animations: ${materialAnimations.length} animations khả dụng`);
      console.log(`Loại animations: in=${inAnimations.length}, out=${outAnimations.length}, group=${groupAnimations.length}`);
      
      // Hiển thị chi tiết về các animation đã được xử lý
      console.log('=== ANIMATIONS IN ===');
      inAnimations.forEach(anim => {
        console.log(`Name: ${anim.name}, ID: ${anim.id}, Type: ${anim.type}, Category: ${anim.category_name}`);
      });
      
      console.log('=== ANIMATIONS OUT ===');
      outAnimations.forEach(anim => {
        console.log(`Name: ${anim.name}, ID: ${anim.id}, Type: ${anim.type}, Category: ${anim.category_name}`);
      });
      
      console.log('=== ANIMATIONS GROUP ===');
      groupAnimations.forEach(anim => {
        console.log(`Name: ${anim.name}, ID: ${anim.id}, Type: ${anim.type}, Category: ${anim.category_name}`);
      });
    } catch (error) {
      console.error("Error updating material animations from draft content:", error);
    }
  }

  /**
   * Cập nhật hoặc thêm mới material animations vào danh sách
   * @param {Array} newAnimations Danh sách material animations mới
   */
  function mergeMaterialAnimations(newAnimations) {
    console.log(`mergeMaterialAnimations: Received ${newAnimations.length} new animations`);
    
    // Kiểm tra xem có animation nào không
    if (newAnimations.length === 0) {
      console.warn('Không có animation nào được thêm vào');
      return;
    }

    // Log một vài animation để kiểm tra
    console.log('Sample of animations to be added:');
    for (let i = 0; i < Math.min(3, newAnimations.length); i++) {
      console.log(`Animation ${i+1}: ${newAnimations[i].name}, Type: ${newAnimations[i].type}`);
    }

    // Lọc các animation trùng lặp dựa trên id, resource_id, type và third_resource_id
    const uniqueAnimations = [];
    const seenKeys = new Set();

    // Hàm tạo khóa duy nhất cho mỗi animation dựa trên các thuộc tính quan trọng
    const getUniqueKey = (anim) => {
      // Sử dụng các thuộc tính quan trọng để tạo khóa duy nhất
      const id = anim.id || anim.animation_id || '';
      const resourceId = anim.resource_id || '';
      const type = anim.type || '';
      const thirdResourceId = anim.third_resource_id || '';
      
      return `${id}|${resourceId}|${type}|${thirdResourceId}`;
    };

    // Lọc các animation trùng lặp
    for (const anim of newAnimations) {
      const key = getUniqueKey(anim);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueAnimations.push(anim);
      } else {
        console.log(`Bỏ qua animation trùng lặp: ${anim.name}, ID: ${anim.id || anim.animation_id}, Type: ${anim.type}`);
      }
    }

    console.log(`Sau khi lọc trùng lặp: ${uniqueAnimations.length}/${newAnimations.length} animations`);

    // Không cần thêm tùy chọn "None" ở đây vì sẽ được tạo riêng cho từng loại animation trong hàm getMaterialAnimationsByType

    // Xóa danh sách cũ và thêm danh sách mới đã lọc trùng
    materialAnimations = [...uniqueAnimations];
    
    console.log(`Material animations list updated. Total: ${materialAnimations.length}`);
    console.log(`Types: in=${materialAnimations.filter(a => a.type === 'in').length}, out=${materialAnimations.filter(a => a.type === 'out').length}, group=${materialAnimations.filter(a => a.type === 'group').length}`);
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

    // Nút Animation Kết hợp (Group)
    const groupButton = document.createElement('button');
    groupButton.className = 'animation-group-button';
    groupButton.innerHTML = '<i class="fas fa-object-group"></i> Kết hợp';
    groupButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'group', fileData, onApplyAnimation);
    };
    animationButtonsContainer.appendChild(groupButton);

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
   * @param {string} animationType - Loại animation (in, out, group)
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
      case 'group':
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

    // Trong CapCut, tất cả các loại animation đều là: in, out, group
    // Không cần mapping vì chúng ta sẽ sử dụng cùng tên trong UI
    const typeMapping = {
      'in': 'in',
      'out': 'out',
      'group': 'group'
    };
    
    // Lấy đúng loại animation trong CapCut dựa trên loại UI
    const capCutType = typeMapping[animationType];
    if (!capCutType) {
      console.error(`Invalid UI animation type: ${animationType}. Must be one of: in, out, group`);
      return;
    }
    
    console.log(`UI animation type: ${animationType}, CapCut type: ${capCutType}`);
    
    // Lấy danh sách animation theo đúng type
    const animations = getMaterialAnimationsByType(capCutType);
    console.log(`Found ${animations.length} animations for type ${capCutType}`);
    
    // Kiểm tra xem có animation nào không
    if (animations.length === 0) {
      const noAnimations = document.createElement('div');
      noAnimations.className = 'animation-dropdown-item no-animations';
      noAnimations.textContent = 'Không có hiệu ứng nào';
      animationList.appendChild(noAnimations);
    } else {
      // Hiển thị tất cả các hiệu ứng trong danh sách animations
      animations.forEach(animation => {
        const item = document.createElement('div');
        item.className = 'animation-dropdown-item';
        
        // Thêm class đặc biệt cho option "None"
        if (animation.animation_id === 'none') {
          item.classList.add('none-option');
        }
        
        item.innerHTML = `<i class="${animation.icon}"></i> ${animation.name}`;
        console.log(`Adding animation to dropdown: ${animation.name} (${animation.type})`);
        
        item.addEventListener('click', () => {
          // Cập nhật text của button theo tên animation đã chọn
          const currentButton = thumbnailItem.querySelector(`.animation-${animationType}-button`);
          if (currentButton) {
            currentButton.innerHTML = `<i class="${animation.icon}"></i> ${animation.name}`;
          }
          
          // Nếu chọn animation kết hợp, reset 2 button in và out về None
          if (animationType === 'group' && animation.animation_id !== 'none') {
            const inButton = thumbnailItem.querySelector('.animation-in-button');
            const outButton = thumbnailItem.querySelector('.animation-out-button');
            
            if (inButton) {
              inButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> None';
              // Gọi onApplyAnimation với animation_id là 'none' cho button in
              onApplyAnimation(fileData, 'none', 'in');
            }
            
            if (outButton) {
              outButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> None';
              // Gọi onApplyAnimation với animation_id là 'none' cho button out
              onApplyAnimation(fileData, 'none', 'out');
            }
          }
          
          // Nếu chọn animation in hoặc out, reset button kết hợp về None
          if ((animationType === 'in' || animationType === 'out') && animation.animation_id !== 'none') {
            const groupButton = thumbnailItem.querySelector('.animation-group-button');
            
            if (groupButton) {
              groupButton.innerHTML = '<i class="fas fa-object-group"></i> None';
              // Gọi onApplyAnimation với animation_id là 'none' cho button group
              onApplyAnimation(fileData, 'none', 'group');
            }
          }
          
          // Gọi hàm onApplyAnimation để xử lý animation đã chọn
          onApplyAnimation(fileData, animation.animation_id, animationType);
          
          // Đóng dropdown
          dropdown.classList.remove('show');
          setTimeout(() => dropdown.remove(), 100);
        });
        animationList.appendChild(item);
      });
    }

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

  /**
   * Hiển thị thông tin về mảng material_animations trên giao diện
   */
  function showMaterialAnimationsInfo() {
    // Tạo một div để hiển thị thông tin
    const infoDiv = document.createElement('div');
    infoDiv.className = 'material-animations-info';
    infoDiv.style.position = 'fixed';
    infoDiv.style.top = '50px';
    infoDiv.style.left = '50px';
    infoDiv.style.width = '80%';
    infoDiv.style.height = '80%';
    infoDiv.style.backgroundColor = 'white';
    infoDiv.style.border = '1px solid black';
    infoDiv.style.padding = '20px';
    infoDiv.style.overflow = 'auto';
    infoDiv.style.zIndex = '9999';
    
    // Thêm nút đóng
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Đóng';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.addEventListener('click', () => infoDiv.remove());
    infoDiv.appendChild(closeButton);
    
    // Thêm tiêu đề
    const title = document.createElement('h2');
    title.textContent = 'Thông tin về Material Animations';
    infoDiv.appendChild(title);
    
    // Thêm thống kê
    const inAnimations = materialAnimations.filter(a => a.type === 'in');
    const outAnimations = materialAnimations.filter(a => a.type === 'out');
    const groupAnimations = materialAnimations.filter(a => a.type === 'group');
    
    const stats = document.createElement('div');
    stats.innerHTML = `
      <p>Tổng số animation: ${materialAnimations.length}</p>
      <p>Animation Vào (in): ${inAnimations.length}</p>
      <p>Animation Ra (out): ${outAnimations.length}</p>
      <p>Animation Kết hợp (group): ${groupAnimations.length}</p>
    `;
    infoDiv.appendChild(stats);
    
    // Hiển thị danh sách animation theo loại
    const createAnimationList = (animations, title) => {
      const section = document.createElement('div');
      section.style.marginTop = '20px';
      
      const sectionTitle = document.createElement('h3');
      sectionTitle.textContent = title;
      section.appendChild(sectionTitle);
      
      const list = document.createElement('ul');
      animations.forEach(anim => {
        const item = document.createElement('li');
        item.textContent = `${anim.name} (ID: ${anim.id}, Type: ${anim.type}, Category: ${anim.category_name})`;
        list.appendChild(item);
      });
      section.appendChild(list);
      
      return section;
    };
    
    infoDiv.appendChild(createAnimationList(inAnimations, 'Animations Vào (in)'));
    infoDiv.appendChild(createAnimationList(outAnimations, 'Animations Ra (out)'));
    infoDiv.appendChild(createAnimationList(groupAnimations, 'Animations Kết hợp (group)'));
    
    // Hiển thị cấu trúc chi tiết của một animation mẫu
    if (materialAnimations.length > 0) {
      const sampleSection = document.createElement('div');
      sampleSection.style.marginTop = '20px';
      
      const sampleTitle = document.createElement('h3');
      sampleTitle.textContent = 'Cấu trúc chi tiết của một Animation';
      sampleSection.appendChild(sampleTitle);
      
      const samplePre = document.createElement('pre');
      samplePre.style.backgroundColor = '#f5f5f5';
      samplePre.style.padding = '10px';
      samplePre.style.overflow = 'auto';
      samplePre.textContent = JSON.stringify(materialAnimations[0], null, 2);
      sampleSection.appendChild(samplePre);
      
      infoDiv.appendChild(sampleSection);
    }
    
    // Thêm vào body
    document.body.appendChild(infoDiv);
  }
  
  /**
   * Khởi tạo Material Manager
   */
  function init() {
    initializeDefaultMaterialAnimations();
    console.log("Material Manager initialized");
    
    // Thêm nút để hiển thị thông tin về material_animations
    const showInfoButton = document.createElement('button');
    showInfoButton.textContent = 'Hiển thị Material Animations';
    showInfoButton.style.position = 'fixed';
    showInfoButton.style.bottom = '20px';
    showInfoButton.style.right = '20px';
    showInfoButton.style.zIndex = '9999';
    showInfoButton.addEventListener('click', showMaterialAnimationsInfo);
    document.body.appendChild(showInfoButton);
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
