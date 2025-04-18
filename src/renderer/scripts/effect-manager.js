/**
 * Effect Manager - Qu·∫£n l√Ω v√† c·∫≠p nh·∫≠t danh s√°ch effects
 * 
 * C·∫•u tr√∫c c·ªßa m·ªói effect trong CapCut c·∫ßn c√≥ c√°c thu·ªôc t√≠nh:
 * - id: M·ªôt chu·ªói UUID duy nh·∫•t cho m·ªói effect
 * - name: T√™n c·ªßa effect
 * - type: Lo·∫°i effect (th∆∞·ªùng l√† "video_effect")
 * - category_name: T√™n danh m·ª•c c·ªßa effect
 * - effect_id: ID c·ªßa effect trong h·ªá th·ªëng CapCut
 * - path: ƒê∆∞·ªùng d·∫´n ƒë·∫øn file effect
 * - adjust_params: C√°c tham s·ªë ƒëi·ªÅu ch·ªânh c·ªßa effect
 */
const EffectManager = (function() {
  // Danh s√°ch c√°c effects ƒë√£ ƒë∆∞·ª£c l∆∞u
  let effects = [];
  
  // M·∫´u c·∫•u tr√∫c track hi·ªáu ·ª©ng t·ª´ draft_content_effect.json
  const effectTrackTemplate = {
    attribute: 0,
    flag: 0,
    id: "", // S·∫Ω ƒë∆∞·ª£c t·∫°o ƒë·ªông
    is_default_name: true,
    name: "",
    segments: [], // S·∫Ω ƒë∆∞·ª£c ƒëi·ªÅn ƒë·ªông
    type: "effect"
  };
  
  // M·∫´u c·∫•u tr√∫c segment hi·ªáu ·ª©ng d·ª±a tr√™n c·∫•u tr√∫c trong draft_content_effect.json
  const effectSegmentTemplate = {
    caption_info: null,
    cartoon: false,
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
    },
    color_correct_alg_result: "",
    common_keyframes: [],
    desc: "",
    digital_human_template_group_id: "",
    enable_adjust: false,
    enable_adjust_mask: false,
    enable_color_correct_adjust: false,
    enable_color_curves: true,
    enable_color_match_adjust: false,
    enable_color_wheels: true,
    enable_hsl: false,
    enable_lut: false,
    enable_smart_color_adjust: false,
    enable_video_mask: true,
    extra_material_refs: [],
    group_id: "",
    hdr_settings: {
      intensity: 1.0,
      mode: 1,
      nits: 1000
    },
    id: "", // S·∫Ω ƒë∆∞·ª£c t·∫°o ƒë·ªông
    intensifies_audio: false,
    is_loop: false,
    is_placeholder: false,
    is_tone_modify: false,
    keyframe_refs: [],
    last_nonzero_volume: 1.0,
    lyric_keyframes: null,
    material_id: "", // ID c·ªßa effect
    raw_segment_id: "",
    render_index: 11000, // B·∫Øt ƒë·∫ßu t·ª´ 11000 v√† tƒÉng d·∫ßn
    render_timerange: {
      duration: 0,
      start: 0
    },
    responsive_layout: {
      enable: false,
      horizontal_pos_layout: 0,
      size_layout: 0,
      target_follow: "",
      vertical_pos_layout: 0
    },
    reverse: false,
    source_timerange: null,
    speed: 1.0,
    state: 0,
    target_timerange: {
      duration: 3000000, // 3 gi√¢y
      start: 0 // S·∫Ω ƒë∆∞·ª£c ƒëi·ªÅu ch·ªânh d·ª±a tr√™n v·ªã tr√≠
    },
    template_id: "",
    template_scene: "default",
    track_attribute: 0,
    track_render_index: 1,
    uniform_scale: {
      on: true,
      value: 1.0
    },
    visible: true,
    volume: 1.0
  };
  
  /**
   * Kh·ªüi t·∫°o EffectManager
   */
  function init() {
    console.log("Initializing EffectManager");
    
    // Kh·ªüi t·∫°o danh s√°ch effects v·ªõi effect "None"
    effects = [{
      id: "none",
      name: "None",
      type: "video_effect",
      icon: "fas fa-ban"
    }];
    
    // T·∫£i effects t·ª´ file draft_content_effect.json
    loadEffectsFromDraftContent();
  }
  
  /**
   * T·∫£i file draft_content_2.json v√† c·∫≠p nh·∫≠t danh s√°ch hi·ªáu ·ª©ng
   */
  function loadEffectsFromDraftContent() {
    try {
      console.log("Loading effects from draft_content_2.json");
      
      // Th·ª≠ ƒë·ªçc file b·∫±ng fetch API
      fetch('./draft_content_2.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          // C·∫≠p nh·∫≠t effects t·ª´ file
          updateFromDraftContent(data);
          console.log("Effects updated from draft_content_2.json");
        })
        .catch(error => {
          console.warn("Could not load draft_content_2.json:", error);
          // Th·ª≠ ƒë·ªçc file b·∫±ng Electron API n·∫øu c√≥
          if (window.electron && window.electron.readJsonFile) {
            console.log("Trying to load with Electron API");
            window.electron.readJsonFile('draft_content_2.json')
              .then(data => {
                updateFromDraftContent(data);
                console.log("Effects updated from draft_content_2.json using Electron API");
              })
              .catch(error => {
                console.warn("Could not load draft_content_2.json with Electron API:", error);
                
                // N·∫øu kh√¥ng t√¨m th·∫•y draft_content_2.json, th·ª≠ v·ªõi draft_content_effect.json
                console.log("Trying to load draft_content_effect.json as fallback");
                window.electron.readJsonFile('draft_content_effect.json')
                  .then(data => {
                    updateFromDraftContent(data);
                    console.log("Effects updated from draft_content_effect.json as fallback");
                  })
                  .catch(fallbackError => {
                    console.warn("Could not load any effect file:", fallbackError);
                  });
              });
          }
        });
    } catch (error) {
      console.error("Error in loadEffectsFromDraftContent:", error);
    }
  }
  
  /**
   * C·∫≠p nh·∫≠t danh s√°ch effects t·ª´ file draft_content_2.json
   * @param {Object} draftContent N·ªôi dung c·ªßa file draft_content_2.json
   */
  function updateFromDraftContent(draftContent) {
    try {
      console.log("Starting to update effects from draft content");
      
      // Ki·ªÉm tra c·∫•u tr√∫c c·ªßa draft content
      if (!draftContent) {
        console.error("Draft content is null or undefined");
        return;
      }
      
      // Kh·ªüi t·∫°o m·∫£ng effects v·ªõi effect "None"
      effects = [{
        id: "none",
        name: "None",
        type: "video_effect",
        icon: "fas fa-ban"
      }];
      
      // T√¨m hi·ªáu ·ª©ng trong materials.video_effects
      if (draftContent.materials && draftContent.materials.video_effects && Array.isArray(draftContent.materials.video_effects)) {
        const videoEffects = draftContent.materials.video_effects;
        console.log(`Found ${videoEffects.length} effects in materials.video_effects`);
        
        // Chuy·ªÉn ƒë·ªïi ƒë·ªãnh d·∫°ng video_effects sang ƒë·ªãnh d·∫°ng n·ªôi b·ªô
        const formattedEffects = videoEffects.map(effect => {
          return {
            id: effect.id,
            name: effect.name,
            type: effect.type,
            effect_id: effect.effect_id || "",
            category_id: effect.category_id || "",
            category_name: effect.category_name || "",
            path: effect.path || "",
            adjust_params: effect.adjust_params || [],
            apply_target_type: effect.apply_target_type || 2,
            enable_mask: effect.enable_mask || true,
            item_effect_type: effect.item_effect_type || 0,
            value: effect.value || 1.0,
            icon: getIconForEffect(effect.name || "")
          };
        });
        
        // Th√™m c√°c effects v√†o danh s√°ch
        effects = effects.concat(formattedEffects);
        console.log(`Added ${formattedEffects.length} effects from materials.video_effects`);
      } else {
        console.log("No effects found in materials.video_effects");
      }
      
      // Ki·ªÉm tra c·∫•u tr√∫c track effect ƒë·ªÉ l·∫•y th√™m th√¥ng tin
      if (draftContent.tracks && Array.isArray(draftContent.tracks)) {
        const effectTracks = draftContent.tracks.filter(track => track.type === "effect");
        if (effectTracks.length > 0) {
          console.log(`Found ${effectTracks.length} effect tracks`);
          
          // L·∫•y th√¥ng tin v·ªÅ th·ªùi gian v√† v·ªã tr√≠ c·ªßa c√°c effects
          effectTracks.forEach(track => {
            if (track.segments && Array.isArray(track.segments)) {
              track.segments.forEach(segment => {
                // T√¨m effect t∆∞∆°ng ·ª©ng trong danh s√°ch ƒë√£ c√≥
                const effectIndex = effects.findIndex(e => e.id === segment.material_id);
                if (effectIndex > 0) { // B·ªè qua effect "None" ·ªü v·ªã tr√≠ 0
                  // C·∫≠p nh·∫≠t th√¥ng tin th·ªùi gian
                  effects[effectIndex].duration = segment.target_timerange.duration;
                  effects[effectIndex].start = segment.target_timerange.start;
                  effects[effectIndex].render_index = segment.render_index;
                  effects[effectIndex].track_render_index = segment.track_render_index;
                  
                  // L∆∞u th√¥ng tin v·ªÅ segment ƒë·ªÉ s·ª≠ d·ª•ng khi export
                  effects[effectIndex].segment = {
                    target_timerange: segment.target_timerange,
                    render_index: segment.render_index,
                    track_render_index: segment.track_render_index
                  };
                }
              });
            }
          });
        }
      }
      
      // N·∫øu kh√¥ng t√¨m th·∫•y effects n√†o, th·ª≠ t√¨m ki·∫øm ƒë·ªá quy
      if (effects.length <= 1) { // Ch·ªâ c√≥ effect "None"
        const foundEffects = findEffectsRecursively(draftContent);
        if (foundEffects.length > 0) {
          console.log(`Found ${foundEffects.length} effects through recursive search`);
          effects = effects.concat(foundEffects);
        }
      }
      
      console.log(`Total effects found: ${effects.length}`);
      
      // In ra danh s√°ch effects ƒë·ªÉ debug
      effects.forEach((effect, index) => {
        console.log(`${index}. ${effect.name} (${effect.id})`);
      });
      
      // C·∫≠p nh·∫≠t giao di·ªán
      updateEffectsUI();
    } catch (error) {
      console.error("Error updating effects from draft content:", error);
    }
  }
  
  /**
   * T√¨m ki·∫øm ƒë·ªá quy c√°c hi·ªáu ·ª©ng trong c·∫•u tr√∫c JSON
   * @param {Object} obj ƒê·ªëi t∆∞·ª£ng JSON c·∫ßn t√¨m ki·∫øm
   * @param {Array} results M·∫£ng k·∫øt qu·∫£ (t√πy ch·ªçn)
   * @returns {Array} M·∫£ng c√°c hi·ªáu ·ª©ng t√¨m th·∫•y
   */
  function findEffectsRecursively(obj, results = []) {
    if (!obj || typeof obj !== 'object') {
      return results;
    }
    
    // Ki·ªÉm tra n·∫øu ƒë·ªëi t∆∞·ª£ng c√≥ v·∫ª nh∆∞ l√† m·ªôt hi·ªáu ·ª©ng
    if (obj.type === 'video_effect' && obj.name && obj.id) {
      results.push({
        id: obj.id,
        name: obj.name,
        type: obj.type,
        effect_id: obj.effect_id || "",
        category_id: obj.category_id || "",
        category_name: obj.category_name || "",
        path: obj.path || "",
        adjust_params: obj.adjust_params || [],
        apply_target_type: obj.apply_target_type || 2,
        enable_mask: obj.enable_mask || true,
        item_effect_type: obj.item_effect_type || 0,
        value: obj.value || 1.0,
        icon: getIconForEffect(obj.name || "")
      });
    }
    
    // T√¨m ki·∫øm trong c√°c m·∫£ng
    if (Array.isArray(obj)) {
      obj.forEach(item => findEffectsRecursively(item, results));
    } else {
      // T√¨m ki·∫øm trong c√°c thu·ªôc t√≠nh c·ªßa ƒë·ªëi t∆∞·ª£ng
      Object.values(obj).forEach(val => {
        if (val && typeof val === 'object') {
          findEffectsRecursively(val, results);
        }
      });
    }
    
    return results;
  }
  
  /**
   * C·∫≠p nh·∫≠t ho·∫∑c th√™m m·ªõi effects v√†o danh s√°ch
   * @param {Array} newEffects Danh s√°ch effects m·ªõi
   */
  function mergeEffects(newEffects) {
    if (!newEffects || !Array.isArray(newEffects) || newEffects.length === 0) {
      console.log("No new effects to merge");
      return;
    }
    
    console.log(`Merging ${newEffects.length} new effects`);
    
    // X√≥a danh s√°ch effects hi·ªán t·∫°i (tr·ª´ effect "None")
    const noneEffect = effects.find(effect => effect.name === "None");
    
    // B·∫Øt ƒë·∫ßu v·ªõi effect "None" n·∫øu c√≥
    let updatedEffects = noneEffect ? [noneEffect] : [];
    
    // Th√™m c√°c effects m·ªõi, lo·∫°i b·ªè tr√πng l·∫∑p
    newEffects.forEach(newEffect => {
      // B·ªè qua n·∫øu l√† effect "None"
      if (newEffect.name === "None") {
        return;
      }
      
      // Ki·ªÉm tra xem effect ƒë√£ t·ªìn t·∫°i ch∆∞a
      const existingIndex = updatedEffects.findIndex(e => e.id === newEffect.id);
      
      if (existingIndex >= 0) {
        // C·∫≠p nh·∫≠t effect ƒë√£ t·ªìn t·∫°i
        updatedEffects[existingIndex] = {
          ...updatedEffects[existingIndex],
          ...newEffect
        };
      } else {
        // Th√™m effect m·ªõi
        updatedEffects.push(newEffect);
      }
    });
    
    // C·∫≠p nh·∫≠t danh s√°ch effects
    effects = updatedEffects;
    
    console.log(`Updated effects list now has ${effects.length} effects`);
  }
  
  /**
   * L·∫•y bi·ªÉu t∆∞·ª£ng ph√π h·ª£p cho effect d·ª±a tr√™n t√™n
   * @param {string} effectName T√™n effect
   * @returns {string} Class c·ªßa bi·ªÉu t∆∞·ª£ng
   */
  function getIconForEffect(effectName) {
    // Chuy·ªÉn ƒë·ªïi t√™n effect th√†nh ch·ªØ th∆∞·ªùng ƒë·ªÉ d·ªÖ so s√°nh
    const name = effectName.toLowerCase();
    
    // Danh s√°ch c√°c bi·ªÉu t∆∞·ª£ng ph√π h·ª£p v·ªõi t·ª´ng lo·∫°i effect
    if (name === "none") return "fas fa-ban";
    if (name.includes("ƒëi·ªÉm") || name.includes("dot")) return "fas fa-dot-circle";
    if (name.includes("m∆∞a") || name.includes("rain")) return "fas fa-cloud-rain";
    if (name.includes("m√†n h√¨nh") || name.includes("screen")) return "fas fa-desktop";
    if (name.includes("blur")) return "fas fa-tint";
    if (name.includes("glow")) return "fas fa-sun";
    if (name.includes("shadow")) return "fas fa-moon";
    if (name.includes("color")) return "fas fa-palette";
    if (name.includes("bright")) return "fas fa-lightbulb";
    if (name.includes("contrast")) return "fas fa-adjust";
    if (name.includes("saturation")) return "fas fa-fill-drip";
    if (name.includes("zoom")) return "fas fa-search-plus";
    if (name.includes("rotate")) return "fas fa-sync";
    if (name.includes("flip")) return "fas fa-exchange-alt";
    if (name.includes("mirror")) return "fas fa-clone";
    if (name.includes("speed")) return "fas fa-tachometer-alt";
    if (name.includes("slow")) return "fas fa-hourglass-half";
    if (name.includes("fast")) return "fas fa-forward";
    if (name.includes("reverse")) return "fas fa-backward";
    
    // Bi·ªÉu t∆∞·ª£ng m·∫∑c ƒë·ªãnh cho c√°c effect kh√°c
    return "fas fa-magic";
  }
  
  /**
   * T·∫°o m·ªôt UUID duy nh·∫•t cho c√°c ƒë·ªëi t∆∞·ª£ng
   * @returns {string} UUID duy nh·∫•t
   */
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  }
  
  /**
   * L·∫•y danh s√°ch hi·ªáu ·ª©ng hi·ªán c√≥
   * @returns {Array} Danh s√°ch hi·ªáu ·ª©ng
   */
  function getEffects() {
    return effects;
  }
  
  /**
   * Hi·ªÉn th·ªã dropdown ch·ªçn hi·ªáu ·ª©ng
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyEffect - Callback function to apply effect
   */
  function showEffectDropdown(thumbnailItem, fileData, onApplyEffect) {
    if (!thumbnailItem) return;
    
    console.log("Showing effect dropdown");
    
    // Ki·ªÉm tra xem ƒë√£ c√≥ dropdown n√†o ƒëang m·ªü kh√¥ng
    const existingDropdown = document.querySelector('.effect-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }
    
    // T·∫°o dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'effect-dropdown';
    
    // X√°c ƒë·ªãnh v·ªã tr√≠ c·ªßa dropdown
    const thumbnailRect = thumbnailItem.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = `${thumbnailRect.top + window.scrollY + 40}px`; // D∆∞·ªõi n√∫t effect
    dropdown.style.left = `${thumbnailRect.left + window.scrollX}px`;
    dropdown.style.width = `${thumbnailRect.width}px`;
    dropdown.style.zIndex = '1000';
    
    // Th√™m ti√™u ƒë·ªÅ cho dropdown
    const dropdownHeader = document.createElement('div');
    dropdownHeader.className = 'effect-dropdown-header';
    dropdownHeader.textContent = 'Ch·ªçn hi·ªáu ·ª©ng';
    dropdown.appendChild(dropdownHeader);

    // T·∫°o danh s√°ch hi·ªáu ·ª©ng
    const effectList = document.createElement('div');
    effectList.className = 'effect-dropdown-list';
    dropdown.appendChild(effectList);

    // L·∫•y danh s√°ch hi·ªáu ·ª©ng
    const availableEffects = getEffects();
    console.log(`Found ${availableEffects.length} effects for dropdown`);
    
    // In ra danh s√°ch hi·ªáu ·ª©ng ƒë·ªÉ debug
    availableEffects.forEach((effect, index) => {
      console.log(`${index}. ${effect.name} (${effect.id})`);
    });
    
    // Ki·ªÉm tra xem c√≥ hi·ªáu ·ª©ng n√†o kh√¥ng
    if (availableEffects.length <= 1) { // Ch·ªâ c√≥ effect "None"
      // Th√™m hi·ªáu ·ª©ng m·∫´u t·ª´ draft_content_2.json
      const sampleEffects = [
        {
          id: "67AE5ED5-14C3-4ac2-A5B5-0B37A61E77FA",
          name: "Ph√≥ng to h√¨nh kim c∆∞∆°ng",
          type: "video_effect",
          category_name: "ƒêang th·ªãnh h√†nh",
          effect_id: "7399471460445605125",
          icon: "fas fa-expand"
        },
        {
          id: "9BFBA51E-3D0F-4d87-8937-C002398DD6EB",
          name: "M·ªü ng∆∞·ª£c",
          type: "video_effect",
          category_name: "ƒêang th·ªãnh h√†nh",
          effect_id: "7399471215905082630",
          icon: "fas fa-sync-alt"
        },
        {
          id: "1A090300-3D37-46f9-9026-4523CCC32A7B",
          name: "Tr·ª•c tr·∫∑c pixel",
          type: "video_effect",
          category_name: "ƒêang th·ªãnh h√†nh",
          effect_id: "7399464859097730309",
          icon: "fas fa-cubes"
        },
        {
          id: "5B61258D-9748-4aa4-91D0-8A993CB1FF79",
          name: "Rung d·ªçc",
          type: "video_effect",
          category_name: "ƒêang th·ªãnh h√†nh",
          effect_id: "7399465889323830533",
          icon: "fas fa-arrows-alt-v"
        }
      ];
      
      // Th√™m c√°c hi·ªáu ·ª©ng m·∫´u v√†o danh s√°ch
      effects = effects.concat(sampleEffects);
      console.log(`Added ${sampleEffects.length} sample effects to dropdown`);
      
      // C·∫≠p nh·∫≠t danh s√°ch hi·ªáu ·ª©ng
      availableEffects.push(...sampleEffects);
    }
    
    // Ki·ªÉm tra l·∫°i sau khi th√™m hi·ªáu ·ª©ng m·∫´u
    if (availableEffects.length === 0) {
      const noEffects = document.createElement('div');
      noEffects.className = 'effect-dropdown-item no-effects';
      noEffects.textContent = 'Kh√¥ng c√≥ hi·ªáu ·ª©ng n√†o';
      effectList.appendChild(noEffects);
    } else {
      // Hi·ªÉn th·ªã t·∫•t c·∫£ c√°c hi·ªáu ·ª©ng trong danh s√°ch
      availableEffects.forEach(effect => {
        const item = document.createElement('div');
        item.className = 'effect-dropdown-item';
        
        // Th√™m class ƒë·∫∑c bi·ªát cho option "None"
        if (effect.id === 'none') {
          item.classList.add('none-option');
        }
        
        // Th√™m n·ªôi dung hi·ªáu ·ª©ng
        item.innerHTML = `<i class="${effect.icon || 'fas fa-magic'}"></i> ${effect.name}`;
        
        // X·ª≠ l√Ω s·ª± ki·ªán click
        item.addEventListener('click', () => {
          // √Åp d·ª•ng hi·ªáu ·ª©ng khi ƒë∆∞·ª£c ch·ªçn
          if (typeof onApplyEffect === 'function') {
            onApplyEffect(thumbnailItem, effect, fileData);
          }
          
          // C·∫≠p nh·∫≠t text c·ªßa button theo t√™n hi·ªáu ·ª©ng ƒë√£ ch·ªçn
          const effectButton = thumbnailItem.querySelector('.effect-button');
          if (effectButton) {
            effectButton.innerHTML = `<i class="${effect.icon || 'fas fa-magic'}"></i> ${effect.name}`;
            
            // L∆∞u ID c·ªßa hi·ªáu ·ª©ng v√†o data attribute c·ªßa button
            effectButton.dataset.effectId = effect.id;
          }
          
          // ƒê√≥ng dropdown
          dropdown.remove();
        });
        
        // Th√™m item v√†o danh s√°ch
        effectList.appendChild(item);
      });
    }
    
    // Th√™m v√†o body
    document.body.appendChild(dropdown);
    
    // Th√™m s·ª± ki·ªán ƒë√≥ng dropdown khi click ra ngo√†i
    document.addEventListener('click', closeDropdown);
    
    // H√†m ƒë√≥ng dropdown khi click ra ngo√†i
    function closeDropdown(event) {
      if (!dropdown.contains(event.target) && event.target !== thumbnailItem) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    }
  }

  /**
   * Th√™m n√∫t hi·ªáu ·ª©ng v√†o thumbnail
   * @param {HTMLElement} thumbnailItem - Thumbnail item element
   * @param {Object} fileData - File data
   * @param {Function} onApplyEffect - Callback function to apply effect
   */
  function addEffectButton(thumbnailItem, fileData, onApplyEffect) {
    if (!thumbnailItem) return;
    
    // T·∫°o container cho n√∫t hi·ªáu ·ª©ng
    const effectButtonContainer = document.createElement('div');
    effectButtonContainer.className = 'effect-button-container';
    
    // N√∫t Hi·ªáu ·ª©ng
    const effectButton = document.createElement('button');
    effectButton.className = 'effect-button';
    effectButton.innerHTML = '<i class="fas fa-magic"></i> Hi·ªáu ·ª©ng';
    effectButton.onclick = function(e) {
      e.stopPropagation();
      showEffectDropdown(thumbnailItem, fileData, onApplyEffect);
    };
    effectButtonContainer.appendChild(effectButton);

    // T·∫°o container ƒë·ªÉ ch·ª©a n√∫t hi·ªáu ·ª©ng ph√≠a tr√™n media
    const effectContainer = document.createElement('div');
    effectContainer.className = 'effect-container';
    
    // Th√™m container n√∫t v√†o effect container
    effectContainer.appendChild(effectButtonContainer);
    
    // Th√™m effect container v√†o thumbnail item
    thumbnailItem.appendChild(effectContainer);
    
    // ƒê·∫£m b·∫£o effect container lu√¥n hi·ªÉn th·ªã
    effectContainer.style.opacity = '1';
    effectContainer.style.visibility = 'visible';
  }

  /**
   * C·∫≠p nh·∫≠t giao di·ªán ng∆∞·ªùi d√πng ƒë·ªÉ hi·ªÉn th·ªã danh s√°ch hi·ªáu ·ª©ng
   */
  function updateEffectsUI() {
    try {
      console.log("Updating effects UI with", effects.length, "effects");
      
      // In ra danh s√°ch hi·ªáu ·ª©ng ƒë·ªÉ debug
      console.log("Effects to be displayed:");
      effects.forEach((effect, index) => {
        console.log(`${index + 1}. ${effect.name} (${effect.id || 'No ID'})`);
      });
      
      // T·∫°o CSS cho hi·ªáu ·ª©ng dropdown
      addEffectStyles();
      
      console.log(`Updated UI with ${effects.length} effects`);
    } catch (error) {
      console.error("Error updating effects UI:", error);
    }
  }
  
  /**
   * Th√™m c√°c styles CSS cho hi·ªáu ·ª©ng
   */
  function addEffectStyles() {
    // Ki·ªÉm tra xem ƒë√£ c√≥ style n√†y ch∆∞a
    if (document.getElementById('effect-manager-styles')) {
      return;
    }
    
    // T·∫°o element style
    const styleElement = document.createElement('style');
    styleElement.id = 'effect-manager-styles';
    styleElement.textContent = `
      .effect-container {
        position: absolute;
        top: -40px;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
        opacity: 1;
        visibility: visible;
        transition: opacity 0.3s, visibility 0.3s;
      }
      
      .effect-button-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 5px;
      }
      
      .effect-button {
        background-color: #4a4a4a;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        margin: 0 5px;
        cursor: pointer;
        font-size: 12px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        transition: background-color 0.3s;
      }
      
      .effect-button:hover {
        background-color: #666666;
      }
      
      .effect-dropdown {
        background-color: #333333;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        color: white;
        overflow: hidden;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .effect-dropdown-header {
        background-color: #4a4a4a;
        padding: 8px 12px;
        font-weight: bold;
        border-bottom: 1px solid #555555;
      }
      
      .effect-dropdown-list {
        padding: 5px 0;
      }
      
      .effect-dropdown-item {
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .effect-dropdown-item:hover {
        background-color: #4a4a4a;
      }
      
      .effect-dropdown-item.none-option {
        color: #aaaaaa;
        border-bottom: 1px solid #555555;
      }
      
      .effect-dropdown-item.no-effects {
        color: #aaaaaa;
        font-style: italic;
        cursor: default;
      }
    `;
    
    // Th√™m v√†o head
    document.head.appendChild(styleElement);
  }
  
  /**
   * T·∫°o m·ªôt track effect m·ªõi cho draft content
   * @param {Array} effectSegments Danh s√°ch c√°c segment hi·ªáu ·ª©ng
   * @returns {Object} Track effect m·ªõi
   */
  function createEffectTrack(effectSegments) {
    // T·∫°o m·ªôt b·∫£n sao c·ªßa m·∫´u track
    const track = JSON.parse(JSON.stringify(effectTrackTemplate));
    
    // T·∫°o ID m·ªõi cho track
    track.id = generateUUID();
    
    // Th√™m c√°c segments
    track.segments = effectSegments || [];
    
    return track;
  }
  
  /**
   * T·∫°o m·ªôt segment hi·ªáu ·ª©ng m·ªõi
   * @param {string} effectId ID c·ªßa hi·ªáu ·ª©ng
   * @param {number} startTime Th·ªùi gian b·∫Øt ƒë·∫ßu (microseconds)
   * @param {number} duration Th·ªùi gian k√©o d√†i (microseconds)
   * @param {number} renderIndex Ch·ªâ s·ªë render
   * @returns {Object} Segment hi·ªáu ·ª©ng m·ªõi
   */
  function createEffectSegment(effectId, startTime, duration, renderIndex) {
    // T·∫°o m·ªôt b·∫£n sao c·ªßa m·∫´u segment
    const segment = JSON.parse(JSON.stringify(effectSegmentTemplate));
    
    // C·∫≠p nh·∫≠t c√°c th√¥ng tin
    segment.id = generateUUID();
    segment.material_id = effectId;
    segment.target_timerange.start = startTime || 0;
    segment.target_timerange.duration = duration || 3000000; // 3 gi√¢y m·∫∑c ƒë·ªãnh
    segment.render_index = renderIndex || 11000;
          enable_video_mask: true,
          extra_material_refs: [],
          group_id: "",
          hdr_settings: null,
          id: generateUUID(),
          intensifies_audio: false,
          is_loop: false,
          is_placeholder: false,
          is_tone_modify: false,
          keyframe_refs: [],
          last_nonzero_volume: 1.0,
          lyric_keyframes: null,
          material_id: effect.id,
          raw_segment_id: "",
          render_index: renderIndex,
          render_timerange: {
            duration: 0,
            start: 0
          },
          responsive_layout: {
            enable: false,
            horizontal_pos_layout: 0,
            size_layout: 0,
            target_follow: "",
            vertical_pos_layout: 0
          },
          reverse: false,
          source_timerange: null,
          speed: 1.0,
          state: 0,
          target_timerange: {
            duration: duration,
            start: startTime
          },
          template_id: "",
          template_scene: "default",
          track_attribute: 0,
          track_render_index: 1,
          uniform_scale: null,
          visible: true,
          volume: 1.0
        };
        
        effectSegments.push(segment);
        
        // TƒÉng render index cho segment ti·∫øp theo
        renderIndex++;
      });
      
      // Ki·ªÉm tra v√† c·∫≠p nh·∫≠t track effect
      if (effectSegments.length > 0) {
        // T·∫°o track effect m·ªõi theo m·∫´u c·ªßa CapCut
        const effectTrack = {
          attribute: 0,
          flag: 0,
          id: generateUUID(),
          is_default_name: true,
          name: "",
          segments: effectSegments,
          type: "effect"
        };
        
        // ƒê·∫£m b·∫£o c√≥ m·∫£ng tracks
        if (!updatedContent.tracks) {
          updatedContent.tracks = [];
        }
        
        // Ki·ªÉm tra xem ƒë√£ c√≥ track effect ch∆∞a
        const existingTrackIndex = updatedContent.tracks.findIndex(track => track.type === "effect");
        
        if (existingTrackIndex >= 0) {
          // C·∫≠p nh·∫≠t track hi·ªán c√≥
          updatedContent.tracks[existingTrackIndex].segments = effectSegments;
        } else {
          // Th√™m track m·ªõi v√†o danh s√°ch
          updatedContent.tracks.push(effectTrack);
        }
      }
      
      console.log("Effects applied to draft content successfully");
      return updatedContent;
    } catch (error) {
      console.error("Error applying effects to draft content:", error);
      return draftContent;
    }
  }
  
  /**
   * T·∫°o m·ªôt track effect m·∫∑c ƒë·ªãnh v·ªõi m·ªôt effect "None"
   * @returns {Object} Track effect m·∫∑c ƒë·ªãnh
   */
  function createDefaultEffectTrack() {
    // T·∫°o m·ªôt segment v·ªõi effect "None"
    const segment = createEffectSegment("none", 0, 5000000, 11000);
    
    // T·∫°o track v·ªõi segment
    return createEffectTrack([segment]);
  }
  
  /**
   * Tr·∫£ v·ªÅ m·∫´u c·∫•u tr√∫c track hi·ªáu ·ª©ng
   * @returns {Object} M·∫´u track hi·ªáu ·ª©ng
   */
  function getEffectTrackTemplate() {
    return JSON.parse(JSON.stringify(effectTrackTemplate));
  }

  /**
   * Tr·∫£ v·ªÅ m·∫´u c·∫•u tr√∫c segment hi·ªáu ·ª©ng
   * @returns {Object} M·∫´u segment hi·ªáu ·ª©ng
   */
  function getEffectSegmentTemplate() {
    return JSON.parse(JSON.stringify(effectSegmentTemplate));
  }

  // Public API
  return {
    init,
    getEffects,
    mergeEffects,
    createEffectTrack,
    createEffectSegment,
    updateFromDraftContent,
    loadEffectsFromDraftContent,
    updateEffectsUI,
    generateUUID,
    applyEffectsToDraftContent,
    createDefaultEffectTrack,
    getEffectTrackTemplate,
    getEffectSegmentTemplate,
    showEffectDropdown,
    addEffectButton,
    addEffectStyles
  };
})();
/ * *  
   *   √ Å p   d · ª • n g   e f f e c t s   v √ † o   d r a f t   c o n t e n t   c h o   v i · ª ! c   x u · ∫ • t   f i l e  
   *   @ p a r a m   { O b j e c t }   d r a f t C o n t e n t   N · ª "!i   d u n g   d r a f t   c o n t e n t  
   *   @ p a r a m   { A r r a y }   e f f e c t s T o A p p l y   D a n h   s √ ° c h   e f f e c t s   c · ∫ ß n   √ ° p   d · ª • n g  
   *   @ r e t u r n s   { O b j e c t }   D r a f t   c o n t e n t   ƒ  √ £   ƒ  ∆ ∞ · ª £ c   c · ∫ ≠ p   n h · ∫ ≠ t  
   * /  
 f u n c t i o n   a p p l y E f f e c t s T o D r a f t C o n t e n t ( d r a f t C o n t e n t ,   e f f e c t s T o A p p l y )   {  
     t r y   {  
         c o n s o l e . l o g ( " A p p l y i n g   e f f e c t s   t o   d r a f t   c o n t e n t " ) ;  
          
         i f   ( ! d r a f t C o n t e n t   | |   ! e f f e c t s T o A p p l y   | |   ! A r r a y . i s A r r a y ( e f f e c t s T o A p p l y )   | |   e f f e c t s T o A p p l y . l e n g t h   = = =   0 )   {  
             c o n s o l e . l o g ( " N o   e f f e c t s   t o   a p p l y   o r   i n v a l i d   d r a f t   c o n t e n t " ) ;  
             r e t u r n   d r a f t C o n t e n t ;  
         }  
          
         / /   T · ∫ ° o   b · ∫ £ n   s a o   c · ª ß a   d r a f t   c o n t e n t   ƒ  · ª í  k h √ ¥ n g   · ∫ £ n h   h ∆ ∞ · ª xn g   ƒ  · ∫ ø n   d · ª Ø   l i · ª ! u   g · ª  c  
         c o n s t   u p d a t e d C o n t e n t   =   J S O N . p a r s e ( J S O N . s t r i n g i f y ( d r a f t C o n t e n t ) ) ;  
          
         / /   ƒ ê · ∫ £ m   b · ∫ £ o   c √ ≥   c √ ° c   m · ∫ £ n g   c · ∫ ß n   t h i · ∫ ø t   t r o n g   m a t e r i a l s  
         i f   ( ! u p d a t e d C o n t e n t . m a t e r i a l s )   {  
             u p d a t e d C o n t e n t . m a t e r i a l s   =   { } ;  
         }  
          
         / /   ƒ ê · ∫ £ m   b · ∫ £ o   c √ ≥   m · ∫ £ n g   v i d e o _ e f f e c t s  
         i f   ( ! u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s )   {  
             u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s   =   [ ] ;  
         }  
          
         / /   ƒ ê · ∫ £ m   b · ∫ £ o   c √ ≥   m · ∫ £ n g   m a t e r i a l _ a n i m a t i o n s  
         i f   ( ! u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s )   {  
             u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s   =   [ ] ;  
         }  
          
         / /   ƒ ê · ∫ £ m   b · ∫ £ o   c √ ≥   m · ∫ £ n g   l o u d n e s s e s  
         i f   ( ! u p d a t e d C o n t e n t . l o u d n e s s e s )   {  
             u p d a t e d C o n t e n t . l o u d n e s s e s   =   [ ] ;  
         }  
          
         / /   L · ª ç c   c √ ° c   e f f e c t s   c · ∫ ß n   √ ° p   d · ª • n g   ( b · ª è   q u a   e f f e c t   " N o n e " )  
         c o n s t   v a l i d E f f e c t s   =   e f f e c t s T o A p p l y . f i l t e r ( e f f e c t   = >   e f f e c t . n a m e   ! = =   " N o n e "   & &   e f f e c t . i d   ! = =   " n o n e " ) ;  
          
         / /   N · ∫ ø u   k h √ ¥ n g   c √ ≥   e f f e c t   n √ † o   h · ª £ p   l · ª ! ,   t r · ∫ £   v · ª Å   d r a f t   c o n t e n t   g · ª  c  
         i f   ( v a l i d E f f e c t s . l e n g t h   = = =   0 )   {  
             c o n s o l e . l o g ( " N o   v a l i d   e f f e c t s   t o   a p p l y " ) ;  
             r e t u r n   u p d a t e d C o n t e n t ;  
         }  
          
         c o n s o l e . l o g ( ` A p p l y i n g   $ { v a l i d E f f e c t s . l e n g t h }   e f f e c t s   t o   d r a f t   c o n t e n t ` ) ;  
          
         / /   T h √ ™ m   c √ ° c   e f f e c t s   v √ † o   m a t e r i a l s . v i d e o _ e f f e c t s  
         v a l i d E f f e c t s . f o r E a c h ( e f f e c t   = >   {  
             / /   T · ∫ ° o   ƒ  · ª  i   t ∆ ∞ · ª £ n g   e f f e c t   t h e o   ƒ  · ª 9 n h   d · ∫ ° n g   c · ª ß a   C a p C u t  
             c o n s t   v i d e o E f f e c t   =   {  
                 i d :   e f f e c t . i d   | |   g e n e r a t e U U I D ( ) ,  
                 n a m e :   e f f e c t . n a m e ,  
                 t y p e :   " v i d e o _ e f f e c t " ,  
                 a d j u s t _ p a r a m s :   e f f e c t . a d j u s t _ p a r a m s   | |   [ ] ,  
                 a p p l y _ t a r g e t _ t y p e :   e f f e c t . a p p l y _ t a r g e t _ t y p e   | |   2 ,  
                 c a t e g o r y _ i d :   e f f e c t . c a t e g o r y _ i d   | |   " 2 7 2 9 6 " ,  
                 c a t e g o r y _ n a m e :   e f f e c t . c a t e g o r y _ n a m e   | |   " ƒ ê a n g   t h · ª 9 n h   h √ † n h " ,  
                 e f f e c t _ i d :   e f f e c t . e f f e c t _ i d   | |   e f f e c t . r e s o u r c e _ i d   | |   " " ,  
                 e n a b l e _ m a s k :   e f f e c t . e n a b l e _ m a s k   ! = =   u n d e f i n e d   ?   e f f e c t . e n a b l e _ m a s k   :   t r u e ,  
                 i t e m _ e f f e c t _ t y p e :   e f f e c t . i t e m _ e f f e c t _ t y p e   | |   0 ,  
                 p a t h :   e f f e c t . p a t h   | |   " " ,  
                 r e s o u r c e _ i d :   e f f e c t . r e s o u r c e _ i d   | |   e f f e c t . e f f e c t _ i d   | |   " " ,  
                 s o u r c e _ p l a t f o r m :   e f f e c t . s o u r c e _ p l a t f o r m   | |   1 ,  
                 v a l u e :   e f f e c t . v a l u e   | |   1 . 0 ,  
                 p l a t f o r m :   e f f e c t . p l a t f o r m   | |   " a l l " ,  
                 c o m m o n _ k e y f r a m e s :   e f f e c t . c o m m o n _ k e y f r a m e s   | |   [ ] ,  
                 e f f e c t _ m a s k :   e f f e c t . e f f e c t _ m a s k   | |   [ ] ,  
                 c o v e r i n g _ r e l a t i o n _ c h a n g e :   e f f e c t . c o v e r i n g _ r e l a t i o n _ c h a n g e   | |   0  
             } ;  
              
             / /   K i · ª ím   t r a   x e m   e f f e c t   ƒ  √ £   t · ª  n   t · ∫ ° i   c h ∆ ∞ a  
             c o n s t   e x i s t i n g I n d e x   =   u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s . f i n d I n d e x ( e   = >   e . i d   = = =   v i d e o E f f e c t . i d ) ;  
              
             i f   ( e x i s t i n g I n d e x   > =   0 )   {  
                 / /   C · ∫ ≠ p   n h · ∫ ≠ t   e f f e c t   ƒ  √ £   t · ª  n   t · ∫ ° i  
                 u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s [ e x i s t i n g I n d e x ]   =   v i d e o E f f e c t ;  
             }   e l s e   {  
                 / /   T h √ ™ m   e f f e c t   m · ª : i  
                 u p d a t e d C o n t e n t . m a t e r i a l s . v i d e o _ e f f e c t s . p u s h ( v i d e o E f f e c t ) ;  
             }  
              
             / /   T h √ ™ m   v √ † o   m a t e r i a l _ a n i m a t i o n s   n · ∫ ø u   c · ∫ ß n  
             c o n s t   m a t e r i a l A n i m a t i o n   =   {  
                 i d :   g e n e r a t e U U I D ( ) ,  
                 m a t e r i a l _ i d :   v i d e o E f f e c t . i d ,  
                 t y p e :   " v i d e o _ e f f e c t " ,  
                 a n i m a t i o n _ e f f e c t s :   [ ] ,  
                 k e y f r a m e _ r e f s :   [ ]  
             } ;  
              
             / /   K i · ª ím   t r a   x e m   m a t e r i a l _ a n i m a t i o n   ƒ  √ £   t · ª  n   t · ∫ ° i   c h ∆ ∞ a  
             c o n s t   e x i s t i n g A n i m I n d e x   =   u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s . f i n d I n d e x ( a   = >   a . m a t e r i a l _ i d   = = =   v i d e o E f f e c t . i d ) ;  
              
             i f   ( e x i s t i n g A n i m I n d e x   > =   0 )   {  
                 / /   C · ∫ ≠ p   n h · ∫ ≠ t   m a t e r i a l _ a n i m a t i o n   ƒ  √ £   t · ª  n   t · ∫ ° i  
                 u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s [ e x i s t i n g A n i m I n d e x ]   =   m a t e r i a l A n i m a t i o n ;  
             }   e l s e   {  
                 / /   T h √ ™ m   m a t e r i a l _ a n i m a t i o n   m · ª : i  
                 u p d a t e d C o n t e n t . m a t e r i a l s . m a t e r i a l _ a n i m a t i o n s . p u s h ( m a t e r i a l A n i m a t i o n ) ;  
             }  
              
             / /   T h √ ™ m   v √ † o   l o u d n e s s e s   n · ∫ ø u   c · ∫ ß n  
             c o n s t   l o u d n e s s   =   {  
                 i d :   g e n e r a t e U U I D ( ) ,  
                 m a t e r i a l _ i d :   v i d e o E f f e c t . i d ,  
                 t y p e :   " v i d e o _ e f f e c t " ,  
                 l o u d n e s s :   0  
             } ;  
              
             / /   K i · ª ím   t r a   x e m   l o u d n e s s   ƒ  √ £   t · ª  n   t · ∫ ° i   c h ∆ ∞ a  
             c o n s t   e x i s t i n g L o u d n e s s I n d e x   =   u p d a t e d C o n t e n t . l o u d n e s s e s . f i n d I n d e x ( l   = >   l . m a t e r i a l _ i d   = = =   v i d e o E f f e c t . i d ) ;  
              
             i f   ( e x i s t i n g L o u d n e s s I n d e x   > =   0 )   {  
                 / /   C · ∫ ≠ p   n h · ∫ ≠ t   l o u d n e s s   ƒ  √ £   t · ª  n   t · ∫ ° i  
                 u p d a t e d C o n t e n t . l o u d n e s s e s [ e x i s t i n g L o u d n e s s I n d e x ]   =   l o u d n e s s ;  
             }   e l s e   {  
                 / /   T h √ ™ m   l o u d n e s s   m · ª : i  
                 u p d a t e d C o n t e n t . l o u d n e s s e s . p u s h ( l o u d n e s s ) ;  
             }  
         } ) ;  
          
         / /   T √ ¨ m   c √ ° c   s e g m e n t s   t r o n g   t r a c k   v i d e o   ƒ  · ª í  x √ ° c   ƒ  · ª 9 n h   t h · ª ù i   g i a n  
         l e t   v i d e o S e g m e n t s   =   [ ] ;  
         i f   ( u p d a t e d C o n t e n t . t r a c k s   & &   A r r a y . i s A r r a y ( u p d a t e d C o n t e n t . t r a c k s ) )   {  
             c o n s t   v i d e o T r a c k   =   u p d a t e d C o n t e n t . t r a c k s . f i n d ( t r a c k   = >   t r a c k . t y p e   = = =   " v i d e o " ) ;  
             i f   ( v i d e o T r a c k   & &   v i d e o T r a c k . s e g m e n t s )   {  
                 v i d e o S e g m e n t s   =   v i d e o T r a c k . s e g m e n t s ;  
             }  
         }  
          
         / /   T · ∫ ° o   c √ ° c   s e g m e n t s   c h o   t r a c k   e f f e c t  
         c o n s t   e f f e c t S e g m e n t s   =   [ ] ;  
         l e t   r e n d e r I n d e x   =   1 1 0 0 0 ;  
          
         / /   T · ∫ ° o   s e g m e n t s   c h o   m · ª  i   e f f e c t  
         v a l i d E f f e c t s . f o r E a c h ( ( e f f e c t ,   i n d e x )   = >   {  
             / /   X √ ° c   ƒ  · ª 9 n h   t h · ª ù i   g i a n   b · ∫ Ø t   ƒ  · ∫ ß u   v √ †   k √ © o   d √ † i  
             l e t   s t a r t T i m e   =   0 ;  
             l e t   d u r a t i o n   =   3 0 0 0 0 0 0 ;   / /   3   g i √ ¢ y   m · ∫ ∑ c   ƒ  · ª 9 n h  
              
             / /   N · ∫ ø u   e f f e c t   c √ ≥   t h √ ¥ n g   t i n   s e g m e n t ,   s · ª ≠   d · ª • n g   t h √ ¥ n g   t i n   ƒ  √ ≥  
             i f   ( e f f e c t . s e g m e n t   & &   e f f e c t . s e g m e n t . t a r g e t _ t i m e r a n g e )   {  
                 s t a r t T i m e   =   e f f e c t . s e g m e n t . t a r g e t _ t i m e r a n g e . s t a r t ;  
                 d u r a t i o n   =   e f f e c t . s e g m e n t . t a r g e t _ t i m e r a n g e . d u r a t i o n ;  
                 r e n d e r I n d e x   =   e f f e c t . s e g m e n t . r e n d e r _ i n d e x   | |   r e n d e r I n d e x ;  
             }  
             / /   N · ∫ ø u   k h √ ¥ n g   c √ ≥   t h √ ¥ n g   t i n   s e g m e n t   n h ∆ ∞ n g   c √ ≥   v i d e o   s e g m e n t   t ∆ ∞ ∆ ° n g   · ª © n g ,   l · ∫ • y   t h · ª ù i   g i a n   t · ª ´   ƒ  √ ≥  
             e l s e   i f   ( v i d e o S e g m e n t s [ i n d e x ] )   {  
                 s t a r t T i m e   =   v i d e o S e g m e n t s [ i n d e x ] . t a r g e t _ t i m e r a n g e . s t a r t ;  
                 d u r a t i o n   =   M a t h . m i n ( v i d e o S e g m e n t s [ i n d e x ] . t a r g e t _ t i m e r a n g e . d u r a t i o n ,   3 0 0 0 0 0 0 ) ;   / /   G i · ª : i   h · ∫ ° n   t · ª  i   ƒ  a   3   g i √ ¢ y  
             }  
              
             / /   T · ∫ ° o   s e g m e n t   h i · ª ! u   · ª © n g   t h e o   m · ∫ ´ u   c · ª ß a   C a p C u t  
             c o n s t   s e g m e n t   =   {  
                 c a p t i o n _ i n f o :   n u l l ,  
                 c a r t o o n :   f a l s e ,  
                 c l i p :   {  
                     a l p h a :   1 . 0 ,  
                     f l i p :   {  
                         h o r i z o n t a l :   f a l s e ,  
                         v e r t i c a l :   f a l s e  
                     } ,  
                     r o t a t i o n :   0 . 0 ,  
                     s c a l e :   {  
                         x :   1 . 0 ,  
                         y :   1 . 0  
                     } ,  
                     t r a n s f o r m :   {  
                         x :   0 . 0 ,  
                         y :   0 . 0  
                     }  
                 } ,  
                 c o l o r _ c o r r e c t _ a l g _ r e s u l t :   " " ,  
                 c o m m o n _ k e y f r a m e s :   [ ] ,  
                 d e s c :   " " ,  
                 d i g i t a l _ h u m a n _ t e m p l a t e _ g r o u p _ i d :   " " ,  
                 e n a b l e _ a d j u s t :   f a l s e ,  
                 e n a b l e _ a d j u s t _ m a s k :   f a l s e ,  
                 e n a b l e _ c o l o r _ c o r r e c t _ a d j u s t :   f a l s e ,  
                 e n a b l e _ c o l o r _ c u r v e s :   t r u e ,  
                 e n a b l e _ c o l o r _ m a t c h _ a d j u s t :   f a l s e ,  
                 e n a b l e _ c o l o r _ w h e e l s :   t r u e ,  
                 e n a b l e _ h s l :   f a l s e ,  
                 e n a b l e _ l u t :   f a l s e ,  
                 e n a b l e _ s m a r t _ c o l o r _ a d j u s t :   f a l s e ,  
                 e n a b l e _ v i d e o _ m a s k :   t r u e ,  
                 e x t r a _ m a t e r i a l _ r e f s :   [ ] ,  
                 g r o u p _ i d :   " " ,  
                 h d r _ s e t t i n g s :   {  
                     i n t e n s i t y :   1 . 0 ,  
                     m o d e :   1 ,  
                     n i t s :   1 0 0 0  
                 } ,  
                 i d :   g e n e r a t e U U I D ( ) ,  
                 i n t e n s i f i e s _ a u d i o :   f a l s e ,  
                 i s _ l o o p :   f a l s e ,  
                 i s _ p l a c e h o l d e r :   f a l s e ,  
                 i s _ t o n e _ m o d i f y :   f a l s e ,  
                 k e y f r a m e _ r e f s :   [ ] ,  
                 l a s t _ n o n z e r o _ v o l u m e :   1 . 0 ,  
                 l y r i c _ k e y f r a m e s :   n u l l ,  
                 m a t e r i a l _ i d :   e f f e c t . i d ,  
                 r a w _ s e g m e n t _ i d :   " " ,  
                 r e n d e r _ i n d e x :   r e n d e r I n d e x ,  
                 r e n d e r _ t i m e r a n g e :   {  
                     d u r a t i o n :   0 ,  
                     s t a r t :   0  
                 } ,  
                 r e s p o n s i v e _ l a y o u t :   {  
                     e n a b l e :   f a l s e ,  
                     h o r i z o n t a l _ p o s _ l a y o u t :   0 ,  
                     s i z e _ l a y o u t :   0 ,  
                     t a r g e t _ f o l l o w :   " " ,  
                     v e r t i c a l _ p o s _ l a y o u t :   0  
                 } ,  
                 r e v e r s e :   f a l s e ,  
                 s o u r c e _ t i m e r a n g e :   n u l l ,  
                 s p e e d :   1 . 0 ,  
                 s t a t e :   0 ,  
                 t a r g e t _ t i m e r a n g e :   {  
                     d u r a t i o n :   d u r a t i o n ,  
                     s t a r t :   s t a r t T i m e  
                 } ,  
                 t e m p l a t e _ i d :   " " ,  
                 t e m p l a t e _ s c e n e :   " d e f a u l t " ,  
                 t r a c k _ a t t r i b u t e :   0 ,  
                 t r a c k _ r e n d e r _ i n d e x :   1 ,  
                 u n i f o r m _ s c a l e :   {  
                     o n :   t r u e ,  
                     v a l u e :   1 . 0  
                 } ,  
                 v i s i b l e :   t r u e ,  
                 v o l u m e :   1 . 0  
             } ;  
              
             e f f e c t S e g m e n t s . p u s h ( s e g m e n t ) ;  
              
             / /   T ƒ ín g   r e n d e r   i n d e x   c h o   s e g m e n t   t i · ∫ ø p   t h e o  
             r e n d e r I n d e x + + ;  
         } ) ;  
          
         / /   K i · ª ím   t r a   v √ †   c · ∫ ≠ p   n h · ∫ ≠ t   t r a c k   e f f e c t  
         i f   ( e f f e c t S e g m e n t s . l e n g t h   >   0 )   {  
             / /   T · ∫ ° o   t r a c k   e f f e c t   m · ª : i   t h e o   m · ∫ ´ u   c · ª ß a   C a p C u t  
             c o n s t   e f f e c t T r a c k   =   {  
                 a t t r i b u t e :   0 ,  
                 f l a g :   0 ,  
                 i d :   g e n e r a t e U U I D ( ) ,  
                 i s _ d e f a u l t _ n a m e :   t r u e ,  
                 n a m e :   " " ,  
                 s e g m e n t s :   e f f e c t S e g m e n t s ,  
                 t y p e :   " e f f e c t "  
             } ;  
              
             / /   ƒ ê · ∫ £ m   b · ∫ £ o   c √ ≥   m · ∫ £ n g   t r a c k s  
             i f   ( ! u p d a t e d C o n t e n t . t r a c k s )   {  
                 u p d a t e d C o n t e n t . t r a c k s   =   [ ] ;  
             }  
              
             / /   K i · ª ím   t r a   x e m   ƒ  √ £   c √ ≥   t r a c k   e f f e c t   c h ∆ ∞ a  
             c o n s t   e x i s t i n g T r a c k I n d e x   =   u p d a t e d C o n t e n t . t r a c k s . f i n d I n d e x ( t r a c k   = >   t r a c k . t y p e   = = =   " e f f e c t " ) ;  
              
             i f   ( e x i s t i n g T r a c k I n d e x   > =   0 )   {  
                 / /   C · ∫ ≠ p   n h · ∫ ≠ t   t r a c k   h i · ª ! n   c √ ≥  
                 u p d a t e d C o n t e n t . t r a c k s [ e x i s t i n g T r a c k I n d e x ] . s e g m e n t s   =   e f f e c t S e g m e n t s ;  
             }   e l s e   {  
                 / /   T h √ ™ m   t r a c k   m · ª : i   v √ † o   d a n h   s √ ° c h  
                 u p d a t e d C o n t e n t . t r a c k s . p u s h ( e f f e c t T r a c k ) ;  
             }  
         }  
          
         c o n s o l e . l o g ( " E f f e c t s   a p p l i e d   t o   d r a f t   c o n t e n t   s u c c e s s f u l l y " ) ;  
         r e t u r n   u p d a t e d C o n t e n t ;  
     }   c a t c h   ( e r r o r )   {  
         c o n s o l e . e r r o r ( " E r r o r   a p p l y i n g   e f f e c t s   t o   d r a f t   c o n t e n t : " ,   e r r o r ) ;  
         r e t u r n   d r a f t C o n t e n t ;  
     }  
 }  
 