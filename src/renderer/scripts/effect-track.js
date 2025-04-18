/**
 * Effect Track - Quản lý các track hiệu ứng
 */
const EffectTrack = (function() {
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

  /**
   * Tạo một track effect mới cho draft content
   * @param {Array} effectSegments Danh sách các segment hiệu ứng
   * @returns {Object} Track effect mới
   */
  function createTrack(effectSegments) {
    // Tạo bản sao của template
    const track = JSON.parse(JSON.stringify(effectTrackTemplate));
    
    // Cập nhật các giá trị
    track.id = Utils.generateUUID();
    track.segments = effectSegments || [];
    
    return track;
  }

  /**
   * Tạo một track effect mặc định với một effect "None"
   * @returns {Object} Track effect mặc định
   */
  function createDefaultTrack() {
    // Tạo một segment với effect "None"
    const segment = EffectSegment.createSegment("none", 0, 5000000, 11000);
    
    // Tạo track với segment
    return createTrack([segment]);
  }

  /**
   * Trả về mẫu cấu trúc track hiệu ứng
   * @returns {Object} Mẫu track hiệu ứng
   */
  function getTemplate() {
    return JSON.parse(JSON.stringify(effectTrackTemplate));
  }

  // Public API
  return {
    createTrack,
    createDefaultTrack,
    getTemplate
  };
})();

// Xuất module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EffectTrack;
}
