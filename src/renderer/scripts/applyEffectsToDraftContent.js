/**
 * Áp dụng effects vào draft content cho việc xuất file
 * @param {Object} draftContent Nội dung draft content
 * @param {Array} effectsToApply Danh sách effects cần áp dụng
 * @returns {Object} Draft content đã được cập nhật
 */
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
    
    // Lọc các effects cần áp dụng (bỏ qua effect "None")
    const validEffects = effectsToApply.filter(effect => effect.name !== "None" && effect.id !== "none");
    
    // Nếu không có effect nào hợp lệ, trả về draft content gốc
    if (validEffects.length === 0) {
      console.log("No valid effects to apply");
      return updatedContent;
    }
    
    console.log(`Applying ${validEffects.length} effects to draft content`);
    
    // Thêm các effects vào materials.video_effects
    validEffects.forEach(effect => {
      // Tạo đối tượng effect theo định dạng của CapCut
      const videoEffect = {
        id: effect.id || generateUUID(),
        name: effect.name,
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
      const materialAnimation = {
        id: generateUUID(),
        material_id: videoEffect.id,
        type: "video_effect",
        animation_effects: [],
        keyframe_refs: []
      };
      
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
      const loudness = {
        id: generateUUID(),
        material_id: videoEffect.id,
        type: "video_effect",
        loudness: 0
      };
      
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
      
      // Tạo segment hiệu ứng theo mẫu của CapCut
      const segment = {
        caption_info: null,
        cartoon: false,
        clip: {
          alpha: 1.0,
          flip: {
            horizontal: false,
            vertical: false
          },
          rotation: 0.0,
          scale: {
            x: 1.0,
            y: 1.0
          },
          transform: {
            x: 0.0,
            y: 0.0
          }
        },
        color_correct_alg_result: "",
        common_keyframes: [],
        desc: "",
        digital_human_template_group_id: "",
        enable_adjust: false,
        enable_adjust_mask: false,
        enable_color_correct_adjust: false,
        enable_color_curves: true,
        enable_color_match_adjust: false,
        enable_color_wheels: true,
        enable_hsl: false,
        enable_lut: false,
        enable_smart_color_adjust: false,
        enable_video_mask: true,
        extra_material_refs: [],
        group_id: "",
        hdr_settings: {
          intensity: 1.0,
          mode: 1,
          nits: 1000
        },
        id: generateUUID(),
        intensifies_audio: false,
        is_loop: false,
        is_placeholder: false,
        is_tone_modify: false,
        keyframe_refs: [],
        last_nonzero_volume: 1.0,
        lyric_keyframes: null,
        material_id: effect.id,
        raw_segment_id: "",
        render_index: renderIndex,
        render_timerange: {
          duration: 0,
          start: 0
        },
        responsive_layout: {
          enable: false,
          horizontal_pos_layout: 0,
          size_layout: 0,
          target_follow: "",
          vertical_pos_layout: 0
        },
        reverse: false,
        source_timerange: null,
        speed: 1.0,
        state: 0,
        target_timerange: {
          duration: duration,
          start: startTime
        },
        template_id: "",
        template_scene: "default",
        track_attribute: 0,
        track_render_index: 1,
        uniform_scale: {
          on: true,
          value: 1.0
        },
        visible: true,
        volume: 1.0
      };
      
      effectSegments.push(segment);
      
      // Tăng render index cho segment tiếp theo
      renderIndex++;
    });
    
    // Kiểm tra và cập nhật track effect
    if (effectSegments.length > 0) {
      // Tạo track effect mới theo mẫu của CapCut
      const effectTrack = {
        attribute: 0,
        flag: 0,
        id: generateUUID(),
        is_default_name: true,
        name: "",
        segments: effectSegments,
        type: "effect"
      };
      
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
