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

      const newTransitions = draftContent.materials.transitions.map(transition => {
        // Tạo đối tượng transition mới với tất cả các thuộc tính cần thiết cho CapCut
        const newTransition = {
          name: transition.name,
          transition_id: transition.transition_id,
          // Sử dụng duration từ transition nếu có, nếu không thì dùng giá trị mặc định
          duration: transition.duration || 1000000, // Default duration: 1 second
          category_id: transition.category_id || "",
          category_name: transition.category_name || "",
          path: transition.path || "",
          platform: transition.platform || "all",
          resource_id: transition.resource_id || transition.transition_id,
          source_platform: transition.source_platform || 1,
          // Các thuộc tính quan trọng khác cho CapCut
          segment: transition.segment || { start: 0, duration: transition.duration || 1000000 },
          tracks: transition.tracks || [],
          type: transition.type || "transition",
          material_type: transition.material_type || "transition",
          version: transition.version || 1,
          // Thêm icon cho giao diện
          icon: getIconForTransition(transition.name)
        };

        // Sao chép các thuộc tính khác nếu có
        if (transition.adjust_params) newTransition.adjust_params = transition.adjust_params;
        if (transition.apply_target_type !== undefined) newTransition.apply_target_type = transition.apply_target_type;
        if (transition.formula_id !== undefined) newTransition.formula_id = transition.formula_id;
        if (transition.render_index !== undefined) newTransition.render_index = transition.render_index;
        if (transition.materials) newTransition.materials = transition.materials;
        if (transition.effect_id) newTransition.effect_id = transition.effect_id;
        if (transition.start !== undefined) newTransition.start = transition.start;
        if (transition.end !== undefined) newTransition.end = transition.end;
        if (transition.material_id) newTransition.material_id = transition.material_id;

        console.log(`Processed transition: ${transition.name}, ID: ${transition.transition_id}`);
        return newTransition;
      });

      // Cập nhật danh sách transitions bằng cách thêm các transitions mới
      mergeTransitions(newTransitions);
      
      console.log(`Updated transitions list: ${transitions.length} transitions available`);
      
      // Log chi tiết về các transitions đã được xử lý
      console.log('=== TRANSITIONS DETAILS ===');
      transitions.forEach(transition => {
        console.log(`Name: ${transition.name}, ID: ${transition.transition_id}, Duration: ${transition.duration}, Category: ${transition.category_name}`);
      });
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