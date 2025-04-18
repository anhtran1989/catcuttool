/**
 * Video Effects - Quản lý các hiệu ứng video
 */
const VideoEffects = (function() {
  // Các ID cố định cho extra_material_refs
  const MATERIAL_ANIMATION_ID = "DBD03595-6CB2-4f91-B2D6-D579740311EF";
  
  /**
   * Tạo một hiệu ứng video mới
   * @param {Object} effect Thông tin hiệu ứng
   * @returns {Object} Hiệu ứng video theo định dạng CapCut
   */
  function createVideoEffect(effect) {
    if (!effect) return null;
    
    // Sử dụng ID hiện có hoặc tạo mới
    const effectId = effect.id || Utils.generateUUID();
    
    // Tạo đối tượng effect theo định dạng của CapCut
    return {
      id: effectId,
      name: effect.name || "Hiệu ứng",
      type: "video_effect",
      adjust_params: effect.adjust_params || [],
      apply_target_type: effect.apply_target_type || 2,
      category_id: effect.category_id || "27296",
      category_name: effect.category_name || "Đang thịnh hành",
      effect_id: effect.effect_id || effect.resource_id || "",
      enable_mask: effect.enable_mask !== undefined ? effect.enable_mask : true,
      item_effect_type: effect.item_effect_type || 0,
      path: effect.path || "",
      resource_id: effect.resource_id || effect.effect_id || "",
      source_platform: effect.source_platform || 1,
      value: effect.value || 1.0,
      platform: effect.platform || "all",
      common_keyframes: effect.common_keyframes || [],
      effect_mask: effect.effect_mask || [],
      covering_relation_change: effect.covering_relation_change || 0
    };
  }

  /**
   * Tạo một material animation cho hiệu ứng
   * @param {string} effectId ID của hiệu ứng
   * @returns {Object} Material animation
   */
  function createMaterialAnimation(effectId) {
    // Sử dụng ID cố định cho material_animation
    return {
      id: MATERIAL_ANIMATION_ID, // Sử dụng ID cố định
      material_id: effectId,
      type: "video_effect",
      animation_effects: [],
      keyframe_refs: []
    };
  }

  /**
   * Tạo một loudness cho hiệu ứng
   * @param {string} effectId ID của hiệu ứng
   * @returns {Object} Loudness
   */
  function createLoudness(effectId) {
    return {
      id: Utils.generateUUID(),
      material_id: effectId,
      type: "video_effect",
      loudness: 0
    };
  }

  /**
   * Lấy biểu tượng phù hợp cho effect dựa trên tên
   * @param {string} effectName Tên effect
   * @returns {string} Class của biểu tượng
   */
  function getIconForEffect(effectName) {
    if (!effectName) return "fas fa-magic";
    
    const effectNameLower = effectName.toLowerCase();
    
    // Ánh xạ tên hiệu ứng với biểu tượng
    if (effectNameLower.includes("zoom") || effectNameLower.includes("phóng")) {
      return "fas fa-search-plus";
    } else if (effectNameLower.includes("glitch") || effectNameLower.includes("trục trặc")) {
      return "fas fa-bolt";
    } else if (effectNameLower.includes("blur") || effectNameLower.includes("mờ")) {
      return "fas fa-eye-slash";
    } else if (effectNameLower.includes("shake") || effectNameLower.includes("rung")) {
      return "fas fa-arrows-alt";
    } else if (effectNameLower.includes("flip") || effectNameLower.includes("lật")) {
      return "fas fa-exchange-alt";
    } else if (effectNameLower.includes("rotate") || effectNameLower.includes("xoay")) {
      return "fas fa-sync";
    } else if (effectNameLower.includes("fade") || effectNameLower.includes("mờ dần")) {
      return "fas fa-low-vision";
    } else if (effectNameLower.includes("color") || effectNameLower.includes("màu")) {
      return "fas fa-palette";
    } else if (effectNameLower.includes("pixel")) {
      return "fas fa-th";
    } else if (effectNameLower.includes("none") || effectNameLower.includes("không")) {
      return "fas fa-ban";
    }
    
    // Mặc định
    return "fas fa-magic";
  }

  // Public API
  return {
    createVideoEffect,
    createMaterialAnimation,
    createLoudness,
    getIconForEffect
  };
})();

// Xuất module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoEffects;
}
