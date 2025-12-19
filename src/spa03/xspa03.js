/**
 * SPA03 Application Shell
 * Hash-based routing with iframe content loading
 */

(function() {
    'use strict';
    
    // ============================================
    // Configuration
    // ============================================
    
    const CONFIG = {
        defaultSpa: 'spa01',
        spaRoutes: {
            spa01: {
                path: '../spa01/spa01.html',
                title: 'Hello World'
            },
            spa02: {
                path: '../spa02/spa02.html',
                title: 'Multi-Language'
            }
        },
        loadingDelay: 300, // ms before showing loading indicator
        iframeTimeout: 10000 // ms before timing out iframe load
    };
    
    // ============================================
    // DOM Elements
    // ============================================
    
    const elements = {
        sidebar: null,
        sidebarToggle: null,
        sidebarOverlay: null,
        contentFrame: null,
        loadingIndicator: null,
        errorDisplay: null,
        errorMessage: null,
        errorRetry: null,
        navLinks: null,
        appShell: null
    };
    
    // ============================================
    // State Management
    // ============================================
    
    const state = {
        currentSpa: null,
        isMobile: false,
        sidebarOpen: false,
        loading: false,
        loadingTimeout: null,
        iframeLoadTimeout: null
    };
    
    // ============================================
    // Initialization
    // ============================================
    
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    }
    
    function initializeApp() {
        // Cache DOM elements
        cacheElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Check mobile state
        checkMobileState();
        
        // Setup hash routing
        setupRouting();
        
        // Load initial SPA based on hash or default
        loadInitialSpa();
    }
    
    function cacheElements() {
        elements.sidebar = document.getElementById('sidebar');
        elements.sidebarToggle = document.getElementById('sidebarToggle');
        elements.sidebarOverlay = document.getElementById('sidebarOverlay');
        elements.contentFrame = document.getElementById('contentFrame');
        elements.loadingIndicator = document.getElementById('loadingIndicator');
        elements.errorDisplay = document.getElementById('errorDisplay');
        elements.errorMessage = document.getElementById('errorMessage');
        elements.errorRetry = document.getElementById('errorRetry');
        elements.navLinks = document.querySelectorAll('.nav-link');
        elements.appShell = document.querySelector('.app-shell');
    }
    
    // ============================================
    // Event Listeners
    // ============================================
    
    function setupEventListeners() {
        // Navigation links
        elements.navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
        
        // Mobile sidebar toggle
        if (elements.sidebarToggle) {
            elements.sidebarToggle.addEventListener('click', toggleSidebar);
        }
        
        // Overlay click to close sidebar
        if (elements.sidebarOverlay) {
            elements.sidebarOverlay.addEventListener('click', closeSidebar);
        }
        
        // Error retry button
        if (elements.errorRetry) {
            elements.errorRetry.addEventListener('click', retryLoadSpa);
        }
        
        // Hash change for browser back/forward
        window.addEventListener('hashchange', handleHashChange);
        
        // Window resize for mobile detection
        window.addEventListener('resize', debounce(checkMobileState, 250));
        
        // Iframe load event
        elements.contentFrame.addEventListener('load', handleIframeLoad);
        
        // Iframe error event
        elements.contentFrame.addEventListener('error', handleIframeError);
        
        // ESC key to close sidebar on mobile
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // ============================================
    // Routing
    // ============================================
    
    function setupRouting() {
        // Ensure hash is properly formatted
        if (!window.location.hash) {
            window.location.hash = `#${CONFIG.defaultSpa}`;
        }
    }
    
    function loadInitialSpa() {
        const hash = window.location.hash.slice(1); // Remove '#'
        const spaId = hash || CONFIG.defaultSpa;
        loadSpa(spaId);
    }
    
    function handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && hash !== state.currentSpa) {
            loadSpa(hash);
        }
    }
    
    function handleNavClick(event) {
        event.preventDefault();
        const spaId = event.currentTarget.getAttribute('data-spa');
        
        if (spaId && spaId !== state.currentSpa) {
            window.location.hash = `#${spaId}`;
            // loadSpa will be called by hashchange event
            
            // Close sidebar on mobile after navigation
            if (state.isMobile) {
                closeSidebar();
            }
        }
    }
    
    // ============================================
    // SPA Loading
    // ============================================
    
    function loadSpa(spaId) {
        // Validate SPA exists
        if (!CONFIG.spaRoutes[spaId]) {
            showError(`Unknown application: ${spaId}`);
            return;
        }
        
        // Clear previous timeouts
        clearTimeout(state.loadingTimeout);
        clearTimeout(state.iframeLoadTimeout);
        
        // Update state
        state.currentSpa = spaId;
        state.loading = true;
        
        // Hide error if showing
        hideError();
        
        // Show loading indicator after delay
        state.loadingTimeout = setTimeout(() => {
            if (state.loading) {
                showLoading();
            }
        }, CONFIG.loadingDelay);
        
        // Set iframe timeout
        state.iframeLoadTimeout = setTimeout(() => {
            if (state.loading) {
                showError('Loading timeout. The application took too long to respond.');
                hideLoading();
            }
        }, CONFIG.iframeTimeout);
        
        // Update active nav link
        updateActiveNavLink(spaId);
        
        // Update page title
        updatePageTitle(spaId);
        
        // Load content in iframe
        const route = CONFIG.spaRoutes[spaId];
        elements.contentFrame.src = route.path;
    }
    
    function handleIframeLoad() {
        // Clear timeouts
        clearTimeout(state.loadingTimeout);
        clearTimeout(state.iframeLoadTimeout);
        
        // Check if iframe loaded successfully
        try {
            const iframeDoc = elements.contentFrame.contentDocument || 
                            elements.contentFrame.contentWindow.document;
            
            // Check if we got an error page
            if (iframeDoc.title === 'Error' || 
                iframeDoc.body.textContent.includes('404')) {
                showError('The requested application could not be found.');
                return;
            }
        } catch (e) {
            // Cross-origin or access denied - assume success
            console.log('Iframe loaded (cross-origin)');
        }
        
        // Hide loading indicator
        hideLoading();
        state.loading = false;
    }
    
    function handleIframeError() {
        clearTimeout(state.loadingTimeout);
        clearTimeout(state.iframeLoadTimeout);
        hideLoading();
        showError('Failed to load the application. Please check your connection.');
    }
    
    function retryLoadSpa() {
        if (state.currentSpa) {
            loadSpa(state.currentSpa);
        }
    }
    
    // ============================================
    // UI Updates
    // ============================================
    
    function updateActiveNavLink(spaId) {
        elements.navLinks.forEach(link => {
            const linkSpaId = link.getAttribute('data-spa');
            if (linkSpaId === spaId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }
    
    function updatePageTitle(spaId) {
        const route = CONFIG.spaRoutes[spaId];
        if (route && route.title) {
            document.title = `${route.title} - Sample Project`;
        }
    }
    
    function showLoading() {
        elements.loadingIndicator.classList.add('show');
    }
    
    function hideLoading() {
        elements.loadingIndicator.classList.remove('show');
    }
    
    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorDisplay.classList.add('show');
    }
    
    function hideError() {
        elements.errorDisplay.classList.remove('show');
    }
    
    // ============================================
    // Sidebar Management
    // ============================================
    
    function toggleSidebar() {
        if (state.sidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    function openSidebar() {
        state.sidebarOpen = true;
        elements.sidebar.classList.add('open');
        elements.sidebarOverlay.classList.add('show');
        elements.appShell.classList.add('sidebar-open');
        
        // Set focus to first nav link for accessibility
        const firstLink = elements.navLinks[0];
        if (firstLink) {
            firstLink.focus();
        }
    }
    
    function closeSidebar() {
        state.sidebarOpen = false;
        elements.sidebar.classList.remove('open');
        elements.sidebarOverlay.classList.remove('show');
        elements.appShell.classList.remove('sidebar-open');
    }
    
    // ============================================
    // Mobile Detection
    // ============================================
    
    function checkMobileState() {
        const wasMobile = state.isMobile;
        state.isMobile = window.innerWidth <= 768;
        
        // Close sidebar when transitioning to desktop
        if (wasMobile && !state.isMobile && state.sidebarOpen) {
            closeSidebar();
        }
    }
    
    // ============================================
    // Keyboard Navigation
    // ============================================
    
    function handleKeyDown(event) {
        // ESC key closes sidebar on mobile
        if (event.key === 'Escape' && state.isMobile && state.sidebarOpen) {
            closeSidebar();
        }
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ============================================
    // Initialize Application
    // ============================================
    
    init();
    
})();
