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
   * Tải file draft_content_2.json và cập nhật danh sách hiệu ứng
   */
  function loadEffectsFromDraftContent() {
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
          updateFromDraftContent(data);
          console.log("Effects updated from draft_content_2.json");
        })
        .catch(error => {
          console.warn("Could not load draft_content_2.json:", error);
          // Thử đọc file bằng Electron API nếu có
          if (window.electron && window.electron.readJsonFile) {
            console.log("Trying to load with Electron API");
            window.electron.readJsonFile('draft_content_2.json')
              .then(data => {
                updateFromDraftContent(data);
                console.log("Effects updated from draft_content_2.json using Electron API");
              })
              .catch(error => {
                console.warn("Could not load draft_content_2.json with Electron API:", error);
                
                // Nếu không tìm thấy draft_content_2.json, thử với draft_content_effect.json
                console.log("Trying to load draft_content_effect.json as fallback");
                window.electron.readJsonFile('draft_content_effect.json')
                  .then(data => {
                    updateFromDraftContent(data);
                    console.log("Effects updated from draft_content_effect.json as fallback");
                  })
                  .catch(fallbackError => {
                    console.warn("Could not load any effect file:", fallbackError);
                  });
              });
          }
        });
    } catch (error) {
      console.error("Error in loadEffectsFromDraftContent:", error);
    }
  }
  
  /**
   * Cập nhật danh sách effects từ file draft_content_2.json
   * @param {Object} draftContent Nội dung của file draft_content_2.json
   */
  function updateFromDraftContent(draftContent) {
    try {
      console.log("Starting to update effects from draft content");
      
      // Kiểm tra cấu trúc của draft content
      if (!draftContent) {
        console.error("Draft content is null or undefined");
        return;
      }
      
      // Khởi tạo mảng effects với effect "None"
      effects = [{
        id: "none",
        name: "None",
        type: "video_effect",
        icon: "fas fa-ban"
      }];
      
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
            effect_id: effect.effect_id || "",
            category_id: effect.category_id || "",
            category_name: effect.category_name || "",
            path: effect.path || "",
            adjust_params: effect.adjust_params || [],
            apply_target_type: effect.apply_target_type || 2,
            enable_mask: effect.enable_mask || true,
            item_effect_type: effect.item_effect_type || 0,
            value: effect.value || 1.0,
            icon: getIconForEffect(effect.name || "")
          };
        });
        
        // Thêm các effects vào danh sách
        effects = effects.concat(formattedEffects);
        console.log(`Added ${formattedEffects.length} effects from materials.video_effects`);
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
                  
                  // Lưu thông tin về segment để sử dụng khi export
                  effects[effectIndex].segment = {
                    target_timerange: segment.target_timerange,
                    render_index: segment.render_index,
                    track_render_index: segment.track_render_index
                  };
                }
              });
            }
          });
        }
      }
      
      // Nếu không tìm thấy effects nào, thử tìm kiếm đệ quy
      if (effects.length <= 1) { // Chỉ có effect "None"
        const foundEffects = findEffectsRecursively(draftContent);
        if (foundEffects.length > 0) {
          console.log(`Found ${foundEffects.length} effects through recursive search`);
          effects = effects.concat(foundEffects);
        }
      }
      
      console.log(`Total effects found: ${effects.length}`);
      
      // In ra danh sách effects để debug
      effects.forEach((effect, index) => {
        console.log(`${index}. ${effect.name} (${effect.id})`);
      });
      
      // Cập nhật giao diện
      updateEffectsUI();
    } catch (error) {
      console.error("Error updating effects from draft content:", error);
    }
  }
  
  /**
   * Tìm kiếm đệ quy các hiệu ứng trong cấu trúc JSON
   * @param {Object} obj Đối tượng JSON cần tìm kiếm
   * @param {Array} results Mảng kết quả (tùy chọn)
   * @returns {Array} Mảng các hiệu ứng tìm thấy
   */
  function findEffectsRecursively(obj, results = []) {
    if (!obj || typeof obj !== 'object') {
      return results;
    }
    
    // Kiểm tra nếu đối tượng có vẻ như là một hiệu ứng
    if (obj.type === 'video_effect' && obj.name && obj.id) {
      results.push({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        effect_id: obj.effect_id || "",
        category_id: obj.category_id || "",
        category_name: obj.category_name || "",
        path: obj.path || "",
        adjust_params: obj.adjust_params || [],
        apply_target_type: obj.apply_target_type || 2,
        enable_mask: obj.enable_mask || true,
        item_effect_type: obj.item_effect_type || 0,
        value: obj.value || 1.0,
        icon: getIconForEffect(obj.name || "")
      });
    }
    
    // Tìm kiếm trong các mảng
    if (Array.isArray(obj)) {
      obj.forEach(item => findEffectsRecursively(item, results));
    } else {
      // Tìm kiếm trong các thuộc tính của đối tượng
      Object.values(obj).forEach(val => {
        if (val && typeof val === 'object') {
          findEffectsRecursively(val, results);
        }
      });
    }
    
    return results;
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
   * Hiển thị dropdown chọn hiệu ứng
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyEffect - Callback function to apply effect
   */
  function showEffectDropdown(thumbnailItem, fileData, onApplyEffect) {
    if (!thumbnailItem) return;
    
    console.log("Showing effect dropdown");
    
    // Kiểm tra xem đã có dropdown nào đang mở không
    const existingDropdown = document.querySelector('.effect-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }
    
    // Tạo dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'effect-dropdown';
    
    // Xác định vị trí của dropdown
    const thumbnailRect = thumbnailItem.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = `${thumbnailRect.top + window.scrollY + 40}px`; // Dưới nút effect
    dropdown.style.left = `${thumbnailRect.left + window.scrollX}px`;
    dropdown.style.width = `${thumbnailRect.width}px`;
    dropdown.style.zIndex = '1000';
    
    // Thêm tiêu đề cho dropdown
    const dropdownHeader = document.createElement('div');
    dropdownHeader.className = 'effect-dropdown-header';
    dropdownHeader.textContent = 'Chọn hiệu ứng';
    dropdown.appendChild(dropdownHeader);

    // Tạo danh sách hiệu ứng
    const effectList = document.createElement('div');
    effectList.className = 'effect-dropdown-list';
    dropdown.appendChild(effectList);

    // Lấy danh sách hiệu ứng
    const availableEffects = getEffects();
    console.log(`Found ${availableEffects.length} effects for dropdown`);
    
    // In ra danh sách hiệu ứng để debug
    availableEffects.forEach((effect, index) => {
      console.log(`${index}. ${effect.name} (${effect.id})`);
    });
    
    // Kiểm tra xem có hiệu ứng nào không
    if (availableEffects.length <= 1) { // Chỉ có effect "None"
      // Thêm hiệu ứng mẫu từ draft_content_2.json
      const sampleEffects = [
        {
          id: "67AE5ED5-14C3-4ac2-A5B5-0B37A61E77FA",
          name: "Phóng to hình kim cương",
          type: "video_effect",
          category_name: "Đang thịnh hành",
          effect_id: "7399471460445605125",
          icon: "fas fa-expand"
        },
        {
          id: "9BFBA51E-3D0F-4d87-8937-C002398DD6EB",
          name: "Mở ngược",
          type: "video_effect",
          category_name: "Đang thịnh hành",
          effect_id: "7399471215905082630",
          icon: "fas fa-sync-alt"
        },
        {
          id: "1A090300-3D37-46f9-9026-4523CCC32A7B",
          name: "Trục trặc pixel",
          type: "video_effect",
          category_name: "Đang thịnh hành",
          effect_id: "7399464859097730309",
          icon: "fas fa-cubes"
        },
        {
          id: "5B61258D-9748-4aa4-91D0-8A993CB1FF79",
          name: "Rung dọc",
          type: "video_effect",
          category_name: "Đang thịnh hành",
          effect_id: "7399465889323830533",
          icon: "fas fa-arrows-alt-v"
        }
      ];
      
      // Thêm các hiệu ứng mẫu vào danh sách
      effects = effects.concat(sampleEffects);
      console.log(`Added ${sampleEffects.length} sample effects to dropdown`);
      
      // Cập nhật danh sách hiệu ứng
      availableEffects.push(...sampleEffects);
    }
    
    // Kiểm tra lại sau khi thêm hiệu ứng mẫu
    if (availableEffects.length === 0) {
      const noEffects = document.createElement('div');
      noEffects.className = 'effect-dropdown-item no-effects';
      noEffects.textContent = 'Không có hiệu ứng nào';
      effectList.appendChild(noEffects);
    } else {
      // Hiển thị tất cả các hiệu ứng trong danh sách
      availableEffects.forEach(effect => {
        const item = document.createElement('div');
        item.className = 'effect-dropdown-item';
        
        // Thêm class đặc biệt cho option "None"
        if (effect.id === 'none') {
          item.classList.add('none-option');
        }
        
        // Thêm nội dung hiệu ứng
        item.innerHTML = `<i class="${effect.icon || 'fas fa-magic'}"></i> ${effect.name}`;
        
        // Xử lý sự kiện click
        item.addEventListener('click', () => {
          // Áp dụng hiệu ứng khi được chọn
          if (typeof onApplyEffect === 'function') {
            onApplyEffect(thumbnailItem, effect, fileData);
          }
          
          // Cập nhật text của button theo tên hiệu ứng đã chọn
          const effectButton = thumbnailItem.querySelector('.effect-button');
          if (effectButton) {
            effectButton.innerHTML = `<i class="${effect.icon || 'fas fa-magic'}"></i> ${effect.name}`;
            
            // Lưu ID của hiệu ứng vào data attribute của button
            effectButton.dataset.effectId = effect.id;
          }
          
          // Đóng dropdown
          dropdown.remove();
        });
        
        // Thêm item vào danh sách
        effectList.appendChild(item);
      });
    }
    
    // Thêm vào body
    document.body.appendChild(dropdown);
    
    // Thêm sự kiện đóng dropdown khi click ra ngoài
    document.addEventListener('click', closeDropdown);
    
    // Hàm đóng dropdown khi click ra ngoài
    function closeDropdown(event) {
      if (!dropdown.contains(event.target) && event.target !== thumbnailItem) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    }
  }

  /**
   * Thêm nút hiệu ứng vào thumbnail
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyEffect - Callback function to apply effect
   */
  function addEffectButton(thumbnailItem, fileData, onApplyEffect) {
    if (!thumbnailItem) return;
    
    // Tạo container cho nút hiệu ứng
    const effectButtonContainer = document.createElement('div');
    effectButtonContainer.className = 'effect-button-container';
    
    // Nút Hiệu ứng
    const effectButton = document.createElement('button');
    effectButton.className = 'effect-button';
    effectButton.innerHTML = '<i class="fas fa-magic"></i> Hiệu ứng';
    effectButton.onclick = function(e) {
      e.stopPropagation();
      showEffectDropdown(thumbnailItem, fileData, onApplyEffect);
    };
    effectButtonContainer.appendChild(effectButton);

    // Tạo container để chứa nút hiệu ứng phía trên media
    const effectContainer = document.createElement('div');
    effectContainer.className = 'effect-container';
    
    // Thêm container nút vào effect container
    effectContainer.appendChild(effectButtonContainer);
    
    // Thêm effect container vào thumbnail item
    thumbnailItem.appendChild(effectContainer);
    
    // Đảm bảo effect container luôn hiển thị
    effectContainer.style.opacity = '1';
    effectContainer.style.visibility = 'visible';
  }

  /**
   * Cập nhật giao diện người dùng để hiển thị danh sách hiệu ứng
   */
  function updateEffectsUI() {
    try {
      console.log("Updating effects UI with", effects.length, "effects");
      
      // In ra danh sách hiệu ứng để debug
      console.log("Effects to be displayed:");
      effects.forEach((effect, index) => {
        console.log(`${index + 1}. ${effect.name} (${effect.id || 'No ID'})`);
      });
      
      // Tạo CSS cho hiệu ứng dropdown
      addEffectStyles();
      
      console.log(`Updated UI with ${effects.length} effects`);
    } catch (error) {
      console.error("Error updating effects UI:", error);
    }
  }
  
  /**
   * Thêm các styles CSS cho hiệu ứng
   */
  function addEffectStyles() {
    // Kiểm tra xem đã có style này chưa
    if (document.getElementById('effect-manager-styles')) {
      return;
    }
    
    // Tạo element style
    const styleElement = document.createElement('style');
    styleElement.id = 'effect-manager-styles';
    styleElement.textContent = `
      .effect-container {
        position: absolute;
        top: -40px;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
        opacity: 1;
        visibility: visible;
        transition: opacity 0.3s, visibility 0.3s;
      }
      
      .effect-button-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 5px;
      }
      
      .effect-button {
        background-color: #4a4a4a;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        margin: 0 5px;
        cursor: pointer;
        font-size: 12px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: background-color 0.3s;
      }
      
      .effect-button:hover {
        background-color: #666666;
      }
      
      .effect-dropdown {
        background-color: #333333;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        color: white;
        overflow: hidden;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .effect-dropdown-header {
        background-color: #4a4a4a;
        padding: 8px 12px;
        font-weight: bold;
        border-bottom: 1px solid #555555;
      }
      
      .effect-dropdown-list {
        padding: 5px 0;
      }
      
      .effect-dropdown-item {
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .effect-dropdown-item:hover {
        background-color: #4a4a4a;
      }
      
      .effect-dropdown-item.none-option {
        color: #aaaaaa;
        border-bottom: 1px solid #555555;
      }
      
      .effect-dropdown-item.no-effects {
        color: #aaaaaa;
        font-style: italic;
        cursor: default;
      }
    `;
    
    // Thêm vào head
    document.head.appendChild(styleElement);
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
          enable_video_mask: true,
          extra_material_refs: [],
          group_id: "",
          hdr_settings: null,
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
          uniform_scale: null,
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
  
  /**
   * Trả về mẫu cấu trúc track hiệu ứng
   * @returns {Object} Mẫu track hiệu ứng
   */
  function getEffectTrackTemplate() {
    return JSON.parse(JSON.stringify(effectTrackTemplate));
  }

  /**
   * Trả về mẫu cấu trúc segment hiệu ứng
   * @returns {Object} Mẫu segment hiệu ứng
   */
  function getEffectSegmentTemplate() {
    return JSON.parse(JSON.stringify(effectSegmentTemplate));
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
    createDefaultEffectTrack,
    getEffectTrackTemplate,
    getEffectSegmentTemplate,
    showEffectDropdown,
    addEffectButton,
    addEffectStyles
  };
})();
/ * *  
   *   � � p   d � � � n g   e f f e c t s   v � � o   d r a f t   c o n t e n t   c h o   v i � � ! c   x u � � � t   f i l e  
   *   @ p a r a m   { O b j e c t }   d r a f t C o n t e n t   N � � "!i   d u n g   d r a f t   c o n t e n t  
   *   @ p a r a m   { A r r a y }   e f f e c t s T o A p p l y   D a n h   s � � c h   e f f e c t s   c � � � n   � � p   d � � � n g  
   *   @ r e t u r n s   { O b j e c t }   D r a f t   c o n t e n t   �  � �   �  � � � � � c   c � � � p   n h � � � t  
   * /  
 f u n c t i o n   a p p l y E f f e c t s T o D r a f t C o n t e n t ( d r a f t C o n t e n t ,   e f f e c t s T o A p p l y )   {  
     t r y   {  
         c o n s o l e . l o g ( " A p p l y i n g   e f f e c t s   t o   d r a f t   c o n t e n t " ) ;  
          
         i f   ( ! d r a f t C o n t e n t   | |   ! e f f e c t s T o A p p l y   | |   ! A r r a y . i s A r r a y ( e f f e c t s T o A p p l y )   | |   e f f e c t s T o A p p l y . l e n g t h   = = =   0 )   {  
             c o n s o l e . l o g ( " N o   e f f e c t s   t o   a p p l y   o r   i n v a l i d   d r a f t   c o n t e n t " ) ;  
             r e t u r n   d r a f t C o n t e n t ;  
         }  
          
         / /   T � � � o   b � � � n   s a o   c � � � a   d r a f t   c o n t e n t   �  � � �  k h � � n g   � � � n h   h � � � � xn g   �  � � � n   d � � �   l i � � ! u   g � �  c  
         c o n s t   u p d a t e d C o n t e n t   =   J S O N . p a r s e ( J S O N . s t r i n g i f y ( d r a f t C o n t e n t ) ) ;  
          
         / /   � � � � � m   b � � � o   c � �   c � � c   m � � � n g   c � � � n   t h i � � � t   t r o n g   m a t e r i a l s  
         i f   ( ! u p d a t e d C o n t e n t . m a t e r i a l s )   {  
             u p d a t e d C o n t e n t . m a t e r i a l s   =   { } ;  
         }  
          
         / /   � � � � � m   b � � � o   c � �   m � � � n g   v i d e o _ e f f e c t s  
         i f   ( ! u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s )   {  
             u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s   =   [ ] ;  
         }  
          
         / /   � � � � � m   b � � � o   c � �   m � � � n g   m a t e r i a l _ a n i m a t i o n s  
         i f   ( ! u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s )   {  
             u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s   =   [ ] ;  
         }  
          
         / /   � � � � � m   b � � � o   c � �   m � � � n g   l o u d n e s s e s  
         i f   ( ! u p d a t e d C o n t e n t . l o u d n e s s e s )   {  
             u p d a t e d C o n t e n t . l o u d n e s s e s   =   [ ] ;  
         }  
          
         / /   L � � � c   c � � c   e f f e c t s   c � � � n   � � p   d � � � n g   ( b � � �   q u a   e f f e c t   " N o n e " )  
         c o n s t   v a l i d E f f e c t s   =   e f f e c t s T o A p p l y . f i l t e r ( e f f e c t   = >   e f f e c t . n a m e   ! = =   " N o n e "   & &   e f f e c t . i d   ! = =   " n o n e " ) ;  
          
         / /   N � � � u   k h � � n g   c � �   e f f e c t   n � � o   h � � � p   l � � ! ,   t r � � �   v � � �   d r a f t   c o n t e n t   g � �  c  
         i f   ( v a l i d E f f e c t s . l e n g t h   = = =   0 )   {  
             c o n s o l e . l o g ( " N o   v a l i d   e f f e c t s   t o   a p p l y " ) ;  
             r e t u r n   u p d a t e d C o n t e n t ;  
         }  
          
         c o n s o l e . l o g ( ` A p p l y i n g   $ { v a l i d E f f e c t s . l e n g t h }   e f f e c t s   t o   d r a f t   c o n t e n t ` ) ;  
          
         / /   T h � � m   c � � c   e f f e c t s   v � � o   m a t e r i a l s . v i d e o _ e f f e c t s  
         v a l i d E f f e c t s . f o r E a c h ( e f f e c t   = >   {  
             / /   T � � � o   �  � �  i   t � � � � � n g   e f f e c t   t h e o   �  � � 9 n h   d � � � n g   c � � � a   C a p C u t  
             c o n s t   v i d e o E f f e c t   =   {  
                 i d :   e f f e c t . i d   | |   g e n e r a t e U U I D ( ) ,  
                 n a m e :   e f f e c t . n a m e ,  
                 t y p e :   " v i d e o _ e f f e c t " ,  
                 a d j u s t _ p a r a m s :   e f f e c t . a d j u s t _ p a r a m s   | |   [ ] ,  
                 a p p l y _ t a r g e t _ t y p e :   e f f e c t . a p p l y _ t a r g e t _ t y p e   | |   2 ,  
                 c a t e g o r y _ i d :   e f f e c t . c a t e g o r y _ i d   | |   " 2 7 2 9 6 " ,  
                 c a t e g o r y _ n a m e :   e f f e c t . c a t e g o r y _ n a m e   | |   " � � a n g   t h � � 9 n h   h � � n h " ,  
                 e f f e c t _ i d :   e f f e c t . e f f e c t _ i d   | |   e f f e c t . r e s o u r c e _ i d   | |   " " ,  
                 e n a b l e _ m a s k :   e f f e c t . e n a b l e _ m a s k   ! = =   u n d e f i n e d   ?   e f f e c t . e n a b l e _ m a s k   :   t r u e ,  
                 i t e m _ e f f e c t _ t y p e :   e f f e c t . i t e m _ e f f e c t _ t y p e   | |   0 ,  
                 p a t h :   e f f e c t . p a t h   | |   " " ,  
                 r e s o u r c e _ i d :   e f f e c t . r e s o u r c e _ i d   | |   e f f e c t . e f f e c t _ i d   | |   " " ,  
                 s o u r c e _ p l a t f o r m :   e f f e c t . s o u r c e _ p l a t f o r m   | |   1 ,  
                 v a l u e :   e f f e c t . v a l u e   | |   1 . 0 ,  
                 p l a t f o r m :   e f f e c t . p l a t f o r m   | |   " a l l " ,  
                 c o m m o n _ k e y f r a m e s :   e f f e c t . c o m m o n _ k e y f r a m e s   | |   [ ] ,  
                 e f f e c t _ m a s k :   e f f e c t . e f f e c t _ m a s k   | |   [ ] ,  
                 c o v e r i n g _ r e l a t i o n _ c h a n g e :   e f f e c t . c o v e r i n g _ r e l a t i o n _ c h a n g e   | |   0  
             } ;  
              
             / /   K i � � �m   t r a   x e m   e f f e c t   �  � �   t � �  n   t � � � i   c h � � a  
             c o n s t   e x i s t i n g I n d e x   =   u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s . f i n d I n d e x ( e   = >   e . i d   = = =   v i d e o E f f e c t . i d ) ;  
              
             i f   ( e x i s t i n g I n d e x   > =   0 )   {  
                 / /   C � � � p   n h � � � t   e f f e c t   �  � �   t � �  n   t � � � i  
                 u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s [ e x i s t i n g I n d e x ]   =   v i d e o E f f e c t ;  
             }   e l s e   {  
                 / /   T h � � m   e f f e c t   m � � : i  
                 u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s . p u s h ( v i d e o E f f e c t ) ;  
             }  
              
             / /   T h � � m   v � � o   m a t e r i a l _ a n i m a t i o n s   n � � � u   c � � � n  
             c o n s t   m a t e r i a l A n i m a t i o n   =   {  
                 i d :   g e n e r a t e U U I D ( ) ,  
                 m a t e r i a l _ i d :   v i d e o E f f e c t . i d ,  
                 t y p e :   " v i d e o _ e f f e c t " ,  
                 a n i m a t i o n _ e f f e c t s :   [ ] ,  
                 k e y f r a m e _ r e f s :   [ ]  
             } ;  
              
             / /   K i � � �m   t r a   x e m   m a t e r i a l _ a n i m a t i o n   �  � �   t � �  n   t � � � i   c h � � a  
             c o n s t   e x i s t i n g A n i m I n d e x   =   u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s . f i n d I n d e x ( a   = >   a . m a t e r i a l _ i d   = = =   v i d e o E f f e c t . i d ) ;  
              
             i f   ( e x i s t i n g A n i m I n d e x   > =   0 )   {  
                 / /   C � � � p   n h � � � t   m a t e r i a l _ a n i m a t i o n   �  � �   t � �  n   t � � � i  
                 u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s [ e x i s t i n g A n i m I n d e x ]   =   m a t e r i a l A n i m a t i o n ;  
             }   e l s e   {  
                 / /   T h � � m   m a t e r i a l _ a n i m a t i o n   m � � : i  
                 u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s . p u s h ( m a t e r i a l A n i m a t i o n ) ;  
             }  
              
             / /   T h � � m   v � � o   l o u d n e s s e s   n � � � u   c � � � n  
             c o n s t   l o u d n e s s   =   {  
                 i d :   g e n e r a t e U U I D ( ) ,  
                 m a t e r i a l _ i d :   v i d e o E f f e c t . i d ,  
                 t y p e :   " v i d e o _ e f f e c t " ,  
                 l o u d n e s s :   0  
             } ;  
              
             / /   K i � � �m   t r a   x e m   l o u d n e s s   �  � �   t � �  n   t � � � i   c h � � a  
             c o n s t   e x i s t i n g L o u d n e s s I n d e x   =   u p d a t e d C o n t e n t . l o u d n e s s e s . f i n d I n d e x ( l   = >   l . m a t e r i a l _ i d   = = =   v i d e o E f f e c t . i d ) ;  
              
             i f   ( e x i s t i n g L o u d n e s s I n d e x   > =   0 )   {  
                 / /   C � � � p   n h � � � t   l o u d n e s s   �  � �   t � �  n   t � � � i  
                 u p d a t e d C o n t e n t . l o u d n e s s e s [ e x i s t i n g L o u d n e s s I n d e x ]   =   l o u d n e s s ;  
             }   e l s e   {  
                 / /   T h � � m   l o u d n e s s   m � � : i  
                 u p d a t e d C o n t e n t . l o u d n e s s e s . p u s h ( l o u d n e s s ) ;  
             }  
         } ) ;  
          
         / /   T � � m   c � � c   s e g m e n t s   t r o n g   t r a c k   v i d e o   �  � � �  x � � c   �  � � 9 n h   t h � � � i   g i a n  
         l e t   v i d e o S e g m e n t s   =   [ ] ;  
         i f   ( u p d a t e d C o n t e n t . t r a c k s   & &   A r r a y . i s A r r a y ( u p d a t e d C o n t e n t . t r a c k s ) )   {  
             c o n s t   v i d e o T r a c k   =   u p d a t e d C o n t e n t . t r a c k s . f i n d ( t r a c k   = >   t r a c k . t y p e   = = =   " v i d e o " ) ;  
             i f   ( v i d e o T r a c k   & &   v i d e o T r a c k . s e g m e n t s )   {  
                 v i d e o S e g m e n t s   =   v i d e o T r a c k . s e g m e n t s ;  
             }  
         }  
          
         / /   T � � � o   c � � c   s e g m e n t s   c h o   t r a c k   e f f e c t  
         c o n s t   e f f e c t S e g m e n t s   =   [ ] ;  
         l e t   r e n d e r I n d e x   =   1 1 0 0 0 ;  
          
         / /   T � � � o   s e g m e n t s   c h o   m � �  i   e f f e c t  
         v a l i d E f f e c t s . f o r E a c h ( ( e f f e c t ,   i n d e x )   = >   {  
             / /   X � � c   �  � � 9 n h   t h � � � i   g i a n   b � � � t   �  � � � u   v � �   k � � o   d � � i  
             l e t   s t a r t T i m e   =   0 ;  
             l e t   d u r a t i o n   =   3 0 0 0 0 0 0 ;   / /   3   g i � � y   m � � � c   �  � � 9 n h  
              
             / /   N � � � u   e f f e c t   c � �   t h � � n g   t i n   s e g m e n t ,   s � � �   d � � � n g   t h � � n g   t i n   �  � �  
             i f   ( e f f e c t . s e g m e n t   & &   e f f e c t . s e g m e n t . t a r g e t _ t i m e r a n g e )   {  
                 s t a r t T i m e   =   e f f e c t . s e g m e n t . t a r g e t _ t i m e r a n g e . s t a r t ;  
                 d u r a t i o n   =   e f f e c t . s e g m e n t . t a r g e t _ t i m e r a n g e . d u r a t i o n ;  
                 r e n d e r I n d e x   =   e f f e c t . s e g m e n t . r e n d e r _ i n d e x   | |   r e n d e r I n d e x ;  
             }  
             / /   N � � � u   k h � � n g   c � �   t h � � n g   t i n   s e g m e n t   n h � � n g   c � �   v i d e o   s e g m e n t   t � � � � n g   � � � n g ,   l � � � y   t h � � � i   g i a n   t � � �   �  � �  
             e l s e   i f   ( v i d e o S e g m e n t s [ i n d e x ] )   {  
                 s t a r t T i m e   =   v i d e o S e g m e n t s [ i n d e x ] . t a r g e t _ t i m e r a n g e . s t a r t ;  
                 d u r a t i o n   =   M a t h . m i n ( v i d e o S e g m e n t s [ i n d e x ] . t a r g e t _ t i m e r a n g e . d u r a t i o n ,   3 0 0 0 0 0 0 ) ;   / /   G i � � : i   h � � � n   t � �  i   �  a   3   g i � � y  
             }  
              
             / /   T � � � o   s e g m e n t   h i � � ! u   � � � n g   t h e o   m � � � u   c � � � a   C a p C u t  
             c o n s t   s e g m e n t   =   {  
                 c a p t i o n _ i n f o :   n u l l ,  
                 c a r t o o n :   f a l s e ,  
                 c l i p :   {  
                     a l p h a :   1 . 0 ,  
                     f l i p :   {  
                         h o r i z o n t a l :   f a l s e ,  
                         v e r t i c a l :   f a l s e  
                     } ,  
                     r o t a t i o n :   0 . 0 ,  
                     s c a l e :   {  
                         x :   1 . 0 ,  
                         y :   1 . 0  
                     } ,  
                     t r a n s f o r m :   {  
                         x :   0 . 0 ,  
                         y :   0 . 0  
                     }  
                 } ,  
                 c o l o r _ c o r r e c t _ a l g _ r e s u l t :   " " ,  
                 c o m m o n _ k e y f r a m e s :   [ ] ,  
                 d e s c :   " " ,  
                 d i g i t a l _ h u m a n _ t e m p l a t e _ g r o u p _ i d :   " " ,  
                 e n a b l e _ a d j u s t :   f a l s e ,  
                 e n a b l e _ a d j u s t _ m a s k :   f a l s e ,  
                 e n a b l e _ c o l o r _ c o r r e c t _ a d j u s t :   f a l s e ,  
                 e n a b l e _ c o l o r _ c u r v e s :   t r u e ,  
                 e n a b l e _ c o l o r _ m a t c h _ a d j u s t :   f a l s e ,  
                 e n a b l e _ c o l o r _ w h e e l s :   t r u e ,  
                 e n a b l e _ h s l :   f a l s e ,  
                 e n a b l e _ l u t :   f a l s e ,  
                 e n a b l e _ s m a r t _ c o l o r _ a d j u s t :   f a l s e ,  
                 e n a b l e _ v i d e o _ m a s k :   t r u e ,  
                 e x t r a _ m a t e r i a l _ r e f s :   [ ] ,  
                 g r o u p _ i d :   " " ,  
                 h d r _ s e t t i n g s :   {  
                     i n t e n s i t y :   1 . 0 ,  
                     m o d e :   1 ,  
                     n i t s :   1 0 0 0  
                 } ,  
                 i d :   g e n e r a t e U U I D ( ) ,  
                 i n t e n s i f i e s _ a u d i o :   f a l s e ,  
                 i s _ l o o p :   f a l s e ,  
                 i s _ p l a c e h o l d e r :   f a l s e ,  
                 i s _ t o n e _ m o d i f y :   f a l s e ,  
                 k e y f r a m e _ r e f s :   [ ] ,  
                 l a s t _ n o n z e r o _ v o l u m e :   1 . 0 ,  
                 l y r i c _ k e y f r a m e s :   n u l l ,  
                 m a t e r i a l _ i d :   e f f e c t . i d ,  
                 r a w _ s e g m e n t _ i d :   " " ,  
                 r e n d e r _ i n d e x :   r e n d e r I n d e x ,  
                 r e n d e r _ t i m e r a n g e :   {  
                     d u r a t i o n :   0 ,  
                     s t a r t :   0  
                 } ,  
                 r e s p o n s i v e _ l a y o u t :   {  
                     e n a b l e :   f a l s e ,  
                     h o r i z o n t a l _ p o s _ l a y o u t :   0 ,  
                     s i z e _ l a y o u t :   0 ,  
                     t a r g e t _ f o l l o w :   " " ,  
                     v e r t i c a l _ p o s _ l a y o u t :   0  
                 } ,  
                 r e v e r s e :   f a l s e ,  
                 s o u r c e _ t i m e r a n g e :   n u l l ,  
                 s p e e d :   1 . 0 ,  
                 s t a t e :   0 ,  
                 t a r g e t _ t i m e r a n g e :   {  
                     d u r a t i o n :   d u r a t i o n ,  
                     s t a r t :   s t a r t T i m e  
                 } ,  
                 t e m p l a t e _ i d :   " " ,  
                 t e m p l a t e _ s c e n e :   " d e f a u l t " ,  
                 t r a c k _ a t t r i b u t e :   0 ,  
                 t r a c k _ r e n d e r _ i n d e x :   1 ,  
                 u n i f o r m _ s c a l e :   {  
                     o n :   t r u e ,  
                     v a l u e :   1 . 0  
                 } ,  
                 v i s i b l e :   t r u e ,  
                 v o l u m e :   1 . 0  
             } ;  
              
             e f f e c t S e g m e n t s . p u s h ( s e g m e n t ) ;  
              
             / /   T � �n g   r e n d e r   i n d e x   c h o   s e g m e n t   t i � � � p   t h e o  
             r e n d e r I n d e x + + ;  
         } ) ;  
          
         / /   K i � � �m   t r a   v � �   c � � � p   n h � � � t   t r a c k   e f f e c t  
         i f   ( e f f e c t S e g m e n t s . l e n g t h   >   0 )   {  
             / /   T � � � o   t r a c k   e f f e c t   m � � : i   t h e o   m � � � u   c � � � a   C a p C u t  
             c o n s t   e f f e c t T r a c k   =   {  
                 a t t r i b u t e :   0 ,  
                 f l a g :   0 ,  
                 i d :   g e n e r a t e U U I D ( ) ,  
                 i s _ d e f a u l t _ n a m e :   t r u e ,  
                 n a m e :   " " ,  
                 s e g m e n t s :   e f f e c t S e g m e n t s ,  
                 t y p e :   " e f f e c t "  
             } ;  
              
             / /   � � � � � m   b � � � o   c � �   m � � � n g   t r a c k s  
             i f   ( ! u p d a t e d C o n t e n t . t r a c k s )   {  
                 u p d a t e d C o n t e n t . t r a c k s   =   [ ] ;  
             }  
              
             / /   K i � � �m   t r a   x e m   �  � �   c � �   t r a c k   e f f e c t   c h � � a  
             c o n s t   e x i s t i n g T r a c k I n d e x   =   u p d a t e d C o n t e n t . t r a c k s . f i n d I n d e x ( t r a c k   = >   t r a c k . t y p e   = = =   " e f f e c t " ) ;  
              
             i f   ( e x i s t i n g T r a c k I n d e x   > =   0 )   {  
                 / /   C � � � p   n h � � � t   t r a c k   h i � � ! n   c � �  
                 u p d a t e d C o n t e n t . t r a c k s [ e x i s t i n g T r a c k I n d e x ] . s e g m e n t s   =   e f f e c t S e g m e n t s ;  
             }   e l s e   {  
                 / /   T h � � m   t r a c k   m � � : i   v � � o   d a n h   s � � c h  
                 u p d a t e d C o n t e n t . t r a c k s . p u s h ( e f f e c t T r a c k ) ;  
             }  
         }  
          
         c o n s o l e . l o g ( " E f f e c t s   a p p l i e d   t o   d r a f t   c o n t e n t   s u c c e s s f u l l y " ) ;  
         r e t u r n   u p d a t e d C o n t e n t ;  
     }   c a t c h   ( e r r o r )   {  
         c o n s o l e . e r r o r ( " E r r o r   a p p l y i n g   e f f e c t s   t o   d r a f t   c o n t e n t : " ,   e r r o r ) ;  
         r e t u r n   d r a f t C o n t e n t ;  
     }  
 }  
 