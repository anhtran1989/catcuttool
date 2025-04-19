/**
 * Module Loader Bridge - Kết nối các module ES với code hiện tại
 */

// Biến toàn cục để lưu trữ các module
window.EffectManagerModule = null;
window.TransitionManagerModule = null;
window.MaterialManagerModule = null;
window.EffectComparisonModule = null;
window.DataLoaderModule = null;

// Hàm để tải các module
function loadModules() {
  return new Promise(async (resolve, reject) => {
    try {
      // Import các module
      const moduleLoader = await import('./module-loader.js');
      
      // Lưu các module vào biến toàn cục
      window.EffectManagerModule = moduleLoader.EffectManager;
      window.TransitionManagerModule = moduleLoader.TransitionManager;
      window.MaterialManagerModule = moduleLoader.MaterialManager;
      window.EffectComparisonModule = moduleLoader.EffectComparison;
      window.DataLoaderModule = moduleLoader.DataLoader;
      
      console.log('Modules loaded successfully');
      
      // Khởi tạo DataLoader trước tiên
      if (window.DataLoaderModule) {
        window.DataLoaderModule.init();
        console.log('DataLoader initialized');
      }
      
      // Khởi tạo các module khác
      if (window.EffectManagerModule) {
        window.EffectManagerModule.init();
        console.log('EffectManager initialized');
      }
      
      if (window.TransitionManagerModule) {
        window.TransitionManagerModule.init();
        console.log('TransitionManager initialized');
      }
      
      if (window.MaterialManagerModule) {
        window.MaterialManagerModule.init();
        console.log('MaterialManager initialized');
      }
      
      if (window.EffectComparisonModule) {
        window.EffectComparisonModule.init();
        console.log('EffectComparison initialized');
      }
      
      // Đăng ký callback cho DataLoader để cập nhật dữ liệu khi tải xong
      if (window.DataLoaderModule) {
        window.DataLoaderModule.onDataLoaded(() => {
          console.log('Data loaded from draft_content_2.json');
          
          // Cập nhật effects từ DataLoader
          if (window.EffectManagerModule) {
            const effects = window.DataLoaderModule.getEffects();
            window.EffectManagerModule.setEffects(effects);
            console.log(`${effects.length} effects loaded from DataLoader`);
            
            // So sánh dữ liệu effects
            if (window.EffectComparisonModule) {
              window.EffectComparisonModule.compareEffects(effects);
              console.log('Effects comparison initialized');
            }
          }
          
          // Cập nhật transitions từ DataLoader
          if (window.TransitionManagerModule) {
            const transitions = window.DataLoaderModule.getTransitions();
            window.TransitionManagerModule.setTransitions(transitions);
            console.log(`${transitions.length} transitions loaded from DataLoader`);
          }
          
          // Cập nhật material animations từ DataLoader
          if (window.MaterialManagerModule) {
            const materialAnimations = window.DataLoaderModule.getMaterialAnimations();
            window.MaterialManagerModule.setMaterialAnimations(materialAnimations);
            console.log(`${materialAnimations.length} material animations loaded from DataLoader`);
            
            // Thiết lập tham chiếu giữa các module
            if (window.EffectManagerModule) {
              window.MaterialManagerModule.setEffectManager(window.EffectManagerModule);
            }
            if (window.TransitionManagerModule) {
              window.MaterialManagerModule.setTransitionManager(window.TransitionManagerModule);
            }
          }
          
          // Cập nhật global dropdowns sau khi các module đã được cập nhật dữ liệu
          if (window.UIManager) {
            if (typeof window.UIManager.createGlobalEffectsDropdown === 'function') {
              window.UIManager.createGlobalEffectsDropdown();
              console.log('Global effects dropdown created after data loaded');
            }
            
            if (typeof window.UIManager.createGlobalTransitionsDropdown === 'function') {
              window.UIManager.createGlobalTransitionsDropdown();
              console.log('Global transitions dropdown created after data loaded');
            }
          }
        });
        
        // Bắt đầu tải dữ liệu từ một file duy nhất
        window.DataLoaderModule.loadData();
      }
      
      // Gắn các module vào các đối tượng hiện có nếu cần
      if (window.FileManager && typeof window.FileManager.setEffectManager === 'function') {
        window.FileManager.setEffectManager(window.EffectManagerModule);
        console.log('EffectManager reference set in FileManager');
      }
      
      // Lưu ý: MaterialManager đã được thay thế bằng MaterialManagerModule
      // và các tham chiếu đã được thiết lập trong callback onDataLoaded
      
      // Thêm các nút hiệu ứng và chuyển cảnh vào các thumbnail hiện có
      addButtonsToExistingThumbnails();
      
      resolve(true);
    } catch (error) {
      console.error('Error loading modules:', error);
      reject(error);
    }
  });
}

// Hàm để thêm các nút hiệu ứng và chuyển cảnh vào các thumbnail hiện có
function addButtonsToExistingThumbnails() {
  const thumbnailItems = document.querySelectorAll('.thumbnail-item');
  
  thumbnailItems.forEach(thumbnailItem => {
    // Thêm nút hiệu ứng
    if (window.EffectManagerModule) {
      window.EffectManagerModule.addEffectButton(thumbnailItem, {}, (thumbnailItem, effect, fileData) => {
        console.log('Effect applied:', effect);
      });
    }
    
    // Thêm nút chuyển cảnh
    if (window.TransitionManagerModule) {
      window.TransitionManagerModule.addTransitionButton(thumbnailItem, {}, (thumbnailItem, transition, fileData) => {
        console.log('Transition applied:', transition);
      });
    }
  });
}

// Tải các module khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  // Đảm bảo rằng chúng ta không gây xung đột với các script khác
  setTimeout(function() {
    loadModules().then(() => {
      window.modulesLoaded = true;
      console.log('All modules loaded and initialized');
      
      // Khởi tạo sự kiện để thông báo các module đã sẵn sàng
      const event = new CustomEvent('modulesReady');
      document.dispatchEvent(event);
    }).catch(error => {
      console.error('Error initializing modules:', error);
    });
  }, 100);
});
