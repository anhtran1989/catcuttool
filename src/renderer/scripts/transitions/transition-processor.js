/**
 * Transition Processor - Xử lý và áp dụng hiệu ứng chuyển cảnh vào nội dung
 */

const TransitionProcessor = (function() {
  /**
   * Áp dụng hiệu ứng chuyển cảnh vào draft content
   * @param {Object} draftContent Nội dung draft
   * @param {Object} transition Hiệu ứng chuyển cảnh cần áp dụng
   * @param {Object} options Các tùy chọn bổ sung
   * @returns {Object} Nội dung draft đã được áp dụng hiệu ứng chuyển cảnh
   */
  function applyTransitionsToDraftContent(draftContent, transition, options = {}) {
    if (!draftContent || !transition) {
      console.error("Invalid draft content or transition");
      return draftContent;
    }
    
    try {
      console.log(`Applying transition "${transition.name}" to draft content`);
      
      // Tạo bản sao của draft content để không ảnh hưởng đến dữ liệu gốc
      const updatedContent = JSON.parse(JSON.stringify(draftContent));
      
      // Nếu transition là "None", không thực hiện thay đổi
      if (transition.id === "none") {
        console.log("Transition is None, no changes applied");
        return updatedContent;
      }
      
      // Đảm bảo materials và transitions tồn tại
      if (!updatedContent.materials) {
        updatedContent.materials = {};
      }
      
      if (!updatedContent.materials.transitions) {
        updatedContent.materials.transitions = [];
      }
      
      // Kiểm tra xem hiệu ứng chuyển cảnh đã tồn tại chưa
      const existingTransitionIndex = updatedContent.materials.transitions.findIndex(t => t.id === transition.id);
      
      if (existingTransitionIndex >= 0) {
        // Cập nhật hiệu ứng chuyển cảnh đã tồn tại
        updatedContent.materials.transitions[existingTransitionIndex] = { ...updatedContent.materials.transitions[existingTransitionIndex], ...transition };
      } else {
        // Thêm hiệu ứng chuyển cảnh mới
        updatedContent.materials.transitions.push(transition);
      }
      
      // Áp dụng hiệu ứng chuyển cảnh vào segment nếu có
      if (options.segmentIndex !== undefined && 
          options.trackIndex !== undefined && 
          updatedContent.tracks && 
          updatedContent.tracks.length > options.trackIndex) {
        
        const track = updatedContent.tracks[options.trackIndex];
        
        // Đảm bảo segments tồn tại
        if (!track.segments) {
          track.segments = [];
        }
        
        if (track.segments.length > options.segmentIndex) {
          const segment = track.segments[options.segmentIndex];
          
          // Đảm bảo extra_material_refs tồn tại
          if (!segment.extra_material_refs) {
            segment.extra_material_refs = [];
          }
          
          // Thêm tham chiếu đến hiệu ứng chuyển cảnh nếu chưa tồn tại
          if (!segment.extra_material_refs.includes(transition.id)) {
            segment.extra_material_refs.push(transition.id);
          }
        }
      }
      
      console.log("Transition applied successfully");
      return updatedContent;
    } catch (error) {
      console.error("Error applying transition to draft content:", error);
      return draftContent;
    }
  }
  
  /**
   * Xóa hiệu ứng chuyển cảnh khỏi draft content
   * @param {Object} draftContent Nội dung draft
   * @param {string} transitionId ID của hiệu ứng chuyển cảnh cần xóa
   * @param {Object} options Các tùy chọn bổ sung
   * @returns {Object} Nội dung draft đã được xóa hiệu ứng chuyển cảnh
   */
  function removeTransitionFromDraftContent(draftContent, transitionId, options = {}) {
    if (!draftContent || !transitionId) {
      console.error("Invalid draft content or transition ID");
      return draftContent;
    }
    
    try {
      console.log(`Removing transition with ID "${transitionId}" from draft content`);
      
      // Tạo bản sao của draft content để không ảnh hưởng đến dữ liệu gốc
      const updatedContent = JSON.parse(JSON.stringify(draftContent));
      
      // Kiểm tra xem materials và transitions có tồn tại không
      if (!updatedContent.materials || !updatedContent.materials.transitions) {
        console.log("No transitions found in draft content");
        return updatedContent;
      }
      
      // Xóa hiệu ứng chuyển cảnh khỏi danh sách transitions
      updatedContent.materials.transitions = updatedContent.materials.transitions.filter(t => t.id !== transitionId);
      
      // Xóa tham chiếu đến hiệu ứng chuyển cảnh trong tất cả các segment
      if (updatedContent.tracks) {
        updatedContent.tracks.forEach(track => {
          if (track.segments) {
            track.segments.forEach(segment => {
              if (segment.extra_material_refs) {
                segment.extra_material_refs = segment.extra_material_refs.filter(ref => ref !== transitionId);
              }
            });
          }
        });
      }
      
      console.log("Transition removed successfully");
      return updatedContent;
    } catch (error) {
      console.error("Error removing transition from draft content:", error);
      return draftContent;
    }
  }
  
  /**
   * Lấy danh sách hiệu ứng chuyển cảnh đã áp dụng cho một segment
   * @param {Object} draftContent Nội dung draft
   * @param {number} trackIndex Chỉ số của track
   * @param {number} segmentIndex Chỉ số của segment
   * @returns {Array} Danh sách hiệu ứng chuyển cảnh đã áp dụng
   */
  function getAppliedTransitions(draftContent, trackIndex, segmentIndex) {
    if (!draftContent || trackIndex === undefined || segmentIndex === undefined) {
      console.error("Invalid parameters");
      return [];
    }
    
    try {
      // Kiểm tra xem track và segment có tồn tại không
      if (!draftContent.tracks || !draftContent.tracks[trackIndex] || !draftContent.tracks[trackIndex].segments || !draftContent.tracks[trackIndex].segments[segmentIndex]) {
        console.log("Track or segment not found");
        return [];
      }
      
      const segment = draftContent.tracks[trackIndex].segments[segmentIndex];
      
      // Kiểm tra xem extra_material_refs có tồn tại không
      if (!segment.extra_material_refs || !Array.isArray(segment.extra_material_refs)) {
        console.log("No extra_material_refs found in segment");
        return [];
      }
      
      // Kiểm tra xem materials và transitions có tồn tại không
      if (!draftContent.materials || !draftContent.materials.transitions) {
        console.log("No transitions found in draft content");
        return [];
      }
      
      // Lọc các hiệu ứng chuyển cảnh đã áp dụng
      const appliedTransitions = draftContent.materials.transitions.filter(transition => segment.extra_material_refs.includes(transition.id));
      
      return appliedTransitions;
    } catch (error) {
      console.error("Error getting applied transitions:", error);
      return [];
    }
  }
  
  /**
   * Tạo hiệu ứng chuyển cảnh giữa hai segment
   * @param {Object} draftContent Nội dung draft
   * @param {Object} transition Hiệu ứng chuyển cảnh
   * @param {number} fromSegmentIndex Chỉ số của segment bắt đầu
   * @param {number} toSegmentIndex Chỉ số của segment kết thúc
   * @param {number} trackIndex Chỉ số của track
   * @returns {Object} Nội dung draft đã được thêm hiệu ứng chuyển cảnh
   */
  function createTransitionBetweenSegments(draftContent, transition, fromSegmentIndex, toSegmentIndex, trackIndex = 0) {
    if (!draftContent || !transition || fromSegmentIndex === undefined || toSegmentIndex === undefined) {
      console.error("Invalid parameters");
      return draftContent;
    }
    
    try {
      console.log(`Creating transition "${transition.name}" between segments ${fromSegmentIndex} and ${toSegmentIndex}`);
      
      // Tạo bản sao của draft content để không ảnh hưởng đến dữ liệu gốc
      const updatedContent = JSON.parse(JSON.stringify(draftContent));
      
      // Đảm bảo materials và transitions tồn tại
      if (!updatedContent.materials) {
        updatedContent.materials = {};
      }
      
      if (!updatedContent.materials.transitions) {
        updatedContent.materials.transitions = [];
      }
      
      // Kiểm tra xem hiệu ứng chuyển cảnh đã tồn tại chưa
      const existingTransitionIndex = updatedContent.materials.transitions.findIndex(t => t.id === transition.id);
      
      if (existingTransitionIndex >= 0) {
        // Cập nhật hiệu ứng chuyển cảnh đã tồn tại
        updatedContent.materials.transitions[existingTransitionIndex] = { ...updatedContent.materials.transitions[existingTransitionIndex], ...transition };
      } else {
        // Thêm hiệu ứng chuyển cảnh mới
        updatedContent.materials.transitions.push(transition);
      }
      
      // Kiểm tra xem track và segment có tồn tại không
      if (!updatedContent.tracks || !updatedContent.tracks[trackIndex] || !updatedContent.tracks[trackIndex].segments) {
        console.log("Track or segments not found");
        return updatedContent;
      }
      
      const track = updatedContent.tracks[trackIndex];
      
      // Kiểm tra xem segment có tồn tại không
      if (track.segments.length <= fromSegmentIndex || track.segments.length <= toSegmentIndex) {
        console.log("Segments not found");
        return updatedContent;
      }
      
      const fromSegment = track.segments[fromSegmentIndex];
      const toSegment = track.segments[toSegmentIndex];
      
      // Đảm bảo extra_material_refs tồn tại
      if (!fromSegment.extra_material_refs) {
        fromSegment.extra_material_refs = [];
      }
      
      if (!toSegment.extra_material_refs) {
        toSegment.extra_material_refs = [];
      }
      
      // Thêm tham chiếu đến hiệu ứng chuyển cảnh nếu chưa tồn tại
      if (!fromSegment.extra_material_refs.includes(transition.id)) {
        fromSegment.extra_material_refs.push(transition.id);
      }
      
      console.log("Transition created successfully");
      return updatedContent;
    } catch (error) {
      console.error("Error creating transition between segments:", error);
      return draftContent;
    }
  }

  // Public API
  return {
    applyTransitionsToDraftContent,
    removeTransitionFromDraftContent,
    getAppliedTransitions,
    createTransitionBetweenSegments
  };
})();

// Export module
export { TransitionProcessor };
