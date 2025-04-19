/**
 * Transition Bridge - Kết nối module ES với code hiện tại
 */

// Import TransitionManager từ module ES
import { TransitionManager } from './index.js';

// Đặt TransitionManager vào global scope để các file khác có thể sử dụng
window.TransitionManager = TransitionManager;

// Log để xác nhận module đã được tải
console.log('TransitionManager module loaded and exposed to global scope');

// Khởi tạo TransitionManager khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  // Đảm bảo không xung đột với các script khác
  setTimeout(() => {
    if (window.TransitionManager && typeof window.TransitionManager.init === 'function') {
      window.TransitionManager.init();
      console.log('TransitionManager initialized from bridge');
    }
  }, 100);
});
