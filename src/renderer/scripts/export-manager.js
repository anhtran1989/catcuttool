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

        // Use Promise.all to read both files concurrently
        Promise.all([
          window.electron.readJsonFile("draft_content_effect.json"),
          window.electron.readJsonFile("draft_content_default.json"),
        ])
          .then(([effectTemplateData, templateData]) => {
            console.log("Successfully loaded template files");
            processTemplateData(effectTemplateData, templateData);
          })
          .catch((error) => {
            console.error("Error loading template files:", error);
            UIManager.showNotification(
              `Error loading template files: ${error.message}`,
              "error"
            );
          });
      } else {
        // Fallback for browser environment (for testing)
        console.log("Running in browser environment, using fetch API");

        // First try to fetch from the current directory
        fetch("./draft_content_effect.json")
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `Failed to load effect template: ${response.status} ${response.statusText}`
              );
            }
            return response.json();
          })
          .then((effectTemplateData) => {
            return fetch("./draft_content_default.json")
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    `Failed to load default template: ${response.status} ${response.statusText}`
                  );
                }
                return response.json();
              })
              .then((templateData) => {
                processTemplateData(effectTemplateData, templateData);
              });
          })
          .catch((error) => {
            console.error("Error loading templates with fetch:", error);
            UIManager.showNotification(
              `Error loading template files: ${error.message}`,
              "error"
            );
          });
      }
    } catch (error) {
      console.error("Unexpected error in exportToCapcut:", error);
      UIManager.showNotification(`Unexpected error: ${error.message}`, "error");
    }
  }

  /**
   * Process template data and generate CapCut export
   * @param {Object} effectTemplateData - The effect template data
   * @param {Object} templateData - The default template data
   */
  function processTemplateData(effectTemplateData, templateData) {
    try {
      console.log("Processing template data");

      // Create a deep copy of the template
      const capcutData = JSON.parse(JSON.stringify(templateData));

      // Create a map of effect IDs to their full configurations from the effect template
      const effectsMap = {};
      if (
        effectTemplateData &&
        effectTemplateData.materials &&
        effectTemplateData.materials.video_effects
      ) {
        effectTemplateData.materials.video_effects.forEach((effect) => {
          effectsMap[effect.effect_id] = effect;
        });
      }

      // Get all thumbnail items
      const thumbnailItems = document.querySelectorAll(".thumbnail-item");
      const transitionElements = document.querySelectorAll(
        ".transitions-container"
      );

      // Collect all media items, transitions, and effects
      const mediaItems = [];

      // Get all thumbnail items
      const thumbnails = Array.from(thumbnailItems);
      thumbnails.forEach((item, index) => {
        // Get media details
        const img = item.querySelector("img");
        const video = item.querySelector("video");
        const fileName = item.querySelector(
          ".thumbnail-info p:first-child"
        ).textContent;
        const duration =
          parseInt(item.querySelector(".duration-input").value) * 1000000; // Convert to microseconds

        // Get the effect details
        const effectElement = item.querySelector(".selected-effect");
        // Extract effect name and ID from the element
        let effectName = "None";
        let effectId = null;
        if (effectElement) {
          // Remove the icon part and get just the name
          effectName = effectElement.textContent.trim().replace(/^\S+\s+/, "");
          // Get effect ID directly from the element's dataset
          effectId = effectElement.dataset.effectId || null;
        }

        // Get the file path directly from the path input field
        const pathInput = item.querySelector(".path-input");
        let filePath = "";

        if (pathInput && pathInput.value && pathInput.value.trim() !== "") {
          // Use the real file path provided by Electron or path input
          filePath = pathInput.value.trim();
        } else if (item.dataset.originalPath) {
          // Use the path stored in the data attribute
          filePath = item.dataset.originalPath;
        } else {
          // Just use the filename if no path provided
          filePath = fileName;
        }

        // Format the path for CapCut - use native path format for Electron
        if (window.electron) {
          // For Electron, use the exact file path with proper separators for the OS
          // CapCut on Windows expects paths with backslashes
          if (window.electron.getPlatform() === "win32") {
            // Convert forward slashes to double backslashes for Windows
            filePath = filePath.replace(/\//g, "\\");

            // Ensure proper backslash format (double backslashes)
            filePath = filePath.replace(/\\/g, "\\\\");
          } else {
            // For macOS/Linux, use forward slashes
            filePath = filePath.replace(/\\/g, "/");
          }
        } else {
          // For web version, use the simple formatting
          filePath = FileManager.formatPathForCapcut(filePath);
        }

        // Check if this file has been modified and get the correct isVideo value
        let isVideo = !!video;
        
        // If we have access to TemplateManager's modifiedMediaFiles, check it
        if (window.TemplateManager && window.TemplateManager.getModifiedFile) {
          const modifiedFile = window.TemplateManager.getModifiedFile(filePath);
          if (modifiedFile) {
            // Use the file type from the modified file data
            isVideo = modifiedFile.fileType === 'video';
          }
        } else {
          // Fallback detection methods:
          
          // 1. Check if data-type attribute exists on the item element
          const dataType = item.getAttribute('data-type');
          if (dataType) {
            isVideo = dataType === 'video';
          } 
          // 2. Check for presence of video element
          else if (video) {
            isVideo = true;
          }
          // 3. Check for presence of img element
          else if (img) {
            isVideo = false;
          }
          
          console.log(`Media item ${fileName} determined to be ${isVideo ? 'video' : 'image'}`);
        }

        // Get transition (if not the last item)
        let transition = null;
        if (index < thumbnails.length - 1) {
          const transitionElement = transitionElements[index];
          if (transitionElement) {
            const selectedTransitionElement = transitionElement.querySelector(
              ".selected-transition"
            );
            if (selectedTransitionElement) {
              // Lấy đầy đủ thông tin về transition
              transition = {
                name: selectedTransitionElement.textContent
                  .trim()
                  .replace(/^\S+\s+/, ""),
                effect_id: selectedTransitionElement.dataset.effectId || null,
                is_overlap:
                  selectedTransitionElement.dataset.isOverlap === "true",
                duration:
                  parseInt(selectedTransitionElement.dataset.duration) || 0,
                category_id: selectedTransitionElement.dataset.categoryId || "",
                category_name:
                  selectedTransitionElement.dataset.categoryName || "",
                path: selectedTransitionElement.dataset.path || "",
                platform: selectedTransitionElement.dataset.platform || "",
                resource_id: selectedTransitionElement.dataset.resourceId || "",
                source_platform:
                  parseInt(selectedTransitionElement.dataset.sourcePlatform) ||
                  0,
              };
            }
          }
        }

        mediaItems.push({
          fileName: fileName,
          isVideo: isVideo,
          filePath: filePath,
          duration: duration,
          effectName: effectName,
          effectId: effectId,
          transition: transition,
        });
      });

      // Add media items to the template
      capcutData.mediaItems = mediaItems;

      // Generate a random UUID for the template
      capcutData.uuid = generateUUID();

      // Reset sections that will be populated
      capcutData.materials.videos = [];
      capcutData.materials.transitions = [];
      capcutData.materials.video_effects = [];
      capcutData.materials.speeds = [];
      capcutData.materials.placeholder_infos = [];
      capcutData.materials.vocal_separations = [];
      capcutData.tracks = [
        {
          attribute: 0,
          flag: 0,
          id: generateUUID(),
          is_default_name: true,
          name: "",
          segments: [],
          type: "video",
        },
      ];

      // Calculate total duration
      let totalDuration = 0;
      mediaItems.forEach((item) => {
        totalDuration += item.duration;
      });
      capcutData.duration = totalDuration;

      // Track IDs to reference later
      const idMap = {
        speeds: [],
        placeholders: [],
        canvases: [],
        soundMappings: [],
        vocalSeparations: [],
        transitions: [],
        videoEffects: [],
      };

      // Create default canvas
      const canvasId = generateUUID();
      capcutData.materials.canvases = [
        {
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
        },
      ];
      idMap.canvases.push(canvasId);

      // Create transition elements first
      mediaItems.forEach((item, index) => {
        if (
          item.transition &&
          item.transition.name !== "Cut" &&
          index < mediaItems.length - 1
        ) {
          const transitionId = generateUUID();

          // Sử dụng tất cả thông tin transition đã lưu trữ
          const transition = item.transition;

          if (transition && transition.effect_id) {
            capcutData.materials.transitions.push({
              id: transitionId,
              effect_id: transition.effect_id,
              duration: transition.duration,
              name: transition.name,
              is_overlap: transition.is_overlap,
              path: transition.path,
              platform: transition.platform,
              category_id: transition.category_id,
              category_name: transition.category_name,
              resource_id: transition.resource_id,
              source_platform: transition.source_platform,
              type: "transition",
            });
            idMap.transitions.push(transitionId);
          } else {
            idMap.transitions.push(null);
          }
        } else {
          idMap.transitions.push(null);
        }
      });

      // Create speed element for each media and other supporting materials
      mediaItems.forEach((item, index) => {
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

          if (templateEffect) {
            // Clone the effect from the template and use the new ID
            const effectClone = JSON.parse(JSON.stringify(templateEffect));
            effectClone.id = effectId;

            // Add to the materials
            capcutData.materials.video_effects.push(effectClone);
          } else {
            // Fallback if effect not found in template
            capcutData.materials.video_effects.push({
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
              request_id: "20250326081840BAF4C832F66D08BA0105",
              resource_id: item.effectId,
              source_platform: 1,
              value: 1.0,
              version: "",
            });
          }
          idMap.videoEffects.push(effectId);
        } else {
          idMap.videoEffects.push(null);
        }
      });

      // Add media items and create segments
      mediaItems.forEach((item, index) => {
        const mediaId = generateUUID();

        // Default values
        const mediaObject = {
          id: mediaId,
          type: item.isVideo ? "video" : "photo",
          material_name: item.fileName,
          path: item.filePath, // Use the actual file path from the source
          width: 1280, // Default width
          height: 720, // Default height
          duration: item.duration,
          has_audio: item.isVideo, // Only videos have audio
          has_sound_separated: false,
          crop: {
            lower_left_x: 0.0,
            lower_left_y: 1.0,
            lower_right_x: 1.0,
            lower_right_y: 1.0,
            upper_left_x: 0.0,
            upper_left_y: 0.0,
            upper_right_x: 1.0,
            upper_right_y: 0.0,
          },
          crop_ratio: "free",
          crop_scale: 1.0,
          category_name: "local",
          check_flag: 62978047,
        };

        capcutData.materials.videos.push(mediaObject);

        // Calculate target timerange
        let startTime = 0;
        for (let i = 0; i < index; i++) {
          startTime += mediaItems[i].duration;
        }

        // Build extra material references
        const extraRefs = [
          idMap.speeds[index],
          idMap.placeholders[index],
          idMap.canvases[0],
          idMap.soundMappings[index],
          idMap.vocalSeparations[index],
        ];

        // Add transition if it exists
        if (idMap.transitions[index]) {
          extraRefs.push(idMap.transitions[index]);
        }

        // Create segment
        const segmentId = generateUUID();
        const segment = {
          id: segmentId,
          material_id: mediaId,
          target_timerange: {
            start: startTime,
            duration: item.duration,
          },
          source_timerange: {
            start: 0,
            duration: item.duration,
          },
          extra_material_refs: extraRefs,
          enable_adjust: true,
          enable_color_curves: true,
          enable_color_wheels: true,
          enable_lut: true,
          enable_video_mask: true,
          speed: 1.0,
          volume: 1.0,
          visible: true,
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
        };

        capcutData.tracks[0].segments.push(segment);
      });

      // Add effect tracks if needed
      const effectsToAdd = idMap.videoEffects.filter((id) => id !== null);
      if (effectsToAdd.length > 0) {
        const effectTrack = {
          id: generateUUID(),
          type: "effect",
          attribute: 0,
          flag: 0,
          is_default_name: true,
          name: "",
          segments: [],
        };

        // Add effect segments
        mediaItems.forEach((item, index) => {
          if (idMap.videoEffects[index]) {
            let startTime = 0;
            for (let i = 0; i < index; i++) {
              startTime += mediaItems[i].duration;
            }

            // Get the selected effect element to retrieve the custom duration
            const thumbnailItem = thumbnailItems[index];
            const selectedEffect =
              thumbnailItem.querySelector(".selected-effect");

            // Get the custom effect duration (if set) or use the media duration
            let effectDuration = item.duration;
            if (selectedEffect && selectedEffect.dataset.duration) {
              // Get the effect duration from the dataset (in microseconds)
              const customDuration = parseInt(selectedEffect.dataset.duration);
              // Use custom duration if it's valid, otherwise fall back to media duration
              if (!isNaN(customDuration) && customDuration > 0) {
                effectDuration = customDuration;
              }
            }

            effectTrack.segments.push({
              id: generateUUID(),
              material_id: idMap.videoEffects[index],
              target_timerange: {
                start: startTime,
                duration: effectDuration,
              },
              render_index: 11000 + index,
              track_render_index: 1,
              visible: true,
              volume: 1.0,
            });
          }
        });

        if (effectTrack.segments.length > 0) {
          capcutData.tracks.push(effectTrack);
        }
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
    generateUUID,
  };
})();
