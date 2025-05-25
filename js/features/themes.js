/**
 * ================================
 * THEME MANAGER
 * Advanced theme system with auto-detection
 * ================================
 */

class ThemeManager {
    constructor(app) {
        this.app = app;
        this.themes = new Map();
        this.currentTheme = 'dark';
        this.systemTheme = 'dark';
        this.userPreference = null;
        this.mediaQuery = null;
    }

    /**
     * Initialize theme system
     */
    async init() {
        this.loadThemes();
        this.detectSystemTheme();
        this.setupEventListeners();
        await this.loadUserPreference();
        this.applyTheme();
        console.log('🎨 Theme system initialized');
    }

    /**
     * Load available themes
     */
    loadThemes() {
        this.themes.set('light', {
            name: 'Világos',
            icon: '☀️',
            description: 'Világos téma nappalhoz',
            colors: {
                primary: '#ffffff',
                secondary: '#f8fafc',
                accent: '#0ea5e9',
                text: '#1e293b',
                border: '#e2e8f0'
            }
        });

        this.themes.set('dark', {
            name: 'Sötét',
            icon: '🌙',
            description: 'Sötét téma éjszakához',
            colors: {
                primary: '#0d1117',
                secondary: '#161b22',
                accent: '#4fc3f7',
                text: '#c9d1d9',
                border: '#30363d'
            }
        });

        this.themes.set('high-contrast', {
            name: 'Magas kontraszt',
            icon: '🔲',
            description: 'Magas kontraszt a jobb láthatóságért',
            colors: {
                primary: '#000000',
                secondary: '#1a1a1a',
                accent: '#00ff00',
                text: '#ffffff',
                border: '#ffffff'
            }
        });

        this.themes.set('sepia', {
            name: 'Szépia',
            icon: '📜',
            description: 'Meleg, szembarát tónus',
            colors: {
                primary: '#f4f1ea',
                secondary: '#ebe4d1',
                accent: '#8b4513',
                text: '#5c4b37',
                border: '#d4c4a8'
            }
        });

        this.themes.set('blue', {
            name: 'Kék',
            icon: '💙',
            description: 'Nyugtató kék árnyalatok',
            colors: {
                primary: '#0f172a',
                secondary: '#1e293b',
                accent: '#3b82f6',
                text: '#e2e8f0',
                border: '#334155'
            }
        });
    }

    /**
     * Detect system theme preference
     */
    detectSystemTheme() {
        if (window.matchMedia) {
            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
            
            // Listen for system theme changes
            this.mediaQuery.addEventListener('change', (e) => {
                this.systemTheme = e.matches ? 'dark' : 'light';
                if (this.userPreference === 'auto') {
                    this.applyTheme();
                }
            });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Theme selector (if exists)
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }

        // Keyboard shortcut for theme toggle
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Listen for high contrast preference
        if (window.matchMedia) {
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            if (contrastQuery.matches && this.userPreference === 'auto') {
                this.setTheme('high-contrast');
            }
            
            contrastQuery.addEventListener('change', (e) => {
                if (e.matches && this.userPreference === 'auto') {
                    this.setTheme('high-contrast');
                }
            });
        }

        // Listen for reduced motion preference
        if (window.matchMedia) {
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            document.documentElement.classList.toggle('reduce-motion', motionQuery.matches);
            
            motionQuery.addEventListener('change', (e) => {
                document.documentElement.classList.toggle('reduce-motion', e.matches);
            });
        }
    }

    /**
     * Load user theme preference
     */
    async loadUserPreference() {
        try {
            const savedTheme = await Storage.get('theme');
            if (savedTheme && this.themes.has(savedTheme)) {
                this.userPreference = savedTheme;
                this.currentTheme = savedTheme;
            } else {
                this.userPreference = 'auto';
                this.currentTheme = this.systemTheme;
            }
        } catch (error) {
            console.warn('Could not load theme preference:', error);
            this.userPreference = 'auto';
            this.currentTheme = this.systemTheme;
        }
    }

