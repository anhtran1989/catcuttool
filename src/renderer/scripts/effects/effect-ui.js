/**
 * Effect UI - Xử lý giao diện người dùng cho hiệu ứng
 */

const EffectUI = (function() {
  /**
   * Hiển thị dropdown chọn hiệu ứng
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyEffect - Callback function to apply effect
   * @param {Array} effects - Danh sách hiệu ứng
   */
  function showEffectDropdown(thumbnailItem, fileData, onApplyEffect, effects) {
    console.log("Showing effect dropdown");
    console.log("Available effects:", effects);
    
    // Đóng tất cả dropdown hiệu ứng hiện có trước khi tạo mới
    closeAllEffectDropdowns();
    
    // Tạo dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'effect-dropdown';
    dropdown.id = 'effect-dropdown';
    
    // Tạo tiêu đề
    const header = document.createElement('div');
    header.className = 'animation-dropdown-header';
    header.textContent = 'Chọn hiệu ứng';
    dropdown.appendChild(header);
    
    // Tạo danh sách hiệu ứng
    const effectList = document.createElement('div');
    effectList.className = 'animation-list';
    
    // Thêm các hiệu ứng vào danh sách
    effects.forEach(effect => {
      const effectItem = document.createElement('div');
      effectItem.className = 'animation-dropdown-item';
      effectItem.innerHTML = `<i class="${effect.icon || 'fas fa-magic'}"></i> ${effect.name}`;
      
      // Xử lý sự kiện click
      effectItem.addEventListener('click', function() {
        console.log(`Selected effect: ${effect.name}`);
        
        // Đóng dropdown
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
        
        // Áp dụng hiệu ứng
        if (typeof onApplyEffect === 'function') {
          onApplyEffect(thumbnailItem, effect, fileData);
        }
      });
      
      effectList.appendChild(effectItem);
    });
    
    dropdown.appendChild(effectList);
    
    // Thêm dropdown vào thumbnail item thay vì body
    thumbnailItem.appendChild(dropdown);
    
    // Định vị dropdown để nó đè lên thumbnail
    dropdown.style.position = 'absolute';
    dropdown.style.top = '40px'; // Ngay dưới nút hiệu ứng
    dropdown.style.left = '0';
    dropdown.style.width = '100%';
    dropdown.style.zIndex = '1000';
    
    // Hiển thị dropdown
    dropdown.classList.add('show');
    
    // Thêm sự kiện click để đóng dropdown khi click ra ngoài
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 100);
    
    // Hàm đóng dropdown khi click ra ngoài
    function closeDropdown(event) {
      const button = thumbnailItem.querySelector('.effect-button');
      if (!dropdown.contains(event.target) && event.target !== button) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    }
  }
  
  /**
   * Đóng tất cả dropdown hiệu ứng hiện có
   */
  function closeAllEffectDropdowns() {
    // Xóa dropdown cũ nếu có
    const existingDropdowns = document.querySelectorAll('.effect-dropdown');
    existingDropdowns.forEach(dropdown => {
      dropdown.remove();
    });
  }
  
  /**
   * Thêm nút hiệu ứng vào thumbnail
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyEffect - Callback function to apply effect
   */
  function addEffectButton(thumbnailItem, fileData, onApplyEffect) {
    if (!thumbnailItem) return;
    
    // Tạo container cho nút hiệu ứng
    const effectButtonContainer = document.createElement('div');
    effectButtonContainer.className = 'effect-button-container';
    
    // Nút Hiệu ứng
    const effectButton = document.createElement('button');
    effectButton.className = 'effect-button';
    effectButton.innerHTML = '<i class="fas fa-magic"></i> Hiệu ứng';
    effectButton.onclick = function(e) {
      e.stopPropagation();
      showEffectDropdown(thumbnailItem, fileData, onApplyEffect);
    };
    effectButtonContainer.appendChild(effectButton);

    // Tạo container để chứa nút hiệu ứng phía trên media
    const effectContainer = document.createElement('div');
    effectContainer.className = 'effect-container';
    
    // Thêm container nút vào effect container
    effectContainer.appendChild(effectButtonContainer);
    
    // Kiểm tra xem đã có container nào chưa
    const existingContainer = thumbnailItem.querySelector('.effect-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Thêm effect container vào thumbnail item
    thumbnailItem.insertBefore(effectContainer, thumbnailItem.firstChild);
    
    // Đảm bảo effect container luôn hiển thị
    effectContainer.style.opacity = '1';
    effectContainer.style.visibility = 'visible';
  }
  
  /**
   * Cập nhật giao diện người dùng để hiển thị danh sách hiệu ứng
   */
  function updateEffectsUI() {
    console.log("Updating effects UI");
    
    // Cập nhật dropdown hiệu ứng nếu đang hiển thị
    const dropdown = document.getElementById('effect-dropdown');
    if (dropdown) {
      // Xóa dropdown hiện tại
      dropdown.remove();
      
      // Tạo dropdown mới (sẽ được thực hiện khi người dùng click vào nút hiệu ứng)
    }
    
    // Thêm styles CSS cho hiệu ứng nếu chưa có
    addEffectStyles();
  }
  
  /**
   * Thêm các styles CSS cho hiệu ứng
   */
  function addEffectStyles() {
    // Kiểm tra xem styles đã tồn tại chưa
    if (document.getElementById('effect-styles')) {
      return;
    }
    
    // Tạo style element
    const style = document.createElement('style');
    style.id = 'effect-styles';
    style.textContent = `
      /* Effect container styles */
      .effect-container {
        position: absolute;
        top: 0px; /* Đặt nút hiệu ứng ở trên cùng */
        left: 0;
        width: 100%;
        z-index: 30;
        display: flex !important;
        justify-content: center;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Effect button container styles */
      .effect-button-container {
        display: flex !important;
        justify-content: center;
        width: 100%;
        z-index: 30;
      }
      
      /* Effect button styles */
      .effect-button {
        padding: 6px 12px;
        font-size: 0.85rem;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        background-color: #4a90e2;
        border: 1px solid #3a80d2;
        color: white;
        font-weight: 500;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        margin-bottom: 10px;
      }
      
      .effect-button:hover {
        background-color: #3a80d2;
        border-color: #2a70c2;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
      }
      
      .effect-button i {
        margin-right: 5px;
        font-size: 0.85rem;
      }
      
      /* Effect dropdown styles */
      .effect-dropdown {
        position: absolute;
        top: 40px;
        left: 0;
        width: 100%;
        background-color: white;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        display: none;
        overflow: hidden;
        max-height: 250px;
        overflow-y: auto;
      }
      
      .effect-dropdown.show {
        display: block;
        animation: fadeIn 0.2s ease;
      }
      
      /* Animation dropdown header */
      .animation-dropdown-header {
        padding: 8px 12px;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
        color: #333;
        font-size: 0.9rem;
      }
      
      /* Animation list */
      .animation-list {
        padding: 5px 0;
      }
      
      /* Animation dropdown item */
      .animation-dropdown-item {
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
      }
      
      .animation-dropdown-item:hover {
        background-color: #f0f7ff;
        color: #4a90e2;
      }
      
      .animation-dropdown-item i {
        margin-right: 8px;
        width: 16px;
        text-align: center;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    
    // Thêm vào head
    document.head.appendChild(style);
  }

  // Public API
  return {
    showEffectDropdown,
    closeAllEffectDropdowns,
    addEffectButton,
    updateEffectsUI,
    addEffectStyles
  };
})();

// Export module
export { EffectUI };
