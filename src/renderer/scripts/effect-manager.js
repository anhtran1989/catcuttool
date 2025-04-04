/**
 * Effect Manager - Quản lý và cập nhật danh sách effects
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

      const newEffects = draftContent.materials.video_effects.map(effect => ({
        name: effect.name,
        effect_id: effect.effect_id,
        duration: 3000000, // Default duration
        category_id: effect.category_id || "",
        category_name: effect.category_name || "",
        path: effect.path || "",
        platform: effect.platform || "all",
        resource_id: effect.resource_id || effect.effect_id,
        source_platform: effect.source_platform || 1,
        icon: getIconForEffect(effect.name)
      }));

      // Cập nhật danh sách effects bằng cách thêm các effects mới
      mergeEffects(newEffects);
      
      console.log(`Updated effects list: ${effects.length} effects available`);
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
          name,
          effect_id: effect_id || "",
          duration: 3000000, // Default duration
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
        name: "Lật Zoom",
        effect_id: "7395465413527899398",
        duration: 3000000,
        icon: "fas fa-arrows-alt"
      },
      {
        name: "Làm mờ bùng nổ",
        effect_id: "7399465788387773701",
        duration: 3000000,
        icon: "fas fa-bomb"
      },
      {
        name: "Lắc lư",
        effect_id: "7399467327726587141",
        duration: 3000000,
        icon: "fas fa-random"
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

  // Public API
  return {
    init,
    getEffects,
    updateFromDraftContent,
    mergeEffects
  };
})(); 