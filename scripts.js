// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Initialize dropdown manager
    DropdownManager.init();
    
    // Create global effects dropdown
    createGlobalEffectsDropdown();
    
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide all tab contents
            tabContents.forEach(tab => {
                tab.style.display = 'none';
            });
            
            // Show the corresponding tab content
            if (index === 0) {
                document.getElementById('template-tab').style.display = 'block';
            } else if (index === 1) {
                document.getElementById('custom-tab').style.display = 'block';
            }
        });
    });
    
    // Set the default tab
    document.getElementById('template-tab').style.display = 'block';
    
    // File upload functionality
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('file-upload');
    const thumbnailList = document.getElementById('thumbnail-list');
    
    // Handle click on upload area
    uploadArea.addEventListener('click', function(e) {
        // Don't trigger if the click was on the Browse Files button (label)
        if (!e.target.classList.contains('upload-button') && !e.target.closest('.upload-button')) {
            // Check if we're running in Electron
            if (window.electron) {
                openElectronFileDialog();
            } else {
                fileInput.click();
            }
        }
    });
    
    // Handle click on Browse Files button
    const browseButton = document.querySelector('.upload-button');
    if (browseButton) {
        browseButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Check if we're running in Electron
            if (window.electron) {
                openElectronFileDialog();
            } else {
                fileInput.click();
            }
        });
    }
    
    // Handle drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        console.log('File drop event triggered');
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('active');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            console.log('Files dropped: ' + files.length);
            handleFiles(files);
        }
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        console.log('File input change event triggered');
        const files = this.files;
        if (files.length > 0) {
            console.log('Files selected: ' + files.length);
            handleFiles(files);
        }
    });
});

// Function to handle files
function handleFiles(files) {
    // Get the file input element if it's not already defined in this scope
    const fileInput = document.getElementById('file-upload');
    if (!fileInput) {
        console.error('Could not find file-upload element');
        return;
    }
    
    if (files && files.length > 0) {
        console.log('Processing ' + files.length + ' files');
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check if the file is an image or video
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                console.log('Creating thumbnail for: ' + file.name);
                // Store the file path if available (for local files)
                let filePath = '';
                if (file.path) {
                    // Use the original file path directly
                    filePath = file.path;
                } else if (file.webkitRelativePath) {
                    filePath = file.webkitRelativePath;
                } else {
                    // For files without paths, just use the filename
                    filePath = file.name;
                }
                
                // Format the path for CapCut
                filePath = formatPathForCapcut(filePath);
                console.log('File path:', filePath);
                createThumbnail(file, filePath);
            } else {
                console.log('Unsupported file type: ' + file.type);
            }
        }
        
        // Reset the file input to allow uploading the same file again
        setTimeout(() => {
            fileInput.value = '';
            console.log('File input reset');
        }, 100);
    } else {
        console.log('No files to process');
    }
}

// Function to create thumbnail
function createThumbnail(file, originalPath) {
    console.log('Starting thumbnail creation for: ' + file.name);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('FileReader loaded successfully');
        
        // Get the thumbnailList element if it's not already defined in this scope
        const thumbnailList = document.getElementById('thumbnail-list');
        if (!thumbnailList) {
            console.error('Could not find thumbnail-list element');
            return;
        }
        
        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = 'thumbnail-item';
        thumbnailItem.draggable = true;
        
        // Format the path for compatibility with CapCut using our dedicated function
        let formattedPath = formatPathForCapcut(originalPath);
        
        // Store the original file path as a data attribute
        thumbnailItem.dataset.originalPath = formattedPath;
        
        // Add index number
        const thumbnailIndex = document.createElement('div');
        thumbnailIndex.className = 'thumbnail-index';
        thumbnailIndex.textContent = thumbnailList.children.length + 1;
        
        let thumbnail;
        
        if (file.type.startsWith('image/')) {
            console.log('Creating image thumbnail');
            thumbnail = document.createElement('img');
            thumbnail.src = e.target.result;
        } else if (file.type.startsWith('video/')) {
            console.log('Creating video thumbnail');
            thumbnail = document.createElement('video');
            thumbnail.src = e.target.result;
            // Add poster image for video if you have one
            thumbnail.setAttribute('controls', 'true');
        }
        
        const thumbnailInfo = document.createElement('div');
        thumbnailInfo.className = 'thumbnail-info';
        
        const fileName = document.createElement('p');
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('p');
        fileSize.textContent = formatFileSize(file.size);
        
        // Create a hidden input for the path
        const pathInput = document.createElement('input');
        pathInput.type = 'hidden';
        pathInput.className = 'path-input';
        pathInput.value = formattedPath;
        
        // Create time duration input container
        const durationContainer = document.createElement('div');
        durationContainer.className = 'duration-container';
        
        // Create duration label
        const durationLabel = document.createElement('label');
        durationLabel.className = 'duration-label';
        durationLabel.textContent = 'Time:';
        
        // Create duration input
        const durationInput = document.createElement('input');
        durationInput.type = 'number';
        durationInput.className = 'duration-input';
        durationInput.value = 5; // Default 5 seconds
        durationInput.min = 1;
        durationInput.max = 60;
        durationInput.step = 1;
        
        // Add event listener to update total duration when changed
        durationInput.addEventListener('change', function() {
            updateTotalDuration();
        });
        
        // Create duration unit label
        const durationUnit = document.createElement('span');
        durationUnit.className = 'duration-unit';
        durationUnit.textContent = 'seconds';
        
        // Add all duration elements
        durationContainer.appendChild(durationLabel);
        durationContainer.appendChild(durationInput);
        durationContainer.appendChild(durationUnit);
        
        // Create effects container
        const effectsContainer = document.createElement('div');
        effectsContainer.className = 'effects-container';
        
        // Create effects button
        const effectsButton = document.createElement('div');
        effectsButton.className = 'effects-button';
        effectsButton.innerHTML = '<i class="fas fa-magic"></i>';
        effectsButton.onclick = function(e) {
            e.stopPropagation();
            toggleEffectsDropdown(this);
        };
        
        // Create selected effect display
        const selectedEffect = document.createElement('div');
        selectedEffect.className = 'selected-effect';
        selectedEffect.innerHTML = '<i class="fas fa-ban"></i> None';
        
        // We no longer need to create a dropdown for each thumbnail
        // It will use the global dropdown
        
        effectsContainer.appendChild(effectsButton);
        effectsContainer.appendChild(selectedEffect);
        
        thumbnailInfo.appendChild(fileName);
        thumbnailInfo.appendChild(fileSize);
        thumbnailInfo.appendChild(pathInput); // Add the hidden path input
        thumbnailInfo.appendChild(durationContainer);
        thumbnailInfo.appendChild(effectsContainer);
        
        thumbnailItem.appendChild(thumbnailIndex);
        thumbnailItem.appendChild(thumbnail);
        thumbnailItem.appendChild(thumbnailInfo);
        
        // If there's already at least one item in the list, add transition element before this one
        if (thumbnailList.children.length > 0) {
            const transitionsContainer = createTransitionsElement();
            thumbnailList.appendChild(transitionsContainer);
        }
        
        thumbnailList.appendChild(thumbnailItem);
        console.log('Thumbnail added to list');
        
        // Add drag event listeners
        setupDragListeners(thumbnailItem);
        
        // Update the total duration
        updateTotalDuration();
    };
    
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
    };
    
    try {
        reader.readAsDataURL(file);
        console.log('Started reading file as data URL');
    } catch (error) {
        console.error('Exception while reading file:', error);
    }
}

