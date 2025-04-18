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
      
      // Kiểm tra xem hiệu ứng đã tồn tại chưa
      const existingEffectIndex = updatedContent.materials.video_effects.findIndex(e => e.id === effect.id);
      
      if (existingEffectIndex >= 0) {
        // Cập nhật hiệu ứng đã tồn tại
        updatedContent.materials.video_effects[existingEffectIndex] = { ...updatedContent.materials.video_effects[existingEffectIndex], ...effect };
      } else {
        // Thêm hiệu ứng mới
        updatedContent.materials.video_effects.push(effect);
      }
      
      // Áp dụng hiệu ứng vào track nếu có
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
          if (!segment.extra_material_refs.includes(effect.id)) {
            segment.extra_material_refs.push(effect.id);
          }
        }
      }
      
      console.log("Effect applied successfully");
      return updatedContent;
    } catch (error) {
      console.error("Error applying effect to draft content:", error);
      return draftContent;
    }
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
