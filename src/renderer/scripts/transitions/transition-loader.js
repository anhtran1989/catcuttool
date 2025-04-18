/**
 * Transition Loader - Module để tải hiệu ứng chuyển cảnh từ các file JSON
 */

import { TransitionUtils } from './transition-utils.js';

const TransitionLoader = (function() {
  /**
   * Tải file draft_content_transition.json và cập nhật danh sách hiệu ứng chuyển cảnh
   * @param {Array} transitions Danh sách hiệu ứng chuyển cảnh hiện tại
   * @param {Function} mergeTransitions Hàm để gộp hiệu ứng chuyển cảnh mới vào danh sách
   */
  function loadTransitionsFromDraftContent(transitions, mergeTransitions) {
    try {
      console.log("Loading transitions from draft_content_transition.json");
      
      // Thử đọc file bằng fetch API
      fetch('./draft_content_transition.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Cập nhật transitions từ file
          updateFromDraftContent(data, transitions, mergeTransitions);
        })
        .catch(error => {
          console.error("Error loading draft_content_transition.json:", error);
          
          // Nếu không thể tải draft_content_transition.json, thử tải draft_content_2.json
          fetch('./draft_content_2.json')
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              // Cập nhật transitions từ file
              updateFromDraftContent(data, transitions, mergeTransitions);
            })
            .catch(error => {
              console.error("Error loading draft_content_2.json:", error);
              // Nếu không thể tải cả hai file, thêm một số hiệu ứng chuyển cảnh mẫu
              addSampleTransitions(mergeTransitions);
            });
        });
    } catch (error) {
      console.error("Error in loadTransitionsFromDraftContent:", error);
      // Nếu có lỗi, thêm một số hiệu ứng chuyển cảnh mẫu
      addSampleTransitions(mergeTransitions);
    }
  }
  
  /**
   * Thêm một số hiệu ứng chuyển cảnh mẫu
   * @param {Function} mergeTransitions Hàm để gộp hiệu ứng chuyển cảnh mới vào danh sách
   */
  function addSampleTransitions(mergeTransitions) {
    console.log("Adding sample transitions");
    
    const sampleTransitions = [
      {
        id: Utils.generateUUID(),
        name: "Fade",
        type: "transition",
        category_name: "Đang thịnh hành",
        effect_id: "fade",
        icon: "fas fa-adjust",
        duration: 500000
      },
      {
        id: Utils.generateUUID(),
        name: "Slide",
        type: "transition",
        category_name: "Đang thịnh hành",
        effect_id: "slide",
        icon: "fas fa-arrows-alt-h",
        duration: 500000
      },
      {
        id: Utils.generateUUID(),
        name: "Zoom",
        type: "transition",
        category_name: "Đang thịnh hành",
        effect_id: "zoom",
        icon: "fas fa-search-plus",
        duration: 500000
      },
      {
        id: Utils.generateUUID(),
        name: "Wipe",
        type: "transition",
        category_name: "Đang thịnh hành",
        effect_id: "wipe",
        icon: "fas fa-hand-paper",
        duration: 500000
      }
    ];
    
    mergeTransitions(sampleTransitions);
  }
  
  /**
   * Cập nhật danh sách transitions từ file draft_content
   * @param {Object} draftContent Nội dung của file draft_content
   * @param {Array} transitions Danh sách hiệu ứng chuyển cảnh hiện tại
   * @param {Function} mergeTransitions Hàm để gộp hiệu ứng chuyển cảnh mới vào danh sách
   */
  function updateFromDraftContent(draftContent, transitions, mergeTransitions) {
    try {
      console.log("Updating transitions from draft content");
      
      if (!draftContent) {
        console.log("Invalid draft content");
        return;
      }
      
      // Tìm kiếm transitions trong cấu trúc JSON
      const foundTransitions = findTransitionsRecursively(draftContent);
      
      if (foundTransitions && foundTransitions.length > 0) {
        console.log(`Found ${foundTransitions.length} transitions in draft content`);
        
        // Cập nhật danh sách transitions
        mergeTransitions(foundTransitions);
      } else {
        console.log("No transitions found in draft content");
        
        // Nếu không tìm thấy transitions, kiểm tra transitions trong materials
        if (draftContent.materials && draftContent.materials.transitions) {
          console.log(`Found ${draftContent.materials.transitions.length} transitions in materials.transitions`);
          
          // Cập nhật danh sách transitions
          mergeTransitions(draftContent.materials.transitions);
        } else {
          console.log("No transitions found in materials.transitions");
          
          // Nếu không tìm thấy transitions trong cả hai nơi, thêm một số hiệu ứng chuyển cảnh mẫu
          addSampleTransitions(mergeTransitions);
        }
      }
    } catch (error) {
      console.error("Error updating transitions from draft content:", error);
      
      // Nếu có lỗi, thêm một số hiệu ứng chuyển cảnh mẫu
      addSampleTransitions(mergeTransitions);
    }
  }
  
  /**
   * Tìm kiếm đệ quy các hiệu ứng chuyển cảnh trong cấu trúc JSON
   * @param {Object} obj Đối tượng JSON cần tìm kiếm
   * @param {Array} results Mảng kết quả (tùy chọn)
   * @returns {Array} Mảng các hiệu ứng chuyển cảnh tìm thấy
   */
  function findTransitionsRecursively(obj, results = []) {
    // Nếu obj là null hoặc không phải object, trả về results
    if (!obj || typeof obj !== 'object') {
      return results;
    }
    
    // Nếu obj là mảng, tìm kiếm trong từng phần tử
    if (Array.isArray(obj)) {
      for (const item of obj) {
        findTransitionsRecursively(item, results);
      }
      return results;
    }
    
    // Kiểm tra xem obj có phải là một transition không
    if (obj.type === 'transition' && obj.name && obj.id) {
      // Thêm icon dựa trên tên transition
      obj.icon = TransitionUtils.getIconForTransition(obj.name);
      
      // Thêm vào kết quả nếu chưa tồn tại
      if (!results.some(t => t.id === obj.id)) {
        results.push(obj);
      }
    }
    
    // Tìm kiếm trong các thuộc tính của obj
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
        findTransitionsRecursively(obj[key], results);
      }
    }
    
    return results;
  }

  // Public API
  return {
    loadTransitionsFromDraftContent,
    updateFromDraftContent,
    addSampleTransitions,
    findTransitionsRecursively
  };
})();

// Export module
export { TransitionLoader };
