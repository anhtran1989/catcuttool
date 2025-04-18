/**
 * Effect Utils - Các tiện ích và hàm hỗ trợ cho hiệu ứng
 */

const EffectUtils = (function() {
  /**
   * Lấy icon phù hợp cho hiệu ứng dựa trên tên
   * @param {string} effectName Tên hiệu ứng
   * @returns {string} Class CSS của icon
   */
  function getIconForEffect(effectName) {
    if (!effectName) return 'fas fa-magic';
    
    const effectNameLower = effectName.toLowerCase();
    
    // Mapping tên hiệu ứng với icon
    if (effectNameLower.includes('zoom') || effectNameLower.includes('phóng')) {
      return 'fas fa-search-plus';
    } else if (effectNameLower.includes('shake') || effectNameLower.includes('rung') || effectNameLower.includes('lắc')) {
      return 'fas fa-arrows-alt';
    } else if (effectNameLower.includes('heart') || effectNameLower.includes('tim') || effectNameLower.includes('trái tim')) {
      return 'fas fa-heart';
    } else if (effectNameLower.includes('blur') || effectNameLower.includes('mờ')) {
      return 'fas fa-tint';
    } else if (effectNameLower.includes('glitch') || effectNameLower.includes('trục trặc')) {
      return 'fas fa-th';
    } else if (effectNameLower.includes('reverse') || effectNameLower.includes('ngược')) {
      return 'fas fa-exchange-alt';
    } else if (effectNameLower.includes('rotate') || effectNameLower.includes('xoay')) {
      return 'fas fa-sync';
    } else if (effectNameLower.includes('flash') || effectNameLower.includes('chớp')) {
      return 'fas fa-bolt';
    } else if (effectNameLower.includes('color') || effectNameLower.includes('màu')) {
      return 'fas fa-palette';
    } else if (effectNameLower.includes('split') || effectNameLower.includes('chia')) {
      return 'fas fa-columns';
    } else if (effectNameLower.includes('mirror') || effectNameLower.includes('gương')) {
      return 'fas fa-clone';
    } else if (effectNameLower.includes('wave') || effectNameLower.includes('sóng')) {
      return 'fas fa-water';
    } else if (effectNameLower.includes('pixel') || effectNameLower.includes('điểm')) {
      return 'fas fa-th';
    } else if (effectNameLower.includes('none') || effectNameLower.includes('không')) {
      return 'fas fa-ban';
    }
    
    // Mặc định
    return 'fas fa-magic';
  }
  
  /**
   * Tạo ID hiệu ứng mới
   * @returns {string} ID mới
   */
  function generateEffectId() {
    return Utils.generateUUID();
  }
  
  /**
   * Tạo một hiệu ứng mới với các thuộc tính mặc định
   * @param {string} name Tên hiệu ứng
   * @param {string} category Danh mục hiệu ứng
   * @returns {Object} Hiệu ứng mới
   */
  function createNewEffect(name, category = "Đang thịnh hành") {
    return {
      id: generateEffectId(),
      name: name,
      type: "video_effect",
      category_name: category,
      effect_id: name.toLowerCase().replace(/\s+/g, '_'),
      icon: getIconForEffect(name),
      adjust_params: []
    };
  }

  // Public API
  return {
    getIconForEffect,
    generateEffectId,
    createNewEffect
  };
})();

// Export module
export { EffectUtils };
