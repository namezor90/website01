/**
 * ================================
 * NOTIFICATIONS SYSTEM
 * Advanced toast notifications with queue and persistence
 * ================================
 */

class NotificationsManager {
    constructor(app) {
        this.app = app;
/**
 * ================================
 * NOTIFICATIONS SYSTEM
 * Advanced toast notifications with queue and persistence
 * ================================
 */

class NotificationsManager {
    constructor(app) {
        this.app = app;
        this.notifications = [];
        this.notificationQueue = [];
        this.activeNotifications = new Map();
        this.settings = {
            maxVisible: 5,
            defaultDuration: 4000,
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left, center
            enableSound: false,
            enableVibration: true,
            enablePersistence: true,
            animationDuration: 300
        };
        this.container = null;
        this.sounds = new Map();
    }

    /**
     * Initialize notifications system
     */
    async init() {
        this.createContainer();
        this.loadSettings();
        this.loadSounds();
        this.setupEventListeners();
        await this.loadPersistedNotifications();
        console.log('🔔 Notifications system initialized');
    }

    /**
     * Create notification container
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = `toast-container toast-${this.settings.position}`;
        
        // Apply position styles
        this.applyContainerPosition();
        
        document.body.appendChild(this.container);
    }

    /**
     * Apply container position styles
     */
    applyContainerPosition() {
        const positions = {
            'top-right': { top: 'var(--space-xl)', right: 'var(--space-xl)' },
            'top-left': { top: 'var(--space-xl)', left: 'var(--space-xl)' },
            'bottom-right': { bottom: 'var(--space-xl)', right: 'var(--space-xl)' },
            'bottom-left': { bottom: 'var(--space-xl)', left: 'var(--space-xl)' },
            'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        };

        const pos = positions[this.settings.position] || positions['top-right'];
        Object.assign(this.container.style, {
            position: 'fixed',
            zIndex: 'var(--z-toast)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)',
            maxWidth: '400px',
            ...pos
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Global notification shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.showNotificationCenter();
            }
        });

        // Handle page visibility for sound management
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSounds();
            }
        });

