/**
 * Drag and Drop Manager - Handles drag and drop functionality for thumbnails
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

  // Public API
  return {
    init,
    setupDragListeners,
    reorganizeTransitions,
    updateIndices,
  };
})();
