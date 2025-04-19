/**
 * Transitions Module - Điểm truy cập chính cho các chức năng quản lý hiệu ứng chuyển cảnh
 */

// Import các module con
import { TransitionUI } from './transition-ui.js';
import { TransitionUtils } from './transition-utils.js';
import { TransitionProcessor } from './transition-processor.js';

// Tạo module TransitionManager
const TransitionManager = (function() {
  // Danh sách các transitions đã được lưu
  let transitions = [];

  /**
   * Khởi tạo TransitionManager
   */
  function init() {
    console.log("Initializing TransitionManager");
    
    // Khởi tạo danh sách transitions với transition "None"
    transitions = [{
      id: "none",
      name: "None",
      type: "transition",
      icon: "fas fa-ban"
    }];
    
    // Thêm styles CSS cho hiệu ứng chuyển cảnh
    TransitionUI.addTransitionStyles();
  }
  
  /**
   * Đặt danh sách hiệu ứng chuyển cảnh từ DataLoader
   * @param {Array} newTransitions Danh sách hiệu ứng chuyển cảnh mới
   */
  function setTransitions(newTransitions) {
    console.log(`Setting ${newTransitions.length} transitions from DataLoader`);
    
    // Đảm bảo luôn có transition "None"
    if (!transitions.some(t => t.id === "none")) {
      transitions = [{
        id: "none",
        name: "None",
        type: "transition",
        icon: "fas fa-ban"
      }];
    }
    
    // Gộp danh sách hiệu ứng chuyển cảnh mới
    mergeTransitions(newTransitions);
  }
  
  /**
   * Cập nhật hoặc thêm mới transitions vào danh sách
   * @param {Array} newTransitions Danh sách transitions mới
   */
  function mergeTransitions(newTransitions) {
    if (!newTransitions || !Array.isArray(newTransitions) || newTransitions.length === 0) {
      console.log("No transitions to merge");
      return;
    }
    
    console.log(`Merging ${newTransitions.length} transitions`);
    
    // Đảm bảo luôn có transition "None"
    if (!transitions.some(t => t.id === "none")) {
      transitions.push({
        id: "none",
        name: "None",
        type: "transition",
        icon: "fas fa-ban"
      });
    }
    
    // Cập nhật hoặc thêm mới từng transition
    newTransitions.forEach(newTransition => {
      // Bỏ qua nếu không có id hoặc name
      if (!newTransition.id || !newTransition.name) {
        return;
      }
      
      // Thêm icon nếu chưa có
      if (!newTransition.icon) {
        newTransition.icon = TransitionUtils.getIconForTransition(newTransition.name);
      }
      
      // Tìm transition trong danh sách hiện tại
      const existingIndex = transitions.findIndex(t => t.id === newTransition.id);
      
      if (existingIndex >= 0) {
        // Cập nhật transition đã tồn tại
        transitions[existingIndex] = { ...transitions[existingIndex], ...newTransition };
      } else {
        // Thêm transition mới
        transitions.push(newTransition);
      }
    });
    
    console.log(`Transitions list now has ${transitions.length} items`);
    
    // Cập nhật giao diện người dùng
    TransitionUI.updateTransitionsUI();
  }
  
  /**
   * Lấy danh sách hiệu ứng chuyển cảnh hiện có
   * @returns {Array} Danh sách hiệu ứng chuyển cảnh
   */
  function getTransitions() {
    return transitions;
  }

  // Public API
  return {
    init,
    getTransitions,
    setTransitions,
    mergeTransitions,
    updateTransitionsUI: TransitionUI.updateTransitionsUI,
    showTransitionDropdown: function(thumbnailItem, fileData, onApplyTransition) {
      TransitionUI.showTransitionDropdown(thumbnailItem, fileData, onApplyTransition, transitions);
    },
    addTransitionButton: function(thumbnailItem, fileData, onApplyTransition) {
      TransitionUI.addTransitionButton(thumbnailItem, fileData, onApplyTransition);
    },
    addTransitionStyles: TransitionUI.addTransitionStyles,
    applyTransitionsToDraftContent: TransitionProcessor.applyTransitionsToDraftContent
  };
})();

// Export module
export { TransitionManager };
