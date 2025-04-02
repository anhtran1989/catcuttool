/**
 * Dropdown Manager - Unified solution for all dropdowns
 */
const DropdownManager = (function () {
  let activeDropdown = null;
  let scrollListener = null;
  let closeListener = null;
  let resizeListener = null;

  /**
   * Initialize dropdown manager
   */
  function init() {
    // Add resize listener to reposition any open dropdowns on window resize
    resizeListener = handleWindowResize.bind(this);
    window.addEventListener("resize", resizeListener);

    // This will handle any dropdown clicks outside of the standard flow
    document.addEventListener("click", (e) => {
      // Don't do anything if we're already handling a dropdown
      if (activeDropdown) return;

      // Check all effects dropdowns
      document
        .querySelectorAll(".effects-dropdown.show")
        .forEach((dropdown) => {
          const effectsContainer = dropdown.closest(".effects-container");
          const effectsLabel =
            effectsContainer?.querySelector(".effects-label");

          if (
            effectsLabel &&
            !dropdown.contains(e.target) &&
            !effectsLabel.contains(e.target)
          ) {
            dropdown.classList.remove("show");
          }
        });

      // Check all transitions dropdowns
      document
        .querySelectorAll(".transitions-dropdown.show")
        .forEach((dropdown) => {
          const transitionsContainer = dropdown.closest(
            ".transitions-container"
          );
          const transitionButton =
            transitionsContainer?.querySelector(".transition-button");

          if (
            transitionButton &&
            !dropdown.contains(e.target) &&
            !transitionButton.contains(e.target)
          ) {
            dropdown.classList.remove("show");
          }
        });
    });
  }

  /**
   * Show dropdown with proper positioning
   * @param {HTMLElement} trigger - Element that triggered the dropdown
   * @param {HTMLElement} dropdown - Dropdown element to show
   * @param {Function} positionCalculator - Function to calculate dropdown position
   */
  function showDropdown(trigger, dropdown, positionCalculator) {
    // First, close any open dropdown
    closeAllDropdowns();

    // Position and show this dropdown
    dropdown.classList.add("show");
    activeDropdown = {
      dropdown: dropdown,
      trigger: trigger,
      positionCalculator: positionCalculator,
    };

    // Calculate initial position
    updateDropdownPosition();

    // Set up scroll listener
    scrollListener = updateDropdownPosition.bind(this);
    window.addEventListener("scroll", scrollListener, { passive: true });

    // Set up click listener to close when clicking outside
    setTimeout(() => {
      closeListener = handleOutsideClick.bind(this);
      document.addEventListener("click", closeListener);
    }, 10);
  }

  /**
   * Update dropdown position based on current viewport
   */
  function updateDropdownPosition() {
    if (
      !activeDropdown ||
      !activeDropdown.dropdown.classList.contains("show")
    ) {
      cleanup();
      return;
    }

    const { dropdown, trigger, positionCalculator } = activeDropdown;

    // Get updated position
    const position = positionCalculator(trigger, dropdown);

    // Apply position
    Object.keys(position).forEach((prop) => {
      dropdown.style[prop] = position[prop];
    });
  }

  /**
   * Handle window resize event
   */
  function handleWindowResize() {
    if (activeDropdown) {
      updateDropdownPosition();
    }
  }

  /**
   * Handle clicks outside the dropdown
   * @param {Event} e - Click event
   */
  function handleOutsideClick(e) {
    if (!activeDropdown) return;

    const { dropdown, trigger } = activeDropdown;

    if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
      closeAllDropdowns();
    }
  }

  /**
   * Close all open dropdowns
   */
  function closeAllDropdowns() {
    // Close any open dropdowns
    document
      .querySelectorAll(".effects-dropdown.show, .transitions-dropdown.show")
      .forEach((item) => {
        item.classList.remove("show");
      });

    cleanup();
  }

  /**
   * Clean up event listeners
   */
  function cleanup() {
    if (scrollListener) {
      window.removeEventListener("scroll", scrollListener);
      scrollListener = null;
    }

    if (closeListener) {
      document.removeEventListener("click", closeListener);
      closeListener = null;
    }

    activeDropdown = null;
  }

  // Public API
  return {
    init,
    showDropdown,
    closeAllDropdowns,
    updateDropdownPosition,
  };
})();
