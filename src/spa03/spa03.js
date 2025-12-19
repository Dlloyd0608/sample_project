/**
 * SPA03 Application Shell
 * Hash-based routing with iframe content loading
 * Dynamic content loading from metadata
 */

(function() {
    'use strict';
    
    // Application namespace
    const NAMESPACE = 'spa03';
    
    // ============================================
    // State Management
    // ============================================
    
    const state = {
        metadata: null,
        config: null,
        currentSpa: null,
        isMobile: false,
        sidebarOpen: false,
        loading: false,
        loadingTimeout: null,
        iframeLoadTimeout: null
    };
    
    const elements = {
        sidebar: null,
        sidebarTitle: null,
        sidebarToggle: null,
        sidebarOverlay: null,
        navList: null,
        version: null,
        contentFrame: null,
        loadingIndicator: null,
        loadingText: null,
        errorDisplay: null,
        errorIcon: null,
        errorTitle: null,
        errorMessage: null,
        errorRetry: null,
        appShell: null
    };
    
    // ============================================
    // Initialization
    // ============================================
    
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }
    }
    
    async function initializeApp() {
        try {
            // Load metadata
            await loadMetadata();
            
            // Cache DOM elements
            cacheElements();
            
            // Populate static content
            populateStaticContent();
            
            // Populate navigation
            populateNavigation();
            
            // Setup event listeners
            setupEventListeners();
            
            // Check mobile state
            checkMobileState();
            
            // Setup hash routing
            setupRouting();
            
            // Load initial SPA based on hash or saved preference
            loadInitialSpa();
            
        } catch (error) {
            console.error('Error initializing SPA03:', error);
            showFallbackError();
        }
    }
    
    async function loadMetadata() {
        state.metadata = await Utils.data.loadJSON('spa03.json');
        
        if (!state.metadata) {
            throw new Error('Failed to load SPA03 metadata');
        }
        
        // Extract configuration
        state.config = {
            defaultSpa: state.metadata.settings.defaultSpa,
            spaRoutes: {},
            loadingDelay: state.metadata.settings.loadingDelay,
            iframeTimeout: state.metadata.settings.iframeTimeout,
            mobileBreakpoint: state.metadata.settings.mobileBreakpoint
        };
        
        // Build routes from navigation metadata
        state.metadata.content.navigation.forEach(nav => {
            state.config.spaRoutes[nav.id] = {
                path: nav.path,
                title: nav.title
            };
        });
        
        console.log('SPA03 metadata loaded:', state.metadata);
    }
    
    function cacheElements() {
        elements.sidebar = document.getElementById('sidebar');
        elements.sidebarTitle = document.getElementById('sidebarTitle');
        elements.sidebarToggle = document.getElementById('sidebarToggle');
        elements.sidebarOverlay = document.getElementById('sidebarOverlay');
        elements.navList = document.getElementById('navList');
        elements.version = document.getElementById('version');
        elements.contentFrame = document.getElementById('contentFrame');
        elements.loadingIndicator = document.getElementById('loadingIndicator');
        elements.loadingText = document.getElementById('loadingText');
        elements.errorDisplay = document.getElementById('errorDisplay');
        elements.errorIcon = document.getElementById('errorIcon');
        elements.errorTitle = document.getElementById('errorTitle');
        elements.errorMessage = document.getElementById('errorMessage');
        elements.errorRetry = document.getElementById('errorRetry');
        elements.appShell = document.querySelector('.app-shell');
    }
    
    function populateStaticContent() {
        const content = state.metadata.content;
        
        // Sidebar header
        if (elements.sidebarTitle && content.sidebar.title) {
            Utils.dom.setText(elements.sidebarTitle, content.sidebar.title);
        }
        
        if (elements.sidebarToggle && content.sidebar.toggleAriaLabel) {
            Utils.dom.setAttr(elements.sidebarToggle, 'aria-label', content.sidebar.toggleAriaLabel);
        }
        
        // Sidebar footer
        if (elements.version && content.sidebar.version) {
            Utils.dom.setText(elements.version, content.sidebar.version);
        }
        
        // Loading text
        if (elements.loadingText && content.loading.text) {
            Utils.dom.setText(elements.loadingText, content.loading.text);
        }
        
        // Error content
        if (elements.errorIcon && content.error.icon) {
            Utils.dom.setText(elements.errorIcon, content.error.icon);
        }
        
        if (elements.errorTitle && content.error.title) {
            Utils.dom.setText(elements.errorTitle, content.error.title);
        }
        
        if (elements.errorRetry && content.error.retryButton) {
            Utils.dom.setText(elements.errorRetry, content.error.retryButton);
        }
        
        // Update page title
        if (state.metadata.meta && state.metadata.meta.title) {
            document.title = state.metadata.meta.title;
        }
    }
    
    function populateNavigation() {
        if (!elements.navList) return;
        
        // Clear existing navigation
        elements.navList.innerHTML = '';
        
        // Create navigation items from metadata
        state.metadata.content.navigation.forEach(navItem => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            
            const a = document.createElement('a');
            a.href = `#${navItem.id}`;
            a.className = 'nav-link';
            a.setAttribute('data-spa', navItem.id);
            
            const icon = document.createElement('span');
            icon.className = 'nav-icon';
            icon.textContent = navItem.icon;
            
            const text = document.createElement('span');
            text.className = 'nav-text';
            text.textContent = navItem.text;
            
            a.appendChild(icon);
            a.appendChild(text);
            li.appendChild(a);
            elements.navList.appendChild(li);
        });
    }
    
    // ============================================
    // Event Listeners
    // ============================================
    
    function setupEventListeners() {
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
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
        
        // Iframe events
        elements.contentFrame.addEventListener('load', handleIframeLoad);
        elements.contentFrame.addEventListener('error', handleIframeError);
        
        // ESC key to close sidebar on mobile
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // ============================================
    // Routing
    // ============================================
    
    function setupRouting() {
        // Check for saved SPA preference
        const savedSpa = Utils.storage.get('lastVisitedSpa', null, NAMESPACE);
        
        // If no hash, use saved preference or default
        if (!window.location.hash) {
            const initialSpa = savedSpa || state.config.defaultSpa;
            window.location.hash = `#${initialSpa}`;
        }
    }
    
    function loadInitialSpa() {
        const hash = window.location.hash.slice(1);
        const spaId = hash || state.config.defaultSpa;
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
        if (!state.config.spaRoutes[spaId]) {
            const errorMsg = Utils.format.template(
                state.metadata.content.error.messages.unknown,
                { app: spaId }
            );
            showError(errorMsg);
            return;
        }
        
        // Clear previous timeouts
        clearTimeout(state.loadingTimeout);
        clearTimeout(state.iframeLoadTimeout);
        
        // Update state
        state.currentSpa = spaId;
        state.loading = true;
        
        // Save preference
        Utils.storage.set('lastVisitedSpa', spaId, NAMESPACE);
        
        // Hide error if showing
        hideError();
        
        // Show loading indicator after delay
        state.loadingTimeout = setTimeout(() => {
            if (state.loading) {
                showLoading();
            }
        }, state.config.loadingDelay);
        
        // Set iframe timeout
        state.iframeLoadTimeout = setTimeout(() => {
            if (state.loading) {
                const timeoutMsg = state.metadata.content.error.messages.timeout;
                showError(timeoutMsg);
                hideLoading();
            }
        }, state.config.iframeTimeout);
        
        // Update active nav link
        updateActiveNavLink(spaId);
        
        // Update page title
        updatePageTitle(spaId);
        
        // Load content in iframe
        const route = state.config.spaRoutes[spaId];
        elements.contentFrame.src = route.path;
    }
    
    function handleIframeLoad() {
        clearTimeout(state.loadingTimeout);
        clearTimeout(state.iframeLoadTimeout);
        
        // Check if iframe loaded successfully
        try {
            const iframeDoc = elements.contentFrame.contentDocument || 
                            elements.contentFrame.contentWindow.document;
            
            if (iframeDoc.title === 'Error' || 
                iframeDoc.body.textContent.includes('404')) {
                const notFoundMsg = state.metadata.content.error.messages.notFound;
                showError(notFoundMsg);
                return;
            }
        } catch (e) {
            console.log('Iframe loaded (cross-origin)');
        }
        
        hideLoading();
        state.loading = false;
    }
    
    function handleIframeError() {
        clearTimeout(state.loadingTimeout);
        clearTimeout(state.iframeLoadTimeout);
        hideLoading();
        
        const loadFailedMsg = state.metadata.content.error.messages.loadFailed;
        showError(loadFailedMsg);
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
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
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
        const route = state.config.spaRoutes[spaId];
        if (route && route.title) {
            const sidebarTitle = state.metadata.content.sidebar.title;
            document.title = `${route.title} - ${sidebarTitle}`;
        }
    }
    
    function showLoading() {
        elements.loadingIndicator.classList.add('show');
    }
    
    function hideLoading() {
        elements.loadingIndicator.classList.remove('show');
    }
    
    function showError(message) {
        Utils.dom.setText(elements.errorMessage, message);
        elements.errorDisplay.classList.add('show');
    }
    
    function hideError() {
        elements.errorDisplay.classList.remove('show');
    }
    
    function showFallbackError() {
        const container = document.body;
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
                <div>
                    <h1>⚠️</h1>
                    <h2>Application Error</h2>
                    <p>Unable to load the application. Please refresh the page.</p>
                </div>
            </div>
        `;
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
        
        const firstLink = document.querySelector('.nav-link');
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
        state.isMobile = window.innerWidth <= state.config.mobileBreakpoint;
        
        if (wasMobile && !state.isMobile && state.sidebarOpen) {
            closeSidebar();
        }
    }
    
    // ============================================
    // Keyboard Navigation
    // ============================================
    
    function handleKeyDown(event) {
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
