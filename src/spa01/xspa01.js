/**
 * SPA01 - Simple Hello World Application
 * Main JavaScript functionality
 */

// Wait for DOM to be ready
Utils.events.ready(() => {
    // Log success message
    Utils.debug.log('Hello World - SPA01 loaded successfully!');
    
    // Example: Using shared utilities
    const container = Utils.dom.query('.container');
    if (container) {
        Utils.debug.log('Container element found', container);
    }
    
    // Optional: Add any SPA01-specific initialization here
    initializeSPA01();
});

/**
 * Initialize SPA01 specific functionality
 */
function initializeSPA01() {
    // Get emoji element
    const emojiElement = Utils.dom.query('.emoji');
    
    if (emojiElement) {
        // Add hover effect
        Utils.events.on(emojiElement, 'mouseenter', () => {
            Utils.debug.log('Emoji hover detected');
        });
        
        // Add click interaction (optional)
        Utils.events.on(emojiElement, 'click', () => {
            Utils.debug.log('Emoji clicked! 👋');
            // Could add more interactive features here
        });
    }
}
