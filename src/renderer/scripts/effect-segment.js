/**
 * Effect Segment - Quản lý các segment hiệu ứng
 */
const EffectSegment = (function() {
  // Mẫu cấu trúc segment hiệu ứng dựa trên cấu trúc trong draft_content_effect.json
  const effectSegmentTemplate = {
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
    id: "", // Sẽ được tạo động
    intensifies_audio: false,
    is_loop: false,
    is_placeholder: false,
    is_tone_modify: false,
    keyframe_refs: [],
    last_nonzero_volume: 1.0,
    lyric_keyframes: null,
    material_id: "", // ID của effect
    raw_segment_id: "",
    render_index: 11000, // Bắt đầu từ 11000 và tăng dần
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
      duration: 3000000, // 3 giây
      start: 0 // Sẽ được điều chỉnh dựa trên vị trí
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

  /**
   * Tạo một segment hiệu ứng mới
   * @param {string} effectId ID của hiệu ứng
   * @param {number} startTime Thời gian bắt đầu (microseconds)
   * @param {number} duration Thời gian kéo dài (microseconds)
   * @param {number} renderIndex Chỉ số render
   * @returns {Object} Segment hiệu ứng mới
   */
  function createSegment(effectId, startTime, duration, renderIndex) {
    // Tạo bản sao của template
    const segment = JSON.parse(JSON.stringify(effectSegmentTemplate));
    
    // Cập nhật các giá trị
    segment.id = Utils.generateUUID();
    segment.material_id = effectId;
    segment.target_timerange.start = startTime || 0;
    segment.target_timerange.duration = duration || 3000000; // 3 giây mặc định
    segment.render_index = renderIndex || 11000;
    
    return segment;
  }

  /**
   * Trả về mẫu cấu trúc segment hiệu ứng
   * @returns {Object} Mẫu segment hiệu ứng
   */
  function getTemplate() {
    return JSON.parse(JSON.stringify(effectSegmentTemplate));
  }

  // Public API
  return {
    createSegment,
    getTemplate
  };
})();

// Xuất module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EffectSegment;
}
