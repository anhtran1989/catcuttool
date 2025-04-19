/**
 * Data Loader - Module để tải dữ liệu từ một file JSON duy nhất
 * và phân phối dữ liệu cho các module khác
 */

const DataLoader = (function() {
  // Lưu trữ dữ liệu đã tải
  let loadedData = null;
  
  // Lưu trữ các callback khi dữ liệu được tải
  const dataLoadedCallbacks = [];
  
  // Đường dẫn mặc định đến file JSON
  const DEFAULT_JSON_PATH = './draft_content_2.json';
  
  /**
   * Khởi tạo module
   */
  function init() {
    console.log('Initializing DataLoader module');
    
    // Tải dữ liệu từ file JSON
    loadData();
  }
  
  /**
   * Tải dữ liệu từ file JSON
   * @param {string} path Đường dẫn đến file JSON (tùy chọn)
   * @returns {Promise} Promise khi dữ liệu được tải
   */
  function loadData(path = DEFAULT_JSON_PATH) {
    return new Promise((resolve, reject) => {
      console.log(`Loading data from ${path}`);
      
      // Thử đọc file bằng fetch API
      fetch(path)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // Lưu trữ dữ liệu
          loadedData = data;
          console.log('Data loaded successfully');
          
          // Gọi các callback
          dataLoadedCallbacks.forEach(callback => callback(data));
          
          resolve(data);
        })
        .catch(error => {
          console.error(`Error loading data from ${path}:`, error);
          reject(error);
        });
    });
  }
  
  /**
   * Đăng ký callback khi dữ liệu được tải
   * @param {Function} callback Hàm callback
   */
  function onDataLoaded(callback) {
    if (typeof callback !== 'function') {
      console.error('Invalid callback provided to onDataLoaded');
      return;
    }
    
    // Nếu dữ liệu đã được tải, gọi callback ngay lập tức
    if (loadedData) {
      callback(loadedData);
    }
    
    // Đăng ký callback cho lần tải tiếp theo
    dataLoadedCallbacks.push(callback);
  }
  
  /**
   * Lấy dữ liệu đã tải
   * @returns {Object} Dữ liệu đã tải
   */
  function getData() {
    return loadedData;
  }
  
  /**
   * Lấy danh sách effects từ dữ liệu đã tải
   * @returns {Array} Danh sách effects
   */
  function getEffects() {
    if (!loadedData || !loadedData.materials) {
      return [];
    }
    
    // Lấy effects từ video_effects
    const videoEffects = loadedData.materials.video_effects || [];
    
    // Thêm các trường cần thiết cho mỗi effect
    return videoEffects.map(effect => {
      return {
        ...effect,
        icon: getIconForEffect(effect.name)
      };
    });
  }
  
  /**
   * Lấy danh sách transitions từ dữ liệu đã tải
   * @returns {Array} Danh sách transitions
   */
  function getTransitions() {
    if (!loadedData || !loadedData.materials) {
      return [];
    }
    
    // Lấy transitions từ transitions
    const transitions = loadedData.materials.transitions || [];
    
    // Thêm các trường cần thiết cho mỗi transition
    return transitions.map(transition => {
      return {
        ...transition,
        icon: getIconForTransition(transition.name)
      };
    });
  }
  
  /**
   * Lấy danh sách material animations từ dữ liệu đã tải
   * @returns {Array} Danh sách material animations
   */
  function getMaterialAnimations() {
    if (!loadedData || !loadedData.materials) {
      return [];
    }
    
    // Lấy material animations từ material_animations
    return loadedData.materials.material_animations || [];
  }
  
  /**
   * Tìm icon phù hợp cho effect dựa trên tên
   * @param {string} effectName Tên của effect
   * @returns {string} Class của icon
   */
  function getIconForEffect(effectName) {
    if (!effectName) return 'fas fa-magic';
    
    const effectNameLower = effectName.toLowerCase();
    
    // Ánh xạ tên effect với icon
    const iconMap = {
      'zoom': 'fas fa-search-plus',
      'phóng to': 'fas fa-search-plus',
      'thu phóng': 'fas fa-search',
      'lắc': 'fas fa-arrows-alt',
      'rung': 'fas fa-arrows-alt',
      'trái tim': 'fas fa-heart',
      'pixel': 'fas fa-th',
      'glitch': 'fas fa-bolt',
      'trục trặc': 'fas fa-bolt',
      'mờ': 'fas fa-eye-slash',
      'blur': 'fas fa-eye-slash',
      'sáng': 'fas fa-sun',
      'flash': 'fas fa-bolt',
      'tia sáng': 'fas fa-sun',
      'lấp lánh': 'fas fa-star',
      'sparkle': 'fas fa-star',
      'điểm': 'fas fa-dot-circle',
      '3d': 'fas fa-cube',
      'màn hình': 'fas fa-desktop',
      'cuộn': 'fas fa-scroll',
      'chuyển động': 'fas fa-running',
      'theo dõi': 'fas fa-eye',
      'track': 'fas fa-eye',
      'ngược': 'fas fa-exchange-alt',
      'reverse': 'fas fa-exchange-alt',
      'bụi': 'fas fa-snowflake',
      'dust': 'fas fa-snowflake',
      'nháy': 'fas fa-lightbulb',
      'blink': 'fas fa-lightbulb',
      'siêu lớn': 'fas fa-expand-arrows-alt'
    };
    
    // Tìm icon phù hợp
    for (const [key, icon] of Object.entries(iconMap)) {
      if (effectNameLower.includes(key)) {
        return icon;
      }
    }
    
    // Mặc định
    return 'fas fa-magic';
  }
  
  /**
   * Tìm icon phù hợp cho transition dựa trên tên
   * @param {string} transitionName Tên của transition
   * @returns {string} Class của icon
   */
  function getIconForTransition(transitionName) {
    if (!transitionName) return 'fas fa-exchange-alt';
    
    const transitionNameLower = transitionName.toLowerCase();
    
    // Ánh xạ tên transition với icon
    const iconMap = {
      'cut': 'fas fa-cut',
      'cắt': 'fas fa-cut',
      'zoom': 'fas fa-search',
      'phóng to': 'fas fa-search-plus',
      'thu phóng': 'fas fa-search',
      'giảm dần': 'fas fa-search-minus',
      'tín hiệu': 'fas fa-bolt',
      'glitch': 'fas fa-bolt',
      'trục trặc': 'fas fa-bolt',
      'lát': 'fas fa-th',
      'lấp lánh': 'fas fa-star',
      'sparkle': 'fas fa-star',
      'thổi': 'fas fa-expand-arrows-alt',
      'trượt': 'fas fa-arrows-alt',
      'slide': 'fas fa-arrows-alt',
      'xuống': 'fas fa-arrow-down',
      'lên': 'fas fa-arrow-up',
      'trái': 'fas fa-arrow-left',
      'phải': 'fas fa-arrow-right',
      'mờ dần': 'fas fa-eye-slash',
      'fade': 'fas fa-eye-slash',
      'xoay': 'fas fa-sync',
      'rotate': 'fas fa-sync',
      'quay': 'fas fa-sync',
      'lật': 'fas fa-exchange-alt',
      'flip': 'fas fa-exchange-alt',
      'đẩy': 'fas fa-hand-point-right',
      'push': 'fas fa-hand-point-right',
      'kéo': 'fas fa-hand-point-left',
      'pull': 'fas fa-hand-point-left'
    };
    
    // Tìm icon phù hợp
    for (const [key, icon] of Object.entries(iconMap)) {
      if (transitionNameLower.includes(key)) {
        return icon;
      }
    }
    
    // Mặc định
    return 'fas fa-exchange-alt';
  }
  
  /**
   * Lấy danh sách material animations từ dữ liệu đã tải
   * @returns {Array} Danh sách material animations
   */
  function getMaterialAnimations() {
    if (!loadedData || !loadedData.materials) {
      return [];
    }
    
    // Lấy material animations từ material_animations
    const materialAnimations = loadedData.materials.material_animations || [];
    
    // Thêm các trường cần thiết cho mỗi material animation
    return materialAnimations.map(animation => {
      // Xác định loại animation (in, out, group)
      let type = 'group'; // Mặc định là group
      
      // Phân loại dựa trên tên
      if (animation.name) {
        const nameLower = animation.name.toLowerCase();
        if (nameLower.includes('vào') || nameLower.includes('in')) {
          type = 'in';
        } else if (nameLower.includes('ra') || nameLower.includes('out')) {
          type = 'out';
        }
      }
      
      return {
        ...animation,
        type: animation.type || type,
        icon: getIconForAnimation(animation.name, type)
      };
    });
  }
  
  /**
   * Tìm icon phù hợp cho animation dựa trên tên và loại
   * @param {string} name Tên của animation
   * @param {string} type Loại animation (in, out, group)
   * @returns {string} Class của icon
   */
  function getIconForAnimation(name, type) {
    if (!name) return 'fas fa-magic';
    
    // Mặc định icon dựa trên loại
    let defaultIcon = 'fas fa-magic';
    if (type === 'in') defaultIcon = 'fas fa-sign-in-alt';
    else if (type === 'out') defaultIcon = 'fas fa-sign-out-alt';
    else if (type === 'group') defaultIcon = 'fas fa-object-group';
    
    const nameLower = name.toLowerCase();
    
    // Ánh xạ tên với icon
    const iconMap = {
      'zoom': 'fas fa-search-plus',
      'phóng to': 'fas fa-search-plus',
      'thu nhỏ': 'fas fa-search-minus',
      'lắc': 'fas fa-arrows-alt',
      'rung': 'fas fa-arrows-alt',
      'xoay': 'fas fa-sync',
      'quay': 'fas fa-sync',
      'fade': 'fas fa-eye-slash',
      'mờ dần': 'fas fa-eye-slash'
    };
    
    // Tìm icon phù hợp
    for (const [key, icon] of Object.entries(iconMap)) {
      if (nameLower.includes(key)) {
        return icon;
      }
    }
    
    return defaultIcon;
  }
  
  // Public API
  return {
    init,
    loadData,
    onDataLoaded,
    getData,
    getEffects,
    getTransitions,
    getMaterialAnimations
  };
})();

// Export module
export { DataLoader };
