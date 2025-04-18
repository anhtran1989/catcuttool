/**
 * Module Loader - Tải và khởi tạo các module cho ứng dụng
 */

// Import các module
import { EffectManager } from './effects/index.js';
import { TransitionManager } from './transitions/index.js';

// Khởi tạo các module khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing modules...');
  
  // Khởi tạo EffectManager
  EffectManager.init();
  
  // Khởi tạo TransitionManager
  TransitionManager.init();
  
  console.log('All modules initialized successfully');
});

// Export các module để có thể sử dụng từ các file khác
export { EffectManager, TransitionManager };
