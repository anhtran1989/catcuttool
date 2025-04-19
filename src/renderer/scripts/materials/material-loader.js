/**
 * Material Loader - Xử lý việc tải dữ liệu material animations
 */

import { MaterialUtils } from './material-utils.js';

const MaterialLoader = (function() {
  /**
   * Cập nhật danh sách hiệu ứng từ dữ liệu JSON
   * @param {Object} draftContent Nội dung JSON
   * @param {Array} materialAnimations Mảng hiện tại của material animations
   * @param {Function} mergeMaterialAnimations Hàm để gộp animations
   */
  function updateFromDraftContent(draftContent, materialAnimations, mergeMaterialAnimations) {
    try {
      if (!draftContent) {
        console.warn("Không tìm thấy dữ liệu trong draft content");
        return;
      }

      const newAnimations = [];
      console.log("Đang xử lý draft content cho material animations...");

      // Kiểm tra cụ thể cho cấu trúc material_animations
      if (draftContent.materials && draftContent.materials.material_animations) {
        console.log("Tìm thấy cấu trúc material_animations");
        
        // Xử lý cấu trúc material_animations theo mẫu của người dùng
        draftContent.materials.material_animations.forEach(animation => {
          if (animation && animation.name) {
            // Xác định loại animation (in, out, group)
            let type = 'group'; // Mặc định là group
            
            // Phân loại dựa trên tên
            const nameLower = animation.name.toLowerCase();
            if (nameLower.includes('vào') || nameLower.includes('in')) {
              type = 'in';
            } else if (nameLower.includes('ra') || nameLower.includes('out')) {
              type = 'out';
            }
            
            // Gán loại vào animation
            const processedAnimation = {
              ...animation,
              type: animation.type || type,
              icon: MaterialUtils.getIconForMaterialAnimation(type, animation.name)
            };
            
            newAnimations.push(processedAnimation);
          }
        });
        
        console.log(`Tìm thấy ${newAnimations.length} material animations trong cấu trúc materials.material_animations`);
      } else {
        // Tìm kiếm đệ quy trong toàn bộ cấu trúc
        const foundAnimations = findAnimationsRecursively(draftContent);
        if (foundAnimations.length > 0) {
          console.log(`Tìm thấy ${foundAnimations.length} material animations từ tìm kiếm đệ quy`);
          newAnimations.push(...foundAnimations);
        }
      }
      
      // Gộp animations mới vào danh sách hiện tại
      if (newAnimations.length > 0) {
        mergeMaterialAnimations(newAnimations);
      } else {
        console.warn("Không tìm thấy material animations nào trong dữ liệu");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật material animations từ draft content:", error);
    }
  }
  
  /**
   * Hàm đệ quy tìm kiếm tất cả các đối tượng có thuộc tính name, type, duration
   * @param {Object} obj Đối tượng cần tìm kiếm
   * @param {string} path Đường dẫn hiện tại
   * @returns {Array} Danh sách các animation tìm thấy
   */
  function findAnimationsRecursively(obj, path = '') {
    const animations = [];
    
    // Nếu không phải object hoặc null, dừng đệ quy
    if (!obj || typeof obj !== 'object') return animations;
    
    // Nếu là mảng, duyệt qua từng phần tử
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const childPath = `${path}[${index}]`;
        const childAnimations = findAnimationsRecursively(item, childPath);
        animations.push(...childAnimations);
      });
      return animations;
    }
    
    // Kiểm tra xem đối tượng hiện tại có phải là một animation không
    if (obj.name && (obj.type || obj.duration)) {
      // Xác định loại animation (in, out, group)
      let type = 'group'; // Mặc định là group
      
      if (obj.type) {
        // Nếu đã có type, sử dụng nó
        type = obj.type;
      } else {
        // Phân loại dựa trên tên
        const nameLower = obj.name.toLowerCase();
        if (nameLower.includes('vào') || nameLower.includes('in')) {
          type = 'in';
        } else if (nameLower.includes('ra') || nameLower.includes('out')) {
          type = 'out';
        }
      }
      
      // Tạo một đối tượng animation mới
      const animation = {
        ...obj,
        type: type,
        path: path,
        icon: MaterialUtils.getIconForMaterialAnimation(type, obj.name)
      };
      
      animations.push(animation);
    }
    
    // Tiếp tục tìm kiếm trong các thuộc tính con
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const childPath = path ? `${path}.${key}` : key;
        const childAnimations = findAnimationsRecursively(obj[key], childPath);
        animations.push(...childAnimations);
      }
    }
    
    return animations;
  }
  
  /**
   * Khởi tạo danh sách material animations mặc định
   * @returns {Array} Danh sách material animations mặc định
   */
  function initializeDefaultMaterialAnimations() {
    const defaultAnimations = [
      {
        id: "none_in",
        name: "None",
        type: "in",
        duration: 0,
        icon: "fas fa-ban"
      },
      {
        id: "none_out",
        name: "None",
        type: "out",
        duration: 0,
        icon: "fas fa-ban"
      },
      {
        id: "none_group",
        name: "None",
        type: "group",
        duration: 0,
        icon: "fas fa-ban"
      },
      {
        id: "fade_in",
        name: "Fade In",
        type: "in",
        duration: 500000,
        icon: "fas fa-eye"
      },
      {
        id: "fade_out",
        name: "Fade Out",
        type: "out",
        duration: 500000,
        icon: "fas fa-eye-slash"
      },
      {
        id: "zoom_in",
        name: "Zoom In",
        type: "in",
        duration: 500000,
        icon: "fas fa-search-plus"
      },
      {
        id: "zoom_out",
        name: "Zoom Out",
        type: "out",
        duration: 500000,
        icon: "fas fa-search-minus"
      }
    ];
    
    return defaultAnimations;
  }

  // Public API
  return {
    updateFromDraftContent,
    findAnimationsRecursively,
    initializeDefaultMaterialAnimations
  };
})();

// Export module
export { MaterialLoader };
