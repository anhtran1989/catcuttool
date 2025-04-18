/**
 * Transition UI - Xử lý giao diện người dùng cho hiệu ứng chuyển cảnh
 */

const TransitionUI = (function() {
  /**
   * Hiển thị dropdown chọn hiệu ứng chuyển cảnh
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyTransition - Callback function to apply transition
   * @param {Array} transitions - Danh sách hiệu ứng chuyển cảnh
   */
  function showTransitionDropdown(thumbnailItem, fileData, onApplyTransition, transitions) {
    console.log("Showing transition dropdown");
    console.log("Available transitions:", transitions);
    
    // Đóng tất cả dropdown hiệu ứng chuyển cảnh hiện có trước khi tạo mới
    closeAllTransitionDropdowns();
    
    // Tạo dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'transition-dropdown';
    dropdown.id = 'transition-dropdown';
    
    // Tạo tiêu đề
    const header = document.createElement('div');
    header.className = 'animation-dropdown-header';
    header.textContent = 'Chọn hiệu ứng chuyển cảnh';
    dropdown.appendChild(header);
    
    // Tạo danh sách hiệu ứng chuyển cảnh
    const transitionList = document.createElement('div');
    transitionList.className = 'animation-list';
    
    // Thêm các hiệu ứng chuyển cảnh vào danh sách
    transitions.forEach(transition => {
      const transitionItem = document.createElement('div');
      transitionItem.className = 'animation-dropdown-item';
      transitionItem.innerHTML = `<i class="${transition.icon || 'fas fa-exchange-alt'}"></i> ${transition.name}`;
      
      // Xử lý sự kiện click
      transitionItem.addEventListener('click', function() {
        console.log(`Selected transition: ${transition.name}`);
        
        // Đóng dropdown
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
        
        // Áp dụng hiệu ứng chuyển cảnh
        if (typeof onApplyTransition === 'function') {
          onApplyTransition(thumbnailItem, transition, fileData);
        }
      });
      
      transitionList.appendChild(transitionItem);
    });
    
    dropdown.appendChild(transitionList);
    
    // Thêm dropdown vào thumbnail item thay vì body
    thumbnailItem.appendChild(dropdown);
    
    // Định vị dropdown để nó đè lên thumbnail
    dropdown.style.position = 'absolute';
    dropdown.style.top = '40px'; // Ngay dưới nút hiệu ứng chuyển cảnh
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
      const button = thumbnailItem.querySelector('.transition-button');
      if (!dropdown.contains(event.target) && event.target !== button) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    }
  }
  
  /**
   * Đóng tất cả dropdown hiệu ứng chuyển cảnh hiện có
   */
  function closeAllTransitionDropdowns() {
    // Xóa dropdown cũ nếu có
    const existingDropdowns = document.querySelectorAll('.transition-dropdown');
    existingDropdowns.forEach(dropdown => {
      dropdown.remove();
    });
  }
  
  /**
   * Thêm nút hiệu ứng chuyển cảnh vào thumbnail
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyTransition - Callback function to apply transition
   */
  function addTransitionButton(thumbnailItem, fileData, onApplyTransition) {
    if (!thumbnailItem) return;
    
    // Tạo container cho nút hiệu ứng chuyển cảnh
    const transitionButtonContainer = document.createElement('div');
    transitionButtonContainer.className = 'transition-button-container';
    
    // Nút Hiệu ứng chuyển cảnh
    const transitionButton = document.createElement('button');
    transitionButton.className = 'transition-button';
    transitionButton.innerHTML = '<i class="fas fa-exchange-alt"></i> Chuyển cảnh';
    transitionButton.onclick = function(e) {
      e.stopPropagation();
      showTransitionDropdown(thumbnailItem, fileData, onApplyTransition);
    };
    transitionButtonContainer.appendChild(transitionButton);

    // Tạo container để chứa nút hiệu ứng chuyển cảnh phía trên media
    const transitionContainer = document.createElement('div');
    transitionContainer.className = 'transition-container';
    
    // Thêm container nút vào transition container
    transitionContainer.appendChild(transitionButtonContainer);
    
    // Kiểm tra xem đã có container nào chưa
    const existingContainer = thumbnailItem.querySelector('.transition-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Kiểm tra xem đã có effect container chưa
    const effectContainer = thumbnailItem.querySelector('.effect-container');
    
    if (effectContainer) {
      // Nếu đã có effect container, thêm transition container vào sau
      effectContainer.parentNode.insertBefore(transitionContainer, effectContainer.nextSibling);
    } else {
      // Nếu chưa có, thêm vào đầu thumbnail item
      thumbnailItem.insertBefore(transitionContainer, thumbnailItem.firstChild);
    }
    
    // Đảm bảo transition container luôn hiển thị
    transitionContainer.style.opacity = '1';
    transitionContainer.style.visibility = 'visible';
  }
  
  /**
   * Cập nhật giao diện người dùng để hiển thị danh sách hiệu ứng chuyển cảnh
   */
  function updateTransitionsUI() {
    console.log("Updating transitions UI");
    
    // Cập nhật dropdown hiệu ứng chuyển cảnh nếu đang hiển thị
    const dropdown = document.getElementById('transition-dropdown');
    if (dropdown) {
      // Xóa dropdown hiện tại
      dropdown.remove();
      
      // Tạo dropdown mới (sẽ được thực hiện khi người dùng click vào nút hiệu ứng chuyển cảnh)
    }
    
    // Thêm styles CSS cho hiệu ứng chuyển cảnh nếu chưa có
    addTransitionStyles();
  }
  
  /**
   * Thêm các styles CSS cho hiệu ứng chuyển cảnh
   */
  function addTransitionStyles() {
    // Kiểm tra xem styles đã tồn tại chưa
    if (document.getElementById('transition-styles')) {
      return;
    }
    
    // Tạo style element
    const style = document.createElement('style');
    style.id = 'transition-styles';
    style.textContent = `
      /* Transition container styles */
      .transition-container {
        position: absolute;
        top: 35px; /* Đặt nút hiệu ứng chuyển cảnh dưới nút hiệu ứng */
        left: 0;
        width: 100%;
        z-index: 29;
        display: flex !important;
        justify-content: center;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Transition button container styles */
      .transition-button-container {
        display: flex !important;
        justify-content: center;
        width: 100%;
        z-index: 29;
      }
      
      /* Transition button styles */
      .transition-button {
        padding: 6px 12px;
        font-size: 0.85rem;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        background-color: #f0ad4e;
        border: 1px solid #eea236;
        color: white;
        font-weight: 500;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        margin-bottom: 10px;
      }
      
      .transition-button:hover {
        background-color: #ec971f;
        border-color: #d58512;
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
      }
      
      .transition-button i {
        margin-right: 5px;
        font-size: 0.85rem;
      }
      
      /* Transition dropdown styles */
      .transition-dropdown {
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
      
      .transition-dropdown.show {
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
        background-color: #fff8e1;
        color: #f0ad4e;
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
    showTransitionDropdown,
    closeAllTransitionDropdowns,
    addTransitionButton,
    updateTransitionsUI,
    addTransitionStyles
  };
})();

// Export module
export { TransitionUI };
