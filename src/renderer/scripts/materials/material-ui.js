/**
 * Material UI - Xử lý giao diện người dùng cho Material Animations
 */

const MaterialUI = (function() {
  // Dropdown hiện tại đang mở
  let currentDropdown = null;
  
  /**
   * Hiển thị dropdown chọn animation
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {string} animationType - Loại animation (in, out, group)
   * @param {Object} fileData - File data
   * @param {Function} onApplyAnimation - Callback function to apply animation
   * @param {Array} animations - Danh sách animations
   */
  function showAnimationDropdown(thumbnailItem, animationType, fileData, onApplyAnimation, animations) {
    if (!thumbnailItem) return;
    
    // Đóng dropdown hiện tại nếu có
    if (currentDropdown) {
      currentDropdown.remove();
      currentDropdown = null;
    }
    
    // Lọc animations theo loại
    const filteredAnimations = animations.filter(anim => anim.type === animationType);
    
    // Tạo dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'animation-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = '1000';
    dropdown.style.backgroundColor = '#fff';
    dropdown.style.border = '1px solid #ddd';
    dropdown.style.borderRadius = '4px';
    dropdown.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    dropdown.style.maxHeight = '300px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.width = '200px';
    
    // Thêm tiêu đề
    const title = document.createElement('div');
    title.className = 'animation-dropdown-title';
    title.style.padding = '8px 12px';
    title.style.borderBottom = '1px solid #ddd';
    title.style.fontWeight = 'bold';
    title.style.backgroundColor = '#f5f5f5';
    title.textContent = animationType === 'in' ? 'Hiệu ứng Vào' : 
                        (animationType === 'out' ? 'Hiệu ứng Ra' : 'Hiệu ứng Kết hợp');
    dropdown.appendChild(title);
    
    // Thêm tùy chọn "None"
    const noneItem = document.createElement('div');
    noneItem.className = 'animation-item';
    noneItem.dataset.animationId = 'none';
    noneItem.dataset.type = animationType;
    noneItem.dataset.name = 'None';
    noneItem.style.padding = '8px 12px';
    noneItem.style.cursor = 'pointer';
    noneItem.style.borderBottom = '1px solid #eee';
    noneItem.innerHTML = '<i class="fas fa-ban"></i> None';
    noneItem.addEventListener('mouseover', function() {
      this.style.backgroundColor = '#f0f0f0';
    });
    noneItem.addEventListener('mouseout', function() {
      this.style.backgroundColor = '';
    });
    noneItem.addEventListener('click', function() {
      // Gọi callback với animation None
      if (typeof onApplyAnimation === 'function') {
        onApplyAnimation(thumbnailItem, {
          id: 'none',
          name: 'None',
          type: animationType,
          duration: 0,
          icon: 'fas fa-ban'
        }, fileData);
      }
      
      // Đóng dropdown
      dropdown.remove();
      currentDropdown = null;
    });
    dropdown.appendChild(noneItem);
    
    // Thêm các animation
    filteredAnimations.forEach(animation => {
      if (animation.id === 'none') return; // Bỏ qua None vì đã thêm ở trên
      
      const item = document.createElement('div');
      item.className = 'animation-item';
      item.dataset.animationId = animation.id || animation.animation_id;
      item.dataset.type = animation.type;
      item.dataset.name = animation.name;
      item.style.padding = '8px 12px';
      item.style.cursor = 'pointer';
      item.style.borderBottom = '1px solid #eee';
      
      // Thêm icon nếu có
      const icon = animation.icon || 'fas fa-magic';
      item.innerHTML = `<i class="${icon}"></i> ${animation.name}`;
      
      // Thêm sự kiện hover
      item.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#f0f0f0';
      });
      item.addEventListener('mouseout', function() {
        this.style.backgroundColor = '';
      });
      
      // Thêm sự kiện click
      item.addEventListener('click', function() {
        // Gọi callback với animation đã chọn
        if (typeof onApplyAnimation === 'function') {
          onApplyAnimation(thumbnailItem, animation, fileData);
        }
        
        // Đóng dropdown
        dropdown.remove();
        currentDropdown = null;
      });
      
      dropdown.appendChild(item);
    });
    
    // Thêm dropdown vào body
    document.body.appendChild(dropdown);
    
    // Định vị dropdown
    positionAnimationDropdown(dropdown, thumbnailItem);
    
    // Lưu dropdown hiện tại
    currentDropdown = dropdown;
    
    // Thêm sự kiện click bên ngoài để đóng dropdown
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 0);
    
    /**
     * Hàm đóng dropdown khi click ra ngoài
     */
    function closeDropdown(event) {
      if (dropdown && !dropdown.contains(event.target) && 
          event.target.closest('.animation-buttons') === null) {
        dropdown.remove();
        currentDropdown = null;
        document.removeEventListener('click', closeDropdown);
      }
    }
  }
  
  /**
   * Định vị dropdown gần với thumbnail item
   * @param {HTMLElement} dropdown - Dropdown element
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   */
  function positionAnimationDropdown(dropdown, thumbnailItem) {
    if (!dropdown || !thumbnailItem) return;
    
    const thumbnailRect = thumbnailItem.getBoundingClientRect();
    
    // Định vị dropdown bên dưới thumbnail
    dropdown.style.left = `${thumbnailRect.left}px`;
    dropdown.style.top = `${thumbnailRect.bottom + 5}px`;
    
    // Kiểm tra xem dropdown có bị tràn ra ngoài màn hình không
    const dropdownRect = dropdown.getBoundingClientRect();
    
    // Nếu bị tràn ra bên phải, dịch sang trái
    if (dropdownRect.right > window.innerWidth) {
      dropdown.style.left = `${window.innerWidth - dropdownRect.width - 5}px`;
    }
    
    // Nếu bị tràn ra bên dưới, hiển thị phía trên thumbnail
    if (dropdownRect.bottom > window.innerHeight) {
      dropdown.style.top = `${thumbnailRect.top - dropdownRect.height - 5}px`;
    }
  }
  
  /**
   * Thêm các button animation (Vào, Kết hợp, Ra) vào thumbnail
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyAnimation - Callback function to apply animation
   */
  function addAnimationButtons(thumbnailItem, fileData, onApplyAnimation) {
    if (!thumbnailItem) return;
    
    // Kiểm tra xem đã có container chưa
    let container = thumbnailItem.querySelector('.animation-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'animation-container';
      thumbnailItem.appendChild(container);
    }
    
    // Tạo container cho các button
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'animation-buttons';
    container.appendChild(buttonsContainer);
    
    // Button "Vào"
    const inButton = document.createElement('button');
    inButton.className = 'animation-in-button';
    inButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Vào';
    inButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'in', fileData, onApplyAnimation, window.MaterialManager.getMaterialAnimations());
    };
    buttonsContainer.appendChild(inButton);
    
    // Button "Kết hợp"
    const groupButton = document.createElement('button');
    groupButton.className = 'animation-group-button';
    groupButton.innerHTML = '<i class="fas fa-object-group"></i>';
    groupButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'group', fileData, onApplyAnimation, window.MaterialManager.getMaterialAnimations());
    };
    buttonsContainer.appendChild(groupButton);
    
    // Button "Ra"
    const outButton = document.createElement('button');
    outButton.className = 'animation-out-button';
    outButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Ra';
    outButton.onclick = function(e) {
      e.stopPropagation();
      showAnimationDropdown(thumbnailItem, 'out', fileData, onApplyAnimation, window.MaterialManager.getMaterialAnimations());
    };
    buttonsContainer.appendChild(outButton);
    
    // Ẩn container khi hover ra khỏi thumbnail
    thumbnailItem.addEventListener('mouseenter', function() {
      container.style.opacity = '1';
    });
    
    thumbnailItem.addEventListener('mouseleave', function() {
      container.style.opacity = '0';
    });
  }
  
  /**
   * Hiển thị thông tin về mảng material_animations trên giao diện
   * @param {Array} materialAnimations - Danh sách material animations
   */
  function showMaterialAnimationsInfo(materialAnimations) {
    // Xóa thông tin cũ nếu có
    const existingInfo = document.getElementById('material-animations-info');
    if (existingInfo) {
      existingInfo.remove();
    }
    
    // Tạo div chứa thông tin
    const infoDiv = document.createElement('div');
    infoDiv.id = 'material-animations-info';
    infoDiv.style.position = 'fixed';
    infoDiv.style.top = '50%';
    infoDiv.style.left = '50%';
    infoDiv.style.transform = 'translate(-50%, -50%)';
    infoDiv.style.backgroundColor = 'white';
    infoDiv.style.padding = '20px';
    infoDiv.style.border = '1px solid #ddd';
    infoDiv.style.borderRadius = '5px';
    infoDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    infoDiv.style.zIndex = '10000';
    infoDiv.style.maxWidth = '80%';
    infoDiv.style.maxHeight = '80%';
    infoDiv.style.overflow = 'auto';
    
    // Thêm tiêu đề
    const title = document.createElement('h2');
    title.textContent = 'Material Animations Info';
    title.style.marginTop = '0';
    infoDiv.appendChild(title);
    
    // Thêm nút đóng
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Đóng';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.addEventListener('click', () => infoDiv.remove());
    infoDiv.appendChild(closeButton);
    
    // Thêm thông tin tổng quan
    const overview = document.createElement('div');
    overview.innerHTML = `<p>Tổng số Material Animations: <strong>${materialAnimations.length}</strong></p>`;
    infoDiv.appendChild(overview);
    
    // Phân loại animations theo type
    const inAnimations = materialAnimations.filter(a => a.type === 'in');
    const outAnimations = materialAnimations.filter(a => a.type === 'out');
    const groupAnimations = materialAnimations.filter(a => a.type === 'group');
    
    // Tạo các danh sách animations theo loại
    const listsContainer = document.createElement('div');
    listsContainer.style.display = 'flex';
    listsContainer.style.flexWrap = 'wrap';
    listsContainer.style.gap = '20px';
    
    // Hàm tạo danh sách animation theo loại
    function createAnimationList(animations, title) {
      const listContainer = document.createElement('div');
      listContainer.style.flex = '1';
      listContainer.style.minWidth = '200px';
      
      const listTitle = document.createElement('h3');
      listTitle.textContent = title;
      listContainer.appendChild(listTitle);
      
      const list = document.createElement('ul');
      animations.forEach(anim => {
        const item = document.createElement('li');
        item.innerHTML = `<i class="${anim.icon || 'fas fa-magic'}"></i> ${anim.name}`;
        list.appendChild(item);
      });
      
      listContainer.appendChild(list);
      return listContainer;
    }
    
    // Thêm các danh sách vào container
    listsContainer.appendChild(createAnimationList(inAnimations, 'Hiệu ứng Vào (In)'));
    listsContainer.appendChild(createAnimationList(groupAnimations, 'Hiệu ứng Kết hợp (Group)'));
    listsContainer.appendChild(createAnimationList(outAnimations, 'Hiệu ứng Ra (Out)'));
    
    infoDiv.appendChild(listsContainer);
    
    // Thêm mẫu JSON
    if (materialAnimations.length > 0) {
      const sampleSection = document.createElement('div');
      sampleSection.style.marginTop = '20px';
      
      const sampleTitle = document.createElement('h3');
      sampleTitle.textContent = 'Mẫu cấu trúc JSON';
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
   * Thêm styles CSS cho material animations
   */
  function addMaterialStyles() {
    // Kiểm tra xem styles đã được thêm chưa
    if (document.getElementById('material-animations-styles')) return;
    
    // Tạo style element
    const style = document.createElement('style');
    style.id = 'material-animations-styles';
    style.textContent = `
      .animation-container {
        position: absolute;
        top: -40px;
        left: 0;
        right: 0;
        z-index: 10;
        transition: opacity 0.3s ease;
        display: flex;
        justify-content: center;
      }
      
      .animation-buttons {
        display: flex;
        gap: 2px;
        background-color: transparent;
        border-radius: 4px;
        padding: 2px;
      }
      
      .animation-buttons button {
        background-color: none;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 3px;
        padding: 3px 8px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .animation-buttons button:hover {
        background-color:rgb(255, 255, 255);
        transform: translateY(-1px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.15);
      }
      
      .animation-in-button {
        border-bottom: 2px solid #4CAF50 !important;
        color: #4CAF50;
      }
      
      .animation-group-button {
        border-bottom: 2px solid #2196F3 !important;
        color: #2196F3;
      }
      
      .animation-out-button {
        border-bottom: 2px solid #F44336 !important;
        color: #F44336;
      }
      
      .animation-dropdown .animation-item:last-child {
        border-bottom: none !important;
      }
    `;
    
    // Thêm vào head
    document.head.appendChild(style);
  }

  // Public API
  return {
    showAnimationDropdown,
    positionAnimationDropdown,
    addAnimationButtons,
    showMaterialAnimationsInfo,
    addMaterialStyles
  };
})();

// Export module
export { MaterialUI };
