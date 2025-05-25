/**
 * ================================
 * MAIN APPLICATION CORE
 * Web Dev Pro - Central App Logic
 * ================================
 */

class WebDevApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        this.modules = new Map();
        this.eventListeners = new Map();
        this.state = {
            theme: 'dark',
            user: null,
            preferences: {},
            analytics: {
                totalViews: 0,
                sectionsVisited: new Set(),
                timeSpent: {},
                lastActivity: null
            }
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            console.log('🚀 Initializing Web Dev Pro...');
            
            // Initialize storage first
            await this.initStorage();
            
            // Load user state
            await this.loadState();
            
            // Initialize core modules
            await this.initModules();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize PWA features
            this.initPWA();
            
            // Load initial content
            await this.loadInitialContent();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Web Dev Pro initialized successfully!');
            
            // Show welcome message for first-time users
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Alkalmazás inicializálási hiba', error.message);
        }
    }

    /**
     * Initialize storage system
     */
    async initStorage() {
        if (typeof Storage !== 'undefined') {
            // Check if we can use IndexedDB for better storage
            if ('indexedDB' in window) {
                await Storage.initIndexedDB();
            }
            console.log('💾 Storage system initialized');
        } else {
            console.warn('⚠️ Local storage not available');
        }
    }

    /**
     * Load application state from storage
     */
    async loadState() {
        try {
            const savedState = await Storage.get('appState');
            if (savedState) {
                this.state = { ...this.state, ...savedState };
            }

            // Load theme
            const savedTheme = await Storage.get('theme') || 'dark';
            this.setTheme(savedTheme);

            // Load user preferences
            const preferences = await Storage.get('preferences');
            if (preferences) {
                this.state.preferences = preferences;
            }

            console.log('📋 Application state loaded');
        } catch (error) {
            console.warn('⚠️ Could not load saved state:', error);
        }
    }

    /**
     * Initialize core modules
     */
    async initModules() {
        const moduleList = [
            'Navigation',
            'Search', 
            'Themes',
            'Notes',
            'Bookmarks',
            'Progress',
            'Notifications'
        ];

        for (const moduleName of moduleList) {
            try {
                if (window[moduleName]) {
                    const module = new window[moduleName](this);
                    await module.init?.();
                    this.modules.set(moduleName.toLowerCase(), module);
                    console.log(`✅ ${moduleName} module loaded`);
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load ${moduleName}:`, error);
            }
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Navigation events
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Visibility API for analytics
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // User menu toggle
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });
            
            document.addEventListener('click', () => {
                userDropdown.classList.add('hidden');
            });
        }

        // FAB menu toggle
        const fabMain = document.getElementById('fabMain');
        const fabMenu = document.getElementById('fabMenu');
        
        if (fabMain && fabMenu) {
            fabMain.addEventListener('click', () => {
                fabMenu.classList.toggle('hidden');
            });
        }

        console.log('👂 Event listeners setup complete');
    }

    /**
     * Handle global click events
     */
    handleGlobalClick(event) {
        const target = event.target;
        
        // Handle modal close clicks
        if (target.classList.contains('modal') || target.classList.contains('modal-close')) {
            const modal = target.closest('.modal') || target;
            this.closeModal(modal.id);
        }
        
        // Handle copy code buttons
        if (target.classList.contains('copy-btn')) {
            this.copyCode(target);
        }
        
        // Handle bookmark buttons
        if (target.classList.contains('bookmark-btn')) {
            this.toggleBookmark(target.dataset.id);
        }
        
        // Handle navigation links
        if (target.dataset.section) {
            this.navigateToSection(target.dataset.section);
        }
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeydown(event) {
        // Ctrl/Cmd + K - Focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + Number - Navigate to section
        if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
            event.preventDefault();
            const sectionIndex = parseInt(event.key) - 1;
            const navButtons = document.querySelectorAll('.nav-btn');
            if (navButtons[sectionIndex]) {
                navButtons[sectionIndex].click();
            }
        }
        
        // Escape key - Close modals/menus
        if (event.key === 'Escape') {
            this.closeAllModals();
            this.closeAllMenus();
        }
        
        // Ctrl/Cmd + S - Save current work
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.saveCurrentWork();
        }
    }

    /**
     * Handle before unload - save state
     */
    async handleBeforeUnload() {
        await this.saveState();
        this.trackAnalytics('session_end');
    }

    /**
     * Handle online/offline events
     */
    handleOnline() {
        this.showNotification('success', 'Kapcsolat helyreállt', 'Újra online vagy!');
        document.body.classList.remove('offline');
    }

    handleOffline() {
        this.showNotification('warning', 'Nincs internetkapcsolat', 'Offline módban dolgozol');
        document.body.classList.add('offline');
    }

    /**
     * Handle visibility change for analytics
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.trackAnalytics('page_blur');
            this.saveState();
        } else {
            this.trackAnalytics('page_focus');
            this.state.analytics.lastActivity = new Date().toISOString();
        }
    }

    /**
     * Initialize PWA features
     */
    initPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registered:', registration.scope);
                })
                .catch(error => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        }

        // Handle install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallBanner();
        });

        // Install button handler
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`Install prompt outcome: ${outcome}`);
                    deferredPrompt = null;
                    this.hideInstallBanner();
                }
            });
        }

        // Dismiss install banner
        const dismissBtn = document.getElementById('dismissInstall');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hideInstallBanner();
                Storage.set('installBannerDismissed', true);
            });
        }
    }

    /**
     * Load initial content
     */
    async loadInitialContent() {
        // Load dashboard data
        await this.loadDashboard();
        
        // Update progress
        this.updateProgress(10);
        
        // Load recent activity
        this.loadRecentActivity();
        
        // Load favorites
        this.loadFavorites();
        
        console.log('📄 Initial content loaded');
    }

    /**
     * Navigate to a section
     */
    async navigateToSection(sectionId) {
        if (this.currentSection === sectionId) return;

        try {
            // Update navigation state
            this.currentSection = sectionId;
            
            // Update active nav button
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.section === sectionId);
            });
            
            // Hide current section
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Load section content if needed
            const section = document.getElementById(sectionId);
            if (!section) {
                await this.loadSectionContent(sectionId);
            }
            
            // Show new section
            const newSection = document.getElementById(sectionId);
            if (newSection) {
                newSection.classList.add('active');
            }
            
            // Update analytics
            this.trackSectionVisit(sectionId);
            
            // Update progress
            this.updateProgress(20);
            
            console.log(`📍 Navigated to: ${sectionId}`);
            
        } catch (error) {
            console.error('❌ Navigation error:', error);
            this.showError('Navigációs hiba', 'Nem sikerült betölteni a szekciót');
        }
    }

    /**
     * Load section content dynamically
     */
    async loadSectionContent(sectionId) {
        const contentLoader = this.modules.get('contentloader');
        if (contentLoader) {
            await contentLoader.loadSection(sectionId);
        }
    }

    /**
     * Set application theme
     */
    setTheme(theme) {
        this.state.theme = theme;
        document.body.setAttribute('data-theme', theme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
        
        // Save theme preference
        Storage.set('theme', theme);
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.showNotification('success', 'Téma megváltoztatva', `${newTheme === 'dark' ? 'Sötét' : 'Világos'} téma aktiválva`);
    }

    /**
     * Show install banner
     */
    showInstallBanner() {
        const banner = document.getElementById('installBanner');
        if (banner && !Storage.get('installBannerDismissed')) {
            banner.classList.remove('hidden');
        }
    }

    /**
     * Hide install banner
     */
    hideInstallBanner() {
        const banner = document.getElementById('installBanner');
        if (banner) {
            banner.classList.add('hidden');
        }
    }

    /**
     * Load dashboard data
     */
    async loadDashboard() {
        const stats = await this.calculateStats();
        this.updateDashboardStats(stats);
    }

    /**
     * Calculate user statistics
     */
    async calculateStats() {
        const bookmarks = await Storage.get('bookmarks') || [];
        const notes = await Storage.get('notes') || [];
        const quizResults = await Storage.get('quizResults') || [];
        
        return {
            totalViews: this.state.analytics.totalViews || 0,
            completedQuizzes: quizResults.length,
            bookmarksCount: bookmarks.length,
            notesCount: notes.length
        };
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats(stats) {
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                this.animateCounter(element, value);
            }
        });
    }

    /**
     * Animate counter values
     */
    animateCounter(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Load recent activity
     */
    async loadRecentActivity() {
        const recentActivity = await Storage.get('recentActivity') || [];
        const container = document.getElementById('recentActivity');
        
        if (container) {
            container.innerHTML = recentActivity.length ? 
                recentActivity.slice(0, 5).map(item => this.createActivityItem(item)).join('') :
                '<p class="text-muted">Még nincs aktivitás</p>';
        }
    }

    /**
     * Load favorites
     */
    async loadFavorites() {
        const favorites = await Storage.get('bookmarks') || [];
        const container = document.getElementById('favoritesList');
        
        if (container) {
            container.innerHTML = favorites.length ?
                favorites.slice(0, 5).map(item => this.createFavoriteItem(item)).join('') :
                '<p class="text-muted">Még nincsenek kedvencek</p>';
        }
    }

    /**
     * Create activity item HTML
     */
    createActivityItem(activity) {
        return `
            <div class="recent-item" onclick="App.navigateToSection('${activity.section}')">
                <div class="item-info">
                    <div class="item-title">${activity.title}</div>
                    <div class="item-meta">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `;
    }

    /**
     * Create favorite item HTML
     */
    createFavoriteItem(favorite) {
        return `
            <div class="favorite-item" onclick="App.navigateToSection('${favorite.section}')">
                <div class="item-info">
                    <div class="item-title">${favorite.title}</div>
                    <div class="item-meta">${favorite.category}</div>
                </div>
                <div class="item-actions">
                    <button class="item-action" onclick="event.stopPropagation(); App.removeBookmark('${favorite.id}')" title="Törlés">🗑️</button>
                </div>
            </div>
        `;
    }

    /**
     * Format timestamp for display
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffHours < 1) return 'Most';
        if (diffHours < 24) return `${diffHours} órája`;
        if (diffDays < 7) return `${diffDays} napja`;
        return date.toLocaleDateString('hu-HU');
    }

    /**
     * Track section visit for analytics
     */
    trackSectionVisit(sectionId) {
        this.state.analytics.sectionsVisited.add(sectionId);
        this.state.analytics.totalViews++;
        this.state.analytics.lastActivity = new Date().toISOString();
        
        // Add to recent activity
        this.addRecentActivity({
            section: sectionId,
            title: this.getSectionTitle(sectionId),
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get section title by ID
     */
    getSectionTitle(sectionId) {
        const titleMap = {
            'dashboard': 'Dashboard',
            'html': 'HTML Alapok',
            'css': 'CSS Stílusok',
            'javascript': 'JavaScript',
            'layout': 'Layout & Positioning',
            'responsive': 'Responsive Design',
            'snippets': 'Code Snippets',
            'debugging': 'Debugging Tippek',
            'errors': 'Gyakori Hibák',
            'tools': 'Eszközök & Workflow',
            'performance': 'Performance',
            'accessibility': 'Accessibility',
            'modern': 'Modern CSS',
            'animations': 'CSS Animációk',
            'playground': 'Code Playground',
            'quiz': 'Kvíz'
        };
        return titleMap[sectionId] || sectionId;
    }

    /**
     * Add recent activity
     */
    async addRecentActivity(activity) {
        const recentActivity = await Storage.get('recentActivity') || [];
        recentActivity.unshift(activity);
        
        // Keep only last 20 activities
        if (recentActivity.length > 20) {
            recentActivity.splice(20);
        }
        
        await Storage.set('recentActivity', recentActivity);
        this.loadRecentActivity();
    }

    /**
     * Update progress bar
     */
    updateProgress(percentage) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(percentage, 100)}%`;
        }
    }

    /**
     * Show notification
     */
    showNotification(type, title, message) {
        const notifications = this.modules.get('notifications');
        if (notifications) {
            notifications.show(type, title, message);
        }
    }

    /**
     * Show error notification
     */
    showError(title, message) {
        this.showNotification('error', title, message);
    }

    /**
     * Show welcome message for new users
     */
    showWelcomeMessage() {
        const isFirstVisit = !Storage.get('hasVisited');
        if (isFirstVisit) {
            setTimeout(() => {
                this.showNotification('success', 'Üdvözlünk!', 'Fedezd fel a Web Dev Pro funkcióit!');
                Storage.set('hasVisited', true);
            }, 1000);
        }
    }

    /**
     * Copy code to clipboard
     */
    async copyCode(button) {
        const codeBlock = button.closest('.code-example');
        const code = codeBlock.querySelector('pre code').textContent;
        
        try {
            await navigator.clipboard.writeText(code);
            const originalText = button.textContent;
            button.textContent = '✅ Másolva!';
            button.style.background = 'var(--success)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('Copy failed:', error);
            this.showError('Másolási hiba', 'Nem sikerült a vágólapra másolni');
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    /**
     * Close all dropdown menus
     */
    closeAllMenus() {
        document.querySelectorAll('.dropdown, .fab-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
    }

    /**
     * Close specific modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Save current work (placeholder for specific implementations)
     */
    async saveCurrentWork() {
        await this.saveState();
        this.showNotification('success', 'Mentve', 'Munkád automatikusan mentve!');
    }

    /**
     * Save application state
     */
    async saveState() {
        try {
            await Storage.set('appState', this.state);
            console.log('💾 Application state saved');
        } catch (error) {
            console.error('❌ Failed to save state:', error);
        }
    }

    /**
     * Track analytics event
     */
    trackAnalytics(event, data = {}) {
        // Simple analytics tracking
        console.log(`📊 Analytics: ${event}`, data);
        
        // In production, you might send this to an analytics service
        // analytics.track(event, data);
    }

    /**
     * Get module instance
     */
    getModule(name) {
        return this.modules.get(name.toLowerCase());
    }

    /**
     * Check if app is initialized
     */
    isReady() {
        return this.isInitialized;
    }
}

// Create global app instance
const App = new WebDevApp();

// Make it globally available
window.App = App;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}