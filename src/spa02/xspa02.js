/**
 * SPA02 - Multi-Language Hello World Application
 * Main JavaScript functionality with language cycling
 */

// Translation data with RTL support
const translations = {
    en: { text: 'Hello World', rtl: false },
    es: { text: 'Hola Mundo', rtl: false },
    fr: { text: 'Bonjour le Monde', rtl: false },
    de: { text: 'Hallo Welt', rtl: false },
    it: { text: 'Ciao Mondo', rtl: false },
    pt: { text: 'Olá Mundo', rtl: false },
    nl: { text: 'Hallo Wereld', rtl: false },
    sv: { text: 'Hej Världen', rtl: false },
    pl: { text: 'Witaj Świecie', rtl: false },
    cs: { text: 'Ahoj Světe', rtl: false },
    ja: { text: 'こんにちは世界', rtl: false },
    'zh-cn': { text: '你好世界', rtl: false },
    'zh-tw': { text: '你好世界', rtl: false },
    ko: { text: '안녕하세요 세계', rtl: false },
    ar: { text: 'مرحبا بالعالم', rtl: true },
    he: { text: 'שלום עולם', rtl: true },
    th: { text: 'สวัสดีชาวโลก', rtl: false },
    hi: { text: 'नमस्ते दुनिया', rtl: false },
    ru: { text: 'Привет мир', rtl: false },
    el: { text: 'Γεια σου Κόσμε', rtl: false }
};

// Application state
const languages = Object.keys(translations);
let currentIndex = 0;
let cycleInterval = null;
let isCycling = true;

// DOM elements
let greetingEl, selectEl, sliderEl, speedValueEl, statusEl;

/**
 * Initialize the application
 */
function initSPA02() {
    // Get DOM elements using shared utilities
    greetingEl = Utils.dom.getById('greeting');
    selectEl = Utils.dom.getById('languageSelect');
    sliderEl = Utils.dom.getById('speedSlider');
    speedValueEl = Utils.dom.getById('speedValue');
    statusEl = Utils.dom.getById('status');

    // Verify all elements exist
    if (!greetingEl || !selectEl || !sliderEl || !speedValueEl || !statusEl) {
        Utils.debug.error('Required DOM elements not found');
        return;
    }

    // Load saved preferences
    loadFromStorage();

    // Set up event listeners
    setupEventListeners();

    // Initialize greeting
    const initialLang = selectEl.value;
    currentIndex = languages.indexOf(initialLang);
    updateGreeting(initialLang);

    // Start auto-cycling
    startCycling();

    Utils.debug.log('SPA02 initialized successfully');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Language selector change
    Utils.events.on(selectEl, 'change', (e) => {
        stopCycling();
        updateGreeting(e.target.value);
        saveToStorage();
        currentIndex = languages.indexOf(e.target.value);
    });

    // Speed slider input
    Utils.events.on(sliderEl, 'input', (e) => {
        speedValueEl.textContent = e.target.value + 's';
        saveToStorage();
        
        if (isCycling) {
            startCycling();
        }
    });
}

/**
 * Update the greeting display
 * @param {string} langCode - Language code
 */
function updateGreeting(langCode) {
    const translation = translations[langCode];
    
    if (!translation) {
        Utils.debug.error('Invalid language code:', langCode);
        return;
    }

    greetingEl.textContent = translation.text;
    
    // Handle RTL languages
    if (translation.rtl) {
        Utils.dom.addClass(greetingEl, 'rtl');
    } else {
        Utils.dom.removeClass(greetingEl, 'rtl');
    }
}

/**
 * Save current settings to storage
 */
function saveToStorage() {
    Utils.storage.set('selectedLanguage', selectEl.value);
    Utils.storage.set('cycleSpeed', sliderEl.value);
}

/**
 * Load saved settings from storage
 */
function loadFromStorage() {
    const savedLang = Utils.storage.get('selectedLanguage');
    const savedSpeed = Utils.storage.get('cycleSpeed');
    
    if (savedLang && translations[savedLang]) {
        selectEl.value = savedLang;
    }
    
    if (savedSpeed) {
        sliderEl.value = savedSpeed;
        speedValueEl.textContent = savedSpeed + 's';
    }
}

/**
 * Start automatic language cycling
 */
function startCycling() {
    // Clear existing interval if any
    if (cycleInterval) {
        clearInterval(cycleInterval);
    }

    const speed = parseFloat(sliderEl.value) * 1000;
    
    cycleInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % languages.length;
        const langCode = languages[currentIndex];
        selectEl.value = langCode;
        updateGreeting(langCode);
        saveToStorage();
    }, speed);

    isCycling = true;
    statusEl.textContent = 'Auto-cycling through languages...';
    Utils.dom.addClass(statusEl, 'cycling');
}

/**
 * Stop automatic language cycling
 */
function stopCycling() {
    if (cycleInterval) {
        clearInterval(cycleInterval);
        cycleInterval = null;
    }
    
    isCycling = false;
    statusEl.textContent = 'Manual mode - select a language';
    Utils.dom.removeClass(statusEl, 'cycling');
}

// Initialize when DOM is ready
Utils.events.ready(() => {
    initSPA02();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopCycling();
});
