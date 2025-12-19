/**
 * Shared Utility Functions
 * Common JavaScript utilities used across all SPAs
 */

const Utils = {
    /**
     * Storage utilities for localStorage operations
     */
    storage: {
        /**
         * Save data to localStorage
         * @param {string} key - Storage key
         * @param {any} value - Value to store (will be JSON stringified)
         * @returns {boolean} Success status
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        /**
         * Retrieve data from localStorage
         * @param {string} key - Storage key
         * @param {any} defaultValue - Default value if key doesn't exist
         * @returns {any} Retrieved value or default
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         * @returns {boolean} Success status
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        /**
         * Clear all localStorage
         * @returns {boolean} Success status
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    },

    /**
     * DOM manipulation utilities
     */
    dom: {
        /**
         * Safely get element by ID
         * @param {string} id - Element ID
         * @returns {HTMLElement|null} Element or null
         */
        getById(id) {
            return document.getElementById(id);
        },

        /**
         * Safely query selector
         * @param {string} selector - CSS selector
         * @returns {HTMLElement|null} Element or null
         */
        query(selector) {
            return document.querySelector(selector);
        },

        /**
         * Query all elements matching selector
         * @param {string} selector - CSS selector
         * @returns {NodeList} Node list
         */
        queryAll(selector) {
            return document.querySelectorAll(selector);
        },

        /**
         * Add class to element
         * @param {HTMLElement} element - Target element
         * @param {string} className - Class name to add
         */
        addClass(element, className) {
            if (element && className) {
                element.classList.add(className);
            }
        },

        /**
         * Remove class from element
         * @param {HTMLElement} element - Target element
         * @param {string} className - Class name to remove
         */
        removeClass(element, className) {
            if (element && className) {
                element.classList.remove(className);
            }
        },

        /**
         * Toggle class on element
         * @param {HTMLElement} element - Target element
         * @param {string} className - Class name to toggle
         */
        toggleClass(element, className) {
            if (element && className) {
                element.classList.toggle(className);
            }
        },

        /**
         * Check if element has class
         * @param {HTMLElement} element - Target element
         * @param {string} className - Class name to check
         * @returns {boolean} Has class status
         */
        hasClass(element, className) {
            return element ? element.classList.contains(className) : false;
        }
    },

    /**
     * Event utilities
     */
    events: {
        /**
         * Add event listener with error handling
         * @param {HTMLElement} element - Target element
         * @param {string} event - Event type
         * @param {Function} handler - Event handler
         * @param {boolean} useCapture - Use capture phase
         */
        on(element, event, handler, useCapture = false) {
            if (element && event && handler) {
                element.addEventListener(event, handler, useCapture);
            }
        },

        /**
         * Remove event listener
         * @param {HTMLElement} element - Target element
         * @param {string} event - Event type
         * @param {Function} handler - Event handler
         */
        off(element, event, handler) {
            if (element && event && handler) {
                element.removeEventListener(event, handler);
            }
        },

        /**
         * Wait for DOM to be ready
         * @param {Function} callback - Callback function
         */
        ready(callback) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        }
    },

    /**
     * Validation utilities
     */
    validate: {
        /**
         * Check if value is not null/undefined/empty
         * @param {any} value - Value to check
         * @returns {boolean} Is valid
         */
        isNotEmpty(value) {
            return value !== null && value !== undefined && value !== '';
        },

        /**
         * Check if string is valid
         * @param {any} value - Value to check
         * @returns {boolean} Is valid string
         */
        isString(value) {
            return typeof value === 'string' && value.length > 0;
        },

        /**
         * Check if number is valid
         * @param {any} value - Value to check
         * @returns {boolean} Is valid number
         */
        isNumber(value) {
            return typeof value === 'number' && !isNaN(value);
        },

        /**
         * Check if value is in range
         * @param {number} value - Value to check
         * @param {number} min - Minimum value
         * @param {number} max - Maximum value
         * @returns {boolean} Is in range
         */
        inRange(value, min, max) {
            return this.isNumber(value) && value >= min && value <= max;
        }
    },

    /**
     * Animation utilities
     */
    animation: {
        /**
         * Smooth scroll to element
         * @param {HTMLElement|string} target - Target element or selector
         * @param {number} duration - Animation duration in ms
         */
        scrollTo(target, duration = 500) {
            const element = typeof target === 'string' 
                ? document.querySelector(target) 
                : target;
            
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        },

        /**
         * Add fade-in animation
         * @param {HTMLElement} element - Target element
         */
        fadeIn(element) {
            if (element) {
                element.style.animation = 'fadeIn 0.6s ease-out';
            }
        }
    },

    /**
     * Formatting utilities
     */
    format: {
        /**
         * Format number with decimals
         * @param {number} value - Number to format
         * @param {number} decimals - Number of decimal places
         * @returns {string} Formatted number
         */
        number(value, decimals = 2) {
            return parseFloat(value).toFixed(decimals);
        },

        /**
         * Capitalize first letter
         * @param {string} str - String to capitalize
         * @returns {string} Capitalized string
         */
        capitalize(str) {
            return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        }
    },

    /**
     * Debug utilities
     */
    debug: {
        /**
         * Log message to console (only in development)
         * @param {string} message - Message to log
         * @param {any} data - Optional data to log
         */
        log(message, data = null) {
            if (console && console.log) {
                data ? console.log(message, data) : console.log(message);
            }
        },

        /**
         * Log error to console
         * @param {string} message - Error message
         * @param {any} error - Error object
         */
        error(message, error = null) {
            if (console && console.error) {
                error ? console.error(message, error) : console.error(message);
            }
        }
    }
};

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
