/**
 * Effects Module - Điểm truy cập chính cho các chức năng quản lý hiệu ứng
 */

// Import các module con
import { EffectUI } from './effect-ui.js';
import { EffectUtils } from './effect-utils.js';
import { EffectProcessor } from './effect-processor.js';

// Tạo module EffectManager
const EffectManager = (function() {
  // Danh sách các effects đã được lưu
  let effects = [];

  /**
   * Khởi tạo EffectManager
   */
  function init() {
    console.log("Initializing EffectManager");
    
    // Khởi tạo danh sách effects với effect "None"
    effects = [{
      id: "none",
      name: "None",
      type: "video_effect",
      icon: "fas fa-ban"
    }];
    
    // Thêm styles CSS cho hiệu ứng
    EffectUI.addEffectStyles();
  }
  
  /**
   * Đặt danh sách hiệu ứng từ DataLoader
   * @param {Array} newEffects Danh sách hiệu ứng mới
   */
  function setEffects(newEffects) {
    console.log(`Setting ${newEffects.length} effects from DataLoader`);
    
    // Đảm bảo luôn có effect "None"
    if (!effects.some(e => e.id === "none")) {
      effects = [{
        id: "none",
        name: "None",
        type: "video_effect",
        icon: "fas fa-ban"
      }];
    }
    
    // Gộp danh sách hiệu ứng mới
    mergeEffects(newEffects);
  }
  
  /**
   * Cập nhật hoặc thêm mới effects vào danh sách
   * @param {Array} newEffects Danh sách effects mới
   */
  function mergeEffects(newEffects) {
    if (!newEffects || !Array.isArray(newEffects) || newEffects.length === 0) {
      console.log("No effects to merge");
      return;
    }
    
    console.log(`Merging ${newEffects.length} effects`);
    
    // Đảm bảo luôn có effect "None"
    if (!effects.some(e => e.id === "none")) {
      effects.push({
        id: "none",
        name: "None",
        type: "video_effect",
        icon: "fas fa-ban"
      });
    }
    
    // Cập nhật hoặc thêm mới từng effect
    newEffects.forEach(newEffect => {
      // Bỏ qua nếu không có id hoặc name
      if (!newEffect.id || !newEffect.name) {
        return;
      }
      
      // Thêm icon nếu chưa có
      if (!newEffect.icon) {
        newEffect.icon = EffectUtils.getIconForEffect(newEffect.name);
      }
      
      // Tìm effect trong danh sách hiện tại
      const existingIndex = effects.findIndex(e => e.id === newEffect.id);
      
      if (existingIndex >= 0) {
        // Cập nhật effect đã tồn tại
        effects[existingIndex] = { ...effects[existingIndex], ...newEffect };
      } else {
        // Thêm effect mới
        effects.push(newEffect);
      }
    });
    
    console.log(`Effects list now has ${effects.length} items`);
    
    // Cập nhật giao diện người dùng
    EffectUI.updateEffectsUI();
  }
  
  /**
   * Lấy danh sách hiệu ứng hiện có
   * @returns {Array} Danh sách hiệu ứng
   */
  function getEffects() {
    return effects;
  }

  // Public API
  return {
    init,
    getEffects,
    setEffects,
    mergeEffects,
    updateEffectsUI: EffectUI.updateEffectsUI,
    showEffectDropdown: function(thumbnailItem, fileData, onApplyEffect) {
      EffectUI.showEffectDropdown(thumbnailItem, fileData, onApplyEffect, effects);
    },
    addEffectButton: function(thumbnailItem, fileData, onApplyEffect) {
      EffectUI.addEffectButton(thumbnailItem, fileData, onApplyEffect);
    },
    addEffectStyles: EffectUI.addEffectStyles,
    applyEffectsToDraftContent: EffectProcessor.applyEffectsToDraftContent
  };
})();

// Export module
export { EffectManager };
