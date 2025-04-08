/**
 * Drag and Drop Manager - Handles drag and drop functionality for thumbnails
 * and manages JSON structure for CapCut template
 */
const DragDropManager = (function () {
  let draggedItem = null;

  /**
   * Initialize drag and drop functionality
   */
  function init() {
    // Nothing to initialize here, since we add listeners to each thumbnail individually
  }

  /**
   * Set up drag listeners for thumbnail items
   * @param {HTMLElement} item - Thumbnail item to set up drag listeners for
   */
  function setupDragListeners(item) {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("dragleave", handleDragLeave);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragend", handleDragEnd);
  }

  /**
   * Handle drag start event
   * @param {DragEvent} e - Drag event
   */
  function handleDragStart(e) {
    draggedItem = this;
    // Set opacity to indicate dragging
    setTimeout(() => {
      this.style.opacity = "0.4";
    }, 0);

    // Required for Firefox
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.innerHTML);
  }

  /**
   * Handle drag over event
   * @param {DragEvent} e - Drag event
   */
  function handleDragOver(e) {
    e.preventDefault();
    // Allow drop
    e.dataTransfer.dropEffect = "move";
    this.classList.add("drag-over");
    return false;
  }

  /**
   * Handle drag leave event
   * @param {DragEvent} e - Drag event
   */
  function handleDragLeave(e) {
    this.classList.remove("drag-over");
  }

  /**
   * Handle drop event
   * @param {DragEvent} e - Drag event
   */
  function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    this.classList.remove("drag-over");

    // Don't do anything if dropping the same item we're dragging
    if (draggedItem !== this) {
      // Get thumbnailList if it's not already defined in this scope
      const thumbnailList = document.getElementById("thumbnail-list");
      if (!thumbnailList) {
        console.error("Could not find thumbnail-list element");
        return;
      }

      // Only handle drops on thumbnail items, not transitions
      if (
        this.classList.contains("thumbnail-item") &&
        draggedItem.classList.contains("thumbnail-item")
      ) {
        // Get the position of the dragged item and the drop target
        const items = Array.from(thumbnailList.children).filter((item) =>
          item.classList.contains("thumbnail-item")
        );
        const draggedIndex = items.indexOf(draggedItem);
        const dropIndex = items.indexOf(this);

        // Find the actual indices in the parent container
        const allItems = Array.from(thumbnailList.children);
        const draggedItemIndex = allItems.indexOf(draggedItem);
        const dropItemIndex = allItems.indexOf(this);

        if (draggedIndex < dropIndex) {
          // Moving forward - need to account for transitions
          // Insert after the next transition (which is right after the drop target)
          if (
            dropItemIndex + 1 < allItems.length &&
            allItems[dropItemIndex + 1].classList.contains(
              "transitions-container"
            )
          ) {
            thumbnailList.insertBefore(
              draggedItem,
              allItems[dropItemIndex + 2]
            );
          } else {
            thumbnailList.insertBefore(draggedItem, this.nextSibling);
          }
        } else {
          // Moving backward
          thumbnailList.insertBefore(draggedItem, this);
        }

        // Reposition transitions
        reorganizeTransitions();

        // Update all index numbers
        updateIndices();
      }
    }

    return false;
  }

  /**
   * Handle drag end event
   * @param {DragEvent} e - Drag event
   */
  function handleDragEnd(e) {
    // Reset opacity of dragged item
    this.style.opacity = "1";

    // Remove drag-over class from all items
    document.querySelectorAll(".thumbnail-item").forEach((item) => {
      item.classList.remove("drag-over");
    });

    draggedItem = null;
  }

  /**
   * Reorganize transitions between thumbnails
   */
  function reorganizeTransitions() {
    // Get thumbnailList if it's not already defined in this scope
    const thumbnailList = document.getElementById("thumbnail-list");
    if (!thumbnailList) {
      console.error("Could not find thumbnail-list element");
      return;
    }

    // Remove all existing transitions
    document.querySelectorAll(".transitions-container").forEach((item) => {
      item.remove();
    });

    // Add transitions between thumbnail items
    const thumbnailItems = Array.from(thumbnailList.children).filter((item) =>
      item.classList.contains("thumbnail-item")
    );

    // Add transitions between items (except after the last one)
    for (let i = 0; i < thumbnailItems.length - 1; i++) {
      const currentItem = thumbnailItems[i];
      const nextItem = thumbnailItems[i + 1];

      // Create a new transition element
      const transitionsContainer = FileManager.createTransitionsElement();

      // Find the actual next item in the parent container
      const allItems = Array.from(thumbnailList.children);
      const currentItemIndex = allItems.indexOf(currentItem);

      // Insert after the current item
      thumbnailList.insertBefore(
        transitionsContainer,
        allItems[currentItemIndex + 1]
      );
    }
  }

  /**
   * Update all index numbers
   */
  function updateIndices() {
    // Get thumbnailList if it's not already defined in this scope
    const thumbnailList = document.getElementById("thumbnail-list");
    if (!thumbnailList) {
      console.error("Could not find thumbnail-list element");
      return;
    }

    const items = thumbnailList.querySelectorAll(".thumbnail-item");
    items.forEach((item, index) => {
      const indexElement = item.querySelector(".thumbnail-index");
      indexElement.textContent = index + 1;
    });

    // Also update total duration when reordering
    FileManager.updateTotalDuration();
  }

  /**
   * Thêm ảnh/video mới vào cấu trúc JSON của CapCut
   * @param {Object} fileData - Thông tin về file ảnh/video
   * @param {Object} draftContent - Cấu trúc JSON hiện tại
   * @returns {Object} Cấu trúc JSON đã được cập nhật
   */
  function addMediaToCapcutJson(fileData, draftContent) {
    console.log('Adding media to CapCut JSON:', fileData);
    
    // Đảm bảo draftContent có cấu trúc đúng
    if (!draftContent) {
      console.error('Không có draftContent, cần cung cấp template mặc định');
      return null;
    }
    
    // Đảm bảo các mảng cần thiết đã được khởi tạo
    if (!draftContent.materials) {
      draftContent.materials = {};
    }
    
    // Khởi tạo các mảng nếu chưa tồn tại
    const requiredArrays = [
      'videos', 'canvases', 'placeholder_infos', 'sound_channel_mappings', 
      'speeds', 'video_effects', 'vocal_separations', 'transitions', 'material_animations'
    ];
    
    requiredArrays.forEach(arrayName => {
      if (!draftContent.materials[arrayName]) {
        draftContent.materials[arrayName] = [];
      }
    });
    
    if (!draftContent.tracks) {
      draftContent.tracks = [];
    }
    
    // 1. Tạo các ID duy nhất cho các thành phần
    const videoId = ExportManager.generateUUID();
    const canvasId = ExportManager.generateUUID();
    const placeholderId = ExportManager.generateUUID();
    const soundChannelId = ExportManager.generateUUID();
    const speedId = ExportManager.generateUUID();
    const vocalSeparationId = ExportManager.generateUUID();
    const segmentId = ExportManager.generateUUID();
    
    // 2. Thêm vào mảng videos trong materials
    const videoItem = {
      id: videoId,
      type: fileData.type.startsWith('image/') ? 'photo' : 'video',
      path: FileManager.formatPathForCapcut(fileData.path || fileData.originalPath),
      material_name: fileData.name || fileData.fileName,
      width: fileData.width || 360,
      height: fileData.height || 640,
      duration: fileData.type.startsWith('image/') ? 10800000000 : (fileData.duration || 5000000),
      source_platform: 1,  // Thêm thuộc tính quan trọng
      resource_id: videoId  // Thêm thuộc tính quan trọng
    };
    
    draftContent.materials.videos.push(videoItem);
    
    // 3. Thêm canvas vào materials.canvases
    const canvasItem = {
      album_image: "",
      blur: 0.0,
      color: "",
      id: canvasId,
      image: "",
      image_id: "",
      image_name: "",
      source_platform: 0,
      team_id: "",
      type: "canvas_color"
    };
    
    draftContent.materials.canvases.push(canvasItem);
    
    // 4. Thêm placeholder_info vào materials.placeholder_infos
    const placeholderItem = {
      error_path: "",
      error_text: "",
      id: placeholderId,
      meta_type: "none",
      res_path: "",
      res_text: "",
      type: "placeholder_info"
    };
    
    draftContent.materials.placeholder_infos.push(placeholderItem);
    
    // 5. Thêm sound_channel_mapping vào materials.sound_channel_mappings
    const soundChannelItem = {
      audio_channel_mapping: 0,
      id: soundChannelId,
      is_config_open: false,
      type: ""
    };
    
    draftContent.materials.sound_channel_mappings.push(soundChannelItem);
    
    // 6. Thêm speed vào materials.speeds
    const speedItem = {
      curve_speed: null,
      id: speedId,
      mode: 0,
      speed: 1.0,
      type: "speed"
    };
    
    draftContent.materials.speeds.push(speedItem);
    
    // 7. Thêm vocal_separation vào materials.vocal_separations
    const vocalSeparationItem = {
      choice: 0,
      id: vocalSeparationId,
      production_path: "",
      removed_sounds: [],
      time_range: null,
      type: "vocal_separation"
    };
    
    draftContent.materials.vocal_separations.push(vocalSeparationItem);
    
    // 8. Tìm hoặc tạo track chính
    let mainTrack = draftContent.tracks.find(track => track.type === 'video');
    
    if (!mainTrack) {
      mainTrack = {
        type: 'video',
        segments: []
      };
      draftContent.tracks.push(mainTrack);
    }
    
    // 9. Tính toán vị trí bắt đầu cho segment mới
    let startPosition = 0;
    if (mainTrack.segments && mainTrack.segments.length > 0) {
      const lastSegment = mainTrack.segments[mainTrack.segments.length - 1];
      if (lastSegment.target_timerange) {
        startPosition = (lastSegment.target_timerange.start || 0) + (lastSegment.target_timerange.duration || 5000000);
      }
    }
    
    // 10. Thêm segment mới vào track
    const segmentItem = {
      material_id: videoId,
      source_timerange: {
        duration: fileData.type.startsWith('image/') ? 5000000 : (fileData.duration || 5000000),
        start: 0
      },
      target_timerange: {
        duration: fileData.type.startsWith('image/') ? 5000000 : (fileData.duration || 5000000),
        start: startPosition
      },
      extra_material_refs: [
        speedId,
        placeholderId,
        canvasId,
        soundChannelId,
        vocalSeparationId
      ],
      id: segmentId,
      render_index: mainTrack.segments ? mainTrack.segments.length : 0  // Thêm thuộc tính quan trọng
    };
    
    if (!mainTrack.segments) {
      mainTrack.segments = [];
    }
    
    mainTrack.segments.push(segmentItem);
    
    // 11. Cập nhật tổng thời lượng của dự án
    updateProjectDuration(draftContent);
    
    console.log('Updated CapCut JSON structure with new media');
    return draftContent;
  }
  
  /**
   * Cập nhật tổng thời lượng của dự án dựa trên các segment
   * @param {Object} draftContent - Cấu trúc JSON hiện tại
   */
  function updateProjectDuration(draftContent) {
    if (!draftContent || !draftContent.tracks) return;
    
    let totalDuration = 0;
    
    // Tìm track video chính
    const mainTrack = draftContent.tracks.find(track => track.type === 'video');
    if (mainTrack && mainTrack.segments && mainTrack.segments.length > 0) {
      // Tìm segment cuối cùng
      const lastSegment = mainTrack.segments[mainTrack.segments.length - 1];
      if (lastSegment.target_timerange) {
        // Tổng thời lượng = vị trí bắt đầu + thời lượng của segment cuối cùng
        totalDuration = (lastSegment.target_timerange.start || 0) + (lastSegment.target_timerange.duration || 0);
      }
    }
    
    // Cập nhật tổng thời lượng của dự án
    draftContent.duration = totalDuration;
  }

  /**
   * Cập nhật cấu trúc JSON của CapCut khi thêm nhiều ảnh/video
   * @param {Array} fileDataArray - Mảng thông tin về các file ảnh/video
   * @param {Object} draftContent - Cấu trúc JSON hiện tại
   * @returns {Object} Cấu trúc JSON đã được cập nhật
   */
  function addMultipleMediaToCapcutJson(fileDataArray, draftContent) {
    let updatedContent = draftContent;
    
    for (const fileData of fileDataArray) {
      updatedContent = addMediaToCapcutJson(fileData, updatedContent);
    }
    
    return updatedContent;
  }

  /**
   * Lấy thông tin về tất cả các ảnh/video hiện có
   * @returns {Array} Mảng thông tin về các file ảnh/video
   */
  function getAllMediaItems() {
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    const mediaItems = [];
    
    thumbnailItems.forEach((item, index) => {
      const fileData = {
        fileName: item.querySelector('.thumbnail-info p')?.textContent || `File ${index + 1}`,
        type: item.dataset.type || 'image/jpeg',
        path: item.dataset.path || '',
        originalPath: item.dataset.originalPath || '',
        width: parseInt(item.dataset.width || '360'),
        height: parseInt(item.dataset.height || '640'),
        duration: parseInt(item.dataset.duration || '5000000')
      };
      
      mediaItems.push(fileData);
    });
    
    return mediaItems;
  }

  // Public API
  return {
    init,
    setupDragListeners,
    reorganizeTransitions,
    updateIndices,
    addMediaToCapcutJson,
    addMultipleMediaToCapcutJson,
    getAllMediaItems
  };
})();
