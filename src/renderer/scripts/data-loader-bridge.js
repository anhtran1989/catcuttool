/**
 * Data Loader Bridge - Kết nối module ES với code hiện tại
 */

// Import DataLoader từ module ES
import { DataLoader } from './data-loader.js';

// Đặt DataLoader vào global scope để các file khác có thể sử dụng
window.DataLoader = DataLoader;

// Log để xác nhận module đã được tải
console.log('DataLoader module loaded and exposed to global scope');

// Khởi tạo DataLoader khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  // Đảm bảo không xung đột với các script khác
  setTimeout(() => {
    if (window.DataLoader && typeof window.DataLoader.init === 'function') {
      window.DataLoader.init();
      console.log('DataLoader initialized from bridge');
      
      // Tải dữ liệu sau khi khởi tạo
      window.DataLoader.loadData().then(() => {
        console.log('Data loaded from DataLoader bridge');
      });
    }
  }, 100);
});
