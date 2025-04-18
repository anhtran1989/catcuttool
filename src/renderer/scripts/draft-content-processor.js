/**
 * Draft Content Processor - Xử lý việc áp dụng hiệu ứng vào draft content
 */
const DraftContentProcessor = (function() {
  /**
   * Áp dụng effects vào draft content cho việc xuất file
   * @param {Object} draftContent Nội dung draft content
   * @param {Array} effectsToApply Danh sách effects cần áp dụng
   * @returns {Object} Draft content đã được cập nhật
   */
  // Các ID cố định cho extra_material_refs
  const FIXED_IDS = {
    SPEED: "3BF7C789-2C7B-4854-8C02-7998D0FE5F0C",
    PLACEHOLDER_INFO: "FCA1D53E-E5F1-4563-8E75-A2C24F6648C8",
    CANVAS: "3DD02A75-8633-4b86-9F31-81736C8BAEFB",
    MATERIAL_ANIMATION: "DBD03595-6CB2-4f91-B2D6-D579740311EF",
    SOUND_CHANNEL_MAPPING: "26CD7B3C-B5EE-4ee3-AD2E-AB8DE22E8BE1",
    VOCAL_SEPARATION: "F431F8EF-20FF-4284-A2AB-5295379C5230"
  };

  function applyEffectsToDraftContent(draftContent, effectsToApply) {
    try {
      console.log("Applying effects to draft content");
      
      if (!draftContent || !effectsToApply || !Array.isArray(effectsToApply) || effectsToApply.length === 0) {
        console.log("No effects to apply or invalid draft content");
        return draftContent;
      }
      
      // Tạo bản sao của draft content để không ảnh hưởng đến dữ liệu gốc
      const updatedContent = JSON.parse(JSON.stringify(draftContent));
      
      // Đảm bảo có các mảng cần thiết trong materials
      if (!updatedContent.materials) {
        updatedContent.materials = {};
      }
      
      // Đảm bảo có mảng video_effects
      if (!updatedContent.materials.video_effects) {
        updatedContent.materials.video_effects = [];
      }
      
      // Đảm bảo có mảng material_animations
      if (!updatedContent.materials.material_animations) {
        updatedContent.materials.material_animations = [];
      }
      
      // Đảm bảo có mảng loudnesses
      if (!updatedContent.loudnesses) {
        updatedContent.loudnesses = [];
      }
      
      // Đảm bảo có extra_material_refs
      if (!updatedContent.extra_material_refs) {
        updatedContent.extra_material_refs = [];
      }
      
      // Lọc các effects cần áp dụng (bỏ qua effect "None")
      const validEffects = effectsToApply.filter(effect => effect.name !== "None" && effect.id !== "none");
      
      // Nếu không có effect nào hợp lệ, trả về draft content gốc
      if (validEffects.length === 0) {
        console.log("No valid effects to apply");
        return updatedContent;
      }
      
      console.log(`Applying ${validEffects.length} effects to draft content`);
      
      // Đảm bảo các ID cố định đã có trong extra_material_refs
      ensureFixedIdsInExtraMaterialRefs(updatedContent);
      
      // Thêm các effects vào materials.video_effects
      validEffects.forEach(effect => {
        // Tạo đối tượng effect theo định dạng của CapCut
        const videoEffect = VideoEffects.createVideoEffect(effect);
        
        // Kiểm tra xem effect đã tồn tại chưa
        const existingIndex = updatedContent.materials.video_effects.findIndex(e => e.id === videoEffect.id);
        
        if (existingIndex >= 0) {
          // Cập nhật effect đã tồn tại
          updatedContent.materials.video_effects[existingIndex] = videoEffect;
        } else {
          // Thêm effect mới
          updatedContent.materials.video_effects.push(videoEffect);
        }
        
        // Thêm vào material_animations nếu cần
        const materialAnimation = VideoEffects.createMaterialAnimation(videoEffect.id);
        
        // Kiểm tra xem material_animation đã tồn tại chưa
        const existingAnimIndex = updatedContent.materials.material_animations.findIndex(a => a.material_id === videoEffect.id);
        
        if (existingAnimIndex >= 0) {
          // Cập nhật material_animation đã tồn tại
          updatedContent.materials.material_animations[existingAnimIndex] = materialAnimation;
        } else {
          // Thêm material_animation mới
          updatedContent.materials.material_animations.push(materialAnimation);
        }
        
        // Thêm vào loudnesses nếu cần
        const loudness = VideoEffects.createLoudness(videoEffect.id);
        
        // Kiểm tra xem loudness đã tồn tại chưa
        const existingLoudnessIndex = updatedContent.loudnesses.findIndex(l => l.material_id === videoEffect.id);
        
        if (existingLoudnessIndex >= 0) {
          // Cập nhật loudness đã tồn tại
          updatedContent.loudnesses[existingLoudnessIndex] = loudness;
        } else {
          // Thêm loudness mới
          updatedContent.loudnesses.push(loudness);
        }
      });
      
      // Tìm các segments trong track video để xác định thời gian
      let videoSegments = [];
      if (updatedContent.tracks && Array.isArray(updatedContent.tracks)) {
        const videoTrack = updatedContent.tracks.find(track => track.type === "video");
        if (videoTrack && videoTrack.segments) {
          videoSegments = videoTrack.segments;
        }
      }
      
      // Tạo các segments cho track effect
      const effectSegments = [];
      let renderIndex = 11000;
      
      // Tạo segments cho mỗi effect
      validEffects.forEach((effect, index) => {
        // Xác định thời gian bắt đầu và kéo dài
        let startTime = 0;
        let duration = 3000000; // 3 giây mặc định
        
        // Nếu effect có thông tin segment, sử dụng thông tin đó
        if (effect.segment && effect.segment.target_timerange) {
          startTime = effect.segment.target_timerange.start;
          duration = effect.segment.target_timerange.duration;
          renderIndex = effect.segment.render_index || renderIndex;
        }
        // Nếu không có thông tin segment nhưng có video segment tương ứng, lấy thời gian từ đó
        else if (videoSegments[index]) {
          startTime = videoSegments[index].target_timerange.start;
          duration = Math.min(videoSegments[index].target_timerange.duration, 3000000); // Giới hạn tối đa 3 giây
        }
        
        // Tạo segment hiệu ứng
        const segment = EffectSegment.createSegment(effect.id, startTime, duration, renderIndex);
        
        effectSegments.push(segment);
        
        // Tăng render index cho segment tiếp theo
        renderIndex++;
      });
      
      // Kiểm tra và cập nhật track effect
      if (effectSegments.length > 0) {
        // Tạo track effect mới
        const effectTrack = EffectTrack.createTrack(effectSegments);
        
        // Đảm bảo có mảng tracks
        if (!updatedContent.tracks) {
          updatedContent.tracks = [];
        }
        
        // Kiểm tra xem đã có track effect chưa
        const existingTrackIndex = updatedContent.tracks.findIndex(track => track.type === "effect");
        
        if (existingTrackIndex >= 0) {
          // Cập nhật track hiện có
          updatedContent.tracks[existingTrackIndex].segments = effectSegments;
        } else {
          // Thêm track mới vào danh sách
          updatedContent.tracks.push(effectTrack);
        }
      }
      
      console.log("Effects applied to draft content successfully");
      return updatedContent;
    } catch (error) {
      console.error("Error applying effects to draft content:", error);
      return draftContent;
    }
  }

  /**
   * Đảm bảo các ID cố định đã có trong extra_material_refs
   * @param {Object} content Draft content cần cập nhật
   */
  function ensureFixedIdsInExtraMaterialRefs(content) {
    if (!content.extra_material_refs) {
      content.extra_material_refs = [];
    }

    // Thêm các ID cố định vào extra_material_refs nếu chưa có
    Object.values(FIXED_IDS).forEach(id => {
      if (!content.extra_material_refs.includes(id)) {
        content.extra_material_refs.push(id);
      }
    });

    console.log("Updated extra_material_refs:", content.extra_material_refs);
  }

  // Public API
  return {
    applyEffectsToDraftContent
  };
})();

// Xuất module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DraftContentProcessor;
}