    /**
     * Set theme
     */
    async setTheme(themeId, save = true) {
        if (!this.themes.has(themeId) && themeId !== 'auto') {
            console.warn(`Unknown theme: ${themeId}`);
            return;
        }

        const oldTheme = this.currentTheme;
        
        if (themeId === 'auto') {
            this.userPreference = 'auto';
            this.currentTheme = this.systemTheme;
        } else {
            this.userPreference = themeId;
            this.currentTheme = themeId;
        }

        this.applyTheme();

        if (save) {
            await this.saveThemePreference();
        }

        // Track theme change
        this.app.trackAnalytics('theme_change', {
            from: oldTheme,
            to: this.currentTheme,
            preference: this.userPreference
        });

        // Notify other components
        this.dispatchThemeChangeEvent(oldTheme, this.currentTheme);

        console.log(`🎨 Theme changed to: ${this.currentTheme}`);
    }

    /**
     * Apply current theme
     */
    applyTheme() {
        const theme = this.themes.get(this.currentTheme);
        if (!theme) return;

        // Set data attribute
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Add transition class for smooth theme changes
        document.body.classList.add('theme-transition');
        
        // Update CSS custom properties
        this.updateCustomProperties(theme.colors);
        
        // Update theme toggle button
        this.updateThemeToggle();
        
        // Update theme selector
        this.updateThemeSelector();
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme.colors.primary);
        
