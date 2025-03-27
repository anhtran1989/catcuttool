// Tab switching functionality
// Global variable to store current project
let currentProject = {
    name: '',
    path: ''
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Project creation functionality
    const projectNameInput = document.getElementById('project-name');
    const defaultPathInput = document.getElementById('default-path');
    const targetPathInput = document.getElementById('target-path');
    const createProjectButton = document.getElementById('create-project-button');
    const browseDefaultPathButton = document.getElementById('browse-default-path');
    const browseTargetPathButton = document.getElementById('browse-target-path');
    
    // Function to handle project creation
    createProjectButton.addEventListener('click', function() {
        const projectName = projectNameInput.value.trim();
        if (!projectName) {
            alert('Please enter a project name');
            return;
        }
        
        const defaultPath = defaultPathInput.value;
        const targetPath = targetPathInput.value;
        
        // Save the current project info
        currentProject.name = projectName;
        
        // Use proper path separator based on platform
        if (window.electron && window.electron.getPlatform() === 'win32') {
            // For Windows, use backslash separator
            currentProject.path = targetPath + '\\' + projectName;
        } else {
            // For other platforms, use forward slash
            currentProject.path = targetPath + '/' + projectName;
        }
        
        console.log('Project created - Name:', currentProject.name, 'Path:', currentProject.path);
        
        // Check if the paths exist
        if (window.electron) {
            createCapcutProject(projectName, defaultPath, targetPath);
        } else {
            alert('This feature requires Electron to work with the file system. Running in browser mode for demo purposes.');
            // Mock success for browser testing
            showNotification('Project created successfully!', 'success');
        }
    });
    
    // Function to browse for folders - default path
    browseDefaultPathButton.addEventListener('click', function() {
        if (window.electron) {
            window.electron.send('select-folder', { inputId: 'default-path' });
        } else {
            alert('This feature requires Electron to work with the file system.');
        }
    });
    
    // Function to browse for folders - target path
    browseTargetPathButton.addEventListener('click', function() {
        if (window.electron) {
            window.electron.send('select-folder', { inputId: 'target-path' });
        } else {
            alert('This feature requires Electron to work with the file system.');
        }
    });
    
    // Listen for folder selection results
    if (window.electron) {
        window.electron.receive('folder-selected', function(data) {
            const { path, inputId } = data;
            document.getElementById(inputId).value = path;
        });
        
        window.electron.receive('project-created', function(data) {
            const { success, message } = data;
            if (success) {
                showNotification(message, 'success');
                projectNameInput.value = ''; // Clear the project name after successful creation
            } else {
                showNotification(message, 'error');
            }
        });
        
        window.electron.receive('save-file-result', function(data) {
            const { success, message } = data;
            if (success) {
                showNotification(message, 'success');
            } else {
                showNotification(message, 'error');
            }
        });
    }
    
    // Initialize dropdown manager
    DropdownManager.init();
    
    // Create global effects dropdown
    createGlobalEffectsDropdown();
    
    // Create global transitions dropdown
    createGlobalTransitionsDropdown();
    
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
    
    // Khởi tạo tất cả các thuộc tính mặc định cho transition
    selectedTransition.dataset.effectId = '';
    selectedTransition.dataset.isOverlap = 'false';
    selectedTransition.dataset.duration = '0';
    selectedTransition.dataset.categoryId = '';
    selectedTransition.dataset.categoryName = '';
    selectedTransition.dataset.path = '';
    selectedTransition.dataset.platform = '';
    selectedTransition.dataset.resourceId = '';
    selectedTransition.dataset.sourcePlatform = '0';
    
    // Create transitions dropdown (we'll use the global one instead)
    const transitionsDropdown = document.createElement('div');
    transitionsDropdown.className = 'transitions-dropdown';
    
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
    
    // Define effect options - chỉ sử dụng những effect thực sự tồn tại trong file JSON
    const effectOptions = [
        { name: 'None', icon: 'fas fa-ban' },
        { name: 'Lật Zoom', icon: 'fas fa-arrows-alt', effect_id: '7395465413527899398' },
        { name: 'Làm mờ bùng nổ', icon: 'fas fa-bomb', effect_id: '7399465788387773701' },
        { name: 'Lắc lư', icon: 'fas fa-random', effect_id: '7399467327726587141' },
        { name: 'Màn hình 3D', icon: 'fas fa-cube', effect_id: '7436469103449084432' },
        { name: 'Chuyển động máy ảnh', icon: 'fas fa-video', effect_id: '7399472023874948357' },
        { name: 'Cuộn ngang', icon: 'fas fa-arrows-alt-h', effect_id: '7442287977864106497' },
        { name: 'Tình yêu mờ nhạt', icon: 'fas fa-heart', effect_id: '7399470509722815750' },
        { name: 'Nét truyện tranh', icon: 'fas fa-pencil-alt', effect_id: '7462247315059789117' },
        { name: 'Theo dõi bắn', icon: 'fas fa-bullseye', effect_id: '7399471976714128645' },
        { name: 'Mở ngược', icon: 'fas fa-undo', effect_id: '7399471215905082630' },
        { name: 'Tuyết vàng', icon: 'fas fa-snowflake', effect_id: '7445221319781650945' },
        { name: 'Trái tim bung nở', icon: 'fas fa-heartbeat', effect_id: '7448891008441405953' },
        { name: 'Lóe sáng chớp nảy', icon: 'fas fa-bolt', effect_id: '7399464712909507846' },
        { name: 'Phim', icon: 'fas fa-film', effect_id: '7399471460445621509' },
        { name: 'Điểm lục giác', icon: 'fas fa-stop', effect_id: '7399466433782058245' },
        { name: 'Lăng kính đá quý', icon: 'fas fa-gem', effect_id: '7446312093990523408' },
        { name: 'Bụi rơi', icon: 'fas fa-feather', effect_id: '7456798559417930257' },
        { name: 'Đèn nhấp nháy theo nhịp', icon: 'fas fa-lightbulb', effect_id: '7399470385282026758' },
        { name: 'Đèn nháy', icon: 'fas fa-lightbulb', effect_id: '7463254687957912893' },
        { name: 'Bám sát đối tượng 2', icon: 'fas fa-crosshairs', effect_id: '7399467027066375429' },
        { name: 'Vở kịch Giáng Sinh', icon: 'fas fa-snowman', effect_id: '7450046927875346960' },
        { name: 'Lũ quét qua', icon: 'fas fa-water', effect_id: '7395468013832523014' },
        { name: 'S-Movement', icon: 'fas fa-wave-square', effect_id: '7399471490363608325' },
        { name: 'Cười lên', icon: 'fas fa-smile', effect_id: '7442284470150894081' },
        { name: 'Chớp mắt mở', icon: 'fas fa-eye', effect_id: '7395467471026785541' },
        { name: 'Đèn flash chéo', icon: 'fas fa-bolt', effect_id: '7399471479596895494' },
        { name: 'Tia sáng kéo dài', icon: 'fas fa-sun', effect_id: '7399466235026509061' },
        { name: 'Sóng xung kích', icon: 'fas fa-broadcast-tower', effect_id: '7395471053717277957' },
        { name: 'Lấp lánh 2', icon: 'fas fa-star', effect_id: '7399466236188380421' },
        { name: 'Trục trặc pixel', icon: 'fas fa-th', effect_id: '7399464859097730309' },
        { name: 'Làm mờ ảo diệu', icon: 'fas fa-magic', effect_id: '7395468812021157126' },
        { name: 'Phóng to phơi sáng', icon: 'fas fa-expand', effect_id: '7395473374673259782' }
    ];
    
    // Add effect options to the dropdown
    effectOptions.forEach(option => {
        const effectOption = document.createElement('div');
        effectOption.className = 'effect-option';
        effectOption.innerHTML = `<i class="${option.icon}"></i> ${option.name}`;
        effectOption.dataset.name = option.name;
        effectOption.dataset.icon = option.icon;
        effectOption.dataset.effectId = option.effect_id || '';
        effectOption.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (currentSelectedEffect) {
                // Update the selected effect display
                const optionName = this.dataset.name;
                const iconClass = this.dataset.icon;
                currentSelectedEffect.innerHTML = `<i class="${iconClass}"></i> ${optionName}`;
                currentSelectedEffect.dataset.effectId = this.dataset.effectId || '';
                
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
    const currentEffectId = selectedEffect.dataset.effectId || '';
    console.log('Current effect name:', currentEffectName);
    
    const options = globalEffectsDropdown.querySelectorAll('.effect-option');
    options.forEach(option => {
        const optionName = option.dataset.name;
        const optionEffectId = option.dataset.effectId || '';
        
        // Mark as selected if name matches or if effect_id matches (when available)
        const isSelected = optionName === currentEffectName || 
                          (currentEffectId && optionEffectId === currentEffectId);
        
        option.classList.toggle('selected', isSelected);
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
    // Keep track of which option was clicked
    const optionName = option.textContent.trim().replace(/^\S+\s+/, '');
    
    // Update the display with icon
    const iconClass = option.querySelector('i').className;
    selectedElement.innerHTML = `<i class="${iconClass}"></i> ${optionName}`;
    
    // Cập nhật tất cả thông tin transition vào selected element
    selectedElement.dataset.effectId = option.dataset.effectId || '';
    selectedElement.dataset.isOverlap = option.dataset.isOverlap || 'false';
    selectedElement.dataset.duration = option.dataset.duration || '0';
    selectedElement.dataset.categoryId = option.dataset.categoryId || '';
    selectedElement.dataset.categoryName = option.dataset.categoryName || '';
    selectedElement.dataset.path = option.dataset.path || '';
    selectedElement.dataset.platform = option.dataset.platform || '';
    selectedElement.dataset.resourceId = option.dataset.resourceId || '';
    selectedElement.dataset.sourcePlatform = option.dataset.sourcePlatform || '0';
    
    // Highlight selected option for visual feedback
    const allOptions = option.parentNode.querySelectorAll('.effect-option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    
    // Wait a moment before closing the dropdown for better visual feedback
    setTimeout(() => {
        hideTransitionsDropdown();
    }, 150);
}

// Function to select an effect
function selectEffect(option, selectedElement) {
    // Keep track of which option was clicked
    const optionName = option.textContent.trim().replace(/^\S+\s+/, '');
    
    // Update the display with icon
    const iconClass = option.querySelector('i').className;
    selectedElement.innerHTML = `<i class="${iconClass}"></i> ${optionName}`;
    
    // Lưu trữ effect ID và các thuộc tính khác
    selectedElement.dataset.effectId = option.dataset.effectId || '';
    
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
        'Lật Zoom': '7395465413527899398',
        'Làm mờ bùng nổ': '7399465788387773701',
        'Lắc lư': '7399467327726587141',
        'Màn hình 3D': '7436469103449084432',
        'Chuyển động máy ảnh': '7399472023874948357',
        'Cuộn ngang': '7442287977864106497',
        'Tình yêu mờ nhạt': '7399470509722815750',
        'Nét truyện tranh': '7462247315059789117',
        'Theo dõi bắn': '7399471976714128645',
        'Mở ngược': '7399471215905082630',
        'Tuyết vàng': '7445221319781650945',
        'Trái tim bung nở': '7448891008441405953',
        'Lóe sáng chớp nảy': '7399464712909507846',
        'Phim': '7399471460445621509',
        'Điểm lục giác': '7399466433782058245',
        'Lăng kính đá quý': '7446312093990523408',
        'Bụi rơi': '7456798559417930257',
        'Đèn nhấp nháy theo nhịp': '7399470385282026758',
        'Đèn nháy': '7463254687957912893',
        'Bám sát đối tượng 2': '7399467027066375429',
        'Vở kịch Giáng Sinh': '7450046927875346960',
        'Lũ quét qua': '7395468013832523014',
        'S-Movement': '7399471490363608325',
        'Cười lên': '7442284470150894081',
        'Chớp mắt mở': '7395467471026785541',
        'Đèn flash chéo': '7399471479596895494',
        'Tia sáng kéo dài': '7399466235026509061',
        'Sóng xung kích': '7395471053717277957',
        'Lấp lánh 2': '7399466236188380421',
        'Trục trặc pixel': '7399464859097730309',
        'Làm mờ ảo diệu': '7395468812021157126',
        'Phóng to phơi sáng': '7395473374673259782'
    },
    
    // Icon mapping for transitions
    transitionIcons: {
        'Cut': 'fas fa-cut',
        'Giảm dần zoom': 'fas fa-search-minus',
        'Tín hiệu trục trặc 2': 'fas fa-bolt',
        'Ba lát': 'fas fa-th',
        'Lấp lánh': 'fas fa-star',
        'Thổi ra': 'fas fa-expand-arrows-alt',
        'Trượt xuống': 'fas fa-arrow-down'
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
    
    // Get the draft_content_effect.json first to have access to the effect details
    fetch('draft_content_effect.json')
        .then(response => response.json())
        .then(effectTemplateData => {
            // Now get the default template
            fetch('draft_content_default.json')
                .then(response => response.json())
                .then(templateData => {
                    // Create a deep copy of the template
                    const capcutData = JSON.parse(JSON.stringify(templateData));
                    
                    // Create a map of effect IDs to their full configurations from the effect template
                    const effectsMap = {};
                    if (effectTemplateData && effectTemplateData.materials && effectTemplateData.materials.video_effects) {
                        effectTemplateData.materials.video_effects.forEach(effect => {
                            effectsMap[effect.effect_id] = effect;
                        });
                    }
                    
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
                        
                        // Get the effect details
                        const effectElement = item.querySelector('.selected-effect');
                        // Extract effect name and ID from the element
                        let effectName = 'None';
                        let effectId = null;
                        if (effectElement) {
                            // Remove the icon part and get just the name
                            effectName = effectElement.textContent.trim().replace(/^\S+\s+/, '');
                            // Get effect ID directly from the element's dataset
                            effectId = effectElement.dataset.effectId || null;
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
                        let transition = null;
                        if (index < thumbnails.length - 1) {
                            const transitionElement = transitionElements[index];
                            if (transitionElement) {
                                const selectedTransitionElement = transitionElement.querySelector('.selected-transition');
                                if (selectedTransitionElement) {
                                    // Lấy đầy đủ thông tin về transition
                                    transition = {
                                        name: selectedTransitionElement.textContent.trim().replace(/^\S+\s+/, ''),
                                        effect_id: selectedTransitionElement.dataset.effectId || null,
                                        is_overlap: selectedTransitionElement.dataset.isOverlap === 'true',
                                        duration: parseInt(selectedTransitionElement.dataset.duration) || 0,
                                        category_id: selectedTransitionElement.dataset.categoryId || "",
                                        category_name: selectedTransitionElement.dataset.categoryName || "",
                                        path: selectedTransitionElement.dataset.path || "",
                                        platform: selectedTransitionElement.dataset.platform || "",
                                        resource_id: selectedTransitionElement.dataset.resourceId || "",
                                        source_platform: parseInt(selectedTransitionElement.dataset.sourcePlatform) || 0
                                    };
                                }
                            }
                        }
                        
                        mediaItems.push({
                            fileName: fileName,
                            isVideo: !!video,
                            filePath: filePath,
                            duration: duration,
                            effectName: effectName,
                            effectId: effectId,
                            transition: transition
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
                        if (item.transition && item.transition.name !== 'Cut' && index < mediaItems.length - 1) {
                            const transitionId = generateUUID();
                            
                            // Sử dụng tất cả thông tin transition đã lưu trữ
                            const transition = item.transition;
                            
                            if (transition && transition.effect_id) {
                                capcutData.materials.transitions.push({
                                    id: transitionId,
                                    effect_id: transition.effect_id,
                                    duration: transition.duration,
                                    name: transition.name,
                                    is_overlap: transition.is_overlap,
                                    path: transition.path,
                                    platform: transition.platform,
                                    category_id: transition.category_id,
                                    category_name: transition.category_name,
                                    resource_id: transition.resource_id,
                                    source_platform: transition.source_platform,
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
                        if (item.effectName && item.effectName !== 'None' && item.effectId) {
                            const effectId = generateUUID();
                            
                            // Get the full effect details from the effect template
                            const templateEffect = effectsMap[item.effectId];
                            
                            if (templateEffect) {
                                // Clone the effect from the template and use the new ID
                                const effectClone = JSON.parse(JSON.stringify(templateEffect));
                                effectClone.id = effectId;
                                
                                // Add to the materials
                                capcutData.materials.video_effects.push(effectClone);
                            } else {
                                // Fallback if effect not found in template
                                capcutData.materials.video_effects.push({
                                    id: effectId,
                                    effect_id: item.effectId,
                                    name: item.effectName,
                                    type: "video_effect",
                                    category_id: "27296",
                                    category_name: "Đang thịnh hành",
                                    adjust_params: [
                                        { name: "effects_adjust_speed", default_value: 0.33, value: 0.33 },
                                        { name: "effects_adjust_intensity", default_value: 0.6, value: 0.6 },
                                        { name: "effects_adjust_luminance", default_value: 0.5, value: 0.5 },
                                        { name: "effects_adjust_blur", default_value: 0.5, value: 0.5 },
                                        { name: "effects_adjust_sharpen", default_value: 0.4, value: 0.4 },
                                        { name: "effects_adjust_color", default_value: 0.5, value: 0.5 },
                                        { name: "effects_adjust_background_animation", default_value: 0.5, value: 0.5 }
                                    ],
                                    apply_target_type: 2,
                                    algorithm_artifact_path: "",
                                    enable_mask: true,
                                    covering_relation_change: 0,
                                    platform: "all",
                                    render_index: 0,
                                    request_id: "20250326081840BAF4C832F66D08BA0105",
                                    resource_id: item.effectId,
                                    source_platform: 1,
                                    value: 1.0,
                                    version: ""
                                });
                            }
                            idMap.videoEffects.push(effectId);
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
                                    render_index: 11000 + index,
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
                    
                    // Download the JSON file or save it to the project folder
                    const jsonString = JSON.stringify(capcutData);
                    
                    console.log('Current project state when exporting:', JSON.stringify(currentProject));
                    
                    if (window.electron && currentProject.name) {
                        // In Electron mode, save the file to the project folder
                        console.log('Exporting to project folder:', currentProject.path);
                        
                        // Ensure path is properly formatted
                        let projectPath = currentProject.path;
                        // Remove double backslashes and use single backslashes for Windows paths
                        if (window.electron.getPlatform() === 'win32') {
                            projectPath = projectPath.replace(/\\\\/g, '\\');
                        }
                        
                        window.electron.send('save-project-file', {
                            projectPath: projectPath,
                            fileName: 'draft_content.json',
                            content: jsonString
                        });
                        // Show immediate notification (will be updated when we get response from main process)
                        showNotification('Exporting to project folder...', 'info');
                    } else {
                        // In browser mode, download the file
                        const blob = new Blob([jsonString], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'draft_content.json'; // Changed to match requested filename
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        alert('File exported successfully! Import it to CapCut to use your template.');
                    }
                })
                .catch(error => {
                    console.error('Error loading default template:', error);
                    alert('Error creating CapCut file. Please make sure draft_content_default.json exists.');
                });
        })
        .catch(error => {
            console.error('Error loading effect template:', error);
            alert('Error loading effects template. Please make sure draft_content_effect.json exists.');
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

// Global variables for transitions dropdown
let globalTransitionsDropdown = null;
let currentTransitionButton = null;
let currentSelectedTransition = null;
let currentTransitionThumbnailItem = null;

// Function to create a single global transitions dropdown
function createGlobalTransitionsDropdown() {
    // Remove any existing global dropdown
    if (document.getElementById('global-transitions-dropdown')) {
        document.getElementById('global-transitions-dropdown').remove();
    }
    
    // Create the dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'global-transitions-dropdown';
    dropdown.className = 'transitions-dropdown effects-dropdown'; // Using effects-dropdown style
    
    // Define transition options with full details from draft_content_transition.json
    const transitionOptions = [
        { 
            name: 'Cut', 
            icon: 'fas fa-cut', 
            effect_id: null,
            is_overlap: false,
            duration: 0,
            category_id: "",
            category_name: "",
            path: "",
            platform: "",
            resource_id: "",
            source_platform: 0
        },
        { 
            name: 'Giảm dần zoom', 
            icon: 'fas fa-search-minus', 
            effect_id: '7262258307128103425',
            is_overlap: true,
            duration: 800000,
            category_id: "25835",
            category_name: "Đang thịnh hành",
            path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7262258307128103425/e4cafc076ecab223a39a26fe6f05b6db",
            platform: "all",
            resource_id: "7262258307128103425",
            source_platform: 1
        },
        { 
            name: 'Tín hiệu trục trặc 2', 
            icon: 'fas fa-bolt', 
            effect_id: '7343854374147330562',
            is_overlap: false,
            duration: 666666,
            category_id: "25835",
            category_name: "Đang thịnh hành",
            path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7343854374147330562/bc6d04c47df8aa910544fdf657419ab7",
            platform: "all",
            resource_id: "7343854374147330562",
            source_platform: 1
        },
        { 
            name: 'Ba lát', 
            icon: 'fas fa-th', 
            effect_id: '7252631917437129218',
            is_overlap: true,
            duration: 800000,
            category_id: "25835",
            category_name: "Đang thịnh hành",
            path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7252631917437129218/e47aeeef97032d11bf767bd290881da4",
            platform: "all",
            resource_id: "7252631917437129218",
            source_platform: 1
        },
        { 
            name: 'Lấp lánh', 
            icon: 'fas fa-star', 
            effect_id: '7361758943661527569',
            is_overlap: true,
            duration: 933333,
            category_id: "25835",
            category_name: "Đang thịnh hành",
            path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7361758943661527569/da913924bc6975821de103b371d540ff",
            platform: "all",
            resource_id: "7361758943661527569",
            source_platform: 1
        },
        { 
            name: 'Thổi ra', 
            icon: 'fas fa-expand-arrows-alt', 
            effect_id: '7362947185249358353',
            is_overlap: true,
            duration: 800000,
            category_id: "25835",
            category_name: "Đang thịnh hành",
            path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7362947185249358353/9d6a02b47846369cec6d19a35826570d",
            platform: "all",
            resource_id: "7362947185249358353",
            source_platform: 1
        },
        { 
            name: 'Trượt xuống', 
            icon: 'fas fa-arrow-down', 
            effect_id: '7309454269982183938',
            is_overlap: true,
            duration: 533333,
            category_id: "25835",
            category_name: "Đang thịnh hành",
            path: "C:/Users/ADMIN/AppData/Local/CapCut/User Data/Cache/effect/7309454269982183938/9c54ccb7b27ab98f7c3bb03a5d4acc4b",
            platform: "all",
            resource_id: "7309454269982183938",
            source_platform: 1
        }
    ];
    
    // Add transition options to the dropdown
    transitionOptions.forEach(option => {
        const transitionOption = document.createElement('div');
        transitionOption.className = 'effect-option'; // Using effect-option style
        transitionOption.innerHTML = `<i class="${option.icon}"></i> ${option.name}`;
        
        // Lưu trữ đầy đủ thông tin cho mỗi transition
        transitionOption.dataset.name = option.name;
        transitionOption.dataset.icon = option.icon;
        transitionOption.dataset.effectId = option.effect_id || '';
        transitionOption.dataset.isOverlap = option.is_overlap;
        transitionOption.dataset.duration = option.duration;
        transitionOption.dataset.categoryId = option.category_id;
        transitionOption.dataset.categoryName = option.category_name;
        transitionOption.dataset.path = option.path;
        transitionOption.dataset.platform = option.platform;
        transitionOption.dataset.resourceId = option.resource_id;
        transitionOption.dataset.sourcePlatform = option.source_platform;
        
        transitionOption.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (currentSelectedTransition) {
                // Update the selected transition display
                const optionName = this.dataset.name;
                const iconClass = this.dataset.icon;
                currentSelectedTransition.innerHTML = `<i class="${iconClass}"></i> ${optionName}`;
                
                // Lưu tất cả thông tin transition vào selected element
                currentSelectedTransition.dataset.effectId = this.dataset.effectId;
                currentSelectedTransition.dataset.isOverlap = this.dataset.isOverlap;
                currentSelectedTransition.dataset.duration = this.dataset.duration;
                currentSelectedTransition.dataset.categoryId = this.dataset.categoryId;
                currentSelectedTransition.dataset.categoryName = this.dataset.categoryName;
                currentSelectedTransition.dataset.path = this.dataset.path;
                currentSelectedTransition.dataset.platform = this.dataset.platform;
                currentSelectedTransition.dataset.resourceId = this.dataset.resourceId;
                currentSelectedTransition.dataset.sourcePlatform = this.dataset.sourcePlatform;
                
                // Close the dropdown
                hideTransitionsDropdown();
            }
        };
        dropdown.appendChild(transitionOption);
    });
    
    // Add the dropdown to the document body
    document.body.appendChild(dropdown);
    
    // Store the dropdown for later use
    globalTransitionsDropdown = dropdown;
    
    // Add global click listener to hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (globalTransitionsDropdown && globalTransitionsDropdown.classList.contains('show')) {
            // If click is outside the dropdown and not on the current transitions button
            if (!globalTransitionsDropdown.contains(e.target) && 
                (!currentTransitionButton || !currentTransitionButton.contains(e.target))) {
                hideTransitionsDropdown();
            }
        }
    });
    
    // Add scroll listener to reposition or hide dropdown
    window.addEventListener('scroll', function() {
        if (globalTransitionsDropdown && globalTransitionsDropdown.classList.contains('show')) {
            if (currentTransitionThumbnailItem && currentTransitionButton) {
                const thumbnailRect = currentTransitionThumbnailItem.getBoundingClientRect();
                
                // If thumbnail is no longer visible, hide the dropdown
                if (thumbnailRect.bottom < 0 || thumbnailRect.top > window.innerHeight ||
                    thumbnailRect.right < 0 || thumbnailRect.left > window.innerWidth) {
                    hideTransitionsDropdown();
                } else {
                    // Update position
                    positionTransitionsDropdown(currentTransitionThumbnailItem);
                }
            }
        }
    });
    
    // Add resize listener
    window.addEventListener('resize', function() {
        if (globalTransitionsDropdown && globalTransitionsDropdown.classList.contains('show')) {
            if (currentTransitionThumbnailItem) {
                positionTransitionsDropdown(currentTransitionThumbnailItem);
            }
        }
    });
    
    return dropdown;
}

// Function to show the transitions dropdown for a specific transition
function showTransitionsDropdown(button) {
    // Get the transition container
    const transitionsContainer = button.closest('.transitions-container');
    const selectedTransition = transitionsContainer.querySelector('.selected-transition');
    const thumbnailItem = transitionsContainer.parentElement;
    
    // Update global references
    currentTransitionThumbnailItem = thumbnailItem;
    currentTransitionButton = button;
    currentSelectedTransition = selectedTransition;
    
    // Make sure we have the global dropdown
    if (!globalTransitionsDropdown) {
        globalTransitionsDropdown = createGlobalTransitionsDropdown();
    }
    
    // Update the selected state in dropdown
    const currentTransitionName = selectedTransition.textContent.trim().replace(/^\S+\s+/, '');
    const currentEffectId = selectedTransition.dataset.effectId || '';
    
    const options = globalTransitionsDropdown.querySelectorAll('.effect-option');
    options.forEach(option => {
        const optionName = option.dataset.name;
        const optionEffectId = option.dataset.effectId || '';
        
        // Mark as selected if name matches or if effect_id matches (when available)
        const isSelected = optionName === currentTransitionName || 
                          (currentEffectId && optionEffectId === currentEffectId);
        
        option.classList.toggle('selected', isSelected);
    });
    
    // Position and show the dropdown
    positionTransitionsDropdown(transitionsContainer);
    globalTransitionsDropdown.classList.add('show');
}

// Function to hide the transitions dropdown
function hideTransitionsDropdown() {
    if (globalTransitionsDropdown) {
        globalTransitionsDropdown.classList.remove('show');
    }
    
    // Clear references
    currentTransitionThumbnailItem = null;
    currentTransitionButton = null;
    currentSelectedTransition = null;
}

// Function to position the transitions dropdown over a transition container
function positionTransitionsDropdown(transitionsContainer) {
    if (!globalTransitionsDropdown) return;
    
    const containerRect = transitionsContainer.getBoundingClientRect();
    
    // Style the dropdown
    globalTransitionsDropdown.style.position = 'fixed';
    globalTransitionsDropdown.style.zIndex = '10000';
    globalTransitionsDropdown.style.width = '250px';
    globalTransitionsDropdown.style.maxHeight = '350px';
    
    // Position to the right of the transition container
    globalTransitionsDropdown.style.left = (containerRect.right + 10) + 'px';
    globalTransitionsDropdown.style.top = containerRect.top + 'px';
    
    // Check if dropdown would go off-screen to the right
    const dropdownRect = globalTransitionsDropdown.getBoundingClientRect();
    if (dropdownRect.right > window.innerWidth) {
        // Position to the left of the transition container
        globalTransitionsDropdown.style.left = (containerRect.left - dropdownRect.width - 10) + 'px';
    }
    
    // Check if dropdown would go off-screen at the bottom
    if (dropdownRect.bottom > window.innerHeight) {
        globalTransitionsDropdown.style.top = (window.innerHeight - dropdownRect.height - 10) + 'px';
    }
}

// Function to toggle transitions dropdown
function toggleTransitionsDropdown(button) {
    // Check if this button's dropdown is already shown
    if (currentTransitionButton === button && globalTransitionsDropdown && 
        globalTransitionsDropdown.classList.contains('show')) {
        // If already open, close it
        hideTransitionsDropdown();
    } else {
        // Close effects dropdowns
        document.querySelectorAll('.effects-dropdown.show').forEach(item => {
            if (item.id !== 'global-transitions-dropdown') {
                item.classList.remove('show');
            }
        });
        
        // Hide effects dropdown if it's open
        if (globalEffectsDropdown && globalEffectsDropdown.classList.contains('show')) {
            hideEffectsDropdown();
        }
        
        // Show this dropdown
        showTransitionsDropdown(button);
    }
}

// Function to create CapCut project - clones the default folder to target location
function createCapcutProject(projectName, defaultPath, targetPath) {
    console.log(`Creating project: ${projectName}, from: ${defaultPath}, to: ${targetPath}`);
    
    // Send request to Electron to create the project
    window.electron.send('create-project', {
        projectName: projectName,
        defaultPath: defaultPath,
        targetPath: targetPath
    });
}

// Function to show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(notification);
    });
    
    notification.appendChild(closeBtn);
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 5000);
}
