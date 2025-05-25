/**
 * ================================
 * NAVIGATION SYSTEM
 * Advanced navigation with history and breadcrumbs
 * ================================
 */

class NavigationManager {
    constructor(app) {
        this.app = app;
        this.history = [];
        this.currentIndex = -1;
        this.maxHistoryLength = 50;
        this.sections = new Map();
        this.breadcrumbs = [];
    }

    /**
     * Initialize navigation system
     */
    async init() {
        this.setupEventListeners();
        this.loadSectionRegistry();
        this.setupHistoryAPI();
        console.log('🧭 Navigation system initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Nav button clicks
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const section = btn.dataset.section;
                if (section) {
                    this.navigateTo(section);
                }
            });
        });

        // Browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.navigateTo(e.state.section, false);
            }
        });

        // Handle link clicks with data-navigate
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-navigate]');
            if (link) {
                e.preventDefault();
                const section = link.dataset.navigate;
                const subsection = link.dataset.subsection;
                this.navigateTo(section, true, subsection);
            }
        });
    }

    /**
     * Load section registry
     */
    loadSectionRegistry() {
        this.sections.set('dashboard', {
            title: 'Dashboard',
            icon: '📊',
            description: 'Áttekintés és statisztikák',
            category: 'core',
            weight: 0
        });

        this.sections.set('html', {
            title: 'HTML Alapok',
            icon: '📄',
            description: 'HTML struktúra és elemek',
            category: 'basics',
            weight: 1
        });

        this.sections.set('css', {
            title: 'CSS Stílusok',
            icon: '🎨',
            description: 'CSS tulajdonságok és szelektorok',
            category: 'basics',
            weight: 2
        });

        this.sections.set('javascript', {
            title: 'JavaScript',
            icon: '⚡',
            description: 'JavaScript alapok és DOM',
            category: 'basics',
            weight: 3
        });

        this.sections.set('layout', {
            title: 'Layout & Positioning',
            icon: '📐',
            description: 'CSS Grid, Flexbox és pozicionálás',
            category: 'advanced',
            weight: 4
        });

        this.sections.set('responsive', {
            title: 'Responsive Design',
            icon: '📱',
            description: 'Mobil-barát tervezés',
            category: 'advanced',
            weight: 5
        });

        this.sections.set('snippets', {
            title: 'Code Snippets',
            icon: '🔧',
            description: 'Hasznos kódrészletek',
            category: 'tools',
            weight: 6
        });

        this.sections.set('debugging', {
            title: 'Debugging Tippek',
            icon: '🐛',
            description: 'Hibakeresési technikák',
            category: 'tools',
            weight: 7
        });

        this.sections.set('errors', {
            title: 'Gyakori Hibák',
            icon: '❌',
            description: 'Tipikus problémák és megoldások',
            category: 'tools',
            weight: 8
        });

        this.sections.set('tools', {
            title: 'Eszközök & Workflow',
            icon: '🛠️',
            description: 'Fejlesztői eszközök és munkafolyamatok',
            category: 'workflow',
            weight: 9
        });

        this.sections.set('performance', {
            title: 'Performance',
            icon: '⚡',
            description: 'Teljesítmény optimalizálás',
            category: 'advanced',
            weight: 10
        });

        this.sections.set('accessibility', {
            title: 'Accessibility',
            icon: '♿',
            description: 'Akadálymentesítés',
            category: 'advanced',
            weight: 11
        });

        this.sections.set('modern', {
            title: 'Modern CSS',
            icon: '🔮',
            description: 'Legújabb CSS funkciók',
            category: 'advanced',
            weight: 12
        });

        this.sections.set('animations', {
            title: 'CSS Animációk',
            icon: '✨',
            description: 'Animációk és átmenetek',
            category: 'advanced',
            weight: 13
        });

        this.sections.set('playground', {
            title: 'Code Playground',
            icon: '🎮',
            description: 'Interaktív kód szerkesztő',
            category: 'tools',
            weight: 14
        });

        this.sections.set('quiz', {
            title: 'Kvíz',
            icon: '🧠',
            description: 'Tudás tesztelése',
            category: 'tools',
            weight: 15
        });
    }

    /**
     * Setup History API
     */
    setupHistoryAPI() {
        // Set initial state
        const currentSection = this.getCurrentSection();
        if (currentSection) {
            this.replaceState(currentSection);
        }
    }

    /**
     * Navigate to a section
     */
    async navigateTo(sectionId, addToHistory = true, subsection = null) {
        try {
            // Validate section
            if (!this.sections.has(sectionId)) {
                throw new Error(`Unknown section: ${sectionId}`);
            }

            const section = this.sections.get(sectionId);
            
            // Add to history
            if (addToHistory) {
                this.addToHistory(sectionId, subsection);
            }

            // Update browser history
            this.pushState(sectionId, subsection);

            // Update navigation UI
            this.updateNavigation(sectionId);

            // Update breadcrumbs
            this.updateBreadcrumbs(sectionId, subsection);

            // Load section content
            await this.loadSection(sectionId, subsection);

            // Track navigation
            this.trackNavigation(sectionId, subsection);

            // Update app state
            this.app.currentSection = sectionId;

            console.log(`🧭 Navigated to: ${sectionId}${subsection ? `#${subsection}` : ''}`);

        } catch (error) {
            console.error('Navigation error:', error);
            this.app.showError('Navigációs hiba', error.message);
        }
    }

    /**
     * Get current section from URL or default
     */
    getCurrentSection() {
        const path = window.location.pathname;
        const hash = window.location.hash.slice(1);
        
        if (hash && this.sections.has(hash)) {
            return hash;
        }
        
        return 'dashboard';
    }

    /**
     * Add navigation to history
     */
    addToHistory(sectionId, subsection = null) {
        const historyItem = {
            sectionId,
            subsection,
            timestamp: new Date().toISOString(),
            title: this.sections.get(sectionId)?.title || sectionId
        };

        // Remove items after current index (when navigating after going back)
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new item
        this.history.push(historyItem);
        this.currentIndex = this.history.length - 1;

        // Limit history size
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
            this.currentIndex--;
        }

        // Save to storage
        this.saveHistory();
    }

    /**
     * Navigate back in history
     */
    goBack() {
        if (this.canGoBack()) {
            this.currentIndex--;
            const item = this.history[this.currentIndex];
            this.navigateTo(item.sectionId, false, item.subsection);
        }
    }

    /**
     * Navigate forward in history
     */
    goForward() {
        if (this.canGoForward()) {
            this.currentIndex++;
            const item = this.history[this.currentIndex];
            this.navigateTo(item.sectionId, false, item.subsection);
        }
    }

    /**
     * Check if can go back
     */
    canGoBack() {
        return this.currentIndex > 0;
    }

    /**
     * Check if can go forward
     */
    canGoForward() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Update browser history state
     */
    pushState(sectionId, subsection = null) {
        const url = subsection ? `#${sectionId}/${subsection}` : `#${sectionId}`;
        const state = { section: sectionId, subsection };
        const title = this.sections.get(sectionId)?.title || sectionId;
        
        history.pushState(state, title, url);
    }

    /**
     * Replace browser history state
     */
    replaceState(sectionId, subsection = null) {
        const url = subsection ? `#${sectionId}/${subsection}` : `#${sectionId}`;
        const state = { section: sectionId, subsection };
        const title = this.sections.get(sectionId)?.title || sectionId;
        
        history.replaceState(state, title, url);
    }

    /**
     * Update navigation UI
     */
    updateNavigation(sectionId) {
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const isActive = btn.dataset.section === sectionId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });

        // Update page title
        const section = this.sections.get(sectionId);
        if (section) {
            document.title = `${section.title} - Web Dev Pro`;
        }
    }

    /**
     * Update breadcrumbs
     */
    updateBreadcrumbs(sectionId, subsection = null) {
        this.breadcrumbs = [
            { title: 'Home', section: 'dashboard' }
        ];

        const section = this.sections.get(sectionId);
        if (section && sectionId !== 'dashboard') {
            this.breadcrumbs.push({
                title: section.title,
                section: sectionId
            });
        }

        if (subsection) {
            this.breadcrumbs.push({
                title: this.formatSubsectionTitle(subsection),
                section: sectionId,
                subsection: subsection
            });
        }

        this.renderBreadcrumbs();
    }

    /**
     * Render breadcrumbs
     */
    renderBreadcrumbs() {
        let breadcrumbContainer = document.querySelector('.breadcrumbs');
        
        if (!breadcrumbContainer) {
            breadcrumbContainer = document.createElement('nav');
            breadcrumbContainer.className = 'breadcrumbs';
            breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb');
            
            const mainContent = document.querySelector('.main-content .container');
            if (mainContent) {
                mainContent.insertBefore(breadcrumbContainer, mainContent.firstChild);
            }
        }

        const breadcrumbHTML = this.breadcrumbs.map((crumb, index) => {
            const isLast = index === this.breadcrumbs.length - 1;
            const linkClass = isLast ? 'breadcrumb-current' : 'breadcrumb-link';
            
            if (isLast) {
                return `<span class="${linkClass}" aria-current="page">${crumb.title}</span>`;
            } else {
                return `<a href="#" class="${linkClass}" data-navigate="${crumb.section}" ${crumb.subsection ? `data-subsection="${crumb.subsection}"` : ''}>${crumb.title}</a>`;
            }
        }).join(' <span class="breadcrumb-separator">›</span> ');

        breadcrumbContainer.innerHTML = `<ol class="breadcrumb-list">${breadcrumbHTML}</ol>`;
    }

    /**
     * Format subsection title
     */
    formatSubsectionTitle(subsection) {
        return subsection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Load section content
     */
    async loadSection(sectionId, subsection = null) {
        // Show loading state
        this.app.updateProgress(50);
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Find or create section element
        let sectionElement = document.getElementById(sectionId);
        
        if (!sectionElement) {
            // Load section dynamically
            const contentLoader = this.app.getModule('contentloader');
            if (contentLoader) {
                await contentLoader.loadSection(sectionId);
                sectionElement = document.getElementById(sectionId);
            }
        }

        if (sectionElement) {
            sectionElement.classList.add('active');
            
            // Handle subsection navigation
            if (subsection) {
                this.navigateToSubsection(sectionElement, subsection);
            }
        }

        // Complete loading
        this.app.updateProgress(100);
        
        // Reset progress after delay
        setTimeout(() => {
            this.app.updateProgress(0);
        }, 500);
    }

    /**
     * Navigate to subsection within a section
     */
    navigateToSubsection(sectionElement, subsection) {
        const target = sectionElement.querySelector(`#${subsection}`) || 
                      sectionElement.querySelector(`[data-subsection="${subsection}"]`);
        
        if (target) {
            // Smooth scroll to subsection
            setTimeout(() => {
                target.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Highlight subsection briefly
                target.classList.add('highlight');
                setTimeout(() => {
                    target.classList.remove('highlight');
                }, 2000);
            }, 100);
        }
    }

    /**
     * Track navigation for analytics
     */
    trackNavigation(sectionId, subsection = null) {
        const section = this.sections.get(sectionId);
        
        this.app.trackAnalytics('navigation', {
            section: sectionId,
            subsection: subsection,
            title: section?.title,
            category: section?.category,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get navigation menu structure
     */
    getMenuStructure() {
        const categories = {};
        
        for (const [id, section] of this.sections) {
            if (!categories[section.category]) {
                categories[section.category] = [];
            }
            
            categories[section.category].push({
                id,
                ...section
            });
        }
        
        // Sort sections within categories by weight
        for (const category in categories) {
            categories[category].sort((a, b) => a.weight - b.weight);
        }
        
        return categories;
    }

    /**
     * Search sections
     */
    searchSections(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const [id, section] of this.sections) {
            const titleMatch = section.title.toLowerCase().includes(lowerQuery);
            const descMatch = section.description.toLowerCase().includes(lowerQuery);
            
            if (titleMatch || descMatch) {
                results.push({
                    id,
                    ...section,
                    relevance: titleMatch ? 2 : 1
                });
            }
        }
        
        return results.sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * Get section info
     */
    getSectionInfo(sectionId) {
        return this.sections.get(sectionId);
    }

    /**
     * Save navigation history
     */
    async saveHistory() {
        try {
            await Storage.set('navigationHistory', {
                history: this.history,
                currentIndex: this.currentIndex
            });
        } catch (error) {
            console.warn('Could not save navigation history:', error);
        }
    }

    /**
     * Load navigation history
     */
    async loadHistory() {
        try {
            const saved = await Storage.get('navigationHistory');
            if (saved) {
                this.history = saved.history || [];
                this.currentIndex = saved.currentIndex || -1;
            }
        } catch (error) {
            console.warn('Could not load navigation history:', error);
        }
    }

    /**
     * Clear navigation history
     */
    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
        this.saveHistory();
    }

    /**
     * Get recent sections
     */
    getRecentSections(limit = 5) {
        return this.history
            .slice(-limit)
            .reverse()
            .map(item => ({
                ...item,
                section: this.sections.get(item.sectionId)
            }));
    }

    /**
     * Get most visited sections
     */
    getMostVisitedSections(limit = 5) {
        const visits = {};
        
        this.history.forEach(item => {
            visits[item.sectionId] = (visits[item.sectionId] || 0) + 1;
        });
        
        return Object.entries(visits)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([sectionId, count]) => ({
                sectionId,
                count,
                section: this.sections.get(sectionId)
            }));
    }
}

// Make Navigation available globally
window.Navigation = NavigationManager;