        // Handle errors globally
        window.addEventListener('error', (e) => {
            this.show('error', 'JavaScript hiba', e.message);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.show('error', 'Promise hiba', e.reason);
        });
    }

    /**
     * Load notification settings
     */
    async loadSettings() {
        try {
            const savedSettings = await Storage.get('notificationSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...savedSettings };
            }
        } catch (error) {
            console.warn('Could not load notification settings:', error);
        }
    }

    /**
     * Save notification settings
     */
    async saveSettings() {
        try {
            await Storage.set('notificationSettings', this.settings);
        } catch (error) {
            console.warn('Could not save notification settings:', error);
        }
    }

    /**
     * Load notification sounds
     */
    loadSounds() {
        // Simple sound effects using Web Audio API
        this.sounds.set('success', this.createTone(800, 0.1, 'sine'));
        this.sounds.set('error', this.createTone(300, 0.2, 'sawtooth'));
        this.sounds.set('warning', this.createTone(500, 0.15, 'triangle'));
        this.sounds.set('info', this.createTone(600, 0.1, 'sine'));
    }

    /**
     * Create simple tone using Web Audio API
     */
    createTone(frequency, duration, waveType = 'sine') {
        return () => {
            if (!this.settings.enableSound) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = waveType;
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.warn('Could not play notification sound:', error);
            }
        };
    }

    /**
     * Show notification
     */
    show(type = 'info', title = '', message = '', options = {}) {
        const notification = {
            id: this.generateNotificationId(),
            type: type.toLowerCase(),
            title: title || this.getDefaultTitle(type),
            message: message || '',
            timestamp: new Date().toISOString(),
            duration: options.duration || this.settings.defaultDuration,
            persistent: options.persistent || false,
            actions: options.actions || [],
            data: options.data || {},
            priority: options.priority || 'normal', // low, normal, high, urgent
            category: options.category || 'general'
        };

        // Add to history
        this.notifications.unshift(notification);
        
        // Limit history size
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }

        // Handle based on priority
        if (notification.priority === 'urgent') {
            this.showImmediately(notification);
        } else if (this.activeNotifications.size >= this.settings.maxVisible) {
            this.notificationQueue.push(notification);
        } else {
            this.displayNotification(notification);
        }

        // Play sound
        this.playSound(type);

        // Vibrate if supported and enabled
        this.vibrate(type);

        // Persist if enabled
        if (this.settings.enablePersistence) {
            this.persistNotifications();
        }

        return notification.id;
    }

    /**
     * Show notification immediately (for urgent notifications)
     */
    showImmediately(notification) {
        // Remove oldest notification if at limit
        if (this.activeNotifications.size >= this.settings.maxVisible) {
            const oldestId = Array.from(this.activeNotifications.keys())[0];
            this.dismiss(oldestId);
        }
        
        this.displayNotification(notification);
    }

    /**
     * Display notification in DOM
     */
    displayNotification(notification) {
        const toastElement = this.createToastElement(notification);
        
        // Add to active notifications
        this.activeNotifications.set(notification.id, {
            notification,
            element: toastElement,
            timer: null
        });

        // Add to container
        this.container.appendChild(toastElement);

        // Animate in
        setTimeout(() => {
            toastElement.classList.remove('toast-enter');
            toastElement.classList.add('toast-enter-active');
        }, 10);

        // Set auto-dismiss timer
        if (!notification.persistent && notification.duration > 0) {
            const timer = setTimeout(() => {
                this.dismiss(notification.id);
            }, notification.duration);
            
            this.activeNotifications.get(notification.id).timer = timer;
        }

        // Pause timer on hover
        toastElement.addEventListener('mouseenter', () => {
            this.pauseTimer(notification.id);
        });

        toastElement.addEventListener('mouseleave', () => {
            this.resumeTimer(notification.id);
        });
    }

    /**
     * Create toast element
     */
    createToastElement(notification) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.type} toast-enter`;
        toast.dataset.notificationId = notification.id;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', notification.priority === 'urgent' ? 'assertive' : 'polite');

        const icon = this.getNotificationIcon(notification.type);
        const actions = notification.actions.length > 0 ? this.createActionButtons(notification) : '';

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${this.escapeHtml(notification.title)}</div>
                ${notification.message ? `<div class="toast-message">${this.escapeHtml(notification.message)}</div>` : ''}
                ${actions}
            </div>
            <button class="toast-close" aria-label="Bezárás" onclick="Notifications.dismiss('${notification.id}')">✕</button>
            ${notification.persistent ? '' : '<div class="toast-progress"></div>'}
        `;

        // Add progress bar animation if not persistent
        if (!notification.persistent && notification.duration > 0) {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: var(--accent-primary);
                    width: 100%;
                    animation: toast-progress ${notification.duration}ms linear;
                `;
            }
        }

        return toast;
    }

    /**
     * Create action buttons for notification
     */
    createActionButtons(notification) {
        const buttons = notification.actions.map(action => 
            `<button class="toast-action" onclick="Notifications.handleAction('${notification.id}', '${action.id}')">${action.label}</button>`
        ).join('');

        return `<div class="toast-actions">${buttons}</div>`;
    }

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳',
            default: '🔔'
        };
        return icons[type] || icons.default;
    }

    /**
     * Get default title for notification type
     */
    getDefaultTitle(type) {
        const titles = {
            success: 'Sikeres',
            error: 'Hiba',
            warning: 'Figyelmeztetés',
            info: 'Információ',
            loading: 'Betöltés',
            default: 'Értesítés'
        };
        return titles[type] || titles.default;
    }

    /**
     * Dismiss notification
     */
    dismiss(notificationId) {
        const activeNotification = this.activeNotifications.get(notificationId);
        if (!activeNotification) return;

        const { element, timer } = activeNotification;

        // Clear timer
        if (timer) {
            clearTimeout(timer);
        }

        // Animate out
        element.classList.add('toast-exit');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.activeNotifications.delete(notificationId);
            
            // Show next notification from queue
            this.processQueue();
        }, this.settings.animationDuration);
    }

    /**
     * Dismiss all notifications
     */
    dismissAll() {
        const notificationIds = Array.from(this.activeNotifications.keys());
        notificationIds.forEach(id => this.dismiss(id));
        this.notificationQueue = [];
    }

    /**
     * Process notification queue
     */
    processQueue() {
        if (this.notificationQueue.length > 0 && this.activeNotifications.size < this.settings.maxVisible) {
            const nextNotification = this.notificationQueue.shift();
            this.displayNotification(nextNotification);
        }
    }

    /**
     * Pause notification timer
     */
    pauseTimer(notificationId) {
        const activeNotification = this.activeNotifications.get(notificationId);
        if (activeNotification && activeNotification.timer) {
            clearTimeout(activeNotification.timer);
            activeNotification.timer = null;
        }
    }

    /**
     * Resume notification timer
     */
    resumeTimer(notificationId) {
        const activeNotification = this.activeNotifications.get(notificationId);
        if (activeNotification && !activeNotification.timer && !activeNotification.notification.persistent) {
            const remainingTime = activeNotification.notification.duration || this.settings.defaultDuration;
            activeNotification.timer = setTimeout(() => {
                this.dismiss(notificationId);
            }, remainingTime);
        }
    }

    /**
     * Handle notification action
     */
    handleAction(notificationId, actionId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        const action = notification.actions.find(a => a.id === actionId);
        if (!action) return;

        // Execute action
        if (typeof action.handler === 'function') {
            action.handler(notification);
        } else if (typeof action.handler === 'string') {
            // Execute global function
            if (window[action.handler]) {
                window[action.handler](notification);
            }
        }

        // Auto-dismiss after action unless specified otherwise
        if (action.dismissAfter !== false) {
            this.dismiss(notificationId);
        }
    }

    /**
     * Play notification sound
     */
    playSound(type) {
        const soundFunction = this.sounds.get(type) || this.sounds.get('info');
        if (soundFunction) {
            soundFunction();
        }
    }

    /**
     * Pause all sounds
     */
    pauseSounds() {
        // Implementation depends on how sounds are managed
        // For Web Audio API, we'd need to track and pause active contexts
    }

    /**
     * Vibrate device if supported
     */
    vibrate(type) {
        if (!this.settings.enableVibration || !navigator.vibrate) return;

        const patterns = {
            success: [100],
            error: [100, 100, 100],
            warning: [200, 100, 200],
            info: [100],
            default: [100]
        };

        const pattern = patterns[type] || patterns.default;
        navigator.vibrate(pattern);
    }

    /**
     * Show notification center/history
     */
    showNotificationCenter() {
        // Create modal for notification history
        const modal = document.createElement('div');
        modal.className = 'modal notification-center-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>🔔 Értesítési központ</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="notification-center-controls">
                        <button class="btn-secondary" onclick="Notifications.dismissAll()">Összes törlése</button>
                        <button class="btn-secondary" onclick="Notifications.showSettings()">Beállítások</button>
                    </div>
                    <div class="notification-history">
                        ${this.createNotificationHistory()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    /**
     * Create notification history HTML
     */
    createNotificationHistory() {
        if (this.notifications.length === 0) {
            return '<p class="text-muted">Nincsenek értesítések</p>';
        }

        return this.notifications.map(notification => `
            <div class="notification-history-item notification-${notification.type}">
                <div class="notification-icon">${this.getNotificationIcon(notification.type)}</div>
                <div class="notification-content">
                    <div class="notification-title">${this.escapeHtml(notification.title)}</div>
                    <div class="notification-message">${this.escapeHtml(notification.message)}</div>
                    <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show notification settings
     */
    showSettings() {
        const modal = document.createElement('div');
        modal.className = 'modal notification-settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚙️ Értesítési beállítások</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="settings-form">
                        <label>
                            <input type="checkbox" ${this.settings.enableSound ? 'checked' : ''} 
                                   onchange="Notifications.updateSetting('enableSound', this.checked)">
                            Hangok engedélyezése
                        </label>
                        
                        <label>
                            <input type="checkbox" ${this.settings.enableVibration ? 'checked' : ''}
                                   onchange="Notifications.updateSetting('enableVibration', this.checked)">
                            Rezgés engedélyezése
                        </label>
                        
                        <label>
                            <input type="checkbox" ${this.settings.enablePersistence ? 'checked' : ''}
                                   onchange="Notifications.updateSetting('enablePersistence', this.checked)">
                            Értesítések mentése
                        </label>
                        
                        <label>
                            Megjelenítési idő (másodperc):
                            <input type="number" min="1" max="30" value="${this.settings.defaultDuration / 1000}"
                                   onchange="Notifications.updateSetting('defaultDuration', this.value * 1000)">
                        </label>
                        
                        <label>
                            Maximum látható értesítések:
                            <input type="number" min="1" max="10" value="${this.settings.maxVisible}"
                                   onchange="Notifications.updateSetting('maxVisible', parseInt(this.value))">
                        </label>
                        
                        <label>
                            Pozíció:
                            <select onchange="Notifications.updateSetting('position', this.value)">
                                <option value="top-right" ${this.settings.position === 'top-right' ? 'selected' : ''}>Jobb felső</option>
                                <option value="top-left" ${this.settings.position === 'top-left' ? 'selected' : ''}>Bal felső</option>
                                <option value="bottom-right" ${this.settings.position === 'bottom-right' ? 'selected' : ''}>Jobb alsó</option>
                                <option value="bottom-left" ${this.settings.position === 'bottom-left' ? 'selected' : ''}>Bal alsó</option>
                                <option value="center" ${this.settings.position === 'center' ? 'selected' : ''}>Középen</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal').remove()">Bezárás</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    /**
     * Update notification setting
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();

        // Apply position change immediately
        if (key === 'position') {
            this.applyContainerPosition();
        }
    }

    /**
     * Persist notifications to storage
     */
    async persistNotifications() {
        try {
            const persistentNotifications = this.notifications.slice(0, 20); // Keep last 20
            await Storage.set('notificationHistory', persistentNotifications);
        } catch (error) {
            console.warn('Could not persist notifications:', error);
        }
    }

    /**
     * Load persisted notifications
     */
    async loadPersistedNotifications() {
        try {
            const persistedNotifications = await Storage.get('notificationHistory');
            if (persistedNotifications) {
                this.notifications = persistedNotifications;
            }
        } catch (error) {
            console.warn('Could not load persisted notifications:', error);
        }
    }

    /**
     * Generate unique notification ID
     */
    generateNotificationId() {
        return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Format timestamp for display
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffMinutes < 1) return 'Most';
        if (diffMinutes < 60) return `${diffMinutes} perce`;
        if (diffHours < 24) return `${diffHours} órája`;
        
        return date.toLocaleDateString('hu-HU', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear all notifications and history
     */
    clearAll() {
        this.dismissAll();
        this.notifications = [];
        this.persistNotifications();
    }

    /**
     * Get notification statistics  
     */
    getNotificationStats() {
        const stats = {
            totalNotifications: this.notifications.length,
            activeNotifications: this.activeNotifications.size,
            queuedNotifications: this.notificationQueue.length
        };

        // Count by type
        const typeStats = {};
        this.notifications.forEach(notification => {
            typeStats[notification.type] = (typeStats[notification.type] || 0) + 1;
        });
        stats.byType = typeStats;

        // Count by category
        const categoryStats = {};
        this.notifications.forEach(notification => {
            categoryStats[notification.category] = (categoryStats[notification.category] || 0) + 1;
        });
        stats.byCategory = categoryStats;

        return stats;
    }

    // Static methods for global access
    static show(type, title, message, options) {
        const notificationsManager = window.App?.getModule('notifications');
        if (notificationsManager) {
            return notificationsManager.show(type, title, message, options);
        }
    }

    static dismiss(notificationId) {
        const notificationsManager = window.App?.getModule('notifications');
        if (notificationsManager) {
            notificationsManager.dismiss(notificationId);
        }
    }

    static dismissAll() {
        const notificationsManager = window.App?.getModule('notifications');
        if (notificationsManager) {
            notificationsManager.dismissAll();
        }
    }

    static handleAction(notificationId, actionId) {
        const notificationsManager = window.App?.getModule('notifications');
        if (notificationsManager) {
            notificationsManager.handleAction(notificationId, actionId);
        }
    }

    static updateSetting(key, value) {
        const notificationsManager = window.App?.getModule('notifications');
        if (notificationsManager) {
            notificationsManager.updateSetting(key, value);
        }
    }

    static showSettings() {
        const notificationsManager = window.App?.getModule('notifications');
        if (notificationsManager) {
            notificationsManager.showSettings();
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes toast-progress {
    from { width: 100%; }
    to { width: 0%; }
}

.toast-enter {
    transform: translateX(100%);
    opacity: 0;
}

.toast-enter-active {
    transform: translateX(0);
    opacity: 1;
    transition: all var(--transition-base);
}

.toast-exit {
    transform: translateX(100%);
    opacity: 0;
    transition: all var(--transition-base);
}

.notification-center-controls {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
}

.notification-history-item {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-sm);
    background: var(--bg-tertiary);
    border-left: 3px solid var(--border);
}

.notification-history-item.notification-success {
    border-left-color: var(--success);
}

.notification-history-item.notification-error {
    border-left-color: var(--error);
}

.notification-history-item.notification-warning {
    border-left-color: var(--warning);
}

.notification-history-item.notification-info {
    border-left-color: var(--accent-primary);
}

.notification-content {
    flex: 1;
}

.notification-title {
    font-weight: 600;
    margin-bottom: var(--space-xs);
}

.notification-message {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-xs);
}

.notification-time {
    color: var(--text-muted);
    font-size: var(--font-size-xs);
}

.settings-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.settings-form label {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.settings-form input[type="checkbox"] {
    width: auto;
    margin-right: var(--space-sm);
}

.toast-actions {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
}

.toast-action {
    background: var(--accent-primary);
    color: white;
    border: none;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-xs);
    transition: var(--transition-fast);
}

.toast-action:hover {
    background: var(--accent-secondary);
}

.toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: var(--accent-primary);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
`;

document.head.appendChild(style);

// Make Notifications available globally
window.Notifications = NotificationsManager;