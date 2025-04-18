/**
 * Transition Utils - Các tiện ích và hàm hỗ trợ cho hiệu ứng chuyển cảnh
 */

const TransitionUtils = (function() {
  /**
   * Lấy icon phù hợp cho hiệu ứng chuyển cảnh dựa trên tên
   * @param {string} transitionName Tên hiệu ứng chuyển cảnh
   * @returns {string} Class CSS của icon
   */
  function getIconForTransition(transitionName) {
    if (!transitionName) return 'fas fa-exchange-alt';
    
    const transitionNameLower = transitionName.toLowerCase();
    
    // Mapping tên hiệu ứng chuyển cảnh với icon
    if (transitionNameLower.includes('fade') || transitionNameLower.includes('mờ')) {
      return 'fas fa-adjust';
    } else if (transitionNameLower.includes('slide') || transitionNameLower.includes('trượt')) {
      return 'fas fa-arrows-alt-h';
    } else if (transitionNameLower.includes('zoom') || transitionNameLower.includes('phóng')) {
      return 'fas fa-search-plus';
    } else if (transitionNameLower.includes('wipe') || transitionNameLower.includes('lau')) {
      return 'fas fa-hand-paper';
    } else if (transitionNameLower.includes('dissolve') || transitionNameLower.includes('tan')) {
      return 'fas fa-tint';
    } else if (transitionNameLower.includes('push') || transitionNameLower.includes('đẩy')) {
      return 'fas fa-hand-point-right';
    } else if (transitionNameLower.includes('flip') || transitionNameLower.includes('lật')) {
      return 'fas fa-undo';
    } else if (transitionNameLower.includes('rotate') || transitionNameLower.includes('xoay')) {
      return 'fas fa-sync';
    } else if (transitionNameLower.includes('blur') || transitionNameLower.includes('mờ')) {
      return 'fas fa-eye-slash';
    } else if (transitionNameLower.includes('bubble') || transitionNameLower.includes('bong bóng')) {
      return 'fas fa-circle';
    } else if (transitionNameLower.includes('fire') || transitionNameLower.includes('lửa')) {
      return 'fas fa-fire';
    } else if (transitionNameLower.includes('swipe') || transitionNameLower.includes('vuốt')) {
      return 'fas fa-hand-point-up';
    } else if (transitionNameLower.includes('none') || transitionNameLower.includes('không')) {
      return 'fas fa-ban';
    }
    
    // Mặc định
    return 'fas fa-exchange-alt';
  }
  
  /**
   * Tạo ID hiệu ứng chuyển cảnh mới
   * @returns {string} ID mới
   */
  function generateTransitionId() {
    return Utils.generateUUID();
  }
  
  /**
   * Tạo một hiệu ứng chuyển cảnh mới với các thuộc tính mặc định
   * @param {string} name Tên hiệu ứng chuyển cảnh
   * @param {string} category Danh mục hiệu ứng chuyển cảnh
   * @param {number} duration Thời lượng hiệu ứng chuyển cảnh (microseconds)
   * @returns {Object} Hiệu ứng chuyển cảnh mới
   */
  function createNewTransition(name, category = "Đang thịnh hành", duration = 500000) {
    return {
      id: generateTransitionId(),
      name: name,
      type: "transition",
      category_name: category,
      effect_id: name.toLowerCase().replace(/\s+/g, '_'),
      icon: getIconForTransition(name),
      duration: duration,
      is_overlap: false
    };
  }
  
  /**
   * Chuyển đổi thời lượng từ microseconds sang milliseconds
   * @param {number} microseconds Thời lượng tính bằng microseconds
   * @returns {number} Thời lượng tính bằng milliseconds
   */
  function microsecondsToMilliseconds(microseconds) {
    return microseconds / 1000;
  }
  
  /**
   * Chuyển đổi thời lượng từ milliseconds sang microseconds
   * @param {number} milliseconds Thời lượng tính bằng milliseconds
   * @returns {number} Thời lượng tính bằng microseconds
   */
  function millisecondsToMicroseconds(milliseconds) {
    return milliseconds * 1000;
  }

  // Public API
  return {
    getIconForTransition,
    generateTransitionId,
    createNewTransition,
    microsecondsToMilliseconds,
    millisecondsToMicroseconds
  };
})();

// Export module
export { TransitionUtils };
