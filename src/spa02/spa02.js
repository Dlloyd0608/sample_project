/**
 * SPA02 - Multi-Language Hello World Application
 * Main JavaScript functionality with dynamic content loading
 */

// Application namespace
const NAMESPACE = 'spa02';

// Application state
const SPA02 = {
    metadata: null,
    languages: [],
    currentIndex: 0,
    cycleInterval: null,
    isCycling: true,
    elements: {
        heading: null,
        greeting: null,
        languageLabel: null,
        languageSelect: null,
        speedLabel: null,
        speedSlider: null,
        speedValue: null,
        status: null
    }
};

/**
 * Initialize the application
 */
async function initSPA02() {
    try {
        // Load metadata from JSON file
        SPA02.metadata = await Utils.data.loadJSON('spa02.json');
        
        if (!SPA02.metadata) {
            throw new Error('Failed to load SPA02 metadata');
        }
        
        Utils.debug.log('SPA02 metadata loaded:', SPA02.metadata);
        
        // Cache DOM elements
        cacheElements();
        
        // Populate static content
        populateStaticContent();
        
        // Populate language options
        populateLanguages();
        
        // Load saved preferences
        loadFromStorage();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize greeting
        const initialLang = SPA02.elements.languageSelect.value;
        SPA02.currentIndex = SPA02.languages.findIndex(lang => lang.code === initialLang);
        updateGreeting(initialLang);
        
        // Start auto-cycling
        startCycling();
        
        Utils.debug.log('SPA02 initialized successfully');
        
    } catch (error) {
        Utils.debug.error('Error initializing SPA02:', error);
        showErrorState();
    }
}

/**
 * Cache DOM elements
 */
function cacheElements() {
    SPA02.elements.heading = Utils.dom.getById('heading');
    SPA02.elements.greeting = Utils.dom.getById('greeting');
    SPA02.elements.languageLabel = Utils.dom.getById('languageLabel');
    SPA02.elements.languageSelect = Utils.dom.getById('languageSelect');
    SPA02.elements.speedLabel = Utils.dom.getById('speedLabel');
    SPA02.elements.speedSlider = Utils.dom.getById('speedSlider');
    SPA02.elements.speedValue = Utils.dom.getById('speedValue');
    SPA02.elements.status = Utils.dom.getById('status');
}

/**
 * Populate static content from metadata
 */
function populateStaticContent() {
    const content = SPA02.metadata.content;
    
    // Set heading
    if (SPA02.elements.heading && content.heading) {
        Utils.dom.setText(SPA02.elements.heading, content.heading);
    }
    
    // Set labels
    if (SPA02.elements.languageLabel && content.labels.languageSelect) {
        Utils.dom.setText(SPA02.elements.languageLabel, content.labels.languageSelect);
    }
    
    if (SPA02.elements.speedLabel && content.labels.speedSlider) {
        Utils.dom.setText(SPA02.elements.speedLabel, content.labels.speedSlider);
    }
    
    // Update page title
    if (SPA02.metadata.meta && SPA02.metadata.meta.title) {
        document.title = SPA02.metadata.meta.title;
    }
    
    // Apply slider settings
    const settings = SPA02.metadata.settings;
    if (settings && SPA02.elements.speedSlider) {
        SPA02.elements.speedSlider.min = settings.minSpeed;
        SPA02.elements.speedSlider.max = settings.maxSpeed;
        SPA02.elements.speedSlider.step = settings.speedStep;
        SPA02.elements.speedSlider.value = settings.defaultSpeed;
    }
}

/**
 * Populate language dropdown from metadata
 */
function populateLanguages() {
    SPA02.languages = SPA02.metadata.languages;
    
    if (!SPA02.elements.languageSelect) return;
    
    // Clear existing options
    SPA02.elements.languageSelect.innerHTML = '';
    
    // Add language options
    SPA02.languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        SPA02.elements.languageSelect.appendChild(option);
    });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Language selector change
    Utils.events.on(SPA02.elements.languageSelect, 'change', (e) => {
        stopCycling();
        updateGreeting(e.target.value);
        saveToStorage();
        SPA02.currentIndex = SPA02.languages.findIndex(lang => lang.code === e.target.value);
    });
    
    // Speed slider input
    Utils.events.on(SPA02.elements.speedSlider, 'input', (e) => {
        const speedUnit = SPA02.metadata.content.labels.speedUnit || 's';
        Utils.dom.setText(SPA02.elements.speedValue, e.target.value + speedUnit);
        saveToStorage();
        
        if (SPA02.isCycling) {
            startCycling();
        }
    });
}