// Function to create transitions element
function createTransitionsElement() {
    const transitionsContainer = document.createElement('div');
    transitionsContainer.className = 'transitions-container';
    
    // Create transition button
    const transitionButton = document.createElement('div');
    transitionButton.className = 'transition-button';
    transitionButton.innerHTML = '<i class="fas fa-exchange-alt"></i>';
    transitionButton.onclick = function(e) {
        e.stopPropagation();
        toggleTransitionsDropdown(this);
    };
    
    // Create selected transition display
    const selectedTransition = document.createElement('div');
    selectedTransition.className = 'selected-transition';
    selectedTransition.innerHTML = '<i class="fas fa-cut"></i> Cut';
    
    // Create transitions dropdown
    const transitionsDropdown = document.createElement('div');
    transitionsDropdown.className = 'transitions-dropdown';
    
    // Define transition options
    const transitionOptions = [
        { name: 'Cut', icon: 'fas fa-cut' },
        { name: 'Fade', icon: 'fas fa-adjust' },
        { name: 'Dissolve', icon: 'fas fa-water' },
        { name: 'Wipe Right', icon: 'fas fa-arrow-right' },
        { name: 'Wipe Left', icon: 'fas fa-arrow-left' },
        { name: 'Wipe Up', icon: 'fas fa-arrow-up' },
        { name: 'Wipe Down', icon: 'fas fa-arrow-down' },
        { name: 'Zoom In', icon: 'fas fa-search-plus' },
        { name: 'Zoom Out', icon: 'fas fa-search-minus' }
    ];
    
    // Add transition options to the dropdown
    transitionOptions.forEach(option => {
        const transitionOption = document.createElement('div');
        transitionOption.className = 'transition-option';
        transitionOption.innerHTML = `<i class="${option.icon}"></i> ${option.name}`;
        transitionOption.onclick = function(e) {
            e.stopPropagation();
            selectTransition(this, selectedTransition);
            transitionsDropdown.classList.remove('show');
        };
        transitionsDropdown.appendChild(transitionOption);
    });
    
    transitionsContainer.appendChild(transitionButton);
    transitionsContainer.appendChild(selectedTransition);
    transitionsContainer.appendChild(transitionsDropdown);
    
    return transitionsContainer;
}

