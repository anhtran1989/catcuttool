/**
 * Material Bridge - Kết nối module ES với code hiện tại
 */

// Import MaterialManager từ module ES
import { MaterialManager } from './index.js';

// Đặt MaterialManager vào global scope để các file khác có thể sử dụng
window.MaterialManager = MaterialManager;

// Log để xác nhận module đã được tải
console.log('MaterialManager module loaded and exposed to global scope');

// Khởi tạo MaterialManager khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  // Đảm bảo không xung đột với các script khác
  setTimeout(() => {
    if (window.MaterialManager && typeof window.MaterialManager.init === 'function') {
      window.MaterialManager.init();
      console.log('MaterialManager initialized from bridge');
    }
  }, 100);
});
