/**
 * Module Loader Bridge - Kết nối các module ES với code hiện tại
 */

// Biến toàn cục để lưu trữ các module
window.EffectManagerModule = null;
window.TransitionManagerModule = null;

// Hàm để tải các module
function loadModules() {
  return new Promise(async (resolve, reject) => {
    try {
      // Import các module
      const moduleLoader = await import('./module-loader.js');
      
      // Lưu các module vào biến toàn cục
      window.EffectManagerModule = moduleLoader.EffectManager;
      window.TransitionManagerModule = moduleLoader.TransitionManager;
      
      console.log('Modules loaded successfully');
      
      // Khởi tạo các module
      if (window.EffectManagerModule) {
        window.EffectManagerModule.init();
        console.log('EffectManager initialized');
      }
      
      if (window.TransitionManagerModule) {
        window.TransitionManagerModule.init();
        console.log('TransitionManager initialized');
      }
      
      // Tải dữ liệu từ các file JSON
      const effectsPromise = fetch('./draft_content_effect.json')
        .then(response => response.json())
        .then(data => {
          if (window.EffectManagerModule) {
            window.EffectManagerModule.updateFromDraftContent(data);
            console.log('Effects loaded from draft_content_effect.json');
          }
          return true;
        })
        .catch(error => {
          console.warn('Could not load draft_content_effect.json:', error);
          return false;
        });
      
      const transitionsPromise = fetch('./draft_content_transition.json')
        .then(response => response.json())
        .then(data => {
          if (window.TransitionManagerModule) {
            window.TransitionManagerModule.updateFromDraftContent(data);
            console.log('Transitions loaded from draft_content_transition.json');
          }
          return true;
        })
        .catch(error => {
          console.warn('Could not load draft_content_transition.json:', error);
          return false;
        });
      
      // Chờ tải xong dữ liệu
      await Promise.all([effectsPromise, transitionsPromise]);
      
      // Gắn các module vào các đối tượng hiện có nếu cần
      if (window.FileManager && typeof window.FileManager.setEffectManager === 'function') {
        window.FileManager.setEffectManager(window.EffectManagerModule);
        console.log('EffectManager reference set in FileManager');
      }
      
      if (window.MaterialManager && typeof window.MaterialManager.setEffectManager === 'function') {
        window.MaterialManager.setEffectManager(window.EffectManagerModule);
        console.log('EffectManager reference set in MaterialManager');
      }
      
      if (window.MaterialManager && typeof window.MaterialManager.setTransitionManager === 'function') {
        window.MaterialManager.setTransitionManager(window.TransitionManagerModule);
        console.log('TransitionManager reference set in MaterialManager');
      }
      
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
      
      // Cập nhật global dropdowns sau khi các module đã sẵn sàng
      if (window.UIManager) {
        if (typeof window.UIManager.createGlobalEffectsDropdown === 'function') {
          window.UIManager.createGlobalEffectsDropdown();
          console.log('Global effects dropdown created');
        }
        
        if (typeof window.UIManager.createGlobalTransitionsDropdown === 'function') {
          window.UIManager.createGlobalTransitionsDropdown();
          console.log('Global transitions dropdown created');
        }
      }
    }).catch(error => {
      console.error('Error initializing modules:', error);
    });
  }, 100);
});