// Dropdown manager - unified solution for all dropdowns
const DropdownManager = {
    activeDropdown: null,
    scrollListener: null,
    closeListener: null,
    resizeListener: null,
    
    init: function() {
        // Add resize listener to reposition any open dropdowns on window resize
        this.resizeListener = this.handleWindowResize.bind(this);
        window.addEventListener('resize', this.resizeListener);
        
        // This will handle any dropdown clicks outside of the standard flow
        document.addEventListener('click', (e) => {
            // Don't do anything if we're already handling a dropdown
            if (this.activeDropdown) return;
            
            // Check all effects dropdowns
            document.querySelectorAll('.effects-dropdown.show').forEach(dropdown => {
                const effectsContainer = dropdown.closest('.effects-container');
                const effectsLabel = effectsContainer?.querySelector('.effects-label');
                
                if (effectsLabel && !dropdown.contains(e.target) && !effectsLabel.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
            
            // Check all transitions dropdowns
            document.querySelectorAll('.transitions-dropdown.show').forEach(dropdown => {
                const transitionsContainer = dropdown.closest('.transitions-container');
                const transitionButton = transitionsContainer?.querySelector('.transition-button');
                
                if (transitionButton && !dropdown.contains(e.target) && !transitionButton.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        });
    },
    
    showDropdown: function(trigger, dropdown, positionCalculator) {
        // First, close any open dropdown
        this.closeAllDropdowns();
        
        // Position and show this dropdown
        dropdown.classList.add('show');
        this.activeDropdown = {
            dropdown: dropdown,
            trigger: trigger,
            positionCalculator: positionCalculator
        };
        
        // Calculate initial position
        this.updateDropdownPosition();
        
        // Set up scroll listener
        this.scrollListener = this.updateDropdownPosition.bind(this);
        window.addEventListener('scroll', this.scrollListener, { passive: true });
        
        // Set up click listener to close when clicking outside
        setTimeout(() => {
            this.closeListener = this.handleOutsideClick.bind(this);
            document.addEventListener('click', this.closeListener);
        }, 10);
    },
    
    updateDropdownPosition: function() {
        if (!this.activeDropdown || !this.activeDropdown.dropdown.classList.contains('show')) {
            this.cleanup();
            return;
        }
        
        const { dropdown, trigger, positionCalculator } = this.activeDropdown;
        
        // Get updated position
        const position = positionCalculator(trigger, dropdown);
        
        // Apply position
        Object.keys(position).forEach(prop => {
            dropdown.style[prop] = position[prop];
        });
    },
    
    handleWindowResize: function() {
        if (this.activeDropdown) {
            this.updateDropdownPosition();
        }
    },
    
    handleOutsideClick: function(e) {
        if (!this.activeDropdown) return;
        
        const { dropdown, trigger } = this.activeDropdown;
        
        if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
            this.closeAllDropdowns();
        }
    },
    
    closeAllDropdowns: function() {
        // Close any open dropdowns
        document.querySelectorAll('.effects-dropdown.show, .transitions-dropdown.show').forEach(item => {
            item.classList.remove('show');
        });
        
        this.cleanup();
    },
    
    cleanup: function() {
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
        
        if (this.closeListener) {
            document.removeEventListener('click', this.closeListener);
            this.closeListener = null;
        }
        
        this.activeDropdown = null;
    }
};

// Functions to help handle viewport visibility
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function positionDropdownInViewport(dropdown, thumbnailRect) {
    // Đặt dropdown với kích thước bằng thumbnail
    dropdown.style.width = thumbnailRect.width + 'px';
    dropdown.style.height = thumbnailRect.height + 'px';
    
    // Kiểm tra xem thumbnail có nằm hoàn toàn trong viewport không
    const isFullyVisible = 
        thumbnailRect.top >= 0 &&
        thumbnailRect.left >= 0 &&
        thumbnailRect.bottom <= window.innerHeight &&
        thumbnailRect.right <= window.innerWidth;
    
    if (isFullyVisible) {
        // Nếu nằm trong viewport, đặt vị trí chính xác
        dropdown.style.left = thumbnailRect.left + 'px';
        dropdown.style.top = thumbnailRect.top + 'px';
    } else {
        // Nếu thumbnail nằm ngoài viewport hoặc chỉ hiển thị một phần
        // Đảm bảo dropdown hiển thị trong vùng nhìn thấy được
        
        // Calculate best position
        const left = Math.max(10, Math.min(thumbnailRect.left, window.innerWidth - thumbnailRect.width - 10));
        const top = Math.max(10, Math.min(thumbnailRect.top, window.innerHeight - thumbnailRect.height - 10));
        
        dropdown.style.left = left + 'px';
        dropdown.style.top = top + 'px';
    }
    
    // Thêm xử lý cho màn hình nhỏ
    if (window.innerWidth < 768) {
        // Trên màn hình nhỏ, hiển thị dropdown to hơn để dễ chọn
        dropdown.style.width = Math.min(thumbnailRect.width, window.innerWidth - 20) + 'px';
        dropdown.style.maxHeight = Math.min(thumbnailRect.height, window.innerHeight - 20) + 'px';
    }
}

// Function to create the effects dropdown overlay
function createEffectsOverlay(thumbnailItem, dropdown) {
    // Đảm bảo đóng tất cả các dropdown khác trước
    document.querySelectorAll('.effects-dropdown.show').forEach(item => {
        if (item !== dropdown) {
            item.classList.remove('show');
        }
    });
    
    // Reset style trước khi áp dụng mới để tránh xung đột
    dropdown.style.position = '';
    dropdown.style.left = '';
    dropdown.style.top = '';
    dropdown.style.width = '';
    dropdown.style.height = '';
    dropdown.style.maxHeight = '';
    dropdown.style.display = '';
    dropdown.style.flexDirection = '';
    dropdown.style.justifyContent = '';
    dropdown.style.alignItems = '';
    dropdown.style.overflowY = '';
    
    // Get dimensions of the thumbnail
    const thumbnailRect = thumbnailItem.getBoundingClientRect();
    
    // Style the dropdown
    dropdown.style.position = 'fixed';
    dropdown.style.zIndex = '10000';
    dropdown.style.display = 'flex';
    dropdown.style.flexDirection = 'column';
    dropdown.style.justifyContent = 'flex-start';
    dropdown.style.alignItems = 'stretch';
    dropdown.style.overflowY = 'auto';
    
    // Đặt vị trí phù hợp với viewport
    positionDropdownInViewport(dropdown, thumbnailRect);
    
    // Kiểm tra xem dropdown có quá nhiều nội dung không
    if (dropdown.scrollHeight > window.innerHeight * 0.8) {
        dropdown.style.maxHeight = (window.innerHeight * 0.8) + 'px';
    }
    
    return thumbnailRect;
}

// Global dropdown for effects
let globalEffectsDropdown = null;
let currentThumbnailItem = null;
let currentEffectsButton = null;
let currentSelectedEffect = null;

// Function to create a single global effects dropdown
function createGlobalEffectsDropdown() {
    // Remove any existing global dropdown
    if (document.getElementById('global-effects-dropdown')) {
        document.getElementById('global-effects-dropdown').remove();
    }
    
    // Create the dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'global-effects-dropdown';
    dropdown.className = 'effects-dropdown';
    
    // Define effect options
    const effectOptions = [
        { name: 'None', icon: 'fas fa-ban' },
        { name: 'Fade', icon: 'fas fa-adjust' },
        { name: 'Zoom In', icon: 'fas fa-search-plus' },
        { name: 'Zoom Out', icon: 'fas fa-search-minus' },
        { name: 'Blur', icon: 'fas fa-water' },
        { name: 'Black & White', icon: 'fas fa-tint' },
        { name: 'Sepia', icon: 'fas fa-image' },
        { name: 'Brightness', icon: 'fas fa-sun' },
        { name: 'Contrast', icon: 'fas fa-adjust' },
        { name: 'Saturation', icon: 'fas fa-palette' },
        { name: 'Hue Rotate', icon: 'fas fa-sync' },
        { name: 'Invert', icon: 'fas fa-exchange-alt' },
        { name: 'Lật Zoom', icon: 'fas fa-arrows-alt' },
        { name: 'Làm mờ bùng nổ', icon: 'fas fa-bomb' },
        { name: 'Lắc lư', icon: 'fas fa-random' },
        { name: 'Màn hình 3D', icon: 'fas fa-cube' },
        { name: 'Chuyển động máy ảnh', icon: 'fas fa-video' },
        { name: 'Cuộn ngang', icon: 'fas fa-arrows-alt-h' },
        { name: 'Tình yêu mờ nhạt', icon: 'fas fa-heart' },
        { name: 'Nét truyện tranh', icon: 'fas fa-pencil-alt' },
        { name: 'Theo dõi bắn', icon: 'fas fa-bullseye' },
        { name: 'Mở ngược', icon: 'fas fa-undo' },
        { name: 'Tuyết vàng', icon: 'fas fa-snowflake' },
        { name: 'Trái tim bung nở', icon: 'fas fa-heartbeat' },
        { name: 'Lóe sáng chớp nảy', icon: 'fas fa-bolt' },
        { name: 'Phim', icon: 'fas fa-film' },
        { name: 'Điểm lục giác', icon: 'fas fa-stop' },
        { name: 'Lăng kính đá quý', icon: 'fas fa-gem' },
        { name: 'Bụi rơi', icon: 'fas fa-feather' },
        { name: 'Đèn nhấp nháy theo nhịp', icon: 'fas fa-lightbulb' },
        { name: 'Đèn nháy', icon: 'fas fa-lightbulb' },
        { name: 'Bám sát đối tượng 2', icon: 'fas fa-crosshairs' },
        { name: 'Vở kịch Giáng Sinh', icon: 'fas fa-snowman' },
        { name: 'Lũ quét qua', icon: 'fas fa-water' },
        { name: 'S-Movement', icon: 'fas fa-wave-square' },
        { name: 'Cười lên', icon: 'fas fa-smile' },
        { name: 'Chớp mắt mở', icon: 'fas fa-eye' },
        { name: 'Đèn flash chéo', icon: 'fas fa-bolt' },
        { name: 'Tia sáng kéo dài', icon: 'fas fa-sun' },
        { name: 'Sóng xung kích', icon: 'fas fa-broadcast-tower' },
        { name: 'Lấp lánh 2', icon: 'fas fa-star' },
        { name: 'Trục trặc pixel', icon: 'fas fa-th' },
        { name: 'Làm mờ ảo diệu', icon: 'fas fa-magic' },
        { name: 'Phóng to phơi sáng', icon: 'fas fa-expand' }
    ];
    
    // Add effect options to the dropdown
    effectOptions.forEach(option => {
        const effectOption = document.createElement('div');
        effectOption.className = 'effect-option';
        effectOption.innerHTML = `<i class="${option.icon}"></i> ${option.name}`;
        effectOption.dataset.name = option.name;
        effectOption.dataset.icon = option.icon;
        effectOption.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (currentSelectedEffect) {
                // Update the selected effect display
                const optionName = this.dataset.name;
                const iconClass = this.dataset.icon;
                currentSelectedEffect.innerHTML = `<i class="${iconClass}"></i> ${optionName}`;
                
                // Close the dropdown
                hideEffectsDropdown();
            }
        };
        dropdown.appendChild(effectOption);
    });
    
    // Add the dropdown to the document body
    document.body.appendChild(dropdown);
    
    // Store the dropdown for later use
    globalEffectsDropdown = dropdown;
    
    // Add global click listener to hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (globalEffectsDropdown && globalEffectsDropdown.classList.contains('show')) {
            // If click is outside the dropdown and not on the current effects button
            if (!globalEffectsDropdown.contains(e.target) && 
                (!currentEffectsButton || !currentEffectsButton.contains(e.target))) {
                hideEffectsDropdown();
            }
        }
    });
    
    // Add scroll listener to reposition or hide dropdown
    window.addEventListener('scroll', function() {
        if (globalEffectsDropdown && globalEffectsDropdown.classList.contains('show')) {
            if (currentThumbnailItem && currentEffectsButton) {
                const thumbnailRect = currentThumbnailItem.getBoundingClientRect();
                
                // If thumbnail is no longer visible, hide the dropdown
                if (thumbnailRect.bottom < 0 || thumbnailRect.top > window.innerHeight ||
                    thumbnailRect.right < 0 || thumbnailRect.left > window.innerWidth) {
                    hideEffectsDropdown();
                } else {
                    // Update position
                    positionEffectsDropdown(currentThumbnailItem);
                }
            }
        }
    });
    
    // Add resize listener
    window.addEventListener('resize', function() {
        if (globalEffectsDropdown && globalEffectsDropdown.classList.contains('show')) {
            if (currentThumbnailItem) {
                positionEffectsDropdown(currentThumbnailItem);
            }
        }
    });
    
    return dropdown;
}

// Function to show the effects dropdown for a specific thumbnail
function showEffectsDropdown(button) {
    console.log('Showing effects dropdown for button:', button);
    
    // Get the thumbnail item
    const thumbnailItem = button.closest('.thumbnail-item');
    const selectedEffect = button.nextElementSibling;
    
    console.log('Thumbnail item:', thumbnailItem);
    console.log('Selected effect:', selectedEffect);
    
    // Update global references
    currentThumbnailItem = thumbnailItem;
    currentEffectsButton = button;
    currentSelectedEffect = selectedEffect;
    
    // Make sure we have the global dropdown
    if (!globalEffectsDropdown) {
        console.log('Creating global effects dropdown');
        globalEffectsDropdown = createGlobalEffectsDropdown();
    }
    
    // Update the selected state in dropdown
    const currentEffectName = selectedEffect.textContent.trim().replace(/^\S+\s+/, '');
    console.log('Current effect name:', currentEffectName);
    
    const options = globalEffectsDropdown.querySelectorAll('.effect-option');
    options.forEach(option => {
        const optionName = option.dataset.name;
        option.classList.toggle('selected', optionName === currentEffectName);
    });
    
    // Position and show the dropdown
    positionEffectsDropdown(thumbnailItem);
    globalEffectsDropdown.classList.add('show');
    console.log('Dropdown shown');
}

// Function to hide the effects dropdown
function hideEffectsDropdown() {
    if (globalEffectsDropdown) {
        globalEffectsDropdown.classList.remove('show');
    }
    
    // Clear references
    currentThumbnailItem = null;
    currentEffectsButton = null;
    currentSelectedEffect = null;
}

// Function to position the effects dropdown over a thumbnail
function positionEffectsDropdown(thumbnailItem) {
    if (!globalEffectsDropdown) return;
    
    const thumbnailRect = thumbnailItem.getBoundingClientRect();
    
    // Style the dropdown
    globalEffectsDropdown.style.position = 'fixed';
    globalEffectsDropdown.style.zIndex = '10000';
    globalEffectsDropdown.style.width = thumbnailRect.width + 'px';
    globalEffectsDropdown.style.height = thumbnailRect.height + 'px';
    globalEffectsDropdown.style.left = thumbnailRect.left + 'px';
    globalEffectsDropdown.style.top = thumbnailRect.top + 'px';
    globalEffectsDropdown.style.maxHeight = 'none';
    
    // If there's not enough space in the viewport, adjust max height
    if (thumbnailRect.height > window.innerHeight * 0.8) {
        globalEffectsDropdown.style.maxHeight = (window.innerHeight * 0.8) + 'px';
    }
}

// Function to toggle effects dropdown
function toggleEffectsDropdown(button) {
    // Check if this button's dropdown is already shown
    if (currentEffectsButton === button && globalEffectsDropdown && 
        globalEffectsDropdown.classList.contains('show')) {
        // If already open, close it
        hideEffectsDropdown();
    } else {
        // Close transitions dropdowns
        document.querySelectorAll('.transitions-dropdown.show').forEach(item => {
            item.classList.remove('show');
        });
        
        // Show this dropdown
        showEffectsDropdown(button);
    }
}

// Function to select a transition
function selectTransition(option, selectedElement) {
    selectedElement.innerHTML = option.innerHTML;
    
    // Ensure the dropdown is closed
    const dropdown = option.closest('.transitions-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
        
        // Remove any event listeners attached to this dropdown
        window.removeEventListener('scroll', option.repositionDropdown);
        document.removeEventListener('click', option.closeDropdownHandler);
    }
}

// Function to select an effect
function selectEffect(option, selectedElement) {
    // Keep track of which option was clicked
    const optionName = option.textContent.trim().replace(/^\S+\s+/, '');
    
    // Update the display with icon
    const iconClass = option.querySelector('i').className;
    selectedElement.innerHTML = `<i class="${iconClass}"></i> ${optionName}`;
    
    // Highlight selected option for visual feedback
    const allOptions = option.parentNode.querySelectorAll('.effect-option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    
    // Wait a moment before closing the dropdown for better visual feedback
    setTimeout(() => {
        // Find and close the dropdown
        const dropdown = option.closest('.effects-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            
            // Cleanup event handlers
            if (typeof cleanup === 'function') {
                cleanup();
            } else if (window.currentDropdownHandlers) {
                const { closeHandler, scrollHandler, resizeHandler } = window.currentDropdownHandlers;
                document.removeEventListener('click', closeHandler);
                window.removeEventListener('scroll', scrollHandler);
                window.removeEventListener('resize', resizeHandler);
                window.currentDropdownHandlers = null;
            }
        }
    }, 150);
}

// Function to setup drag listeners for thumbnail items
function setupDragListeners(item) {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
}

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    // Set opacity to indicate dragging
    setTimeout(() => {
        this.style.opacity = '0.4';
    }, 0);
    
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    e.preventDefault();
    // Allow drop
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();
    
    this.classList.remove('drag-over');
    
    // Don't do anything if dropping the same item we're dragging
    if (draggedItem !== this) {
        // Get thumbnailList if it's not already defined in this scope
        const thumbnailList = document.getElementById('thumbnail-list');
        if (!thumbnailList) {
            console.error('Could not find thumbnail-list element');
            return;
        }
        
        // Only handle drops on thumbnail items, not transitions
        if (this.classList.contains('thumbnail-item') && draggedItem.classList.contains('thumbnail-item')) {
            // Get the position of the dragged item and the drop target
            const items = Array.from(thumbnailList.children).filter(item => 
                item.classList.contains('thumbnail-item')
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
                if (dropItemIndex + 1 < allItems.length && 
                    allItems[dropItemIndex + 1].classList.contains('transitions-container')) {
                    thumbnailList.insertBefore(draggedItem, allItems[dropItemIndex + 2]);
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

function handleDragEnd(e) {
    // Reset opacity of dragged item
    this.style.opacity = '1';
    
    // Remove drag-over class from all items
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    
    draggedItem = null;
}

// Function to reorganize transitions
function reorganizeTransitions() {
    // Get thumbnailList if it's not already defined in this scope
    const thumbnailList = document.getElementById('thumbnail-list');
    if (!thumbnailList) {
        console.error('Could not find thumbnail-list element');
        return;
    }
    
    // Remove all existing transitions
    document.querySelectorAll('.transitions-container').forEach(item => {
        item.remove();
    });
    
    // Add transitions between thumbnail items
    const thumbnailItems = Array.from(thumbnailList.children).filter(item => 
        item.classList.contains('thumbnail-item')
    );
    
    // Add transitions between items (except after the last one)
    for (let i = 0; i < thumbnailItems.length - 1; i++) {
        const currentItem = thumbnailItems[i];
        const nextItem = thumbnailItems[i + 1];
        
        // Create a new transition element
        const transitionsContainer = createTransitionsElement();
        
        // Find the actual next item in the parent container
        const allItems = Array.from(thumbnailList.children);
        const currentItemIndex = allItems.indexOf(currentItem);
        
        // Insert after the current item
        thumbnailList.insertBefore(transitionsContainer, allItems[currentItemIndex + 1]);
    }
}

// Function to update all index numbers
function updateIndices() {
    // Get thumbnailList if it's not already defined in this scope
    const thumbnailList = document.getElementById('thumbnail-list');
    if (!thumbnailList) {
        console.error('Could not find thumbnail-list element');
        return;
    }
    
    const items = thumbnailList.querySelectorAll('.thumbnail-item');
    items.forEach((item, index) => {
        const indexElement = item.querySelector('.thumbnail-index');
        indexElement.textContent = index + 1;
    });

    // Also update total duration when reordering
    updateTotalDuration();
}

// Function to add a total duration counter to thumbnail container
function addTotalDurationCounter() {
    // Check if duration counter already exists
    if (!document.getElementById('total-duration-container')) {
        const thumbnailContainer = document.querySelector('.thumbnail-container');
        
        const totalDurationContainer = document.createElement('div');
        totalDurationContainer.id = 'total-duration-container';
        totalDurationContainer.className = 'total-duration-container';
        
        const totalDurationLabel = document.createElement('span');
        totalDurationLabel.className = 'total-duration-label';
        totalDurationLabel.textContent = 'Total Duration: ';
        
        const totalDurationValue = document.createElement('span');
        totalDurationValue.id = 'total-duration-value';
        totalDurationValue.className = 'total-duration-value';
        totalDurationValue.textContent = '0 seconds';
        
        totalDurationContainer.appendChild(totalDurationLabel);
        totalDurationContainer.appendChild(totalDurationValue);
        
        // Insert after the "Uploaded Files" heading
        const heading = thumbnailContainer.querySelector('h2');
        heading.parentNode.insertBefore(totalDurationContainer, heading.nextSibling);
    }
}

// Function to update total duration
function updateTotalDuration() {
    // Make sure duration counter exists
    addTotalDurationCounter();
    
    // Get thumbnailList if it's not already defined in this scope
    const thumbnailList = document.getElementById('thumbnail-list');
    if (!thumbnailList) {
        console.error('Could not find thumbnail-list element');
        return;
    }
    
    // Calculate total duration
    let totalDuration = 0;
    const durationInputs = thumbnailList.querySelectorAll('.duration-input');
    durationInputs.forEach(input => {
        totalDuration += parseInt(input.value) || 0;
    });
    
    // Update the displayed value
    const totalDurationValue = document.getElementById('total-duration-value');
    if (totalDurationValue) {
        totalDurationValue.textContent = totalDuration + ' seconds';
    }
}

// Function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// CapCut effect and transition mappings
const capcut = {
    // Effects mapping (name -> effect_id)
    effects: {
        'None': null,
        'Fade': '7399470719085595910',
        'Zoom In': '7399470719085595911',
        'Zoom Out': '7399470719085595912',
        'Blur': '7399470719085595913',
        'Black & White': '7399470719085595914',
        'Sepia': '7399470719085595915',
        'Brightness': '7399470719085595916',
        'Contrast': '7399470719085595917',
        'Saturation': '7399470719085595918',
        'Hue Rotate': '7399470719085595919',
        'Invert': '7399470719085595920'
    },
    
    // Transitions mapping (name -> effect_id)
    transitions: {
        'Cut': null,
        'Fade': '7291211157254181377',
        'Dissolve': '7291211157254181378',
        'Wipe Right': '7291211157254181379',
        'Wipe Left': '7291211157254181380',
        'Wipe Up': '7291211157254181381',
        'Wipe Down': '7291211157254181382',
        'Zoom In': '7291211157254181383',
        'Zoom Out': '7291211157254181384'
    },
    
    // Icon mapping for transitions
    transitionIcons: {
        'Cut': 'fas fa-cut',
        'Fade': 'fas fa-adjust',
        'Dissolve': 'fas fa-water',
        'Wipe Right': 'fas fa-arrow-right',
        'Wipe Left': 'fas fa-arrow-left',
        'Wipe Up': 'fas fa-arrow-up',
        'Wipe Down': 'fas fa-arrow-down',
        'Zoom In': 'fas fa-search-plus',
        'Zoom Out': 'fas fa-search-minus'
    }
};

// Generate a random UUID for CapCut JSON
function generateUUID() {
    const pattern = 'XXXXXXXX-XXXX-4XXX-XXXX-XXXXXXXXXXXX';
    return pattern.replace(/X/g, function() {
        return Math.floor(Math.random() * 16).toString(16).toUpperCase();
    });
}

// Add export button functionality
const exportButton = document.getElementById('export-button');
exportButton.addEventListener('click', exportToCapcut);

// Function to export data to CapCut JSON format
function exportToCapcut() {
    // Ensure we have media items
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    if (thumbnailItems.length === 0) {
        alert('Please add at least one media file before exporting');
        return;
    }
    
    // Get the default template
    fetch('draft_content_default.json')
        .then(response => response.json())
        .then(templateData => {
            // Create a deep copy of the template
            const capcutData = JSON.parse(JSON.stringify(templateData));
            
            // Collect all media items, transitions, and effects
            const mediaItems = [];
            const transitionElements = document.querySelectorAll('.transitions-container');
            
            // Get all thumbnail items
            const thumbnails = Array.from(thumbnailItems);
            thumbnails.forEach((item, index) => {
                // Get media details
                const img = item.querySelector('img');
                const video = item.querySelector('video');
                const fileName = item.querySelector('.thumbnail-info p:first-child').textContent;
                const duration = parseInt(item.querySelector('.duration-input').value) * 1000000; // Convert to microseconds
                
                // Get the effect name
                const effectElement = item.querySelector('.selected-effect');
                // Extract effect name from the element
                let effectName = 'None';
                if (effectElement) {
                    // Remove the icon part and get just the name
                    effectName = effectElement.textContent.trim().replace(/^\S+\s+/, '');
                }
                
                // Get the file path directly from the path input field
                const pathInput = item.querySelector('.path-input');
                let filePath = '';
                
                if (pathInput && pathInput.value && pathInput.value.trim() !== '') {
                    // Use the real file path provided by Electron or path input
                    filePath = pathInput.value.trim();
                } else if (item.dataset.originalPath) {
                    // Use the path stored in the data attribute
                    filePath = item.dataset.originalPath;
                } else {
                    // Just use the filename if no path provided
                    filePath = fileName;
                }
                
                // Format the path for CapCut - use native path format for Electron
                if (window.electron) {
                    // For Electron, use the exact file path with proper separators for the OS
                    // CapCut on Windows expects paths with backslashes
                    if (window.electron.getPlatform() === 'win32') {
                        // Convert forward slashes to double backslashes for Windows
                        filePath = filePath.replace(/\//g, '\\');
                        
                        // Ensure proper backslash format (double backslashes)
                        filePath = filePath.replace(/\\/g, '\\\\');
                    } else {
                        // For macOS/Linux, use forward slashes
                        filePath = filePath.replace(/\\/g, '/');
                    }
                } else {
                    // For web version, use the simple formatting
                    filePath = formatPathForCapcut(filePath);
                }
                
                // Get transition (if not the last item)
                let transitionName = null;
                if (index < thumbnails.length - 1) {
                    const transitionElement = transitionElements[index];
                    if (transitionElement) {
                        const transitionText = transitionElement.querySelector('.selected-transition').textContent.trim();
                        transitionName = transitionText.split(' ').slice(1).join(' '); // Remove the icon part
                    }
                }
                
                mediaItems.push({
                    fileName: fileName,
                    isVideo: !!video,
                    filePath: filePath,
                    duration: duration,
                    effect: effectName,
                    transition: transitionName
                });
            });
            
            // Add media items to the template
            capcutData.mediaItems = mediaItems;
            
            // Generate a random UUID for the template
            capcutData.uuid = generateUUID();
            
            // Reset sections that will be populated
            capcutData.materials.videos = [];
            capcutData.materials.transitions = [];
            capcutData.materials.video_effects = [];
            capcutData.materials.speeds = [];
            capcutData.materials.placeholder_infos = [];
            capcutData.materials.vocal_separations = [];
            capcutData.tracks = [{
                attribute: 0,
                flag: 0,
                id: generateUUID(),
                is_default_name: true,
                name: "",
                segments: [],
                type: "video"
            }];
            
            // Calculate total duration
            let totalDuration = 0;
            mediaItems.forEach(item => {
                totalDuration += item.duration;
            });
            capcutData.duration = totalDuration;
            
            // Track IDs to reference later
            const idMap = {
                speeds: [],
                placeholders: [],
                canvases: [],
                soundMappings: [],
                vocalSeparations: [],
                transitions: [],
                videoEffects: []
            };
            
            // Create default canvas
            const canvasId = generateUUID();
            capcutData.materials.canvases = [{
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
            }];
            idMap.canvases.push(canvasId);
            
            // Create transition elements first
            mediaItems.forEach((item, index) => {
                if (item.transition && item.transition !== 'Cut' && index < mediaItems.length - 1) {
                    const transitionId = generateUUID();
                    const transitionEffectId = capcut.transitions[item.transition];
                    
                    if (transitionEffectId) {
                        capcutData.materials.transitions.push({
                            id: transitionId,
                            effect_id: transitionEffectId,
                            duration: 866666, // Default duration (about 0.866 seconds)
                            name: item.transition,
                            is_overlap: true,
                            path: "", // Will be configured by CapCut
                            category_id: "25835",
                            category_name: "remen",
                            type: "transition"
                        });
                        idMap.transitions.push(transitionId);
                    } else {
                        idMap.transitions.push(null);
                    }
                } else {
                    idMap.transitions.push(null);
                }
            });
            
            // Create speed element for each media and other supporting materials
            mediaItems.forEach((item, index) => {
                const speedId = generateUUID();
                capcutData.materials.speeds.push({
                    curve_speed: null,
                    id: speedId,
                    mode: 0,
                    speed: 1.0,
                    type: "speed"
                });
                idMap.speeds.push(speedId);
                
                // Create placeholder
                const placeholderId = generateUUID();
                capcutData.materials.placeholder_infos.push({
                    error_path: "",
                    error_text: "",
                    id: placeholderId,
                    meta_type: "none",
                    res_path: "",
                    res_text: "",
                    type: "placeholder_info"
                });
                idMap.placeholders.push(placeholderId);
                
                // Create sound channel mapping
                const soundMappingId = generateUUID();
                capcutData.materials.sound_channel_mappings.push({
                    audio_channel_mapping: 0,
                    id: soundMappingId,
                    is_config_open: false,
                    type: ""
                });
                idMap.soundMappings.push(soundMappingId);
                
                // Create vocal separation
                const vocalSeparationId = generateUUID();
                capcutData.materials.vocal_separations.push({
                    choice: 0,
                    id: vocalSeparationId,
                    production_path: "",
                    removed_sounds: [],
                    time_range: null,
                    type: "vocal_separation"
                });
                idMap.vocalSeparations.push(vocalSeparationId);
                
                // Create video effect if needed
                if (item.effect && item.effect !== 'None') {
                    const effectId = generateUUID();
                    const effectEffectId = capcut.effects[item.effect];
                    
                    if (effectEffectId) {
                        capcutData.materials.video_effects.push({
                            id: effectId,
                            effect_id: effectEffectId,
                            name: item.effect,
                            type: "video_effect",
                            category_id: "27296",
                            category_name: "hot2",
                            adjust_params: [
                                { name: "effects_adjust_color", default_value: 0.5, value: 0.5 },
                                { name: "effects_adjust_sharpen", default_value: 0.25, value: 0.25 },
                                { name: "effects_adjust_luminance", default_value: 1.0, value: 1.0 },
                                { name: "effects_adjust_background_animation", default_value: 0.5, value: 0.5 },
                                { name: "effects_adjust_intensity", default_value: 0.6, value: 0.6 },
                                { name: "effects_adjust_speed", default_value: 0.33, value: 0.33 }
                            ],
                            render_index: 0,
                            value: 1.0
                        });
                        idMap.videoEffects.push(effectId);
                    } else {
                        idMap.videoEffects.push(null);
                    }
                } else {
                    idMap.videoEffects.push(null);
                }
            });
            
            // Add media items and create segments
            mediaItems.forEach((item, index) => {
                const mediaId = generateUUID();
                
                // Default values
                const mediaObject = {
                    id: mediaId,
                    type: item.isVideo ? "video" : "photo",
                    material_name: item.fileName,
                    path: item.filePath, // Use the actual file path from the source
                    width: 1280, // Default width
                    height: 720, // Default height
                    duration: item.isVideo ? item.duration : 10800000000, // Long duration for images
                    has_audio: item.isVideo,
                    has_sound_separated: false,
                    crop: {
                        lower_left_x: 0.0,
                        lower_left_y: 1.0,
                        lower_right_x: 1.0,
                        lower_right_y: 1.0,
                        upper_left_x: 0.0,
                        upper_left_y: 0.0,
                        upper_right_x: 1.0,
                        upper_right_y: 0.0
                    },
                    crop_ratio: "free",
                    crop_scale: 1.0,
                    category_name: "local",
                    check_flag: 62978047
                };
                
                capcutData.materials.videos.push(mediaObject);
                
                // Calculate target timerange
                let startTime = 0;
                for (let i = 0; i < index; i++) {
                    startTime += mediaItems[i].duration;
                }
                
                // Build extra material references
                const extraRefs = [
                    idMap.speeds[index],
                    idMap.placeholders[index],
                    idMap.canvases[0],
                    idMap.soundMappings[index],
                    idMap.vocalSeparations[index]
                ];
                
                // Add transition if it exists
                if (idMap.transitions[index]) {
                    extraRefs.push(idMap.transitions[index]);
                }
                
                // Create segment
                const segmentId = generateUUID();
                const segment = {
                    id: segmentId,
                    material_id: mediaId,
                    target_timerange: {
                        start: startTime,
                        duration: item.duration
                    },
                    source_timerange: {
                        start: 0,
                        duration: item.duration
                    },
                    extra_material_refs: extraRefs,
                    enable_adjust: true,
                    enable_color_curves: true,
                    enable_color_wheels: true,
                    enable_lut: true,
                    enable_video_mask: true,
                    speed: 1.0,
                    volume: 1.0,
                    visible: true,
                    clip: {
                        alpha: 1.0,
                        flip: {
                            horizontal: false,
                            vertical: false
                        },
                        rotation: 0.0,
                        scale: {
                            x: 1.0,
                            y: 1.0
                        },
                        transform: {
                            x: 0.0,
                            y: 0.0
                        }
                    }
                };
                
                capcutData.tracks[0].segments.push(segment);
            });
            
            // Add effect tracks if needed
            const effectsToAdd = idMap.videoEffects.filter(id => id !== null);
            if (effectsToAdd.length > 0) {
                const effectTrack = {
                    id: generateUUID(),
                    type: "effect",
                    attribute: 0,
                    flag: 0,
                    is_default_name: true,
                    name: "",
                    segments: []
                };
                
                // Add effect segments
                mediaItems.forEach((item, index) => {
                    if (idMap.videoEffects[index]) {
                        let startTime = 0;
                        for (let i = 0; i < index; i++) {
                            startTime += mediaItems[i].duration;
                        }
                        
                        effectTrack.segments.push({
                            id: generateUUID(),
                            material_id: idMap.videoEffects[index],
                            target_timerange: {
                                start: startTime,
                                duration: item.duration
                            },
                            render_index: 11000,
                            track_render_index: 1,
                            visible: true,
                            volume: 1.0
                        });
                    }
                });
                
                if (effectTrack.segments.length > 0) {
                    capcutData.tracks.push(effectTrack);
                }
            }
            
            // Download the JSON file
            const jsonString = JSON.stringify(capcutData);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'draft_content_new.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('File exported successfully! Import it to CapCut to use your template.');
        })
        .catch(error => {
            console.error('Error loading template:', error);
            alert('Error creating CapCut file. Please make sure draft_content_default.json exists.');
        });
}

// Function to format paths for CapCut compatibility
function formatPathForCapcut(path) {
    if (!path) return '';
    
    // Replace backslashes with forward slashes and ensure double slashes
    let formattedPath = path.replace(/\\/g, '//');
    
    // Fix Windows paths with drive letters (C:)
    if (/^[A-Za-z]:/.test(formattedPath)) {
        formattedPath = formattedPath.replace(/^([A-Za-z]:)(?:\/)?/, '$1//');
    }
    
    return formattedPath;
}

// Function to open Electron's file dialog
async function openElectronFileDialog() {
    try {
        const filePaths = await window.electron.selectFiles();
        if (filePaths && filePaths.length > 0) {
            const fileDetails = await window.electron.getFileDetails(filePaths);
            processElectronFiles(fileDetails);
        }
    } catch (error) {
        console.error('Error selecting files with Electron:', error);
    }
}

// Function to process files selected through Electron
function processElectronFiles(fileDetails) {
    console.log('Processing Electron files:', fileDetails);
    
    // Process each file
    for (const fileDetail of fileDetails) {
        // Only process image and video files
        if (fileDetail.type.startsWith('image/') || fileDetail.type.startsWith('video/')) {
            // Create a thumbnail with the real file path
            createElectronThumbnail(fileDetail);
        } else {
            console.log('Unsupported file type:', fileDetail.type);
        }
    }
}

// Function to create thumbnail for files selected through Electron
function createElectronThumbnail(fileDetail) {
    console.log('Creating thumbnail for Electron file:', fileDetail.name);
    
    // Get the thumbnailList element
    const thumbnailList = document.getElementById('thumbnail-list');
    if (!thumbnailList) {
        console.error('Could not find thumbnail-list element');
        return;
    }
    
    const thumbnailItem = document.createElement('div');
    thumbnailItem.className = 'thumbnail-item';
    thumbnailItem.draggable = true;
    
    // Store the real file path
    const realPath = fileDetail.path;
    thumbnailItem.dataset.originalPath = realPath;
    
    // Add index number
    const thumbnailIndex = document.createElement('div');
    thumbnailIndex.className = 'thumbnail-index';
    thumbnailIndex.textContent = thumbnailList.children.length + 1;
    
    let thumbnail;
    
    // Create URL from file path or use a placeholder
    if (fileDetail.type.startsWith('image/')) {
        thumbnail = document.createElement('img');
        // For Electron, we can use the file:// protocol to load local images
        thumbnail.src = 'file://' + realPath;
    } else if (fileDetail.type.startsWith('video/')) {
        thumbnail = document.createElement('video');
        thumbnail.src = 'file://' + realPath;
        thumbnail.setAttribute('controls', 'true');
    }
    
    const thumbnailInfo = document.createElement('div');
    thumbnailInfo.className = 'thumbnail-info';
    
    const fileName = document.createElement('p');
    fileName.textContent = fileDetail.name;
    
    const fileSize = document.createElement('p');
    fileSize.textContent = formatFileSize(fileDetail.size);
    
    // Create a hidden input to store the path
    const pathInput = document.createElement('input');
    pathInput.type = 'hidden';
    pathInput.className = 'path-input';
    pathInput.value = realPath;
    
    // Create time duration input container
    const durationContainer = document.createElement('div');
    durationContainer.className = 'duration-container';
    
    // Create duration label
    const durationLabel = document.createElement('label');
    durationLabel.className = 'duration-label';
    durationLabel.textContent = 'Time:';
    
    // Create duration input
    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.className = 'duration-input';
    durationInput.value = 5; // Default 5 seconds
    durationInput.min = 1;
    durationInput.max = 60;
    durationInput.step = 1;
    
    // Add event listener to update total duration when changed
    durationInput.addEventListener('change', function() {
        updateTotalDuration();
    });
    
    // Create duration unit label
    const durationUnit = document.createElement('span');
    durationUnit.className = 'duration-unit';
    durationUnit.textContent = 'seconds';
    
    // Add all duration elements
    durationContainer.appendChild(durationLabel);
    durationContainer.appendChild(durationInput);
    durationContainer.appendChild(durationUnit);
    
    // Create effects container
    const effectsContainer = document.createElement('div');
    effectsContainer.className = 'effects-container';
    
    // Create effects button
    const effectsButton = document.createElement('div');
    effectsButton.className = 'effects-button';
    effectsButton.innerHTML = '<i class="fas fa-magic"></i>';
    effectsButton.onclick = function(e) {
        e.stopPropagation();
        toggleEffectsDropdown(this);
    };
    
    // Create selected effect display
    const selectedEffect = document.createElement('div');
    selectedEffect.className = 'selected-effect';
    selectedEffect.innerHTML = '<i class="fas fa-ban"></i> None';
    
    // We no longer need to create a dropdown for each thumbnail
    // It will use the global dropdown
    
    effectsContainer.appendChild(effectsButton);
    effectsContainer.appendChild(selectedEffect);
    
    thumbnailInfo.appendChild(fileName);
    thumbnailInfo.appendChild(fileSize);
    thumbnailInfo.appendChild(pathInput); // Add the hidden path input
    thumbnailInfo.appendChild(durationContainer);
    thumbnailInfo.appendChild(effectsContainer);
    
    thumbnailItem.appendChild(thumbnailIndex);
    thumbnailItem.appendChild(thumbnail);
    thumbnailItem.appendChild(thumbnailInfo);
    
    // If there's already at least one item in the list, add transition element before this one
    if (thumbnailList.children.length > 0) {
        const transitionsContainer = createTransitionsElement();
        thumbnailList.appendChild(transitionsContainer);
    }
    
    thumbnailList.appendChild(thumbnailItem);
    console.log('Thumbnail added to list');
    
    // Add drag event listeners
    setupDragListeners(thumbnailItem);
    
    // Update the total duration
    updateTotalDuration();
}
