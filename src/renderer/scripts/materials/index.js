/**
 * Materials Module - Điểm truy cập chính cho các chức năng quản lý material animations
 */

// Import các module con
import { MaterialLoader } from './material-loader.js';
import { MaterialUI } from './material-ui.js';
import { MaterialUtils } from './material-utils.js';

// Tạo module MaterialManager
const MaterialManager = (function() {
  // Danh sách các material animations đã được lưu
  let materialAnimations = [];
  
  // Lưu trữ tham chiếu đến EffectManager và TransitionManager
  let effectManager = null;
  let transitionManager = null;
  
  /**
   * Khởi tạo Material Manager
   */
  function init() {
    console.log("Initializing MaterialManager");
    
    // Khởi tạo danh sách material animations mặc định
    materialAnimations = MaterialLoader.initializeDefaultMaterialAnimations();
    
    // Thêm styles CSS cho material animations
    MaterialUI.addMaterialStyles();
    
    // Thêm nút để hiển thị thông tin về material_animations
    const showInfoButton = document.createElement('button');
    showInfoButton.textContent = 'Hiển thị Material Animations';
    showInfoButton.style.position = 'fixed';
    showInfoButton.style.bottom = '20px';
    showInfoButton.style.right = '20px';
    showInfoButton.style.zIndex = '9999';
    showInfoButton.addEventListener('click', () => {
      MaterialUI.showMaterialAnimationsInfo(materialAnimations);
    });
    document.body.appendChild(showInfoButton);
  }
  
  /**
   * Đặt tham chiếu đến EffectManager
   * @param {Object} manager - EffectManager instance
   */
  function setEffectManager(manager) {
    effectManager = manager;
    console.log('EffectManager reference set in MaterialManager');
  }
  
  /**
   * Đặt tham chiếu đến TransitionManager
   * @param {Object} manager - TransitionManager instance
   */
  function setTransitionManager(manager) {
    transitionManager = manager;
    console.log('TransitionManager reference set in MaterialManager');
  }

  /**
   * Lấy danh sách material animations hiện tại
   * @returns {Array} Danh sách material animations
   */
  function getMaterialAnimations() {
    return materialAnimations;
  }

  /**
   * Lấy danh sách hiệu ứng cho một loại cụ thể
   * @param {string} type Loại hiệu ứng (in, out, group)
   * @returns {Array} Danh sách hiệu ứng
   */
  function getMaterialAnimationsByType(type) {
    if (!type) return materialAnimations;
    
    // Đảm bảo type hợp lệ
    if (!['in', 'out', 'group'].includes(type)) {
      console.warn(`Invalid animation type: ${type}. Must be one of: in, out, group`);
      return [];
    }
    
    // Tạo "None" option với cấu trúc giống với material animation thật
    const noneOption = {
      name: "None",
      animation_id: "none",
      id: "none",
      category_id: "",
      category_name: type === 'in' ? "Vào" : (type === 'out' ? "Ra" : "Kết hợp"),
      duration: 0,
      material_type: "video",
      panel: "video",
      path: "",
      platform: "all",
      resource_id: "none",
      source_platform: 1,
      start: 0,
      third_resource_id: "none",
      type: type,
      icon: "fas fa-ban"
    };
    
    console.log(`Getting animations for type: ${type}`);
    console.log(`Total animations available: ${materialAnimations.length}`);
    
    // Lọc chính xác theo type (in, out, group)
    const filteredAnimations = materialAnimations.filter(a => a.type === type);
    console.log(`Found ${filteredAnimations.length} animations of type ${type}`);
    
    return [noneOption, ...filteredAnimations];
  }

  /**
   * Lấy danh sách material animations hiệu ứng vào (in)
   * @returns {Array} Danh sách hiệu ứng vào
   */
  function getInAnimations() {
    return getMaterialAnimationsByType("in");
  }

  /**
   * Lấy danh sách material animations hiệu ứng ra (out)
   * @returns {Array} Danh sách hiệu ứng ra
   */
  function getOutAnimations() {
    return getMaterialAnimationsByType("out");
  }

  /**
   * Lấy danh sách material animations hiệu ứng kết hợp (group)
   * @returns {Array} Danh sách hiệu ứng kết hợp
   */
  function getGroupAnimations() {
    return getMaterialAnimationsByType("group");
  }

  /**
   * Cập nhật danh sách hiệu ứng từ draft_content_material.json
   * @param {Object} draftContent Nội dung draft_content_material.json
   */
  function updateFromDraftContent(draftContent) {
    MaterialLoader.updateFromDraftContent(draftContent, materialAnimations, mergeMaterialAnimations);
  }
  
  /**
   * Cập nhật hoặc thêm mới material animations vào danh sách
   * @param {Array} newAnimations Danh sách material animations mới
   */
  function mergeMaterialAnimations(newAnimations) {
    if (!newAnimations || !Array.isArray(newAnimations) || newAnimations.length === 0) {
      console.log("No material animations to merge");
      return;
    }
    
    console.log(`Merging ${newAnimations.length} material animations`);
    
    // Đảm bảo luôn có animation "None" cho mỗi loại
    const noneTypes = ['in', 'out', 'group'];
    noneTypes.forEach(type => {
      if (!materialAnimations.some(a => a.id === 'none' && a.type === type)) {
        materialAnimations.push({
          id: `none_${type}`,
          name: "None",
          type: type,
          duration: 0,
          icon: "fas fa-ban"
        });
      }
    });
    
    // Cập nhật hoặc thêm mới từng animation
    newAnimations.forEach(newAnimation => {
      // Bỏ qua nếu không có tên
      if (!newAnimation.name) {
        return;
      }
      
      // Tạo khóa duy nhất cho animation
      const newKey = MaterialUtils.getUniqueKey(newAnimation);
      
      // Tìm animation trong danh sách hiện tại
      const existingIndex = materialAnimations.findIndex(a => 
        MaterialUtils.getUniqueKey(a) === newKey || 
        (a.id && a.id === newAnimation.id) ||
        (a.name === newAnimation.name && a.type === newAnimation.type)
      );
      
      if (existingIndex >= 0) {
        // Cập nhật animation đã tồn tại
        materialAnimations[existingIndex] = { ...materialAnimations[existingIndex], ...newAnimation };
      } else {
        // Thêm animation mới
        materialAnimations.push(newAnimation);
      }
    });
    
    console.log(`Material animations list now has ${materialAnimations.length} items`);
  }
  
  /**
   * Hiển thị dropdown chọn animation
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {string} animationType - Loại animation (in, out, group)
   * @param {Object} fileData - File data
   * @param {Function} onApplyAnimation - Callback function to apply animation
   */
  function showAnimationDropdown(thumbnailItem, animationType, fileData, onApplyAnimation) {
    // Lấy danh sách animations theo loại
    const animations = getMaterialAnimationsByType(animationType);
    
    // Hiển thị dropdown
    MaterialUI.showAnimationDropdown(thumbnailItem, animationType, fileData, onApplyAnimation, animations);
  }
  
  /**
   * Thêm các button animation (Vào, Kết hợp, Ra) vào thumbnail
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyAnimation - Callback function to apply animation
   */
  function addAnimationButtons(thumbnailItem, fileData, onApplyAnimation) {
    MaterialUI.addAnimationButtons(thumbnailItem, fileData, onApplyAnimation);
  }
  
  /**
   * Đặt danh sách material animations từ DataLoader
   * @param {Array} newAnimations Danh sách material animations mới
   */
  function setMaterialAnimations(newAnimations) {
    console.log(`Setting ${newAnimations.length} material animations from DataLoader`);
    
    // Gộp danh sách material animations mới
    mergeMaterialAnimations(newAnimations);
  }

  // Public API
  return {
    init,
    getMaterialAnimations,
    getInAnimations,
    getOutAnimations,
    getGroupAnimations,
    updateFromDraftContent,
    mergeMaterialAnimations,
    addAnimationButtons,
    showAnimationDropdown,
    setEffectManager,
    setTransitionManager,
    setMaterialAnimations
  };
})();

// Export module
export { MaterialManager };
