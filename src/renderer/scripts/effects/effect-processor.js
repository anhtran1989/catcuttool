/**
 * Effect Processor - Xử lý và áp dụng hiệu ứng vào nội dung
 */

const EffectProcessor = (function() {
  /**
   * Áp dụng hiệu ứng vào draft content
   * @param {Object} draftContent Nội dung draft
   * @param {Object} effect Hiệu ứng cần áp dụng
   * @param {Object} options Các tùy chọn bổ sung
   * @returns {Object} Nội dung draft đã được áp dụng hiệu ứng
   */
  function applyEffectsToDraftContent(draftContent, effect, options = {}) {
    if (!draftContent || !effect) {
      console.error("Invalid draft content or effect");
      return draftContent;
    }
    
    try {
      console.log(`Applying effect "${effect.name}" to draft content`);
      
      // Tạo bản sao của draft content để không ảnh hưởng đến dữ liệu gốc
      const updatedContent = JSON.parse(JSON.stringify(draftContent));
      
      // Nếu effect là "None", không thực hiện thay đổi
      if (effect.id === "none") {
        console.log("Effect is None, no changes applied");
        return updatedContent;
      }
      
      // Đảm bảo materials và video_effects tồn tại
      if (!updatedContent.materials) {
        updatedContent.materials = {};
      }
      
      if (!updatedContent.materials.video_effects) {
        updatedContent.materials.video_effects = [];
      }
      
      // Tạo bản sao của hiệu ứng để đảm bảo đầy đủ các trường theo cấu trúc chuẩn
      const completeEffect = {
        // Các trường bắt buộc theo cấu trúc chuẩn CapCut
        id: effect.id || generateUUID(),
        effect_id: effect.effect_id,
        name: effect.name,
        type: "video_effect",
        category_id: effect.category_id || "27296",
        category_name: effect.category_name || "Đang thịnh hành",
        adjust_params: effect.adjust_params || [
          { name: "effects_adjust_speed", default_value: 0.33, value: 0.33 },
          { name: "effects_adjust_intensity", default_value: 0.6, value: 0.6 },
          { name: "effects_adjust_luminance", default_value: 0.5, value: 0.5 },
          { name: "effects_adjust_blur", default_value: 0.5, value: 0.5 },
          { name: "effects_adjust_sharpen", default_value: 0.4, value: 0.4 },
          { name: "effects_adjust_color", default_value: 0.5, value: 0.5 },
          { name: "effects_adjust_background_animation", default_value: 0.5, value: 0.5 }
        ],
        apply_target_type: effect.apply_target_type || 2,
        algorithm_artifact_path: effect.algorithm_artifact_path || "",
        enable_mask: effect.enable_mask !== undefined ? effect.enable_mask : true,
        covering_relation_change: effect.covering_relation_change || 0,
        platform: effect.platform || "all",
        render_index: effect.render_index || 11000, // Đảm bảo render_index bắt đầu từ 11000 cho hiệu ứng
        request_id: effect.request_id || generateUUID().replace(/-/g, ""),
        resource_id: effect.resource_id || effect.effect_id,
        source_platform: effect.source_platform || 1,
        value: effect.value || 1.0,
        version: effect.version || "",
        time_range: effect.time_range || null,
        common_keyframes: effect.common_keyframes || [],
        effect_mask: effect.effect_mask || null,
        formula_id: effect.formula_id || "",
        item_effect_type: effect.item_effect_type || 0,
        path: effect.path || "",
        track_render_index: effect.track_render_index || 0,
        apply_time_range: effect.apply_time_range || null,
        disable_effect_faces: effect.disable_effect_faces || null
      };
      
      // Kiểm tra xem hiệu ứng đã tồn tại chưa
      const existingEffectIndex = updatedContent.materials.video_effects.findIndex(e => e.id === completeEffect.id);
      
      if (existingEffectIndex >= 0) {
        // Cập nhật hiệu ứng đã tồn tại
        updatedContent.materials.video_effects[existingEffectIndex] = completeEffect;
      } else {
        // Thêm hiệu ứng mới
        updatedContent.materials.video_effects.push(completeEffect);
      }
      
      // Tìm hoặc tạo track hiệu ứng
      let effectTrack = updatedContent.tracks.find(track => track.type === 'effect');
      
      if (!effectTrack) {
        // Tạo track hiệu ứng mới nếu chưa tồn tại
        effectTrack = {
          attribute: 0,
          flag: 0,
          id: generateUUID(),
          is_default_name: true,
          name: "Effect Track",
          segments: [],
          type: "effect"
        };
        updatedContent.tracks.push(effectTrack);
      }
      
      // Tạo segment cho hiệu ứng
      const effectSegment = {
        caption_info: null,
        cartoon: false,
        clip: {
          alpha: 1.0,
          flip: { horizontal: false, vertical: false },
          rotation: 0.0,
          scale: { x: 1.0, y: 1.0 },
          transform: { x: 0.0, y: 0.0 }
        },
        color_correct_alg_result: "",
        common_keyframes: [],
        desc: "",
        digital_human_template_group_id: "",
        enable_adjust: true,
        enable_adjust_mask: false,
        enable_color_correct_adjust: false,
        enable_color_curves: true,
        enable_color_match_adjust: false,
        enable_color_wheels: true,
        enable_hsl: false,
        enable_lut: true,
        enable_smart_color_adjust: false,
        enable_video_mask: true,
        extra_material_refs: [completeEffect.id],
        group_id: "",
        hdr_settings: { intensity: 1.0, mode: 1, nits: 1000 },
        id: generateUUID(),
        intensifies_audio: false,
        is_loop: false,
        is_placeholder: false,
        is_tone_modify: false,
        keyframe_refs: [],
        last_nonzero_volume: 1.0,
        lyric_keyframes: [],
        material_id: completeEffect.id,
        raw_segment_id: "",
        render_index: completeEffect.render_index || 11000,
        render_timerange: null,
        responsive_layout: null,
        reverse: false,
        source_timerange: options.timeRange || { duration: 3000000, start: 0 }, // Mặc định 3 giây
        speed: 1.0,
        state: 0,
        target_timerange: options.timeRange || { duration: 3000000, start: 0 }, // Mặc định 3 giây
        template_id: "",
        template_scene: null,
        track_attribute: 0,
        track_render_index: 0,
        uniform_scale: true,
        visible: true,
        volume: 1.0
      };
      
      // Nếu có options.timeRange, sử dụng nó
      if (options.timeRange) {
        effectSegment.source_timerange = options.timeRange;
        effectSegment.target_timerange = options.timeRange;
      }
      
      // Nếu có options.trackIndex và options.segmentIndex, áp dụng hiệu ứng vào segment cụ thể
      if (options.trackIndex !== undefined && updatedContent.tracks && updatedContent.tracks.length > options.trackIndex) {
        const track = updatedContent.tracks[options.trackIndex];
        
        // Đảm bảo segments tồn tại
        if (!track.segments) {
          track.segments = [];
        }
        
        // Áp dụng hiệu ứng vào segment nếu có
        if (options.segmentIndex !== undefined && track.segments.length > options.segmentIndex) {
          const segment = track.segments[options.segmentIndex];
          
          // Đảm bảo extra_material_refs tồn tại
          if (!segment.extra_material_refs) {
            segment.extra_material_refs = [];
          }
          
          // Thêm tham chiếu đến hiệu ứng nếu chưa tồn tại
          if (!segment.extra_material_refs.includes(completeEffect.id)) {
            segment.extra_material_refs.push(completeEffect.id);
          }
          
          // Sử dụng timeRange của segment hiện tại nếu không có options.timeRange
          if (!options.timeRange && segment.target_timerange) {
            effectSegment.source_timerange = { ...segment.target_timerange };
            effectSegment.target_timerange = { ...segment.target_timerange };
          }
        }
      } else {
        // Nếu không có options.trackIndex, thêm segment vào track hiệu ứng
        effectTrack.segments.push(effectSegment);
      }
      
      console.log("Effect applied successfully");
      return updatedContent;
    } catch (error) {
      console.error("Error applying effect to draft content:", error);
      return draftContent;
    }
  }
  
  /**
   * Tạo UUID mới cho hiệu ứng
   * @returns {string} UUID mới
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Xóa hiệu ứng khỏi draft content
   * @param {Object} draftContent Nội dung draft
   * @param {string} effectId ID của hiệu ứng cần xóa
   * @param {Object} options Các tùy chọn bổ sung
   * @returns {Object} Nội dung draft đã được xóa hiệu ứng
   */
  function removeEffectFromDraftContent(draftContent, effectId, options = {}) {
    if (!draftContent || !effectId) {
      console.error("Invalid draft content or effect ID");
      return draftContent;
    }
    
    try {
      console.log(`Removing effect with ID "${effectId}" from draft content`);
      
      // Tạo bản sao của draft content để không ảnh hưởng đến dữ liệu gốc
      const updatedContent = JSON.parse(JSON.stringify(draftContent));
      
      // Kiểm tra xem materials và video_effects có tồn tại không
      if (!updatedContent.materials || !updatedContent.materials.video_effects) {
        console.log("No video effects found in draft content");
        return updatedContent;
      }
      
      // Xóa hiệu ứng khỏi danh sách video_effects
      updatedContent.materials.video_effects = updatedContent.materials.video_effects.filter(e => e.id !== effectId);
      
      // Xóa tham chiếu đến hiệu ứng trong tất cả các track và segment
      if (updatedContent.tracks) {
        updatedContent.tracks.forEach(track => {
          if (track.segments) {
            track.segments.forEach(segment => {
              if (segment.extra_material_refs) {
                segment.extra_material_refs = segment.extra_material_refs.filter(ref => ref !== effectId);
              }
            });
          }
        });
      }
      
      console.log("Effect removed successfully");
      return updatedContent;
    } catch (error) {
      console.error("Error removing effect from draft content:", error);
      return draftContent;
    }
  }
  
  /**
   * Lấy danh sách hiệu ứng đã áp dụng cho một segment
   * @param {Object} draftContent Nội dung draft
   * @param {number} trackIndex Chỉ số của track
   * @param {number} segmentIndex Chỉ số của segment
   * @returns {Array} Danh sách hiệu ứng đã áp dụng
   */
  function getAppliedEffects(draftContent, trackIndex, segmentIndex) {
    if (!draftContent || trackIndex === undefined || segmentIndex === undefined) {
      console.error("Invalid parameters");
      return [];
    }
    
    try {
      // Kiểm tra xem track và segment có tồn tại không
      if (!draftContent.tracks || !draftContent.tracks[trackIndex] || !draftContent.tracks[trackIndex].segments || !draftContent.tracks[trackIndex].segments[segmentIndex]) {
        console.log("Track or segment not found");
        return [];
      }
      
      const segment = draftContent.tracks[trackIndex].segments[segmentIndex];
      
      // Kiểm tra xem extra_material_refs có tồn tại không
      if (!segment.extra_material_refs || !Array.isArray(segment.extra_material_refs)) {
        console.log("No extra_material_refs found in segment");
        return [];
      }
      
      // Kiểm tra xem materials và video_effects có tồn tại không
      if (!draftContent.materials || !draftContent.materials.video_effects) {
        console.log("No video effects found in draft content");
        return [];
      }
      
      // Lọc các hiệu ứng đã áp dụng
      const appliedEffects = draftContent.materials.video_effects.filter(effect => segment.extra_material_refs.includes(effect.id));
      
      return appliedEffects;
    } catch (error) {
      console.error("Error getting applied effects:", error);
      return [];
    }
  }

  // Public API
  return {
    applyEffectsToDraftContent,
    removeEffectFromDraftContent,
    getAppliedEffects
  };
})();

// Export module
export { EffectProcessor };
