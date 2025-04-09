/**
 * Export Manager - Handles exporting to CapCut
 */
const ExportManager = (function () {
  // CapCut effect and transition mappings
  const capcut = {
    // Effects mapping (name -> effect_id)
    effects: {
      None: null,
      "Lật Zoom": "7395465413527899398",
      "Làm mờ bùng nổ": "7399465788387773701",
      "Lắc lư": "7399467327726587141",
      "Màn hình 3D": "7436469103449084432",
      "Chuyển động máy ảnh": "7399472023874948357",
      "Cuộn ngang": "7442287977864106497",
      "Tình yêu mờ nhạt": "7399470509722815750",
      "Nét truyện tranh": "7462247315059789117",
      "Theo dõi bắn": "7399471976714128645",
      "Mở ngược": "7399471215905082630",
      "Tuyết vàng": "7445221319781650945",
      "Trái tim bung nở": "7448891008441405953",
      "Lóe sáng chớp nảy": "7399464712909507846",
      Phim: "7399471460445621509",
      "Điểm lục giác": "7399466433782058245",
      "Lăng kính đá quý": "7446312093990523408",
      "Bụi rơi": "7456798559417930257",
      "Đèn nhấp nháy theo nhịp": "7399470385282026758",
      "Đèn nháy": "7463254687957912893",
      "Bám sát đối tượng 2": "7399467027066375429",
      "Vở kịch Giáng Sinh": "7450046927875346960",
      "Lũ quét qua": "7395468013832523014",
      "S-Movement": "7399471490363608325",
      "Cười lên": "7442284470150894081",
      "Chớp mắt mở": "7395467471026785541",
      "Đèn flash chéo": "7399471479596895494",
      "Tia sáng kéo dài": "7399466235026509061",
      "Sóng xung kích": "7395471053717277957",
      "Lấp lánh 2": "7399466236188380421",
      "Trục trặc pixel": "7399464859097730309",
      "Làm mờ ảo diệu": "7395468812021157126",
      "Phóng to phơi sáng": "7395473374673259782",
    },

    // Icon mapping for transitions
    transitionIcons: {
      Cut: "fas fa-cut",
      "Giảm dần zoom": "fas fa-search-minus",
      "Tín hiệu trục trặc 2": "fas fa-bolt",
      "Ba lát": "fas fa-th",
      "Lấp lánh": "fas fa-star",
      "Thổi ra": "fas fa-expand-arrows-alt",
      "Trượt xuống": "fas fa-arrow-down",
    },
  };

  /**
   * Initialize export manager
   */
  function init() {
    // Add export button functionality
    const exportButton = document.getElementById("export-button");
    if (exportButton) {
      exportButton.addEventListener("click", exportToCapcut);
    }
  }

  /**
   * Generate a random UUID for CapCut JSON
   * @returns {string} Random UUID
   */
  function generateUUID() {
    const pattern = "XXXXXXXX-XXXX-4XXX-XXXX-XXXXXXXXXXXX";
    return pattern.replace(/X/g, function () {
      return Math.floor(Math.random() * 16)
        .toString(16)
        .toUpperCase();
    });
  }

  /**
   * Export data to CapCut JSON format
   */
  function exportToCapcut() {
    // Ensure we have media items
    const thumbnailItems = document.querySelectorAll(".thumbnail-item");
    if (thumbnailItems.length === 0) {
      UIManager.showNotification(
        "Please add at least one media file before exporting",
        "error"
      );
      return;
    }

    try {
      // Check if running in Electron environment
      if (window.electron) {
        console.log("Using Node.js API to read template files");

        // Use Promise.all to read all template files concurrently
        Promise.all([
          window.electron.readJsonFile("draft_content_effect.json"),
          window.electron.readJsonFile("draft_content_transition.json"),
          window.electron.readJsonFile("draft_content_default.json"),
        ])
          .then(([effectTemplateData, transitionTemplateData, templateData]) => {
            console.log("Successfully loaded template files");
            processTemplateData(effectTemplateData, transitionTemplateData, templateData);
          })
          .catch((error) => {
            console.error("Error loading template files:", error);
            UIManager.showNotification(
              `Error loading template files: ${error.message}`,
              "error"
            );
          });
      } else {
        // In browser mode, use fetch to load template files
        console.log("Using fetch API to read template files");
        Promise.all([
          fetch("draft_content_effect.json").then((response) => response.json()),
          fetch("draft_content_transition.json").then((response) => response.json()),
          fetch("draft_content_default.json").then((response) => response.json()),
        ])
          .then(([effectTemplateData, transitionTemplateData, templateData]) => {
            console.log("Successfully loaded template files");
            processTemplateData(effectTemplateData, transitionTemplateData, templateData);
          })
          .catch((error) => {
            console.error("Error loading template files:", error);
            UIManager.showNotification(
              `Error loading template files: ${error.message}`,
              "error"
            );
          });
      }
    } catch (error) {
      console.error("Error during export:", error);
      UIManager.showNotification(
        `Error during export: ${error.message}`,
        "error"
      );
    }
  }

  /**
   * Validates the export data to ensure it meets all requirements
   * @param {Object} capcutData - The data to be exported
   * @param {Array} mediaItems - The media items included in the export
   * @returns {Object} - Object with isValid flag and error message if invalid
   */
  function validateExportData(capcutData, mediaItems) {
    // Kiểm tra các điều kiện cần thiết
    if (!capcutData) {
      return {
        isValid: false,
        message: "Invalid CapCut data structure",
      };
    }

    if (!capcutData.materials) {
      return {
        isValid: false,
        message: "Missing materials in CapCut data",
      };
    }

    if (!capcutData.tracks || capcutData.tracks.length === 0) {
      return {
        isValid: false,
        message: "No tracks found in CapCut data",
      };
    }

    // Kiểm tra xem có ít nhất một track video
    const videoTrack = capcutData.tracks.find((track) => track.type === "video");
    if (!videoTrack) {
      return {
        isValid: false,
        message: "No video track found in CapCut data",
      };
    }

    // Kiểm tra xem có ít nhất một segment trong track video
    if (!videoTrack.segments || videoTrack.segments.length === 0) {
      return {
        isValid: false,
        message: "No segments found in video track",
      };
    }

    // Kiểm tra xem số lượng segment có khớp với số lượng media items
    if (videoTrack.segments.length !== mediaItems.length) {
      console.warn(
        `Warning: Number of segments (${videoTrack.segments.length}) doesn't match number of media items (${mediaItems.length})`
      );
      // Không coi đây là lỗi nghiêm trọng, chỉ cảnh báo
    }

    // Kiểm tra các thuộc tính bắt buộc của segment
    for (let i = 0; i < videoTrack.segments.length; i++) {
      const segment = videoTrack.segments[i];
      if (!segment.id) {
        return {
          isValid: false,
          message: `Segment at index ${i} is missing ID`,
        };
      }

      if (!segment.material_id) {
        return {
          isValid: false,
          message: `Segment at index ${i} is missing material_id`,
        };
      }

      if (!segment.target_timerange) {
        return {
          isValid: false,
          message: `Segment at index ${i} is missing target_timerange`,
        };
      }
    }

    // Nếu mọi kiểm tra đều thành công
    return {
      isValid: true,
    };
  }

  /**
   * Process template data and generate CapCut export
   * @param {Object} effectTemplateData - The effect template data
   * @param {Object} transitionTemplateData - The transition template data
   * @param {Object} templateData - The default template data
   */
  function processTemplateData(effectTemplateData, transitionTemplateData, templateData) {
    try {
      console.log("Processing template data");

      // Create a deep copy of the template - GIỮ NGUYÊN CẤU TRÚC GỐC
      const capcutData = JSON.parse(JSON.stringify(templateData));
      
      // Đảm bảo rằng tất cả các mảng cần thiết luôn tồn tại để tránh lỗi khi kiểm tra
      if (!capcutData.materials) {
        capcutData.materials = {};
      }
      
      // Khởi tạo các mảng nếu chưa tồn tại
      const requiredArrays = [
        'videos', 'canvases', 'placeholder_infos', 'sound_channel_mappings', 
        'speeds', 'video_effects', 'vocal_separations', 'transitions', 'material_animations',
        'audios', 'texts', 'stickers', 'shapes', 'handwrites', 'filters', 'adjusts',
        'chromas', 'color_curves', 'hsl', 'log_color_wheels', 'primary_color_wheels',
        'audio_effects', 'audio_fades', 'audio_track_indexes', 'audio_balances', 'loudnesses',
        'placeholders', 'plugin_effects', 'realtime_denoises', 'smart_crops', 'smart_relights',
        'green_screens', 'time_marks', 'tail_leaders', 'text_templates', 'beats',
        'digital_humans', 'flowers', 'common_mask', 'manual_beautys', 'manual_deformations',
        'material_colors', 'multi_language_refs', 'drafts', 'images', 'ai_translates'
      ];
      
      requiredArrays.forEach(arrayName => {
        if (!capcutData.materials[arrayName]) {
          capcutData.materials[arrayName] = [];
        }
      });
      
      if (!capcutData.tracks) {
        capcutData.tracks = [];
      }
      
      // Đảm bảo có ít nhất một track video
      let mainVideoTrack = capcutData.tracks.find(track => track.type === 'video');
      if (!mainVideoTrack) {
        mainVideoTrack = {
          attribute: 0,
          flag: 0,
          id: generateUUID(),
          is_default_name: true,
          name: "",
          segments: [],
          type: "video",
        };
        capcutData.tracks.push(mainVideoTrack);
      }
      
      // Đảm bảo có UUID cho template
      if (!capcutData.id) {
        capcutData.id = generateUUID().toUpperCase();
      }

      // Create a map of effect IDs to their full configurations from the effect template
      const effectsMap = {};
      if (
        effectTemplateData &&
        effectTemplateData.materials &&
        effectTemplateData.materials.video_effects
      ) {
        effectTemplateData.materials.video_effects.forEach((effect) => {
          if (effect.effect_id) {
            effectsMap[effect.effect_id] = effect;
          }
        });
      }

      // Create a map of transition IDs to their full configurations from the transition template
      const transitionsMap = {};
      if (
        transitionTemplateData &&
        transitionTemplateData.materials &&
        transitionTemplateData.materials.transitions
      ) {
        transitionTemplateData.materials.transitions.forEach((transition) => {
          if (transition.effect_id) {
            transitionsMap[transition.effect_id] = transition;
          }
        });
      }

      // Get media items from the DOM
      const thumbnailItems = document.querySelectorAll(".thumbnail-item");
      const mediaItems = [];

      // Map to store IDs for reference
      const idMap = {
        canvases: [],
        speeds: [],
        placeholders: [],
        placeholderInfos: [], 
        soundMappings: [],
        vocalSeparations: [],
        videoEffects: [], 
        transitions: [],
        mediaIds: []
      };
      
      // Xóa các mảng để tạo mới, đảm bảo chỉ tạo đúng số lượng phần tử cần thiết
      capcutData.materials.speeds = [];
      capcutData.materials.placeholder_infos = [];
      capcutData.materials.canvases = [];
      capcutData.materials.sound_channel_mappings = [];
      capcutData.materials.vocal_separations = [];

      // Process each thumbnail to extract media information
      thumbnailItems.forEach((item) => {
        // Tìm kiếm tên file trong thumbnail-info > p (đối tượng p đầu tiên chứa tên file)
        const thumbnailInfo = item.querySelector(".thumbnail-info");
        let fileName = "Unknown File";
        
        if (thumbnailInfo) {
          const fileNameElement = thumbnailInfo.querySelector("p");
          if (fileNameElement) {
            fileName = fileNameElement.textContent;
          } else {
            console.warn("Missing file name paragraph in thumbnail item");
          }
        } else {
          console.warn("Missing thumbnail-info element in thumbnail item");
          // Không return để vẫn tạo media item với tên mặc định
        }

        const mediaItem = {
          fileName: fileName,
          filePath: item.dataset.path || item.dataset.originalPath || "",
          isVideo: item.dataset.type === "video" || (item.querySelector("video") !== null),
          width: parseInt(item.dataset.width) || 1280,
          height: parseInt(item.dataset.height) || 720,
          duration: 5000000, // Default to 5 seconds (in microseconds)
          
          // Tìm kiếm duration-input nếu có
          durationInSeconds: (function() {
            const durationInput = item.querySelector(".duration-input");
            if (durationInput && durationInput.value) {
              // Chuyển đổi giây thành microseconds
              return parseInt(durationInput.value) * 1000000;
            }
            return 5000000; // Mặc định 5 giây
          })(),
          original_width: parseInt(item.dataset.width) || 1280,
          original_height: parseInt(item.dataset.height) || 720,
          original_duration: (function() {
            const durationInput = item.querySelector(".duration-input");
            if (durationInput && durationInput.value) {
              return parseInt(durationInput.value) * 1000000;
            }
            return 5000000; // Mặc định 5 giây
          })(),
          rotation: 0,
          volume: 1.0,
          source_platform: 0,
          source_type: 0,
          is_placeholder: false,
          is_edit_mask: false,
          is_tone_modify: false,
          is_segmented: false,
          is_hidden: false,
          is_from_ve_project: false,
        };

        // Get selected effect if any
        try {
          const selectedEffect = item.querySelector(".selected-effect");
          if (selectedEffect && selectedEffect.dataset && selectedEffect.dataset.effectId) {
            mediaItem.effectId = selectedEffect.dataset.effectId;
            mediaItem.effectName = selectedEffect.dataset.name || selectedEffect.textContent.trim() || "Unknown Effect";
            
            // Lấy effect duration từ dataset của selected-effect
            if (selectedEffect.dataset.duration) {
              mediaItem.effectDuration = parseInt(selectedEffect.dataset.duration) || 3000000; // Default 3 seconds if parsing fails
            } else {
              // Tìm input duration gần nhất
              const durationInput = item.querySelector(".duration-input");
              if (durationInput && durationInput.value) {
                // Chuyển đổi từ giây sang microseconds
                mediaItem.effectDuration = parseInt(durationInput.value) * 1000000 || 3000000;
              } else {
                mediaItem.effectDuration = 3000000; // Default 3 seconds
              }
            }
            console.log(`Effect for item ${index}: ${mediaItem.effectName}, duration: ${mediaItem.effectDuration}`);
          }
        } catch (effectError) {
          console.warn("Error processing effect for item:", effectError);
        }

        // Get selected transition if any
        try {
          const selectedTransition = item.querySelector(".selected-transition");
          if (selectedTransition && selectedTransition.dataset && selectedTransition.dataset.transitionId) {
            mediaItem.transition = {
              effect_id: selectedTransition.dataset.transitionId,
              name: selectedTransition.dataset.transitionName || "Unknown Transition",
              duration: parseInt(selectedTransition.dataset.duration) || 500000, // Default 0.5 seconds
            };
          }
        } catch (transitionError) {
          console.warn("Error processing transition for item:", transitionError);
        }

        mediaItems.push(mediaItem);
      });

      console.log(`Processing ${mediaItems.length} media items`);

      // Kiểm tra xem có media item nào không
      if (mediaItems.length === 0) {
        console.warn("No valid media items found. Creating a default media item.");
        // Tạo một media item mặc định để tránh lỗi validation
        mediaItems.push({
          fileName: "Default Media",
          filePath: "",
          isVideo: false, // Sử dụng hình ảnh mặc định
          width: 1280,
          height: 720,
          duration: 5000000, // 5 giây
          original_width: 1280,
          original_height: 720,
          original_duration: 5000000,
          rotation: 0.0, // Sử dụng số thực
          volume: 1.0,
          source_platform: 0,
          source_type: 0,
          is_placeholder: false,
          is_edit_mask: false,
          is_tone_modify: false,
          is_segmented: false,
          is_hidden: false,
          is_from_ve_project: false,
        });
      }

      // Chỉ sử dụng một vòng lặp duy nhất để xử lý tất cả các media items
      mediaItems.forEach((item, index) => {
        // Xử lý effects nếu có
        if (item.effectName && item.effectName !== "None" && item.effectId) {
          const effectId = generateUUID();

          // Get the full effect details from the effect template
          const templateEffect = effectsMap[item.effectId];
          
          console.log(`Creating effect for item ${index}: ${item.effectName}, effect_id: ${item.effectId}`);

          // Tạo đối tượng effect
          let effectObject;
          
          if (templateEffect) {
            // Clone the effect from the template and use the new ID
            effectObject = JSON.parse(JSON.stringify(templateEffect));
            effectObject.id = effectId;
            
            // Đảm bảo có request_id mới
            effectObject.request_id = generateUUID().replace(/-/g, "");
            
            // Cập nhật resource_id nếu cần
            if (!effectObject.resource_id) {
              effectObject.resource_id = item.effectId;
            }
          } else {
            // Nếu không tìm thấy trong template, tạo mới với các giá trị mặc định
            effectObject = {
              id: effectId,
              effect_id: item.effectId,
              name: item.effectName,
              type: "video_effect",
              category_id: "27296",
              category_name: "Đang thịnh hành",
              adjust_params: [
                {
                  name: "effects_adjust_speed",
                  default_value: 0.33,
                  value: 0.33,
                },
                {
                  name: "effects_adjust_intensity",
                  default_value: 0.6,
                  value: 0.6,
                },
                {
                  name: "effects_adjust_luminance",
                  default_value: 0.5,
                  value: 0.5,
                },
                { name: "effects_adjust_blur", default_value: 0.5, value: 0.5 },
                {
                  name: "effects_adjust_sharpen",
                  default_value: 0.4,
                  value: 0.4,
                },
                {
                  name: "effects_adjust_color",
                  default_value: 0.5,
                  value: 0.5,
                },
                {
                  name: "effects_adjust_background_animation",
                  default_value: 0.5,
                  value: 0.5,
                },
              ],
              apply_target_type: 2,
              algorithm_artifact_path: "",
              enable_mask: true,
              covering_relation_change: 0,
              platform: "all",
              render_index: 0,
              request_id: generateUUID().replace(/-/g, ""),
              resource_id: item.effectId,
              source_platform: 1,
              value: 1.0,
              version: "",
            };
          }
          
          // Thêm effect vào danh sách
          capcutData.materials.video_effects.push(effectObject);
          // Đảm bảo mảng videoEffects có đủ phần tử
          while (idMap.videoEffects.length <= index) {
            idMap.videoEffects.push(null);
          }
          idMap.videoEffects[index] = effectId;
        } else {
          // Đảm bảo mảng videoEffects có đủ phần tử
          while (idMap.videoEffects.length <= index) {
            idMap.videoEffects.push(null);
          }
          idMap.videoEffects[index] = null;
        }
        const mediaId = generateUUID();
        
        // Calculate target timerange
        let startTime = 0;
        for (let i = 0; i < index; i++) {
          startTime += mediaItems[i].duration;
        }
        
        // Chuyển đổi đường dẫn Windows (backslash) sang đường dẫn Unix (forward slash)
        const formattedPath = item.filePath.replace(/\\/g, '/');
        
        // Tạo đối tượng media theo thứ tự thuộc tính trong draft_content_image.json
        // Sắp xếp các thuộc tính theo đúng thứ tự trong file mẫu
        const mediaObject = {};
        
        // Thêm các thuộc tính theo đúng thứ tự trong draft_content_image.json
        mediaObject.aigc_history_id = "";
        mediaObject.aigc_item_id = "";
        mediaObject.aigc_type = "none";
        mediaObject.audio_fade = null;
        mediaObject.beauty_body_preset_id = "";
        mediaObject.beauty_face_auto_preset = {
          name: "",
          preset_id: "",
          rate_map: ""
        };
        mediaObject.beauty_face_auto_preset_infos = [];
        mediaObject.beauty_face_preset_infos = [];
        mediaObject.cartoon_path = "";
        mediaObject.category_id = "";
        mediaObject.category_name = "local";
        mediaObject.check_flag = 62978047;
        mediaObject.crop = {
          lower_left_x: 0.0,
          lower_left_y: 1.0,
          lower_right_x: 1.0,
          lower_right_y: 1.0,
          upper_left_x: 0.0,
          upper_left_y: 0.0,
          upper_right_x: 1.0,
          upper_right_y: 0.0
        };
        mediaObject.crop_ratio = "free";
        mediaObject.crop_scale = 1.0;
        mediaObject.duration = 10800000000;  // Giá trị cố định từ file mẫu
        mediaObject.extra_type_option = 0;
        mediaObject.formula_id = "";
        mediaObject.freeze = null;
        mediaObject.has_audio = false;
        mediaObject.has_sound_separated = false;
        mediaObject.height = item.height;
        mediaObject.id = mediaId;
        mediaObject.intensifies_audio_path = "";
        mediaObject.intensifies_path = "";
        mediaObject.is_ai_generate_content = false;
        mediaObject.is_copyright = false;
        mediaObject.is_text_edit_overdub = false;
        mediaObject.is_unified_beauty_mode = false;
        mediaObject.live_photo_cover_path = "";
        mediaObject.live_photo_timestamp = -1;
        mediaObject.local_id = "";
        mediaObject.local_material_from = "";
        mediaObject.local_material_id = "";
        mediaObject.material_id = "";
        mediaObject.material_name = item.fileName;
        mediaObject.material_url = "";
        mediaObject.matting = {
          custom_matting_id: "",
          enable_matting_stroke: false,
          expansion: 0,
          feather: 0,
          flag: 0,
          has_use_quick_brush: false,
          has_use_quick_eraser: false,
          interactiveTime: [],
          path: "",
          reverse: false,
          strokes: []
        };
        mediaObject.media_path = "";
        mediaObject.multi_camera_info = null;
        mediaObject.object_locked = null;
        mediaObject.origin_material_id = "";
        mediaObject.path = formattedPath;
        mediaObject.picture_from = "none";
        mediaObject.picture_set_category_id = "";
        mediaObject.picture_set_category_name = "";
        mediaObject.request_id = "";
        mediaObject.reverse_intensifies_path = "";
        mediaObject.reverse_path = "";
        mediaObject.smart_match_info = null;
        mediaObject.smart_motion = null;
        mediaObject.source = 0;
        mediaObject.source_platform = 0;
        mediaObject.stable = {
          matrix_path: "",
          stable_level: 0,
          time_range: {
            duration: 0,
            start: 0
          }
        };
        mediaObject.team_id = "";
        mediaObject.type = item.isVideo ? "video" : "photo";  // Sử dụng "photo" cho hình ảnh
        mediaObject.video_algorithm = {
          ai_background_configs: [],
          ai_expression_driven: null,
          ai_motion_driven: null,
          aigc_generate: null,
          algorithms: [],
          complement_frame_config: null,
          deflicker: null,
          gameplay_configs: [],
          motion_blur_config: null,
          mouth_shape_driver: null,
          noise_reduction: null,
          path: "",
          quality_enhance: null,
          smart_complement_frame: null,
          super_resolution: null,
          time_range: null
        };
        mediaObject.width = item.width;
        
        // Thêm đối tượng media vào mảng videos
        capcutData.materials.videos.push(mediaObject);
        
        idMap.mediaIds.push(mediaId);
        
        // Tạo các phần tử con cho mỗi media item
        
        // 1. Tạo speed
        const speedId = generateUUID();
        const speedObject = {
          curve_speed: null,
          id: speedId,
          mode: 0,
          speed: 1.0, // Giữ nguyên định dạng float
          type: "speed"
        };
        capcutData.materials.speeds.push(speedObject);
        idMap.speeds[index] = speedId;
        
        // 2. Tạo placeholder_info
        const placeholderInfoId = generateUUID();
        const placeholderInfoObject = {
          error_path: "",
          error_text: "",
          id: placeholderInfoId,
          meta_type: "none",
          res_path: "",
          res_text: "",
          type: "placeholder_info"
        };
        capcutData.materials.placeholder_infos.push(placeholderInfoObject);
        idMap.placeholderInfos[index] = placeholderInfoId;
        
        // 3. Tạo canvas
        const canvasId = generateUUID();
        const canvasObject = {
          album_image: "",
          blur: 0.0, // Giữ nguyên định dạng float
          color: "",
          id: canvasId,
          image: "",
          image_id: "",
          image_name: "",
          source_platform: 0,
          team_id: "",
          type: "canvas_color"
        };
        capcutData.materials.canvases.push(canvasObject);
        idMap.canvases[index] = canvasId;
        
        // 4. Tạo sound_channel_mapping
        const soundMappingId = generateUUID();
        const soundMappingObject = {
          audio_channel_mapping: 0,
          id: soundMappingId,
          is_config_open: false,
          type: ""
        };
        capcutData.materials.sound_channel_mappings.push(soundMappingObject);
        idMap.soundMappings[index] = soundMappingId;
        
        // 5. Tạo vocal_separation
        const vocalSeparationId = generateUUID();
        const vocalSeparationObject = {
          choice: 0,
          id: vocalSeparationId,
          production_path: "",
          removed_sounds: [],
          time_range: null,
          type: "vocal_separation"
        };
        capcutData.materials.vocal_separations.push(vocalSeparationObject);
        idMap.vocalSeparations[index] = vocalSeparationId;
        
        // Add extra material references
        const extraRefs = [];
        
        // Thêm các tham chiếu vào extraRefs
        extraRefs.push(speedId);
        extraRefs.push(placeholderInfoId);
        extraRefs.push(canvasId);
        extraRefs.push(soundMappingId);
        extraRefs.push(vocalSeparationId);

        // Add video effect if it exists
        if (idMap.videoEffects && idMap.videoEffects[index]) {
          extraRefs.push(idMap.videoEffects[index]);
          console.log(`Adding effect reference ${idMap.videoEffects[index]} to segment for media item ${item.fileName}`);
        }

        // Tạo segment theo thứ tự thuộc tính trong draft_content_image.json
        const segmentId = generateUUID();
        const segment = {};
        
        // Thêm các thuộc tính theo đúng thứ tự trong file mẫu
        segment.caption_info = null;
        segment.cartoon = false;
        segment.clip = {
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
        };
        segment.color_correct_alg_result = "";
        segment.common_keyframes = [];
        segment.desc = "";
        segment.digital_human_template_group_id = "";
        segment.enable_adjust = true;
        segment.enable_adjust_mask = false;
        segment.enable_color_correct_adjust = false;
        segment.enable_color_curves = true;
        segment.enable_color_match_adjust = false;
        segment.enable_color_wheels = true;
        segment.enable_hsl = false;
        segment.enable_lut = true;
        segment.enable_smart_color_adjust = false;
        segment.enable_video_mask = true;
        segment.extra_material_refs = extraRefs;
        segment.group_id = "";
        segment.hdr_settings = {
          intensity: 1.0,
          mode: 1,
          nits: 1000
        };
        segment.id = segmentId;
        segment.intensifies_audio = false;
        segment.is_loop = false;
        segment.is_placeholder = false;
        segment.is_tone_modify = false;
        segment.keyframe_refs = [];
        segment.last_nonzero_volume = 1.0;
        segment.lyric_keyframes = null;
        segment.material_id = mediaId;
        segment.raw_segment_id = "";
        segment.render_index = 0;
        segment.render_timerange = {
          duration: 0,
          start: 0
        };
        segment.responsive_layout = {
          enable: false,
          horizontal_pos_layout: 0,
          size_layout: 0,
          target_follow: "",
          vertical_pos_layout: 0
        };
        segment.reverse = false;
        segment.source_timerange = {
          duration: item.duration,
          start: 0
        };
        segment.speed = 1.0;
        segment.state = 0;
        segment.target_timerange = {
          duration: item.duration,
          start: startTime
        };
        segment.template_id = "";
        segment.template_scene = "default";
        segment.track_attribute = 0;
        segment.track_render_index = 0;
        segment.uniform_scale = {
          on: true,
          value: 1.0
        };
        segment.visible = true;
        segment.volume = 1.0;

        // Thêm segment vào track video
        mainVideoTrack.segments.push(segment);
      });
      
      // Xử lý material_animations theo cấu trúc đúng
      // Theo yêu cầu của người dùng, material_animations sẽ để rỗng (không có phần tử con)
      // Đảm bảo mảng material_animations đã được khởi tạo
      capcutData.materials.material_animations = [];
      
      // Thêm track hiệu ứng vào danh sách tracks
      try {
        // Tạo mẫu track hiệu ứng trực tiếp
        const effectTrackTemplate = {
          attribute: 0,
          flag: 0,
          id: "", // Sẽ được tạo động
          is_default_name: true,
          name: "",
          segments: [], // Sẽ được điền động
          type: "effect"
        };
        
        // Tạo mẫu segment hiệu ứng trực tiếp
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
          id: "",
          intensifies_audio: false,
          is_loop: false,
          is_placeholder: false,
          is_tone_modify: false,
          keyframe_refs: [],
          last_nonzero_volume: 1.0,
          lyric_keyframes: null,
          material_id: "",
          raw_segment_id: "",
          render_index: 0,
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
          source_timerange: {
            duration: 0,
            start: 0
          },
          speed: 1.0,
          state: 0,
          target_timerange: {
            duration: 0,
            start: 0
          },
          template_id: "",
          template_scene: "default",
          track_attribute: 0,
          track_render_index: 0,
          uniform_scale: {
            on: true,
            value: 1.0
          },
          visible: true,
          volume: 1.0
        };
        
        // Tạo track hiệu ứng mới
        const effectTrack = JSON.parse(JSON.stringify(effectTrackTemplate));
        effectTrack.id = generateUUID();
        effectTrack.name = "Effect Track";
        
        // Thêm segments vào track hiệu ứng nếu có hiệu ứng được áp dụng
        mediaItems.forEach((item, index) => {
          if (item.effectId && item.effectName && item.effectName !== "None") {
            // Tạo segment hiệu ứng mới
            const effectSegment = JSON.parse(JSON.stringify(effectSegmentTemplate));
            effectSegment.id = generateUUID();
            
            // Thiết lập target_timerange để khớp với media item
            let startTime = 0;
            for (let i = 0; i < index; i++) {
              startTime += mediaItems[i].duration;
            }
            
            // Sử dụng effectDuration nếu có, nếu không thì sử dụng media item duration
            const segmentDuration = item.effectDuration || item.duration;
            
            effectSegment.target_timerange = {
              duration: segmentDuration,
              start: startTime
            };
            
            console.log(`Effect segment for item ${index}: duration=${segmentDuration}, start=${startTime}`);
            
            // Thiết lập material_id để liên kết với hiệu ứng
            effectSegment.material_id = idMap.videoEffects[index];
            
            // Thêm segment vào track hiệu ứng
            effectTrack.segments.push(effectSegment);
          }
        });
        
        // Chỉ thêm track hiệu ứng nếu có ít nhất một segment
        if (effectTrack.segments.length > 0) {
          // Đảm bảo danh sách tracks đã được khởi tạo
          if (!capcutData.tracks) {
            capcutData.tracks = [];
          }
          
          // Thêm track hiệu ứng vào danh sách tracks
          capcutData.tracks.push(effectTrack);
          console.log("Added effect track with", effectTrack.segments.length, "segments");
        }
      } catch (effectTrackError) {
        console.error("Error creating effect track:", effectTrackError);
      }
      
      // Cập nhật tổng thời lượng của dự án dựa trên các media items
      let totalDuration = 0;
      mediaItems.forEach(item => {
        totalDuration += item.duration;
      });
      
      // Đặt duration cho dự án
      capcutData.duration = totalDuration;
      
      // Đảm bảo ID của dự án là chữ hoa
      if (capcutData.id) {
        capcutData.id = capcutData.id.toUpperCase();
      }
      
      // Đảm bảo các thuộc tính khác theo cấu trúc draft_content_image.json
      if (!capcutData.canvas_config) {
        capcutData.canvas_config = {
          background: null,
          height: 1920,
          ratio: "original",
          width: 1440
        };
      }
      
      if (!capcutData.free_render_index_mode_on) {
        capcutData.free_render_index_mode_on = false;
      }
      
      if (!capcutData.render_index_track_mode_on) {
        capcutData.render_index_track_mode_on = true;
      }

      // Kiểm tra tính hợp lệ của dữ liệu trước khi xuất file
      const validationResult = validateExportData(capcutData, mediaItems);
      if (!validationResult.isValid) {
        UIManager.showNotification(validationResult.message, "error");
        console.error("Validation failed:", validationResult.message);
        return; // Dừng quá trình xuất file nếu dữ liệu không hợp lệ
      }

      // Download the JSON file or save it to the project folder
      // Sử dụng indent 2 để tạo file JSON dễ đọc
      const jsonString = JSON.stringify(capcutData, null, 2);

      console.log(
        "Current project state when exporting:",
        JSON.stringify(currentProject)
      );

      if (window.electron && currentProject.name) {
        // In Electron mode, save the file to the project folder
        console.log("Exporting to project folder:", currentProject.path);

        // Ensure path is properly formatted
        let projectPath = currentProject.path;
        // Remove double backslashes and use single backslashes for Windows paths
        if (window.electron.getPlatform() === "win32") {
          projectPath = projectPath.replace(/\\\\/g, "\\");
        }

        window.electron.send("save-project-file", {
          projectPath: projectPath,
          fileName: "draft_content.json",
          content: jsonString,
        });
        // Show immediate notification (will be updated when we get response from main process)
        UIManager.showNotification("Exporting to project folder...", "info");
      } else {
        // In browser mode, download the file
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "draft_content.json"; // Changed to match requested filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        UIManager.showNotification(
          "File exported successfully! Import it to CapCut to use your template.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error processing template data:", error);
      UIManager.showNotification(
        `Error processing template data: ${error.message}`,
        "error"
      );
    }
  }

  // Public API
  return {
    init,
    exportToCapcut,
    processTemplateData,
    generateUUID,
    capcut // Expose the capcut object
  };
})();
