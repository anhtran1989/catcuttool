/**
 * Material Utils - Các tiện ích và hàm hỗ trợ cho Material Animations
 */

const MaterialUtils = (function() {
  /**
   * Lấy biểu tượng phù hợp cho material animation dựa trên loại và tên
   * @param {string} type Loại animation (in, out, group)
   * @param {string} name Tên animation
   * @returns {string} Class của biểu tượng
   */
  function getIconForMaterialAnimation(type, name) {
    if (!name) return 'fas fa-magic';
    
    // Mặc định icon dựa trên loại
    let defaultIcon = 'fas fa-magic';
    if (type === 'in') defaultIcon = 'fas fa-sign-in-alt';
    else if (type === 'out') defaultIcon = 'fas fa-sign-out-alt';
    else if (type === 'group') defaultIcon = 'fas fa-object-group';
    
    const nameLower = name.toLowerCase();
    
    // Ánh xạ tên với icon
    const iconMap = {
      'zoom': 'fas fa-search-plus',
      'phóng to': 'fas fa-search-plus',
      'thu nhỏ': 'fas fa-search-minus',
      'lắc': 'fas fa-arrows-alt',
      'rung': 'fas fa-arrows-alt',
      'xoay': 'fas fa-sync',
      'quay': 'fas fa-sync',
      'fade': 'fas fa-eye-slash',
      'mờ dần': 'fas fa-eye-slash'
    };
    
    // Tìm icon phù hợp
    for (const [key, icon] of Object.entries(iconMap)) {
      if (nameLower.includes(key)) {
        return icon;
      }
    }
    
    return defaultIcon;
  }
  
  /**
   * Tạo khóa duy nhất cho mỗi animation dựa trên các thuộc tính quan trọng
   * @param {Object} anim Animation object
   * @returns {string} Khóa duy nhất
   */
  function getUniqueKey(anim) {
    if (!anim) return '';
    
    // Sử dụng id nếu có
    if (anim.id) return anim.id;
    
    // Hoặc tạo khóa từ tên và loại
    return `${anim.name || ''}_${anim.type || ''}_${anim.duration || 0}`;
  }

  // Public API
  return {
    getIconForMaterialAnimation,
    getUniqueKey
  };
})();

// Export module
export { MaterialUtils };
