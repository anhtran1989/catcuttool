/**
 * Effect Manager - Quản lý và cập nhật danh sách effects
 * 
 * Cấu trúc của mỗi effect trong CapCut cần có các thuộc tính:
 * - id: Một chuỗi UUID duy nhất cho mỗi effect
 * - name: Tên của effect
 * - type: Loại effect (thường là "video_effect")
 * - category_name: Tên danh mục của effect
 * - effect_id: ID của effect trong hệ thống CapCut
 * - path: Đường dẫn đến file effect
 * - adjust_params: Các tham số điều chỉnh của effect
 */
const EffectManager = (function() {
  // Danh sách các effects đã được lưu
  let effects = [];
  
  // Mẫu cấu trúc track hiệu ứng từ draft_content_effect.json
  const effectTrackTemplate = {
    attribute: 0,
    flag: 0,
    id: "", // Sẽ được tạo động
    is_default_name: true,
    name: "",
    segments: [], // Sẽ được điền động
    type: "effect"
  };
  
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
   * Khởi tạo EffectManager
   */
  function init() {
    console.log("Initializing EffectManager");
    
    // Khởi tạo danh sách effects với effect "None"
    effects = [{
      id: "none",
      name: "None",
      type: "video_effect",
      icon: "fas fa-ban"
    }];
    
    // Tải effects từ file draft_content_effect.json
    loadEffectsFromDraftContent();
  }
  
  /**
   * Tải file draft_content_effect.json và cập nhật danh sách hiệu ứng
   */
  function loadEffectsFromDraftContent() {
    try {
      console.log("Loading effects from draft_content_effect.json");
      
      // Thử đọc file bằng fetch API
      fetch('./draft_content_effect.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Cập nhật effects từ file
          updateFromDraftContent(data);
          console.log("Effects updated from draft_content_effect.json");
        })
        .catch(error => {
          console.warn("Could not load draft_content_effect.json:", error);
          // Thử đọc file bằng Electron API nếu có
          if (window.electron && window.electron.readJsonFile) {
            console.log("Trying to load with Electron API");
            window.electron.readJsonFile('draft_content_effect.json')
              .then(data => {
                updateFromDraftContent(data);
                console.log("Effects updated from draft_content_effect.json using Electron API");
              })
              .catch(error => {
                console.warn("Could not load draft_content_effect.json with Electron API:", error);
              });
          }
        });
    } catch (error) {
      console.error("Error in loadEffectsFromDraftContent:", error);
    }
  }
  
  /**
   * Cập nhật danh sách effects từ file draft_content_effect.json
   * @param {Object} draftContent Nội dung của file draft_content_effect.json
   */
  function updateFromDraftContent(draftContent) {
    try {
      console.log("Starting to update effects from draft content");
      
      // Kiểm tra cấu trúc của draft content
      if (!draftContent) {
        console.error("Draft content is null or undefined");
        return;
      }
      
      // Tìm hiệu ứng trong materials.video_effects
      if (draftContent.materials && draftContent.materials.video_effects && Array.isArray(draftContent.materials.video_effects)) {
        const videoEffects = draftContent.materials.video_effects;
        console.log(`Found ${videoEffects.length} effects in materials.video_effects`);
        
        // Chuyển đổi định dạng video_effects sang định dạng nội bộ
        const formattedEffects = videoEffects.map(effect => {
          return {
            id: effect.id,
            name: effect.name,
            type: effect.type,
            effect_id: effect.effect_id,
            category_id: effect.category_id,
            category_name: effect.category_name,
            path: effect.path,
            adjust_params: effect.adjust_params,
            apply_target_type: effect.apply_target_type,
            enable_mask: effect.enable_mask,
            item_effect_type: effect.item_effect_type,
            value: effect.value,
            icon: getIconForEffect(effect.name || "")
          };
        });
        
        // Cập nhật danh sách effects
        mergeEffects(formattedEffects);
      } else {
        console.log("No effects found in materials.video_effects");
      }
      
      // Kiểm tra cấu trúc track effect để lấy thêm thông tin
      if (draftContent.tracks && Array.isArray(draftContent.tracks)) {
        const effectTracks = draftContent.tracks.filter(track => track.type === "effect");
        if (effectTracks.length > 0) {
          console.log(`Found ${effectTracks.length} effect tracks`);
          
          // Lấy thông tin về thời gian và vị trí của các effects
          effectTracks.forEach(track => {
            if (track.segments && Array.isArray(track.segments)) {
              track.segments.forEach(segment => {
                // Tìm effect tương ứng trong danh sách đã có
                const effectIndex = effects.findIndex(e => e.id === segment.material_id);
                if (effectIndex > 0) { // Bỏ qua effect "None" ở vị trí 0
                  // Cập nhật thông tin thời gian
                  effects[effectIndex].duration = segment.target_timerange.duration;
                  effects[effectIndex].start = segment.target_timerange.start;
                  effects[effectIndex].render_index = segment.render_index;
                  effects[effectIndex].track_render_index = segment.track_render_index;
                }
              });
            }
          });
        }
      }
      
      // Cập nhật giao diện
      updateEffectsUI();
    } catch (error) {
      console.error("Error updating effects from draft content:", error);
    }
  }
  
  /**
   * Cập nhật hoặc thêm mới effects vào danh sách
   * @param {Array} newEffects Danh sách effects mới
   */
  function mergeEffects(newEffects) {
    if (!newEffects || !Array.isArray(newEffects) || newEffects.length === 0) {
      console.log("No new effects to merge");
      return;
    }
    
    console.log(`Merging ${newEffects.length} new effects`);
    
    // Xóa danh sách effects hiện tại (trừ effect "None")
    const noneEffect = effects.find(effect => effect.name === "None");
    
    // Bắt đầu với effect "None" nếu có
    let updatedEffects = noneEffect ? [noneEffect] : [];
    
    // Thêm các effects mới, loại bỏ trùng lặp
    newEffects.forEach(newEffect => {
      // Bỏ qua nếu là effect "None"
      if (newEffect.name === "None") {
        return;
      }
      
      // Kiểm tra xem effect đã tồn tại chưa
      const existingIndex = updatedEffects.findIndex(e => e.id === newEffect.id);
      
      if (existingIndex >= 0) {
        // Cập nhật effect đã tồn tại
        updatedEffects[existingIndex] = {
          ...updatedEffects[existingIndex],
          ...newEffect
        };
      } else {
        // Thêm effect mới
        updatedEffects.push(newEffect);
      }
    });
    
    // Cập nhật danh sách effects
    effects = updatedEffects;
    
    console.log(`Updated effects list now has ${effects.length} effects`);
  }
  
  /**
   * Lấy biểu tượng phù hợp cho effect dựa trên tên
   * @param {string} effectName Tên effect
   * @returns {string} Class của biểu tượng
   */
  function getIconForEffect(effectName) {
    // Chuyển đổi tên effect thành chữ thường để dễ so sánh
    const name = effectName.toLowerCase();
    
    // Danh sách các biểu tượng phù hợp với từng loại effect
    if (name === "none") return "fas fa-ban";
    if (name.includes("điểm") || name.includes("dot")) return "fas fa-dot-circle";
    if (name.includes("mưa") || name.includes("rain")) return "fas fa-cloud-rain";
    if (name.includes("màn hình") || name.includes("screen")) return "fas fa-desktop";
    if (name.includes("blur")) return "fas fa-tint";
    if (name.includes("glow")) return "fas fa-sun";
    if (name.includes("shadow")) return "fas fa-moon";
    if (name.includes("color")) return "fas fa-palette";
    if (name.includes("bright")) return "fas fa-lightbulb";
    if (name.includes("contrast")) return "fas fa-adjust";
    if (name.includes("saturation")) return "fas fa-fill-drip";
    if (name.includes("zoom")) return "fas fa-search-plus";
    if (name.includes("rotate")) return "fas fa-sync";
    if (name.includes("flip")) return "fas fa-exchange-alt";
    if (name.includes("mirror")) return "fas fa-clone";
    if (name.includes("speed")) return "fas fa-tachometer-alt";
    if (name.includes("slow")) return "fas fa-hourglass-half";
    if (name.includes("fast")) return "fas fa-forward";
    if (name.includes("reverse")) return "fas fa-backward";
    
    // Biểu tượng mặc định cho các effect khác
    return "fas fa-magic";
  }
  
  /**
   * Tạo một UUID duy nhất cho các đối tượng
   * @returns {string} UUID duy nhất
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  }
  
  /**
   * Lấy danh sách hiệu ứng hiện có
   * @returns {Array} Danh sách hiệu ứng
   */
  function getEffects() {
    return effects;
  }
  
  /**
   * Cập nhật giao diện người dùng để hiển thị danh sách hiệu ứng
   */
  function updateEffectsUI() {
    try {
      console.log("Updating effects UI with", effects.length, "effects");
      
      // Kiểm tra xem UIManager có sẵn không
      if (typeof UIManager === 'undefined' || !UIManager.createGlobalEffectsDropdown) {
        console.log("UIManager not available, will try again later");
        setTimeout(updateEffectsUI, 1000); // Thử lại sau 1 giây
        return;
      }
      
      // In ra danh sách hiệu ứng để debug
      console.log("Effects to be displayed:");
      effects.forEach((effect, index) => {
        console.log(`${index + 1}. ${effect.name} (${effect.id || 'No ID'})`);
      });
      
      // Sử dụng UIManager để cập nhật dropdown hiệu ứng
      UIManager.createGlobalEffectsDropdown();
      
      console.log(`Updated UI with ${effects.length} effects`);
    } catch (error) {
      console.error("Error updating effects UI:", error);
    }
  }
  
  /**
   * Tạo một track effect mới cho draft content
   * @param {Array} effectSegments Danh sách các segment hiệu ứng
   * @returns {Object} Track effect mới
   */
  function createEffectTrack(effectSegments) {
    // Tạo một bản sao của mẫu track
    const track = JSON.parse(JSON.stringify(effectTrackTemplate));
    
    // Tạo ID mới cho track
    track.id = generateUUID();
    
    // Thêm các segments
    track.segments = effectSegments || [];
    
    return track;
  }
  
  /**
   * Tạo một segment hiệu ứng mới
   * @param {string} effectId ID của hiệu ứng
   * @param {number} startTime Thời gian bắt đầu (microseconds)
   * @param {number} duration Thời gian kéo dài (microseconds)
   * @param {number} renderIndex Chỉ số render
   * @returns {Object} Segment hiệu ứng mới
   */
  function createEffectSegment(effectId, startTime, duration, renderIndex) {
    // Tạo một bản sao của mẫu segment
    const segment = JSON.parse(JSON.stringify(effectSegmentTemplate));
    
    // Cập nhật các thông tin
    segment.id = generateUUID();
    segment.material_id = effectId;
    segment.target_timerange.start = startTime || 0;
    segment.target_timerange.duration = duration || 3000000; // 3 giây mặc định
    segment.render_index = renderIndex || 11000;
    
    return segment;
  }
  
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
      
      // Đảm bảo có mảng video_effects trong materials
      if (!updatedContent.materials) {
        updatedContent.materials = {};
      }
      if (!updatedContent.materials.video_effects) {
        updatedContent.materials.video_effects = [];
      }
      
      // Thêm các effects vào materials.video_effects
      effectsToApply.forEach(effect => {
        // Bỏ qua effect "None"
        if (effect.name === "None") {
          return;
        }
        
        // Tạo đối tượng effect theo định dạng của CapCut
        const videoEffect = {
          id: effect.id || generateUUID(),
          name: effect.name,
          type: "video_effect",
          adjust_params: effect.adjust_params || [],
          apply_target_type: effect.apply_target_type || 2,
          category_id: effect.category_id || "",
          category_name: effect.category_name || "Đang thịnh hành",
          effect_id: effect.effect_id || "",
          enable_mask: effect.enable_mask || true,
          item_effect_type: effect.item_effect_type || 0,
          path: effect.path || "",
          resource_id: effect.effect_id || "",
          source_platform: effect.source_platform || 1,
          value: effect.value || 1.0
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
      });
      
      // Tạo các segments cho track effect
      const effectSegments = [];
      let renderIndex = 11000;
      
      // Tìm các segments trong track video để xác định thời gian
      let videoSegments = [];
      if (updatedContent.tracks && Array.isArray(updatedContent.tracks)) {
        const videoTrack = updatedContent.tracks.find(track => track.type === "video");
        if (videoTrack && videoTrack.segments) {
          videoSegments = videoTrack.segments;
        }
      }
      
      // Tạo segments cho mỗi effect
      effectsToApply.forEach((effect, index) => {
        // Bỏ qua effect "None"
        if (effect.name === "None") {
          return;
        }
        
        // Xác định thời gian bắt đầu và kéo dài
        let startTime = 0;
        let duration = 3000000; // 3 giây mặc định
        
        // Nếu có video segment tương ứng, lấy thời gian từ đó
        if (videoSegments[index]) {
          startTime = videoSegments[index].target_timerange.start;
          duration = videoSegments[index].target_timerange.duration;
        }
        
        // Tạo segment hiệu ứng
        const segment = createEffectSegment(effect.id, startTime, duration, renderIndex);
        effectSegments.push(segment);
        
        // Tăng render index cho segment tiếp theo
        renderIndex++;
      });
      
      // Kiểm tra và cập nhật track effect
      if (effectSegments.length > 0) {
        // Tìm track effect hiện có
        let effectTrack = null;
        if (updatedContent.tracks && Array.isArray(updatedContent.tracks)) {
          effectTrack = updatedContent.tracks.find(track => track.type === "effect");
        }
        
        if (effectTrack) {
          // Cập nhật segments trong track hiện có
          effectTrack.segments = effectSegments;
        } else {
          // Tạo track effect mới
          const newTrack = createEffectTrack(effectSegments);
          
          // Đảm bảo có mảng tracks
          if (!updatedContent.tracks) {
            updatedContent.tracks = [];
          }
          
          // Thêm track mới vào danh sách
          updatedContent.tracks.push(newTrack);
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
   * Tạo một track effect mặc định với một effect "None"
   * @returns {Object} Track effect mặc định
   */
  function createDefaultEffectTrack() {
    // Tạo một segment với effect "None"
    const segment = createEffectSegment("none", 0, 5000000, 11000);
    
    // Tạo track với segment
    return createEffectTrack([segment]);
  }
  
  // Public API
  return {
    init,
    getEffects,
    mergeEffects,
    createEffectTrack,
    createEffectSegment,
    updateFromDraftContent,
    loadEffectsFromDraftContent,
    updateEffectsUI,
    generateUUID,
    applyEffectsToDraftContent,
    createDefaultEffectTrack
  };
})();