        // Remove transition class after animation
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);

        // Show notification
        this.app.showNotification('success', 'Téma megváltoztatva', `${theme.name} téma aktiválva`);
    }

    /**
     * Update CSS custom properties
     */
    updateCustomProperties(colors) {
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--theme-${key}`, value);
        });
    }

    /**
     * Update theme toggle button
     */
    updateThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.querySelector('.theme-icon');
        
        if (themeIcon) {
            const theme = this.themes.get(this.currentTheme);
            themeIcon.textContent = theme?.icon || '🎨';
        }
        
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', `Jelenlegi téma: ${this.getCurrentThemeName()}`);
            themeToggle.title = `Téma váltás (${this.getCurrentThemeName()})`;
        }
    }

    /**
     * Update theme selector
     */
    updateThemeSelector() {
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.value = this.userPreference;
        }
    }

    /**
     * Update meta theme-color
     */
    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = color;
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const nextTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
    }

    /**
     * Cycle through all available themes
     */
    cycleThemes() {
        const themeIds = Array.from(this.themes.keys());
        const currentIndex = themeIds.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeIds.length;
        const nextTheme = themeIds[nextIndex];
        
        this.setTheme(nextTheme);
    }

    /**
     * Get current theme name
     */
    getCurrentThemeName() {
        const theme = this.themes.get(this.currentTheme);
        return theme ? theme.name : this.currentTheme;
    }

    /**
     * Get available themes
     */
    getAvailableThemes() {
        return Array.from(this.themes.entries()).map(([id, theme]) => ({
            id,
            ...theme
        }));
    }

    /**
     * Save theme preference
     */
    async saveThemePreference() {
        try {
            await Storage.set('theme', this.userPreference);
            await Storage.set('themeSettings', {
                preference: this.userPreference,
                current: this.currentTheme,
                system: this.systemTheme,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    /**
     * Dispatch theme change event
     */
    dispatchThemeChangeEvent(oldTheme, newTheme) {
        const event = new CustomEvent('themechange', {
            detail: {
                oldTheme,
                newTheme,
                theme: this.themes.get(newTheme)
            }
        });
        
        window.dispatchEvent(event);
        document.dispatchEvent(event);
    }

    /**
     * Create theme selector UI
     */
    createThemeSelector(container) {
        if (!container) return;

        const selectorHTML = `
            <div class="theme-selector-container">
                <label for="themeSelect" class="theme-selector-label">
                    <span class="theme-icon">🎨</span>
                    Téma kiválasztása
                </label>
                <select id="themeSelect" class="theme-selector">
                    <option value="auto">🔄 Automatikus (rendszer)</option>
                    ${this.getAvailableThemes().map(theme => 
                        `<option value="${theme.id}" ${theme.id === this.userPreference ? 'selected' : ''}>
                            ${theme.icon} ${theme.name}
                        </option>`
                    ).join('')}
                </select>
                <div class="theme-preview">
                    ${this.createThemePreview()}
                </div>
            </div>
        `;

        container.innerHTML = selectorHTML;

        // Add event listener
        const select = container.querySelector('#themeSelect');
        if (select) {
            select.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
    }

    /**
     * Create theme preview
     */
    createThemePreview() {
        const theme = this.themes.get(this.currentTheme);
        if (!theme) return '';

        return `
            <div class="theme-preview-box" style="
                background: ${theme.colors.primary};
                border: 2px solid ${theme.colors.border};
                color: ${theme.colors.text};
                padding: 1rem;
                border-radius: 8px;
                margin-top: 0.5rem;
            ">
                <div style="
                    background: ${theme.colors.accent};
                    color: white;
                    padding: 0.5rem;
                    border-radius: 4px;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                ">
                    ${theme.name} Téma
                </div>
                <div style="
                    background: ${theme.colors.secondary};
                    padding: 0.5rem;
                    border-radius: 4px;
                    font-size: 0.875rem;
                ">
                    ${theme.description}
                </div>
            </div>
        `;
    }

    /**
     * Auto-schedule theme based on time
     */
    setupAutoScheduling() {
        const settings = {
            lightStart: 6, // 6 AM
            darkStart: 18  // 6 PM
        };

        const checkTime = () => {
            if (this.userPreference !== 'auto-schedule') return;

            const now = new Date();
            const hour = now.getHours();
            
            const shouldBeDark = hour >= settings.darkStart || hour < settings.lightStart;
            const targetTheme = shouldBeDark ? 'dark' : 'light';
            
            if (this.currentTheme !== targetTheme) {
                this.setTheme(targetTheme, false); // Don't save as user preference
            }
        };

        // Check immediately
        checkTime();

        // Check every hour
        setInterval(checkTime, 60 * 60 * 1000);

        console.log('🕒 Auto theme scheduling enabled');
    }

    /**
     * Generate theme based on user preferences
     */
    generateCustomTheme(options = {}) {
        const baseTheme = this.themes.get(options.base || 'dark');
        
        const customTheme = {
            name: options.name || 'Egyéni',
            icon: options.icon || '🎨',
            description: options.description || 'Egyéni téma',
            colors: {
                ...baseTheme.colors,
                ...options.colors
            }
        };

        const themeId = `custom-${Date.now()}`;
        this.themes.set(themeId, customTheme);
        
        return themeId;
    }

    /**
     * Apply theme to specific element
     */
    applyThemeToElement(element, themeId) {
        const theme = this.themes.get(themeId);
        if (!theme || !element) return;

        element.setAttribute('data-theme', themeId);
        
        // Apply colors as CSS variables
        Object.entries(theme.colors).forEach(([key, value]) => {
            element.style.setProperty(`--theme-${key}`, value);
        });
    }

    /**
     * Get theme contrast ratio
     */
    getContrastRatio(themeId) {
        const theme = this.themes.get(themeId);
        if (!theme) return 0;

        // Simple contrast calculation (would be more complex in real implementation)
        const bgColor = theme.colors.primary;
        const textColor = theme.colors.text;
        
        // Convert hex to RGB and calculate luminance
        const getBrightness = (color) => {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return (r * 299 + g * 587 + b * 114) / 1000;
        };

        const bgBrightness = getBrightness(bgColor);
        const textBrightness = getBrightness(textColor);
        
        const lighter = Math.max(bgBrightness, textBrightness);
        const darker = Math.min(bgBrightness, textBrightness);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Check if theme meets accessibility standards
     */
    isAccessible(themeId) {
        const contrastRatio = this.getContrastRatio(themeId);
        return contrastRatio >= 4.5; // WCAG AA standard
    }

    /**
     * Export theme configuration
     */
    exportTheme(themeId) {
        const theme = this.themes.get(themeId);
        if (!theme) return null;

        return {
            id: themeId,
            version: '1.0',
            exported: new Date().toISOString(),
            theme: theme
        };
    }

    /**
     * Import theme configuration
     */
    importTheme(themeData) {
        try {
            if (!themeData.theme || !themeData.id) {
                throw new Error('Invalid theme data');
            }

            const themeId = `imported-${themeData.id}-${Date.now()}`;
            this.themes.set(themeId, themeData.theme);
            
            return themeId;
        } catch (error) {
            console.error('Theme import failed:', error);
            return null;
        }
    }

    /**
     * Remove custom theme
     */
    removeTheme(themeId) {
        if (themeId.startsWith('custom-') || themeId.startsWith('imported-')) {
            this.themes.delete(themeId);
            
            // Switch to default if current theme was removed
            if (this.currentTheme === themeId) {
                this.setTheme('dark');
            }
            
            return true;
        }
        return false;
    }

    /**
     * Get theme usage statistics
     */
    async getThemeStats() {
        try {
            const stats = await Storage.get('themeStats') || {};
            return {
                currentTheme: this.currentTheme,
                userPreference: this.userPreference,
                systemTheme: this.systemTheme,
                totalThemes: this.themes.size,
                usage: stats,
                accessibility: {
                    contrastRatio: this.getContrastRatio(this.currentTheme),
                    isAccessible: this.isAccessible(this.currentTheme)
                }
            };
        } catch (error) {
            console.warn('Could not get theme stats:', error);
            return {};
        }
    }

    /**
     * Track theme usage
     */
    async trackThemeUsage(themeId) {
        try {
            const stats = await Storage.get('themeStats') || {};
            stats[themeId] = (stats[themeId] || 0) + 1;
            await Storage.set('themeStats', stats);
        } catch (error) {
            console.warn('Could not track theme usage:', error);
        }
    }

    /**
     * Reset all theme settings
     */
    async resetThemes() {
        // Clear custom themes
        const themeIds = Array.from(this.themes.keys());
        themeIds.forEach(id => {
            if (id.startsWith('custom-') || id.startsWith('imported-')) {
                this.themes.delete(id);
            }
        });

        // Reset to default
        this.userPreference = 'auto';
        this.currentTheme = this.systemTheme;
        
        this.applyTheme();
        await this.saveThemePreference();
        
        // Clear stats
        await Storage.remove('themeStats');
        
        this.app.showNotification('success', 'Témák visszaállítva', 'Minden beállítás visszaállt az alapértelmezettre');
    }

    /**
     * Create theme customization UI
     */
    createThemeCustomizer(container) {
        if (!container) return;

        const customizerHTML = `
            <div class="theme-customizer">
                <h3>🎨 Téma testreszabás</h3>
                
                <div class="customizer-section">
                    <label>Alapszín:</label>
                    <input type="color" id="primaryColor" value="${this.themes.get(this.currentTheme)?.colors.primary || '#0d1117'}">
                </div>
                
                <div class="customizer-section">
                    <label>Másodlagos szín:</label>
                    <input type="color" id="secondaryColor" value="${this.themes.get(this.currentTheme)?.colors.secondary || '#161b22'}">
                </div>
                
                <div class="customizer-section">
                    <label>Kiemelő szín:</label>
                    <input type="color" id="accentColor" value="${this.themes.get(this.currentTheme)?.colors.accent || '#4fc3f7'}">
                </div>
                
                <div class="customizer-section">
                    <label>Szöveg szín:</label>
                    <input type="color" id="textColor" value="${this.themes.get(this.currentTheme)?.colors.text || '#c9d1d9'}">
                </div>
                
                <div class="customizer-actions">
                    <button class="btn-primary" onclick="Themes.applyCustomization()">Alkalmaz</button>
                    <button class="btn-secondary" onclick="Themes.resetCustomization()">Visszaállít</button>
                    <button class="btn-secondary" onclick="Themes.saveCustomTheme()">Mentés</button>
                </div>
                
                <div class="theme-preview-live">
                    ${this.createThemePreview()}
                </div>
            </div>
        `;

        container.innerHTML = customizerHTML;
        this.setupCustomizerEvents(container);
    }

    /**
     * Setup theme customizer events
     */
    setupCustomizerEvents(container) {
        const colorInputs = container.querySelectorAll('input[type="color"]');
        
        colorInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.previewCustomization(container);
            });
        });
    }

    /**
     * Preview theme customization
     */
    previewCustomization(container) {
        const colors = {
            primary: container.querySelector('#primaryColor').value,
            secondary: container.querySelector('#secondaryColor').value,
            accent: container.querySelector('#accentColor').value,
            text: container.querySelector('#textColor').value
        };

        const preview = container.querySelector('.theme-preview-live');
        if (preview) {
            preview.innerHTML = this.createCustomPreview(colors);
        }
    }

    /**
     * Create custom theme preview
     */
    createCustomPreview(colors) {
        return `
            <div class="custom-theme-preview" style="
                background: ${colors.primary};
                border: 2px solid ${colors.secondary};
                color: ${colors.text};
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
            ">
                <div style="
                    background: ${colors.accent};
                    color: white;
                    padding: 0.5rem;
                    border-radius: 4px;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                ">
                    Egyéni Téma Előnézet
                </div>
                <div style="
                    background: ${colors.secondary};
                    padding: 0.5rem;
                    border-radius: 4px;
                    font-size: 0.875rem;
                ">
                    Ez az egyéni téma előnézete a kiválasztott színekkel.
                </div>
            </div>
        `;
    }

    /**
     * Apply customization (static method for global access)
     */
    static applyCustomization() {
        const themeManager = window.App?.getModule('themes');
        if (themeManager) {
            themeManager.applyCustomization();
        }
    }

    /**
     * Apply customization
     */
    applyCustomization() {
        const container = document.querySelector('.theme-customizer');
        if (!container) return;

        const colors = {
            primary: container.querySelector('#primaryColor').value,
            secondary: container.querySelector('#secondaryColor').value,
            accent: container.querySelector('#accentColor').value,
            text: container.querySelector('#textColor').value,
            border: container.querySelector('#secondaryColor').value // Use secondary as border
        };

        const customThemeId = this.generateCustomTheme({
            name: 'Egyéni Téma',
            description: 'Felhasználó által testreszabott téma',
            colors: colors
        });

        this.setTheme(customThemeId);
    }

    /**
     * Reset customization (static method)
     */
    static resetCustomization() {
        const themeManager = window.App?.getModule('themes');
        if (themeManager) {
            themeManager.resetCustomization();
        }
    }

    /**
     * Reset customization
     */
    resetCustomization() {
        this.setTheme('dark');
    }

    /**
     * Save custom theme (static method)
     */
    static saveCustomTheme() {
        const themeManager = window.App?.getModule('themes');
        if (themeManager) {
            themeManager.saveCustomTheme();
        }
    }

    /**
     * Save custom theme
     */
    async saveCustomTheme() {
        const themeName = prompt('Add meg az egyéni téma nevét:', 'Saját Téma');
        if (!themeName) return;

        const container = document.querySelector('.theme-customizer');
        if (!container) return;

        const colors = {
            primary: container.querySelector('#primaryColor').value,
            secondary: container.querySelector('#secondaryColor').value,
            accent: container.querySelector('#accentColor').value,
            text: container.querySelector('#textColor').value,
            border: container.querySelector('#secondaryColor').value
        };

        const customThemeId = this.generateCustomTheme({
            name: themeName,
            description: `Egyéni téma: ${themeName}`,
            icon: '🎨',
            colors: colors
        });

        // Save to storage
        try {
            const customThemes = await Storage.get('customThemes') || {};
            customThemes[customThemeId] = this.themes.get(customThemeId);
            await Storage.set('customThemes', customThemes);
            
            this.app.showNotification('success', 'Téma mentve', `${themeName} téma sikeresen mentve`);
        } catch (error) {
            this.app.showError('Mentési hiba', 'Nem sikerült menteni a témát');
        }
    }
}

// Make Themes available globally
window.Themes = ThemeManager;