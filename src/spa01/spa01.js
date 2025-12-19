/**
 * SPA01 - Simple Hello World Application
 * Main JavaScript functionality with dynamic content loading
 */

// Application state
const SPA01 = {
    metadata: null,
    elements: {
        emoji: null,
        heading: null,
        description: null,
        container: null
    }
};

/**
 * Initialize the application
 */
async function initSPA01() {
    try {
        // Load metadata from JSON file
        SPA01.metadata = await Utils.data.loadJSON('spa01.json');
        
        if (!SPA01.metadata) {
            throw new Error('Failed to load SPA01 metadata');
        }
        
        Utils.debug.log('SPA01 metadata loaded:', SPA01.metadata);
        
        // Cache DOM elements
        cacheElements();
        
        // Populate content from metadata
        populateContent();
        
        // Apply settings
        applySettings();
        
        // Initialize interactions
        initializeInteractions();
        
        Utils.debug.log('SPA01 initialized successfully!');
        
    } catch (error) {
        Utils.debug.error('Error initializing SPA01:', error);
        showErrorState();
    }
}

/**
 * Cache DOM elements
 */
function cacheElements() {
    SPA01.elements.emoji = Utils.dom.getById('emoji');
    SPA01.elements.heading = Utils.dom.getById('heading');
    SPA01.elements.description = Utils.dom.getById('description');
    SPA01.elements.container = Utils.dom.query('.container');
}

/**
 * Populate content from metadata
 */
function populateContent() {
    const content = SPA01.metadata.content;
    
    // Set emoji
    if (SPA01.elements.emoji && content.emoji) {
        Utils.dom.setText(SPA01.elements.emoji, content.emoji);
    }
    
    // Set heading
    if (SPA01.elements.heading && content.heading) {
        Utils.dom.setText(SPA01.elements.heading, content.heading);
    }
    
    // Set description
    if (SPA01.elements.description && content.description) {
        Utils.dom.setText(SPA01.elements.description, content.description);
    }
    
    // Update page title
    if (SPA01.metadata.meta && SPA01.metadata.meta.title) {
        document.title = SPA01.metadata.meta.title;
    }
}

/**
 * Apply settings from metadata
 */
function applySettings() {
    const settings = SPA01.metadata.settings;
    
    if (!settings) return;
    
    // Apply animation settings
    if (settings.animationEnabled && SPA01.elements.container) {
        if (settings.fadeInDuration) {
            SPA01.elements.container.style.animationDuration = settings.fadeInDuration;
        }
    }
}

/**
 * Initialize interactive features
 */
function initializeInteractions() {
    const emojiElement = SPA01.elements.emoji;
    
    if (!emojiElement) return;
    
    // Add hover effect
    Utils.events.on(emojiElement, 'mouseenter', () => {
        Utils.debug.log('Emoji hover detected');
    });
    
    // Add click interaction
    Utils.events.on(emojiElement, 'click', () => {
        Utils.debug.log('Emoji clicked! 👋');
        // Could add more interactive features here
        animateEmoji();
    });
}

/**
 * Animate emoji on click
 */
function animateEmoji() {
    const emojiElement = SPA01.elements.emoji;
    
    if (!emojiElement) return;
    
    // Remove animation class if exists
    Utils.dom.removeClass(emojiElement, 'wave');
    
    // Trigger reflow to restart animation
    void emojiElement.offsetWidth;
    
    // Add animation class back
    Utils.dom.addClass(emojiElement, 'wave');
}

/**
 * Show error state when metadata fails to load
 */
function showErrorState() {
    // Fallback content when metadata fails to load
    const container = Utils.dom.query('.container');
    
    if (container) {
        container.innerHTML = `
            <span class="emoji">⚠️</span>
            <h1>Error</h1>
            <p>Unable to load application content. Please refresh the page.</p>
        `;
    }
}

// Initialize when DOM is ready
Utils.events.ready(() => {
    initSPA01();
});
