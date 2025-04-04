/**
 * Transition Manager - Quản lý và cập nhật danh sách transitions
 */
const TransitionManager = (function () {
  // Danh sách các transitions đã được lưu
  let transitions = [];

  /**
   * Lấy danh sách transitions hiện tại
   * @returns {Array} Danh sách transitions
   */
  function getTransitions() {
    return transitions;
  }

  /**
   * Cập nhật danh sách transitions từ file draft_content_transition.json
   * @param {Object} draftContent Nội dung của file draft_content_transition.json
   */
  function updateFromDraftContent(draftContent) {
    try {
      if (!draftContent || !draftContent.materials || !draftContent.materials.transitions) {
        console.error("Invalid draft content format");
        return;
      }

      const newTransitions = draftContent.materials.transitions.map(transition => ({
        name: transition.name,
        effect_id: transition.effect_id,
        is_overlap: transition.is_overlap || false,
        duration: transition.duration || 0,
        category_id: transition.category_id || "",
        category_name: transition.category_name || "",
        path: transition.path || "",
        platform: transition.platform || "all",
        resource_id: transition.resource_id || transition.effect_id,
        source_platform: transition.source_platform || 1,
        icon: getIconForTransition(transition.name)
      }));

      // Cập nhật danh sách transitions bằng cách thêm các transitions mới
      mergeTransitions(newTransitions);
      
      console.log(`Updated transitions list: ${transitions.length} transitions available`);
    } catch (error) {
      console.error("Error updating transitions from draft content:", error);
    }
  }

  /**
   * Cập nhật hoặc thêm mới transitions vào danh sách
   * @param {Array} newTransitions Danh sách transitions mới
   */
  function mergeTransitions(newTransitions) {
    if (!Array.isArray(newTransitions)) return;

    // Luôn đảm bảo có tùy chọn "Cut"
    const hasCut = transitions.some(t => t.name === "Cut");
    if (!hasCut) {
      transitions.push({
        name: "Cut",
        icon: "fas fa-cut",
        effect_id: null,
        is_overlap: false,
        duration: 0,
        category_id: "",
        category_name: "",
        path: "",
        platform: "",
        resource_id: "",
        source_platform: 0
      });
    }

    newTransitions.forEach(newTransition => {
      // Kiểm tra xem transition đã tồn tại chưa dựa trên effect_id
      const existingIndex = transitions.findIndex(t => 
        (t.effect_id === newTransition.effect_id && t.effect_id !== null) || 
        (t.name === newTransition.name)
      );
      
      if (existingIndex >= 0) {
        // Cập nhật transition đã tồn tại
        transitions[existingIndex] = {
          ...transitions[existingIndex],
          ...newTransition
        };
      } else {
        // Thêm transition mới
        transitions.push(newTransition);
      }
    });
  }

  /**
   * Lấy biểu tượng phù hợp cho transition dựa trên tên
   * @param {string} transitionName Tên transition
   * @returns {string} Class của biểu tượng
   */
  function getIconForTransition(transitionName) {
    const iconMap = {
      "Cut": "fas fa-cut",
      "Giảm dần zoom": "fas fa-search-minus",
      "Tín hiệu trục trặc 2": "fas fa-bolt",
      "Ba lát": "fas fa-th",
      "Lấp lánh": "fas fa-star",
      "Thổi ra": "fas fa-expand-arrows-alt",
      "Trượt xuống": "fas fa-arrow-down"
    };

    return iconMap[transitionName] || "fas fa-exchange-alt"; // Default icon
  }

  /**
   * Khởi tạo danh sách transitions với tùy chọn Cut
   */
  function initializeDefaultTransitions() {
    // Luôn bắt đầu với tùy chọn Cut
    transitions = [{
      name: "Cut",
      icon: "fas fa-cut",
      effect_id: null,
      is_overlap: false,
      duration: 0,
      category_id: "",
      category_name: "",
      path: "",
      platform: "",
      resource_id: "",
      source_platform: 0
    }];
    
    console.log("Initialized default transitions");
  }

  /**
   * Khởi tạo danh sách transitions từ ExportManager 
   */
  function initializeFromExportManager() {
    try {
      // Check if ExportManager exists and has the capcut property with transitionIcons
      if (typeof ExportManager !== 'undefined' && ExportManager.capcut && ExportManager.capcut.transitionIcons) {
        // Get transition icons from ExportManager
        const transitionIcons = ExportManager.capcut.transitionIcons;
        
        // Create transitions from icons
        const initialTransitions = Object.entries(transitionIcons).map(([name, icon]) => ({
          name,
          icon,
          effect_id: name === "Cut" ? null : name,
          is_overlap: false,
          duration: 500000, // Default duration
          category_id: "",
          category_name: "",
          path: "",
          platform: "all",
          resource_id: "",
          source_platform: 1
        }));
        
        transitions = initialTransitions;
        console.log(`Initialized ${transitions.length} transitions from ExportManager`);
      } else {
        console.log("ExportManager not available or missing capcut.transitionIcons property");
        initializeDefaultTransitions();
      }
    } catch (error) {
      console.error("Error initializing transitions from ExportManager:", error);
      initializeDefaultTransitions();
    }
  }

  /**
   * Khởi tạo TransitionManager
   */
  function init() {
    // Try to initialize from ExportManager first
    initializeFromExportManager();
    
    // If no transitions were loaded, use default
    if (transitions.length === 0) {
      initializeDefaultTransitions();
    }
    
    console.log("Transition Manager initialized");
  }

  // Public API
  return {
    init,
    getTransitions,
    updateFromDraftContent,
    mergeTransitions
  };
})(); 