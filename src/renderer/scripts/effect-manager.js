/**
 * Effect Manager - Quản lý và cập nhật danh sách effects
 * 
 * Cấu trúc của mỗi effect trong CapCut cần có các thuộc tính:
 * - id: Một chuỗi UUID duy nhất cho mỗi effect
 * - name: Tên của effect
 * - type: Loại effect (thường là "video_effect")
 * - target_id: ID của ảnh/video mà effect sẽ áp dụng
 * - start: Thời gian bắt đầu của effect
 * - duration: Thời gian hiệu ứng kéo dài
 */
const EffectManager = (function () {
  // Danh sách các effects đã được lưu
  let effects = [];

  /**
   * Lấy danh sách effects hiện tại
   * @returns {Array} Danh sách effects
   */
  function getEffects() {
    return effects;
  }

  /**
   * Cập nhật danh sách effects từ file draft_content_effect.json
   * @param {Object} draftContent Nội dung của file draft_content_effect.json
   */
  function updateFromDraftContent(draftContent) {
    try {
      if (!draftContent || !draftContent.materials || !draftContent.materials.video_effects) {
        console.error("Invalid draft content format");
        return;
      }

      const newEffects = draftContent.materials.video_effects.map(effect => {
        // Tạo đối tượng effect mới với tất cả các thuộc tính cần thiết cho CapCut
        const newEffect = {
          // Thuộc tính cơ bản
          id: effect.id || generateUUID(), // Đảm bảo mỗi effect có một UUID duy nhất
          name: effect.name,
          effect_id: effect.effect_id,
          type: "video_effect", // Loại effect cố định
          
          // Thời gian và thông số kỹ thuật
          duration: effect.duration || 3000000, // Thời gian mặc định nếu không có
          start: 0, // Thời gian bắt đầu mặc định
          
          // Thông tin phân loại
          category_id: effect.category_id || "",
          category_name: effect.category_name || "",
          
          // Thông tin tài nguyên
          path: effect.path || "",
          platform: effect.platform || "all",
          resource_id: effect.resource_id || effect.effect_id,
          source_platform: effect.source_platform || 1,
          
          // Các thuộc tính điều chỉnh
          adjust_params: effect.adjust_params || [],
          apply_target_type: effect.apply_target_type || 2,
          enable_mask: effect.enable_mask !== undefined ? effect.enable_mask : true,
          item_effect_type: effect.item_effect_type || 0,
          value: effect.value !== undefined ? effect.value : 1.0,
          
          // Thêm icon cho giao diện
          icon: getIconForEffect(effect.name)
        };

        // Sao chép các thuộc tính khác nếu có
        if (effect.effect_mask) newEffect.effect_mask = effect.effect_mask;
        if (effect.common_keyframes) newEffect.common_keyframes = effect.common_keyframes;
        if (effect.covering_relation_change !== undefined) newEffect.covering_relation_change = effect.covering_relation_change;
        if (effect.formula_id !== undefined) newEffect.formula_id = effect.formula_id;
        if (effect.render_index !== undefined) newEffect.render_index = effect.render_index;
        if (effect.track_render_index !== undefined) newEffect.track_render_index = effect.track_render_index;
        if (effect.version !== undefined) newEffect.version = effect.version;
        if (effect.algorithm_artifact_path !== undefined) newEffect.algorithm_artifact_path = effect.algorithm_artifact_path;

        console.log(`Processed effect: ${effect.name}, ID: ${effect.effect_id}`);
        return newEffect;
      });

      // Cập nhật danh sách effects bằng cách thêm các effects mới
      mergeEffects(newEffects);
      
      console.log(`Updated effects list: ${effects.length} effects available`);
      
      // Log chi tiết về các effects đã được xử lý
      console.log('=== EFFECTS DETAILS ===');
      effects.forEach(effect => {
        console.log(`Name: ${effect.name}, ID: ${effect.effect_id}, Category: ${effect.category_name}`);
      });
    } catch (error) {
      console.error("Error updating effects from draft content:", error);
    }
  }

  /**
   * Cập nhật hoặc thêm mới effects vào danh sách
   * @param {Array} newEffects Danh sách effects mới
   */
  function mergeEffects(newEffects) {
    if (!Array.isArray(newEffects)) return;

    newEffects.forEach(newEffect => {
      // Kiểm tra xem effect đã tồn tại chưa dựa trên effect_id
      const existingIndex = effects.findIndex(e => e.effect_id === newEffect.effect_id);
      
      if (existingIndex >= 0) {
        // Cập nhật effect đã tồn tại
        effects[existingIndex] = {
          ...effects[existingIndex],
          ...newEffect
        };
      } else {
        // Thêm effect mới
        effects.push(newEffect);
      }
    });
  }

  /**
   * Lấy biểu tượng phù hợp cho effect dựa trên tên
   * @param {string} effectName Tên effect
   * @returns {string} Class của biểu tượng
   */
  function getIconForEffect(effectName) {
    const iconMap = {
      "Lật Zoom": "fas fa-arrows-alt",
      "Làm mờ bùng nổ": "fas fa-bomb",
      "Lắc lư": "fas fa-random",
      "Màn hình 3D": "fas fa-cube",
      "Chuyển động máy ảnh": "fas fa-video",
      "Cuộn ngang": "fas fa-arrows-alt-h",
      "Tình yêu mờ nhạt": "fas fa-heart",
      "Nét truyện tranh": "fas fa-pencil-alt",
      "Theo dõi bắn": "fas fa-bullseye",
      "Mở ngược": "fas fa-undo",
      "Tuyết vàng": "fas fa-snowflake",
      "Trái tim bung nở": "fas fa-heartbeat",
      "Lóe sáng chớp nảy": "fas fa-bolt",
      "Phim": "fas fa-film",
      "Điểm lục giác": "fas fa-stop",
      "Lăng kính đá quý": "fas fa-gem",
      "Bụi rơi": "fas fa-feather",
      "Đèn nhấp nháy theo nhịp": "fas fa-lightbulb",
      "Đèn nháy": "fas fa-lightbulb",
      "Bám sát đối tượng 2": "fas fa-crosshairs",
      "Vở kịch Giáng Sinh": "fas fa-gifts",
      "Lũ quét qua": "fas fa-water",
      "S-Movement": "fas fa-bezier-curve",
      "Cười lên": "fas fa-smile",
      "Chớp mắt mở": "fas fa-eye",
      "Đèn flash chéo": "fas fa-bolt",
      "Tia sáng kéo dài": "fas fa-sun",
      "Sóng xung kích": "fas fa-wave-square",
      "Lấp lánh 2": "fas fa-star",
      "Trục trặc pixel": "fas fa-microscope",
      "Làm mờ ảo diệu": "fas fa-magic",
      "Phóng to phơi sáng": "fas fa-search-plus"
    };

    return iconMap[effectName] || "fas fa-star"; // Default icon
  }

  /**
   * Khởi tạo danh sách effects từ ExportManager 
   */
  function initializeFromExportManager() {
    try {
      // Check if ExportManager exists and has the capcut property
      if (typeof ExportManager !== 'undefined' && ExportManager.capcut && ExportManager.capcut.effects) {
        // Lấy danh sách effects từ ExportManager.capcut.effects
        const exportManagerEffects = ExportManager.capcut.effects;
        
        const initialEffects = Object.entries(exportManagerEffects).map(([name, effect_id]) => ({
          id: generateUUID(), // UUID duy nhất cho mỗi effect
          name,
          effect_id: effect_id || "",
          type: "video_effect", // Loại effect cố định
          duration: 3000000, // Default duration
          start: 0, // Thời gian bắt đầu mặc định
          apply_target_type: 2, // Mặc định áp dụng cho toàn bộ media
          enable_mask: true,
          item_effect_type: 0,
          value: 1.0,
          icon: getIconForEffect(name)
        }));
        
        // Bỏ qua effect "None"
        const filteredEffects = initialEffects.filter(effect => effect.name !== "None" && effect.effect_id);
        
        effects = filteredEffects;
        console.log(`Initialized ${effects.length} effects from ExportManager`);
      } else {
        console.log("ExportManager not available or missing capcut.effects property");
        initializeDefaultEffects();
      }
    } catch (error) {
      console.error("Error initializing effects from ExportManager:", error);
      initializeDefaultEffects();
    }
  }

  /**
   * Khởi tạo danh sách effects mặc định nếu không thể lấy từ ExportManager
   */
  function initializeDefaultEffects() {
    // Thêm một số effects mặc định
    effects = [
      {
        id: generateUUID(),
        name: "Lật Zoom",
        effect_id: "7395465413527899398",
        type: "video_effect",
        duration: 3000000,
        start: 0,
        apply_target_type: 2,
        enable_mask: true,
        item_effect_type: 0,
        value: 1.0,
        icon: "fas fa-arrows-alt"
      },
      {
        id: generateUUID(),
        name: "Hình vuông mờ",
        effect_id: "7395470784166251782",
        type: "video_effect",
        duration: 3000000,
        start: 0,
        apply_target_type: 2,
        enable_mask: true,
        item_effect_type: 0,
        value: 1.0,
        icon: "fas fa-square"
      },
      {
        id: generateUUID(),
        name: "Lóe",
        effect_id: "7399470564022291717",
        type: "video_effect",
        duration: 3000000,
        start: 0,
        apply_target_type: 2,
        enable_mask: true,
        item_effect_type: 0,
        value: 1.0,
        icon: "fas fa-bolt"
      },
      {
        id: generateUUID(),
        name: "Mưa sao băng",
        effect_id: "7399468413527051525",
        type: "video_effect",
        duration: 3000000,
        start: 0,
        apply_target_type: 2,
        enable_mask: true,
        item_effect_type: 0,
        value: 1.0,
        icon: "fas fa-star"
      }
    ];
    console.log("Initialized default effects list with sample effects");
  }

  /**
   * Khởi tạo EffectManager
   */
  function init() {
    // Khởi tạo danh sách effects ban đầu từ ExportManager
    initializeFromExportManager();
    
    console.log("Effect Manager initialized");
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

  // Public API
  return {
    init,
    getEffects,
    updateFromDraftContent,
    mergeEffects,
    generateUUID
  };
})(); 