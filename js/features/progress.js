/**
 * ================================
 * PROGRESS TRACKER
 * Advanced learning progress tracking with achievements
 * ================================
 */

class ProgressManager {
    constructor(app) {
        this.app = app;
        this.progress = new Map();
        this.achievements = new Map();
        this.milestones = new Map();
        this.streaks = new Map();
        this.sessionData = {
            startTime: new Date().toISOString(),
            sectionsVisited: new Set(),
            timeSpent: {},
            interactions: 0,
            completedActions: []
        };
        this.goals = new Map();
        this.learningPath = [];
    }

    /**
     * Initialize progress tracking system
     */
    async init() {
        await this.loadProgress();
        await this.loadAchievements();
        await this.loadGoals();
        this.setupEventListeners();
        this.initializeMilestones();
        this.startSessionTracking();
        console.log('📊 Progress tracking system initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Track section visits
        document.addEventListener('sectionchange', (e) => {
            this.trackSectionVisit(e.detail.section);
        });

        // Track interactions
        document.addEventListener('click', (e) => {
            this.trackInteraction('click', e.target);
        });

        // Track quiz completions
        document.addEventListener('quizcomplete', (e) => {
            this.trackQuizCompletion(e.detail);
        });

        // Track note creation
        document.addEventListener('notecreated', (e) => {
            this.trackAction('note_created', e.detail);
        });

        // Track bookmark creation
        document.addEventListener('bookmarkcreated', (e) => {
            this.trackAction('bookmark_created', e.detail);
        });

        // Track code copying
        document.addEventListener('codecopied', (e) => {
            this.trackAction('code_copied', e.detail);
        });

        // Track time spent in app
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseTimeTracking();
            } else {
                this.resumeTimeTracking();
            }
        });

        // Save progress before page unload
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });

        // Track scroll progress
        window.addEventListener('scroll', this.throttle(() => {
            this.trackScrollProgress();
        }, 1000));
    }

    /**
     * Initialize progress milestones
     */
    initializeMilestones() {
        // Section completion milestones
        const sections = ['html', 'css', 'javascript', 'layout', 'responsive'];
        sections.forEach(section => {
            this.milestones.set(`complete_${section}`, {
                id: `complete_${section}`,
                title: `${section.toUpperCase()} Mester`,
                description: `Teljesítsd a ${section} szekciót`,
                type: 'section_completion',
                target: section,
                progress: 0,
                maxProgress: 100,
                reward: 100,
                icon: this.getSectionIcon(section)
            });
        });

        // Streak milestones
        [3, 7, 14, 30].forEach(days => {
            this.milestones.set(`streak_${days}`, {
                id: `streak_${days}`,
                title: `${days} napos sorozat`,
                description: `Látogass el ${days} egymást követő napon`,
                type: 'streak',
                target: days,
                progress: 0,
                maxProgress: days,
                reward: days * 10,
                icon: '🔥'
            });
        });

        // Activity milestones
        const activities = [
            { action: 'notes_created', amounts: [1, 5, 10, 25], name: 'Jegyzetelő' },
            { action: 'bookmarks_created', amounts: [1, 10, 25, 50], name: 'Gyűjtögető' },
            { action: 'quizzes_completed', amounts: [1, 5, 10, 20], name: 'Kvízmester' },
            { action: 'code_copied', amounts: [5, 25, 50, 100], name: 'Kódmásoló' }
        ];

        activities.forEach(activity => {
            activity.amounts.forEach(amount => {
                this.milestones.set(`${activity.action}_${amount}`, {
                    id: `${activity.action}_${amount}`,
                    title: `${activity.name} ${amount}`,
                    description: `Hajtsd végre ${amount} ${activity.action.replace('_', ' ')} műveletet`,
                    type: 'activity',
                    target: amount,
                    progress: 0,
                    maxProgress: amount,
                    reward: amount * 5,
                    icon: this.getActivityIcon(activity.action)
                });
            });
        });
    }

    /**
     * Track section visit
     */
    trackSectionVisit(sectionId) {
        const now = new Date().toISOString();
        
        // Update session data
        this.sessionData.sectionsVisited.add(sectionId);
        
        // Update section progress
        if (!this.progress.has(sectionId)) {
            this.progress.set(sectionId, {
                id: sectionId,
                visits: 0,
                timeSpent: 0,
                lastVisit: null,
                firstVisit: now,
                completionPercentage: 0,
                interactions: 0,
                achievements: []
            });
        }

        const sectionProgress = this.progress.get(sectionId);
        sectionProgress.visits++;
        sectionProgress.lastVisit = now;
        
        // Start time tracking for this section
        this.startSectionTimeTracking(sectionId);
        
        // Check for achievements
        this.checkSectionAchievements(sectionId);
        
        // Update overall progress
        this.updateOverallProgress();
    }

    /**
     * Track interaction with elements
     */
    trackInteraction(type, element) {
        this.sessionData.interactions++;
        
        // Track by section
        const currentSection = this.app.currentSection;
        if (currentSection && this.progress.has(currentSection)) {
            this.progress.get(currentSection).interactions++;
        }

        // Track specific interactions
        if (element.classList.contains('demo-btn')) {
            this.trackAction('demo_interaction', { section: currentSection });
        } else if (element.classList.contains('copy-btn')) {
            this.trackAction('code_copied', { section: currentSection });
        } else if (element.classList.contains('nav-btn')) {
            this.trackAction('navigation_used', { section: currentSection });
        }
    }

    /**
     * Track specific actions
     */
    trackAction(actionType, data = {}) {
        const action = {
            type: actionType,
            timestamp: new Date().toISOString(),
            section: data.section || this.app.currentSection,
            data: data
        };

        this.sessionData.completedActions.push(action);
        this.updateActionProgress(actionType);
        this.checkMilestones();
    }

    /**
     * Track quiz completion
     */
    trackQuizCompletion(quizData) {
        const { score, maxScore, timeSpent, topic } = quizData;
        const percentage = Math.round((score / maxScore) * 100);
        
        this.trackAction('quiz_completed', {
            score,
            maxScore,
            percentage,
            timeSpent,
            topic
        });

        // Award bonus points for high scores
        if (percentage >= 90) {
            this.awardAchievement('quiz_master', 'Kvízmester', 'Érj el 90% feletti eredményt');
        } else if (percentage >= 80) {
            this.awardAchievement('quiz_expert', 'Kvíz szakértő', 'Érj el 80% feletti eredményt');
        }
    }

    /**
     * Start time tracking for section
     */
    startSectionTimeTracking(sectionId) {
        // Stop previous section tracking
        this.stopAllSectionTimeTracking();
        
        // Start new tracking
        this.sessionData.currentSection = sectionId;
        this.sessionData.sectionStartTime = Date.now();
    }

    /**
     * Stop all section time tracking
     */
    stopAllSectionTimeTracking() {
        if (this.sessionData.currentSection && this.sessionData.sectionStartTime) {
            const timeSpent = Date.now() - this.sessionData.sectionStartTime;
            const sectionId = this.sessionData.currentSection;
            
            // Update time spent
            if (!this.sessionData.timeSpent[sectionId]) {
                this.sessionData.timeSpent[sectionId] = 0;
            }
            this.sessionData.timeSpent[sectionId] += timeSpent;
            
            // Update section progress
            if (this.progress.has(sectionId)) {
                this.progress.get(sectionId).timeSpent += timeSpent;
            }
        }
    }

    /**
     * Pause time tracking
     */
    pauseTimeTracking() {
        this.stopAllSectionTimeTracking();
        this.sessionData.pausedAt = Date.now();
    }

    /**
     * Resume time tracking
     */
    resumeTimeTracking() {
        if (this.sessionData.pausedAt) {
            const pausedTime = Date.now() - this.sessionData.pausedAt;
            this.sessionData.totalPausedTime = (this.sessionData.totalPausedTime || 0) + pausedTime;
            delete this.sessionData.pausedAt;
        }
        
        // Resume section tracking if there was an active section
        if (this.sessionData.currentSection) {
            this.sessionData.sectionStartTime = Date.now();
        }
    }

    /**
     * Track scroll progress
     */
    trackScrollProgress() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        const currentSection = this.app.currentSection;
        if (currentSection && this.progress.has(currentSection)) {
            const sectionProgress = this.progress.get(currentSection);
            sectionProgress.maxScrollPercent = Math.max(
                sectionProgress.maxScrollPercent || 0,
                scrollPercent
            );
        }
    }

    /**
     * Update action progress for milestones
     */
    updateActionProgress(actionType) {
        // Count actions of this type
        const actionCount = this.sessionData.completedActions.filter(
            action => action.type === actionType
        ).length;

        // Update relevant milestones
        for (const [id, milestone] of this.milestones) {
            if (milestone.type === 'activity' && id.includes(actionType)) {
                milestone.progress = Math.min(actionCount, milestone.maxProgress);
            }
        }
    }

    /**
     * Check and update milestones
     */
    checkMilestones() {
        for (const [id, milestone] of this.milestones) {
            if (milestone.progress >= milestone.maxProgress && !milestone.completed) {
                this.completeMilestone(id);
            }
        }
    }

    /**
     * Complete a milestone
     */
    completeMilestone(milestoneId) {
        const milestone = this.milestones.get(milestoneId);
        if (!milestone || milestone.completed) return;

        milestone.completed = true;
        milestone.completedAt = new Date().toISOString();

        // Award achievement
        this.awardAchievement(
            milestoneId,
            milestone.title,
            milestone.description,
            milestone.icon
        );

        // Show notification
        this.app.showNotification('success', 'Mérföldkő teljesítve!', 
            `🏆 ${milestone.title} - ${milestone.reward} pont`, {
            duration: 6000,
            actions: [{
                id: 'view_achievements',
                label: 'Eredmények megtekintése',
                handler: () => this.showAchievementsModal()
            }]
        });
    }

    /**
     * Award achievement
     */
    awardAchievement(id, title, description, icon = '🏆') {
        if (this.achievements.has(id)) return; // Already awarded

        const achievement = {
            id,
            title,
            description,
            icon,
            awardedAt: new Date().toISOString(),
            points: this.calculateAchievementPoints(id)
        };

        this.achievements.set(id, achievement);
        this.saveProgress();
    }

    /**
     * Calculate achievement points
     */
    calculateAchievementPoints(achievementId) {
        const milestone = this.milestones.get(achievementId);
        return milestone ? milestone.reward : 50;
    }

    /**
     * Check section-specific achievements
     */
    checkSectionAchievements(sectionId) {
        const sectionProgress = this.progress.get(sectionId);
        
        // First visit achievement
        if (sectionProgress.visits === 1) {
            this.awardAchievement(
                `first_visit_${sectionId}`,
                `Első látogatás: ${sectionId}`,
                `Első alkalommal látogattad meg a ${sectionId} szekciót`
            );
        }

        // Multiple visits achievement
        if (sectionProgress.visits === 5) {
            this.awardAchievement(
                `regular_visitor_${sectionId}`,
                `Visszatérő látogató: ${sectionId}`,
                `5 alkalommal látogattad meg a ${sectionId} szekciót`
            );
        }

        // Time spent achievement
        if (sectionProgress.timeSpent > 300000) { // 5 minutes
            this.awardAchievement(
                `time_spent_${sectionId}`,
                `Elmélyedő tanulás: ${sectionId}`,
                `5 percet töltöttél a ${sectionId} szekcióban`
            );
        }
    }

    /**
     * Update overall progress
     */
    updateOverallProgress() {
        const totalSections = this.progress.size;
        const completedSections = Array.from(this.progress.values())
            .filter(section => section.completionPercentage >= 80).length;
        
        const overallProgress = totalSections > 0 ? 
            Math.round((completedSections / totalSections) * 100) : 0;
        
        // Update progress bar
        this.app.updateProgress(overallProgress);
        
        // Store overall progress
        this.sessionData.overallProgress = overallProgress;
    }

    /**
     * Start session tracking
     */
    startSessionTracking() {
        this.sessionData.startTime = new Date().toISOString();
        
        // Update daily streak
        this.updateDailyStreak();
        
        // Track session start
        this.trackAction('session_started');
    }

    /**
     * Update daily streak
     */
    async updateDailyStreak() {
        const today = new Date().toDateString();
        const streakData = await Storage.get('dailyStreak') || {
            currentStreak: 0,
            lastVisit: null,
            longestStreak: 0,
            totalDays: 0
        };

        if (streakData.lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (streakData.lastVisit === yesterday.toDateString()) {
                // Consecutive day
                streakData.currentStreak++;
            } else if (streakData.lastVisit !== null) {
                // Streak broken
                streakData.currentStreak = 1;
            } else {
                // First visit
                streakData.currentStreak = 1;
            }
            
            streakData.lastVisit = today;
            streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
            streakData.totalDays++;
            
            await Storage.set('dailyStreak', streakData);
            
            // Update streak milestones
            this.updateStreakMilestones(streakData.currentStreak);
            
            // Show streak notification
            if (streakData.currentStreak > 1) {
                this.app.showNotification('success', 'Napi sorozat!', 
                    `🔥 ${streakData.currentStreak} egymást követő nap`, {
                    duration: 4000
                });
            }
        }
    }

    /**
     * Update streak milestones
     */
    updateStreakMilestones(currentStreak) {
        for (const [id, milestone] of this.milestones) {
            if (milestone.type === 'streak') {
                milestone.progress = Math.min(currentStreak, milestone.maxProgress);
            }
        }
    }

    /**
     * Get learning statistics
     */
    async getLearningStats() {
        const streakData = await Storage.get('dailyStreak') || {};
        const totalTimeSpent = Object.values(this.sessionData.timeSpent)
            .reduce((sum, time) => sum + time, 0);

        return {
            // Session stats
            currentSession: {
                startTime: this.sessionData.startTime,
                sectionsVisited: this.sessionData.sectionsVisited.size,
                interactions: this.sessionData.interactions,
                timeSpent: Date.now() - new Date(this.sessionData.startTime).getTime()
            },
            
            // Overall stats
            overall: {
                totalSections: this.progress.size,
                completedSections: Array.from(this.progress.values())
                    .filter(s => s.completionPercentage >= 80).length,
                totalTimeSpent: totalTimeSpent,
                totalInteractions: Array.from(this.progress.values())
                    .reduce((sum, s) => sum + s.interactions, 0),
                achievements: this.achievements.size,
                totalPoints: this.getTotalPoints()
            },
            
            // Streak stats
            streak: {
                current: streakData.currentStreak || 0,
                longest: streakData.longestStreak || 0,
                totalDays: streakData.totalDays || 0
            },
            
            // Progress by section
            sections: Object.fromEntries(this.progress),
            
            // Recent achievements
            recentAchievements: Array.from(this.achievements.values())
                .sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
                .slice(0, 5)
        };
    }

    /**
     * Get total points earned
     */
    getTotalPoints() {
        return Array.from(this.achievements.values())
            .reduce((sum, achievement) => sum + (achievement.points || 0), 0);
    }

    /**
     * Show achievements modal
     */
    showAchievementsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal achievements-modal';
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>🏆 Eredmények</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    ${this.createAchievementsHTML()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    /**
     * Create achievements HTML
     */
    createAchievementsHTML() {
        const achievements = Array.from(this.achievements.values());
        const milestones = Array.from(this.milestones.values());
        
        const achievedHTML = achievements.map(achievement => `
            <div class="achievement-item achieved">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-content">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-points">+${achievement.points} pont</div>
                </div>
                <div class="achievement-date">${this.formatTime(achievement.awardedAt)}</div>
            </div>
        `).join('');

        const unachievedHTML = milestones
            .filter(milestone => !milestone.completed)
            .map(milestone => `
                <div class="achievement-item locked">
                    <div class="achievement-icon">${milestone.icon}</div>
                    <div class="achievement-content">
                        <div class="achievement-title">${milestone.title}</div>
                        <div class="achievement-description">${milestone.description}</div>
                        <div class="achievement-progress">
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${(milestone.progress / milestone.maxProgress) * 100}%"></div>
                            </div>
                            <span class="progress-text">${milestone.progress}/${milestone.maxProgress}</span>
                        </div>
                    </div>
                    <div class="achievement-reward">+${milestone.reward} pont</div>
                </div>
            `).join('');

        return `
            <div class="achievements-summary">
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-number">${achievements.length}</span>
                        <span class="stat-label">Elért eredmény</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${this.getTotalPoints()}</span>
                        <span class="stat-label">Összesen pont</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${milestones.filter(m => !m.completed).length}</span>
                        <span class="stat-label">Hátralévő</span>
                    </div>
                </div>
            </div>
            
            <div class="achievements-tabs">
                <button class="tab-btn active" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active'); document.querySelector('.achieved-achievements').style.display='block'; document.querySelector('.locked-achievements').style.display='none';">Elért</button>
                <button class="tab-btn" onclick="this.parentNode.querySelector('.active').classList.remove('active'); this.classList.add('active'); document.querySelector('.achieved-achievements').style.display='none'; document.querySelector('.locked-achievements').style.display='block';">Folyamatban</button>
            </div>
            
            <div class="achieved-achievements">
                ${achievedHTML || '<p class="text-muted">Még nincsenek elért eredmények</p>'}
            </div>
            
            <div class="locked-achievements" style="display: none;">
                ${unachievedHTML || '<p class="text-muted">Minden eredmény elérve!</p>'}
            </div>
        `;
    }

    /**
     * Set learning goals
     */
    async setGoal(goalData) {
        const goal = {
            id: goalData.id || `goal_${Date.now()}`,
            title: goalData.title,
            description: goalData.description,
            type: goalData.type, // daily, weekly, monthly, custom
            target: goalData.target,
            current: goalData.current || 0,
            deadline: goalData.deadline,
            created: new Date().toISOString(),
            completed: false
        };

        this.goals.set(goal.id, goal);
        await this.saveProgress();
        
        return goal;
    }

    /**
     * Update goal progress
     */
    updateGoalProgress(goalId, progress) {
        const goal = this.goals.get(goalId);
        if (!goal) return;

        goal.current = Math.min(progress, goal.target);
        
        if (goal.current >= goal.target && !goal.completed) {
            goal.completed = true;
            goal.completedAt = new Date().toISOString();
            
            this.awardAchievement(
                `goal_${goalId}`,
                `Cél teljesítve: ${goal.title}`,
                goal.description
            );
            
            this.app.showNotification('success', 'Cél teljesítve!', 
                `🎯 ${goal.title}`, { duration: 5000 });
        }
    }

    /**
     * Load progress from storage
     */
    async loadProgress() {
        try {
            const storedProgress = await Storage.get('learningProgress');
            if (storedProgress) {
                // Restore progress data
                this.progress = new Map(storedProgress.sections || []);
                this.achievements = new Map(storedProgress.achievements || []);
                this.goals = new Map(storedProgress.goals || []);
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    }

    /**
     * Save progress to storage
     */
    async saveProgress() {
        try {
            const progressData = {
                sections: Array.from(this.progress.entries()),
                achievements: Array.from(this.achievements.entries()),
                goals: Array.from(this.goals.entries()),
                lastUpdated: new Date().toISOString()
            };
            
            await Storage.set('learningProgress', progressData);
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    /**
     * Export progress data
     */
    async exportProgress() {
        const stats = await this.getLearningStats();
        const exportData = {
            version: '1.0',
            exported: new Date().toISOString(),
            stats: stats,
            progress: Object.fromEntries(this.progress),
            achievements: Object.fromEntries(this.achievements),
            goals: Object.fromEntries(this.goals)
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `webdevpro-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Get section icon
     */
    getSectionIcon(section) {
        const icons = {
            html: '📄',
            css: '🎨',
            javascript: '⚡',
            layout: '📐',
            responsive: '📱'
        };
        return icons[section] || '📚';
    }

    /**
     * Get activity icon
     */
    getActivityIcon(activity) {
        const icons = {
            notes_created: '📝',
            bookmarks_created: '⭐',
            quizzes_completed: '🧠',
            code_copied: '📋'
        };
        return icons[activity] || '🎯';
    }

    /**
     * Format time for display
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
     * Throttle function for performance
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Static methods for global access
    static showAchievements() {
        const progressManager = window.App?.getModule('progress');
        if (progressManager) {
            progressManager.showAchievementsModal();
        }
    }

    static exportProgress() {
        const progressManager = window.App?.getModule('progress');
        if (progressManager) {
            progressManager.exportProgress();
        }
    }
}

// Add CSS for achievements
const style = document.createElement('style');
style.textContent = `
.achievements-summary {
    margin-bottom: var(--space-xl);
    padding: var(--space-lg);
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
}

.achievements-tabs {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
    border-bottom: 1px solid var(--border);
}

.tab-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    padding: var(--space-md);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: var(--transition-fast);
}

.tab-btn.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
}

.achievement-item {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-md);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    transition: var(--transition-base);
}

.achievement-item.achieved {
    background: linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(79, 195, 247, 0.1) 100%);
    border-color: var(--accent-primary);
}

.achievement-item.locked {
    opacity: 0.7;
}

.achievement-icon {
    font-size: var(--font-size-2xl);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--bg-secondary);
}

.achievement-item.achieved .achievement-icon {
    background: var(--accent-primary);
    color: white;
}

.achievement-content {
    flex: 1;
}

.achievement-title {
    font-weight: 600;
    font-size: var(--font-size-lg);
    margin-bottom: var(--space-xs);
}

.achievement-description {
    color: var(--text-secondary);
    margin-bottom: var(--space-sm);
}

.achievement-points,
.achievement-reward {
    color: var(--accent-primary);
    font-weight: 500;
    font-size: var(--font-size-sm);
}

.achievement-date {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    align-self: flex-start;
}

.achievement-progress {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.progress-bar-container {
    flex: 1;
    height: 8px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background: var(--accent-primary);
    border-radius: var(--radius-sm);
    transition: width var(--transition-base);
}

.progress-text {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}
`;

document.head.appendChild(style);

// Make Progress available globally
window.Progress = ProgressManager;