/**
 * Effect Bridge - Kết nối module ES với code hiện tại
 */

// Import EffectManager từ module ES
import { EffectManager } from './index.js';

// Đặt EffectManager vào global scope để các file khác có thể sử dụng
window.EffectManager = EffectManager;

// Log để xác nhận module đã được tải
console.log('EffectManager module loaded and exposed to global scope');

// Khởi tạo EffectManager khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  // Đảm bảo không xung đột với các script khác
  setTimeout(() => {
    if (window.EffectManager && typeof window.EffectManager.init === 'function') {
      window.EffectManager.init();
      console.log('EffectManager initialized from bridge');
    }
  }, 100);
});
