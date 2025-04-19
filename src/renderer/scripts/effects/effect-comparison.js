/**
 * Effect Comparison - Module để so sánh hiệu ứng từ các file JSON khác nhau
 */

import { EffectUtils } from './effect-utils.js';

const EffectComparison = (function() {
  // Lưu trữ hiệu ứng từ các nguồn khác nhau
  let effectSources = {
    default: [],
    draft2: []
  };
  
  // Dropdown hiện tại đang mở
  let currentDropdown = null;

  /**
   * Khởi tạo module
   */
  function init() {
    console.log("Initializing Effect Comparison module");
    
    // Tải hiệu ứng từ draft_content_2.json
    loadEffectsFromDraft2();
    
    // Thêm nút chuyển đổi nguồn hiệu ứng vào giao diện
    addEffectSourceToggle();
    
    // Lắng nghe sự kiện click để mở dropdown
    document.addEventListener('click', handleEffectSourceClick);
  }
  
  /**
   * Tải hiệu ứng từ file draft_content_2.json
   */
  function loadEffectsFromDraft2() {
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
          // Lưu trữ hiệu ứng từ draft_content_2.json
          if (data && data.materials && data.materials.video_effects) {
            effectSources.draft2 = data.materials.video_effects.map(effect => {
              return {
                ...effect,
                icon: EffectUtils.getIconForEffect(effect.name)
              };
            });
            console.log(`Loaded ${effectSources.draft2.length} effects from draft_content_2.json`);
          }
        })
        .catch(error => {
          console.error("Error loading draft_content_2.json:", error);
        });
    } catch (error) {
      console.error("Error in loadEffectsFromDraft2:", error);
    }
  }
  
  /**
   * Thêm nút chuyển đổi nguồn hiệu ứng vào giao diện
   */
  function addEffectSourceToggle() {
    // Tạo nút chuyển đổi nguồn hiệu ứng
    const toggleButton = document.createElement('button');
    toggleButton.id = 'effect-source-toggle';
    toggleButton.className = 'effect-source-toggle';
    toggleButton.innerHTML = '<i class="fas fa-exchange-alt"></i> So sánh hiệu ứng';
    
    // Thêm vào giao diện
    const exportContainer = document.querySelector('.export-container');
    if (exportContainer) {
      exportContainer.appendChild(toggleButton);
    }
    
    // Thêm CSS cho nút
    const style = document.createElement('style');
    style.textContent = `
      .effect-source-toggle {
        background-color: #4CAF50;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
        font-size: 14px;
      }
      .effect-source-toggle:hover {
        background-color: #45a049;
      }
      .effect-source-dropdown {
        position: absolute;
        background-color: #f9f9f9;
        min-width: 200px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1000;
        border-radius: 4px;
        display: none;
      }
      .effect-source-dropdown.show {
        display: block;
      }
      .effect-source-dropdown ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      .effect-source-dropdown li {
        padding: 10px 15px;
        cursor: pointer;
      }
      .effect-source-dropdown li:hover {
        background-color: #f1f1f1;
      }
      .effect-source-dropdown li.active {
        background-color: #e0e0e0;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Xử lý sự kiện click vào nút chuyển đổi nguồn hiệu ứng
   * @param {Event} event Sự kiện click
   */
  function handleEffectSourceClick(event) {
    const toggleButton = document.getElementById('effect-source-toggle');
    
    // Nếu click vào nút chuyển đổi nguồn hiệu ứng
    if (toggleButton && toggleButton.contains(event.target)) {
      event.preventDefault();
      
      // Kiểm tra xem dropdown đã tồn tại chưa
      let dropdown = document.querySelector('.effect-source-dropdown');
      
      // Nếu chưa tồn tại, tạo mới
      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'effect-source-dropdown';
        
        // Tạo danh sách nguồn hiệu ứng
        const ul = document.createElement('ul');
        
        // Thêm các nguồn hiệu ứng
        const sources = [
          { id: 'default', name: 'Hiệu ứng mặc định' },
          { id: 'draft2', name: 'Hiệu ứng từ draft_content_2.json' }
        ];
        
        sources.forEach(source => {
          const li = document.createElement('li');
          li.dataset.source = source.id;
          li.textContent = source.name;
          li.addEventListener('click', () => {
            // Đánh dấu nguồn hiệu ứng đang chọn
            document.querySelectorAll('.effect-source-dropdown li').forEach(item => {
              item.classList.remove('active');
            });
            li.classList.add('active');
            
            // Áp dụng nguồn hiệu ứng
            applyEffectSource(source.id);
            
            // Đóng dropdown
            dropdown.classList.remove('show');
          });
          ul.appendChild(li);
        });
        
        dropdown.appendChild(ul);
        document.body.appendChild(dropdown);
      }
      
      // Hiển thị dropdown
      const rect = toggleButton.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + window.scrollY}px`;
      dropdown.style.left = `${rect.left + window.scrollX}px`;
      dropdown.classList.toggle('show');
      
      // Lưu trữ dropdown hiện tại
      currentDropdown = dropdown.classList.contains('show') ? dropdown : null;
    } else if (currentDropdown && !currentDropdown.contains(event.target)) {
      // Nếu click bên ngoài dropdown, đóng dropdown
      currentDropdown.classList.remove('show');
      currentDropdown = null;
    }
  }
  
  /**
   * Áp dụng nguồn hiệu ứng
   * @param {string} sourceId ID của nguồn hiệu ứng
   */
  function applyEffectSource(sourceId) {
    console.log(`Applying effect source: ${sourceId}`);
    
    // Lấy danh sách hiệu ứng từ nguồn đã chọn
    const effects = effectSources[sourceId] || [];
    
    // Cập nhật tất cả các dropdown hiệu ứng
    updateAllEffectDropdowns(effects);
  }
  
  /**
   * Cập nhật tất cả các dropdown hiệu ứng
   * @param {Array} effects Danh sách hiệu ứng mới
   */
  function updateAllEffectDropdowns(effects) {
    // Lấy tất cả các dropdown hiệu ứng
    const dropdowns = document.querySelectorAll('.effects-dropdown');
    
    dropdowns.forEach(dropdown => {
      // Xóa tất cả các hiệu ứng hiện tại
      dropdown.innerHTML = '';
      
      // Thêm hiệu ứng "None"
      const noneItem = document.createElement('div');
      noneItem.className = 'effect-item';
      noneItem.dataset.effectId = 'none';
      noneItem.dataset.name = 'None';
      noneItem.innerHTML = '<i class="fas fa-ban"></i> None';
      dropdown.appendChild(noneItem);
      
      // Thêm các hiệu ứng mới
      effects.forEach(effect => {
        const effectItem = document.createElement('div');
        effectItem.className = 'effect-item';
        effectItem.dataset.effectId = effect.effect_id;
        effectItem.dataset.name = effect.name;
        
        // Thêm icon nếu có
        const icon = effect.icon || 'fas fa-magic';
        effectItem.innerHTML = `<i class="${icon}"></i> ${effect.name}`;
        
        dropdown.appendChild(effectItem);
      });
      
      // Thêm sự kiện click cho các hiệu ứng
      addEffectItemClickHandlers(dropdown);
    });
  }
  
  /**
   * Thêm sự kiện click cho các hiệu ứng
   * @param {HTMLElement} dropdown Dropdown hiệu ứng
   */
  function addEffectItemClickHandlers(dropdown) {
    const effectItems = dropdown.querySelectorAll('.effect-item');
    
    effectItems.forEach(item => {
      item.addEventListener('click', function() {
        // Lấy thông tin hiệu ứng
        const effectId = this.dataset.effectId;
        const effectName = this.dataset.name;
        
        // Lấy container cha
        const effectsContainer = dropdown.closest('.effects-container');
        
        // Lấy label hiệu ứng
        const effectsLabel = effectsContainer.querySelector('.effects-label');
        
        // Cập nhật label
        if (effectsLabel) {
          effectsLabel.innerHTML = `<i class="${this.querySelector('i').className}"></i> ${effectName}`;
          effectsLabel.dataset.effectId = effectId;
          effectsLabel.dataset.name = effectName;
        }
        
        // Lấy thumbnail item
        const thumbnailItem = effectsContainer.closest('.thumbnail-item');
        
        // Cập nhật selected-effect
        if (thumbnailItem) {
          let selectedEffect = thumbnailItem.querySelector('.selected-effect');
          
          if (!selectedEffect) {
            selectedEffect = document.createElement('div');
            selectedEffect.className = 'selected-effect';
            thumbnailItem.appendChild(selectedEffect);
          }
          
          selectedEffect.dataset.effectId = effectId;
          selectedEffect.dataset.name = effectName;
          selectedEffect.innerHTML = `<i class="${this.querySelector('i').className}"></i> ${effectName}`;
        }
        
        // Đóng dropdown
        dropdown.classList.remove('show');
      });
    });
  }

  /**
   * So sánh dữ liệu hiệu ứng và cập nhật giao diện
   * @param {Array} effects Danh sách hiệu ứng từ DataLoader
   */
  function compareEffects(effects) {
    console.log(`Comparing ${effects.length} effects from DataLoader`);
    
    // Lưu trữ hiệu ứng vào nguồn default
    effectSources.default = effects.map(effect => {
      return {
        ...effect,
        icon: EffectUtils.getIconForEffect(effect.name)
      };
    });
    
    // So sánh số lượng hiệu ứng giữa các nguồn
    console.log(`Effects comparison: default=${effectSources.default.length}, draft2=${effectSources.draft2.length}`);
    
    // Tạo bảng so sánh
    createComparisonTable();
    
    // Áp dụng nguồn hiệu ứng mặc định
    applyEffectSource('default');
  }
  
  /**
   * Tạo bảng so sánh hiệu ứng
   */
  function createComparisonTable() {
    // Kiểm tra xem đã có bảng so sánh chưa
    let comparisonTable = document.getElementById('effect-comparison-table');
    
    if (!comparisonTable) {
      // Tạo bảng so sánh
      comparisonTable = document.createElement('div');
      comparisonTable.id = 'effect-comparison-table';
      comparisonTable.className = 'effect-comparison-table';
      
      // Thêm vào giao diện
      const exportContainer = document.querySelector('.export-container');
      if (exportContainer) {
        exportContainer.appendChild(comparisonTable);
      }
      
      // Thêm CSS cho bảng
      const style = document.createElement('style');
      style.textContent = `
        .effect-comparison-table {
          margin-top: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          background-color: #f9f9f9;
        }
        .effect-comparison-header {
          font-weight: bold;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
        }
        .effect-comparison-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .effect-comparison-row:last-child {
          border-bottom: none;
        }
        .effect-source-count {
          margin-left: 10px;
          padding: 2px 6px;
          background-color: #4CAF50;
          color: white;
          border-radius: 10px;
          font-size: 12px;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Cập nhật nội dung bảng
    comparisonTable.innerHTML = `
      <div class="effect-comparison-header">
        <div>So sánh nguồn hiệu ứng</div>
      </div>
      <div class="effect-comparison-row">
        <div>Mặc định (DataLoader)</div>
        <div class="effect-source-count">${effectSources.default.length}</div>
      </div>
      <div class="effect-comparison-row">
        <div>draft_content_2.json</div>
        <div class="effect-source-count">${effectSources.draft2.length}</div>
      </div>
    `;
  }
  
  // Public API
  return {
    init,
    loadEffectsFromDraft2,
    applyEffectSource,
    compareEffects
  };
})();

// Export module
export { EffectComparison };
