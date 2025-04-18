/**
 * Effect Loader - Module để tải hiệu ứng từ các file JSON
 */

import { EffectUtils } from './effect-utils.js';

const EffectLoader = (function() {
  /**
   * Tải file draft_content_2.json và cập nhật danh sách hiệu ứng
   * @param {Array} effects Danh sách hiệu ứng hiện tại
   * @param {Function} mergeEffects Hàm để gộp hiệu ứng mới vào danh sách
   */
  function loadEffectsFromDraftContent(effects, mergeEffects) {
    try {
      console.log("Loading effects from draft_content_2.json");
      
      // Thử đọc file bằng fetch API
      fetch('./draft_content_2.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Cập nhật effects từ file
          updateFromDraftContent(data, effects, mergeEffects);
        })
        .catch(error => {
          console.error("Error loading draft_content_2.json:", error);
          
          // Nếu không thể tải draft_content_2.json, thử tải draft_content_effect.json
          fetch('./draft_content_effect.json')
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              // Cập nhật effects từ file
              if (data && data.materials && data.materials.video_effects) {
                mergeEffects(data.materials.video_effects);
              }
            })
            .catch(error => {
              console.error("Error loading draft_content_effect.json:", error);
              // Nếu không thể tải cả hai file, thêm một số hiệu ứng mẫu
              addSampleEffects(mergeEffects);
            });
        });
    } catch (error) {
      console.error("Error in loadEffectsFromDraftContent:", error);
      // Nếu có lỗi, thêm một số hiệu ứng mẫu
      addSampleEffects(mergeEffects);
    }
  }
  
  /**
   * Thêm một số hiệu ứng mẫu
   * @param {Function} mergeEffects Hàm để gộp hiệu ứng mới vào danh sách
   */
  function addSampleEffects(mergeEffects) {
    console.log("Adding sample effects");
    
    const sampleEffects = [
      {
        id: Utils.generateUUID(),
        name: "Phóng to hình kim cương",
        type: "video_effect",
        category_name: "Đang thịnh hành",
        effect_id: "diamond_zoom",
        icon: "fas fa-search-plus"
      },
      {
        id: Utils.generateUUID(),
        name: "Mở ngược",
        type: "video_effect",
        category_name: "Đang thịnh hành",
        effect_id: "reverse_open",
        icon: "fas fa-exchange-alt"
      },
      {
        id: Utils.generateUUID(),
        name: "Trục trặc pixel",
        type: "video_effect",
        category_name: "Đang thịnh hành",
        effect_id: "pixel_glitch",
        icon: "fas fa-th"
      },
      {
        id: Utils.generateUUID(),
        name: "Rung dọc",
        type: "video_effect",
        category_name: "Đang thịnh hành",
        effect_id: "vertical_shake",
        icon: "fas fa-arrows-alt"
      }
    ];
    
    mergeEffects(sampleEffects);
  }
  
  /**
   * Cập nhật danh sách effects từ file draft_content_2.json
   * @param {Object} draftContent Nội dung của file draft_content_2.json
   * @param {Array} effects Danh sách hiệu ứng hiện tại
   * @param {Function} mergeEffects Hàm để gộp hiệu ứng mới vào danh sách
   */
  function updateFromDraftContent(draftContent, effects, mergeEffects) {
    try {
      console.log("Updating effects from draft content");
      
      if (!draftContent) {
        console.log("Invalid draft content");
        return;
      }
      
      // Tìm kiếm effects trong cấu trúc JSON
      const foundEffects = findEffectsRecursively(draftContent);
      
      if (foundEffects && foundEffects.length > 0) {
        console.log(`Found ${foundEffects.length} effects in draft content`);
        
        // Cập nhật danh sách effects
        mergeEffects(foundEffects);
      } else {
        console.log("No effects found in draft content");
        
        // Nếu không tìm thấy effects, kiểm tra video_effects trong materials
        if (draftContent.materials && draftContent.materials.video_effects) {
          console.log(`Found ${draftContent.materials.video_effects.length} effects in materials.video_effects`);
          
          // Cập nhật danh sách effects
          mergeEffects(draftContent.materials.video_effects);
        } else {
          console.log("No effects found in materials.video_effects");
          
          // Nếu không tìm thấy effects trong cả hai nơi, thêm một số hiệu ứng mẫu
          addSampleEffects(mergeEffects);
        }
      }
    } catch (error) {
      console.error("Error updating effects from draft content:", error);
      
      // Nếu có lỗi, thêm một số hiệu ứng mẫu
      addSampleEffects(mergeEffects);
    }
  }
  
  /**
   * Tìm kiếm đệ quy các hiệu ứng trong cấu trúc JSON
   * @param {Object} obj Đối tượng JSON cần tìm kiếm
   * @param {Array} results Mảng kết quả (tùy chọn)
   * @returns {Array} Mảng các hiệu ứng tìm thấy
   */
  function findEffectsRecursively(obj, results = []) {
    // Nếu obj là null hoặc không phải object, trả về results
    if (!obj || typeof obj !== 'object') {
      return results;
    }
    
    // Nếu obj là mảng, tìm kiếm trong từng phần tử
    if (Array.isArray(obj)) {
      for (const item of obj) {
        findEffectsRecursively(item, results);
      }
      return results;
    }
    
    // Kiểm tra xem obj có phải là một effect không
    if (obj.type === 'video_effect' && obj.name && obj.id) {
      // Thêm icon dựa trên tên effect
      obj.icon = EffectUtils.getIconForEffect(obj.name);
      
      // Thêm vào kết quả nếu chưa tồn tại
      if (!results.some(e => e.id === obj.id)) {
        results.push(obj);
      }
    }
    
    // Tìm kiếm trong các thuộc tính của obj
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
        findEffectsRecursively(obj[key], results);
      }
    }
    
    return results;
  }

  // Public API
  return {
    loadEffectsFromDraftContent,
    updateFromDraftContent,
    addSampleEffects,
    findEffectsRecursively
  };
})();

// Export module
export { EffectLoader };