/**
 * Update the greeting display
 * @param {string} langCode - Language code
 */
function updateGreeting(langCode) {
    const language = SPA02.languages.find(lang => lang.code === langCode);
    
    if (!language) {
        Utils.debug.error('Invalid language code:', langCode);
        return;
    }
    
    Utils.dom.setText(SPA02.elements.greeting, language.greeting);
    
    // Handle RTL languages
    if (language.rtl) {
        Utils.dom.addClass(SPA02.elements.greeting, 'rtl');
    } else {
        Utils.dom.removeClass(SPA02.elements.greeting, 'rtl');
    }
}

/**
 * Save current settings to storage with namespace
 */
function saveToStorage() {
    Utils.storage.set('selectedLanguage', SPA02.elements.languageSelect.value, NAMESPACE);
    Utils.storage.set('cycleSpeed', SPA02.elements.speedSlider.value, NAMESPACE);
}

/**
 * Load saved settings from storage
 */
function loadFromStorage() {
    const savedLang = Utils.storage.get('selectedLanguage', null, NAMESPACE);
    const savedSpeed = Utils.storage.get('cycleSpeed', null, NAMESPACE);
    
    // Load language preference
    if (savedLang) {
        const langExists = SPA02.languages.some(lang => lang.code === savedLang);
        if (langExists) {
            SPA02.elements.languageSelect.value = savedLang;
        }
    }
    
    // Load speed preference
    if (savedSpeed) {
        SPA02.elements.speedSlider.value = savedSpeed;
        const speedUnit = SPA02.metadata.content.labels.speedUnit || 's';
        Utils.dom.setText(SPA02.elements.speedValue, savedSpeed + speedUnit);
    } else {
        // Set default speed value display
        const speedUnit = SPA02.metadata.content.labels.speedUnit || 's';
        Utils.dom.setText(SPA02.elements.speedValue, SPA02.elements.speedSlider.value + speedUnit);
    }
}

/**
 * Start automatic language cycling
 */
function startCycling() {
    // Clear existing interval if any
    if (SPA02.cycleInterval) {
        clearInterval(SPA02.cycleInterval);
    }
    
    const speed = parseFloat(SPA02.elements.speedSlider.value) * 1000;
    
    SPA02.cycleInterval = setInterval(() => {
        SPA02.currentIndex = (SPA02.currentIndex + 1) % SPA02.languages.length;
        const language = SPA02.languages[SPA02.currentIndex];
        SPA02.elements.languageSelect.value = language.code;
        updateGreeting(language.code);
        saveToStorage();
    }, speed);
    
    SPA02.isCycling = true;
    
    // Update status
    const statusText = SPA02.metadata.content.status.cycling;
    Utils.dom.setText(SPA02.elements.status, statusText);
    Utils.dom.addClass(SPA02.elements.status, 'cycling');
}

/**
 * Stop automatic language cycling
 */
function stopCycling() {
    if (SPA02.cycleInterval) {
        clearInterval(SPA02.cycleInterval);
        SPA02.cycleInterval = null;
    }
    
    SPA02.isCycling = false;
    
    // Update status
    const statusText = SPA02.metadata.content.status.manual;
    Utils.dom.setText(SPA02.elements.status, statusText);
    Utils.dom.removeClass(SPA02.elements.status, 'cycling');
}

/**
 * Show error state when metadata fails to load
 */
function showErrorState() {
    const container = Utils.dom.query('.container');
    
    if (container) {
        container.innerHTML = `
            <h1>Error</h1>
            <p>Unable to load application content. Please refresh the page.</p>
        `;
    }
}

// Initialize when DOM is ready
Utils.events.ready(() => {
    initSPA02();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopCycling();
});
