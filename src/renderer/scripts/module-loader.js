/**
 * Module Loader - Tải và khởi tạo các module cho ứng dụng
 */

// Import các module
import { EffectManager } from './effects/index.js';
import { TransitionManager } from './transitions/index.js';
import { DataLoader } from './data-loader.js';

// Khởi tạo các module khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing modules...');
  
  // Khởi tạo DataLoader trước tiên
  DataLoader.init();
  
  // Đăng ký các callback khi dữ liệu được tải
  DataLoader.onDataLoaded(data => {
    console.log('Data loaded, initializing other modules...');
    
    // Khởi tạo EffectManager
    EffectManager.init();
    EffectManager.setEffects(DataLoader.getEffects());
    
    // Khởi tạo TransitionManager
    TransitionManager.init();
    TransitionManager.setTransitions(DataLoader.getTransitions());
    
    console.log('All modules initialized successfully');
  });
});

// Export các module để có thể sử dụng từ các file khác
export { EffectManager, TransitionManager, DataLoader };
