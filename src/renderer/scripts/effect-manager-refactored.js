/**
 * Effect Manager - Quản lý và cập nhật danh sách effects
 * 
 * Cấu trúc của mỗi effect trong CapCut cần có các thuộc tính:
 * - id: Một chuỗi UUID duy nhất cho mỗi effect
 * - name: Tên của effect
 * - type: Loại effect (thường là "video_effect")
 * - category_name: Tên danh mục của effect
 * - effect_id: ID của effect trong hệ thống CapCut
 * - path: Đường dẫn đến file effect
 * - adjust_params: Các tham số điều chỉnh của effect
 */
const EffectManager = (function() {
  // Danh sách các effects đã được lưu
  let effects = [];

  /**
   * Khởi tạo EffectManager
   */
  function init() {
    console.log("Initializing EffectManager");
    
    // Khởi tạo danh sách effects với effect "None"
    effects = [{
      id: "none",
      name: "None",
      type: "video_effect",
      icon: "fas fa-ban"
    }];
    
    // Tải effects từ file draft_content_effect.json
    loadEffectsFromDraftContent();
  }
  
  /**
   * Tải file draft_content_2.json và cập nhật danh sách hiệu ứng
   */
  function loadEffectsFromDraftContent() {
    try {
      console.log("Loading effects from draft_content_2.json");
      
      // Thử đọc file bằng fetch API
      fetch('./draft_content_2.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Cập nhật effects từ file
          updateFromDraftContent(data);
        })
        .catch(error => {
          console.error("Error loading draft_content_2.json:", error);
          
          // Nếu không thể tải draft_content_2.json, thử tải draft_content_effect.json
          fetch('./draft_content_effect.json')
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              // Cập nhật effects từ file
              if (data && data.materials && data.materials.video_effects) {
                mergeEffects(data.materials.video_effects);
              }
            })
            .catch(error => {
              console.error("Error loading draft_content_effect.json:", error);
              // Nếu không thể tải cả hai file, thêm một số hiệu ứng mẫu
              addSampleEffects();
            });
        });
    } catch (error) {
      console.error("Error in loadEffectsFromDraftContent:", error);
      // Nếu có lỗi, thêm một số hiệu ứng mẫu
      addSampleEffects();
    }
  }
  
  /**
   * Thêm một số hiệu ứng mẫu
   */
  function addSampleEffects() {
    console.log("Adding sample effects");
    
    const sampleEffects = [
      {
        id: Utils.generateUUID(),
        name: "Phóng to hình kim cương",
        type: "video_effect",
        category_name: "Đang thịnh hành",
        effect_id: "diamond_zoom",
        icon: "fas fa-search-plus"
      },
      {
        id: Utils.generateUUID(),
        name: "Mở ngược",
        type: "video_effect",
        category_name: "Đang thịnh hành",
        effect_id: "reverse_open",
        icon: "fas fa-exchange-alt"
      },
      {
        id: Utils.generateUUID(),
        name: "Trục trặc pixel",
        type: "video_effect",
        category_name: "Đang thịnh hành",
        effect_id: "pixel_glitch",
        icon: "fas fa-th"
      },
      {
        id: Utils.generateUUID(),
        name: "Rung dọc",
        type: "video_effect",
        category_name: "Đang thịnh hành",
        effect_id: "vertical_shake",
        icon: "fas fa-arrows-alt"
      }
    ];
    
    mergeEffects(sampleEffects);
  }
  
  /**
   * Cập nhật danh sách effects từ file draft_content_2.json
   * @param {Object} draftContent Nội dung của file draft_content_2.json
   */
  function updateFromDraftContent(draftContent) {
    try {
      console.log("Updating effects from draft content");
      
      if (!draftContent) {
        console.log("Invalid draft content");
        return;
      }
      
      // Tìm kiếm effects trong cấu trúc JSON
      const foundEffects = findEffectsRecursively(draftContent);
      
      if (foundEffects && foundEffects.length > 0) {
        console.log(`Found ${foundEffects.length} effects in draft content`);
        
        // Cập nhật danh sách effects
        mergeEffects(foundEffects);
      } else {
        console.log("No effects found in draft content");
        
        // Nếu không tìm thấy effects, kiểm tra video_effects trong materials
        if (draftContent.materials && draftContent.materials.video_effects) {
          console.log(`Found ${draftContent.materials.video_effects.length} effects in materials.video_effects`);
          
          // Cập nhật danh sách effects
          mergeEffects(draftContent.materials.video_effects);
        } else {
          console.log("No effects found in materials.video_effects");
          
          // Nếu không tìm thấy effects trong cả hai nơi, thêm một số hiệu ứng mẫu
          addSampleEffects();
        }
      }
    } catch (error) {
      console.error("Error updating effects from draft content:", error);
      
      // Nếu có lỗi, thêm một số hiệu ứng mẫu
      addSampleEffects();
    }
  }
  
  /**
   * Tìm kiếm đệ quy các hiệu ứng trong cấu trúc JSON
   * @param {Object} obj Đối tượng JSON cần tìm kiếm
   * @param {Array} results Mảng kết quả (tùy chọn)
   * @returns {Array} Mảng các hiệu ứng tìm thấy
   */
  function findEffectsRecursively(obj, results = []) {
    // Nếu obj là null hoặc không phải object, trả về results
    if (!obj || typeof obj !== 'object') {
      return results;
    }
    
    // Nếu obj là mảng, tìm kiếm trong từng phần tử
    if (Array.isArray(obj)) {
      for (const item of obj) {
        findEffectsRecursively(item, results);
      }
      return results;
    }
    
    // Kiểm tra xem obj có phải là một effect không
    if (obj.type === 'video_effect' && obj.name && obj.id) {
      // Thêm icon dựa trên tên effect
      obj.icon = VideoEffects.getIconForEffect(obj.name);
      
      // Thêm vào kết quả nếu chưa tồn tại
      if (!results.some(e => e.id === obj.id)) {
        results.push(obj);
      }
    }
    
    // Tìm kiếm trong các thuộc tính của obj
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
        findEffectsRecursively(obj[key], results);
      }
    }
    
    return results;
  }
  
  /**
   * Cập nhật hoặc thêm mới effects vào danh sách
   * @param {Array} newEffects Danh sách effects mới
   */
  function mergeEffects(newEffects) {
    if (!newEffects || !Array.isArray(newEffects) || newEffects.length === 0) {
      console.log("No effects to merge");
      return;
    }
    
    console.log(`Merging ${newEffects.length} effects`);
    
    // Đảm bảo luôn có effect "None"
    if (!effects.some(e => e.id === "none")) {
      effects.push({
        id: "none",
        name: "None",
        type: "video_effect",
        icon: "fas fa-ban"
      });
    }
    
    // Cập nhật hoặc thêm mới từng effect
    newEffects.forEach(newEffect => {
      // Bỏ qua nếu không có id hoặc name
      if (!newEffect.id || !newEffect.name) {
        return;
      }
      
      // Thêm icon nếu chưa có
      if (!newEffect.icon) {
        newEffect.icon = VideoEffects.getIconForEffect(newEffect.name);
      }
      
      // Tìm effect trong danh sách hiện tại
      const existingIndex = effects.findIndex(e => e.id === newEffect.id);
      
      if (existingIndex >= 0) {
        // Cập nhật effect đã tồn tại
        effects[existingIndex] = { ...effects[existingIndex], ...newEffect };
      } else {
        // Thêm effect mới
        effects.push(newEffect);
      }
    });
    
    console.log(`Effects list now has ${effects.length} items`);
    
    // Cập nhật giao diện người dùng
    updateEffectsUI();
  }
  
  /**
   * Lấy danh sách hiệu ứng hiện có
   * @returns {Array} Danh sách hiệu ứng
   */
  function getEffects() {
    return effects;
  }
  
  /**
   * Hiển thị dropdown chọn hiệu ứng
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyEffect - Callback function to apply effect
   */
  function showEffectDropdown(thumbnailItem, fileData, onApplyEffect) {
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
    init,
    getEffects,
    mergeEffects,
    updateFromDraftContent,
    loadEffectsFromDraftContent,
    updateEffectsUI,
    showEffectDropdown,
    addEffectButton,
    addEffectStyles,
    applyEffectsToDraftContent: DraftContentProcessor.applyEffectsToDraftContent
  };
})();
