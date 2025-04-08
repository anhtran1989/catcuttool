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
        soundMappings: [],
        vocalSeparations: [],
        videoEffects: {},
        transitions: {},
      };

      // Ensure we have at least one canvas
      if (capcutData.materials.canvases.length === 0) {
        const canvasId = generateUUID();
        capcutData.materials.canvases.push({
          album_image: "",
          blur: 0.0,
          color: "",
          id: canvasId,
          image: "",
          image_id: "",
          image_name: "",
          source_platform: 0,
          team_id: "",
          type: "canvas_color",
        });
        idMap.canvases.push(canvasId);
      } else {
        // Use existing canvas
        idMap.canvases.push(capcutData.materials.canvases[0].id);
      }

      // Process each thumbnail to extract media information
      thumbnailItems.forEach((item) => {
        const mediaItem = {
          fileName: item.querySelector(".file-name").textContent,
          filePath: item.dataset.path,
          isVideo: item.dataset.type === "video",
          width: parseInt(item.dataset.width) || 1280,
          height: parseInt(item.dataset.height) || 720,
          duration: parseInt(item.dataset.duration) || 5000000, // Default to 5 seconds (in microseconds)
        };

        // Get selected effect if any
        const selectedEffect = item.querySelector(".selected-effect");
        if (selectedEffect && selectedEffect.dataset.effectId) {
          mediaItem.effectId = selectedEffect.dataset.effectId;
          mediaItem.effectName = selectedEffect.dataset.effectName || "Unknown Effect";
        }

        // Get selected transition if any
        const selectedTransition = item.querySelector(".selected-transition");
        if (selectedTransition && selectedTransition.dataset.transitionId) {
          mediaItem.transition = {
            effect_id: selectedTransition.dataset.transitionId,
            name: selectedTransition.dataset.transitionName || "Unknown Transition",
            duration: parseInt(selectedTransition.dataset.duration) || 500000, // Default 0.5 seconds
          };
        }

        mediaItems.push(mediaItem);
      });

      console.log(`Processing ${mediaItems.length} media items`);

      // Create speeds, placeholders, sound mappings, and vocal separations for each media
      mediaItems.forEach((item, index) => {
        // Create speed element
        const speedId = generateUUID();
        capcutData.materials.speeds.push({
          curve_speed: null,
          id: speedId,
          mode: 0,
          speed: 1.0,
          type: "speed",
        });
        idMap.speeds.push(speedId);

        // Create placeholder
        const placeholderId = generateUUID();
        capcutData.materials.placeholder_infos.push({
          error_path: "",
          error_text: "",
          id: placeholderId,
          meta_type: "none",
          res_path: "",
          res_text: "",
          type: "placeholder_info",
        });
        idMap.placeholders.push(placeholderId);

        // Create sound channel mapping
        const soundMappingId = generateUUID();
        capcutData.materials.sound_channel_mappings.push({
          audio_channel_mapping: 0,
          id: soundMappingId,
          is_config_open: false,
          type: "",
        });
        idMap.soundMappings.push(soundMappingId);

        // Create vocal separation
        const vocalSeparationId = generateUUID();
        capcutData.materials.vocal_separations.push({
          choice: 0,
          id: vocalSeparationId,
          production_path: "",
          removed_sounds: [],
          time_range: null,
          type: "vocal_separation",
        });
        idMap.vocalSeparations.push(vocalSeparationId);

        // Create video effect if needed
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
          idMap.videoEffects[index] = effectId;
        } else {
          idMap.videoEffects[index] = null;
        }
      });
      
      // Add media items and create segments
      mediaItems.forEach((item, index) => {
        const mediaId = generateUUID();
        
        // Calculate target timerange
        let startTime = 0;
        for (let i = 0; i < index; i++) {
          startTime += mediaItems[i].duration;
        }
        
        // Add media to materials.videos or materials.images based on type
        if (item.isVideo) {
          capcutData.materials.videos.push({
            id: mediaId,
            path: item.filePath,
            name: item.fileName,
            type: "video",
            source_platform: 0,
            source_type: 0,
            height: item.height,
            width: item.width,
            duration: item.duration,
            original_duration: item.duration,
            original_width: item.width,
            original_height: item.height,
            rotation: 0,
            volume: 1.0,
            extra: {},
            team_id: "",
            is_placeholder: false,
            is_edit_mask: false,
            is_tone_modify: false,
            is_segmented: false,
            is_hidden: false,
            is_from_ve_project: false,
          });
        } else {
          capcutData.materials.images.push({
            id: mediaId,
            path: item.filePath,
            name: item.fileName,
            type: "image",
            source_platform: 0,
            source_type: 0,
            height: item.height,
            width: item.width,
            duration: item.duration,
            original_width: item.width,
            original_height: item.height,
            rotation: 0,
            extra: {},
            team_id: "",
            is_placeholder: false,
            is_edit_mask: false,
            is_tone_modify: false,
            is_segmented: false,
            is_hidden: false,
            is_from_ve_project: false,
          });
        }
        
        // Add extra material references
        const extraRefs = [
          idMap.speeds[index],
          idMap.placeholders[index],
          idMap.canvases[0],
          idMap.soundMappings[index],
          idMap.vocalSeparations[index],
        ];

        // Add video effect if it exists
        if (idMap.videoEffects[index]) {
          extraRefs.push(idMap.videoEffects[index]);
          console.log(`Adding effect reference ${idMap.videoEffects[index]} to segment for media item ${item.fileName}`);
        }

        // Tạo segment với đầy đủ thuộc tính cần thiết cho CapCut
        const segmentId = generateUUID();
        const segment = {
          id: segmentId,
          material_id: mediaId,
          // Phạm vi thời gian đích (thời gian trong timeline)
          target_timerange: {
            start: startTime,
            duration: item.duration,
          },
          // Phạm vi thời gian nguồn (thời gian trong file gốc)
          source_timerange: {
            start: 0,
            duration: item.duration,
          },
          // Tham chiếu đến các material khác
          extra_material_refs: extraRefs,
          // Các thuộc tính điều chỉnh
          enable_adjust: true,
          enable_color_curves: true,
          enable_color_wheels: true,
          enable_lut: true,
          enable_video_mask: true,
          // Tốc độ và âm lượng
          speed: 1.0,
          volume: 1.0,
          visible: true,
          // Thuộc tính clip
          clip: {
            alpha: 1.0,
            flip: {
              horizontal: false,
              vertical: false,
            },
            rotation: 0.0,
            scale: {
              x: 1.0,
              y: 1.0,
            },
            transform: {
              x: 0.0,
              y: 0.0,
            },
          },
          // Thêm các thuộc tính cần thiết khác cho CapCut
          render_index: 10000 + index, // Chỉ số render
          track_render_index: 0, // Chỉ số render của track
          state: 0, // Trạng thái
          cartoon: false, // Hiệu ứng hoạt hình
          intensifies_audio: false, // Tăng cường âm thanh
        };

        // Thêm segment vào track video
        mainVideoTrack.segments.push(segment);
      });
      
      // Xử lý material_animations theo cấu trúc đúng
      if (capcutData.materials.material_animations.length === 0) {
        // Tạo container cho material_animations nếu cần
        const animationContainer = {
          id: generateUUID(),
          animations: [],
          type: "material_animation_container"
        };
        
        // Thêm các animation mẫu nếu cần
        const sampleAnimations = [
          {
            name: "Fade In",
            type: "in",
            duration: 500000, // 0.5 giây
            id: generateUUID(),
            category_name: "Basic"
          },
          {
            name: "Fade Out",
            type: "out",
            duration: 500000, // 0.5 giây
            id: generateUUID(),
            category_name: "Basic"
          }
        ];
        
        animationContainer.animations = sampleAnimations;
        capcutData.materials.material_animations.push(animationContainer);
      }

      // Kiểm tra tính hợp lệ của dữ liệu trước khi xuất file
      const validationResult = validateExportData(capcutData, mediaItems);
      if (!validationResult.isValid) {
        UIManager.showNotification(validationResult.message, "error");
        console.error("Validation failed:", validationResult.message);
        return; // Dừng quá trình xuất file nếu dữ liệu không hợp lệ
      }

      // Download the JSON file or save it to the project folder
      const jsonString = JSON.stringify(capcutData);

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
