/**
 * Utils - Các hàm tiện ích
 */
const Utils = (function() {
  /**
   * Tạo một UUID duy nhất cho các đối tượng
   * @returns {string} UUID duy nhất
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Format paths for CapCut compatibility
   * @param {string} path - Original file path
   * @returns {string} Formatted path for CapCut
   */
  function formatPathForCapcut(path) {
    if (!path) return "";

    // Chuẩn hóa đường dẫn theo định dạng của CapCut
    // Thay thế tất cả dấu \ bằng /
    let formattedPath = path.replace(/\\/g, "/");
    
    // Đảm bảo chỉ có một dấu / sau ký tự ổ đĩa (C:)
    if (/^[A-Za-z]:/.test(formattedPath)) {
      // Loại bỏ tất cả các dấu / sau ký tự ổ đĩa và thêm một dấu /
      formattedPath = formattedPath.replace(/^([A-Za-z]:)\/*/, "$1/");
    }
    
    // Đảm bảo không có nhiều dấu / liên tiếp
    formattedPath = formattedPath.replace(/\/+/g, "/");
    
    console.log("Formatted path:", formattedPath);
    return formattedPath;
  }

  /**
   * Format file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Public API
  return {
    generateUUID,
    formatPathForCapcut,
    formatFileSize
  };
})();

// Xuất module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
