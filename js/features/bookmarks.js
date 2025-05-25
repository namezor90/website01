/**
 * ================================
 * BOOKMARKS MANAGER
 * Advanced bookmark system with categories and tags
 * ================================
 */

class BookmarksManager {
    constructor(app) {
        this.app = app;
        this.bookmarks = new Map();
        this.categories = new Set(['general', 'html', 'css', 'javascript', 'tools', 'resources']);
        this.tags = new Set();
        this.searchIndex = new Map();
        this.collections = new Map(); // Bookmark collections/folders
    }

    /**
     * Initialize bookmarks system
     */
    async init() {
        await this.loadBookmarks();
        this.setupEventListeners();
        this.buildSearchIndex();
        console.log('⭐ Bookmarks system initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Global bookmark shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.quickBookmark();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                this.showBookmarksModal();
            }
        });

        // Context menu for bookmarking
        document.addEventListener('contextmenu', (e) => {
            const concept = e.target.closest('.concept-card, .code-example, .demo-container');
            if (concept) {
                e.preventDefault();
                this.showContextMenu(e, concept);
            }
        });

        // Bookmark buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('bookmark-btn')) {
                const itemId = e.target.dataset.id;
                const itemType = e.target.dataset.type || 'content';
                this.toggleBookmark(itemId, itemType);
            }
        });
    }

    /**
     * Load bookmarks from storage
     */
    async loadBookmarks() {
        try {
            const storedBookmarksArray = await Storage.get('bookmarks') || [];
            const storedCollections = await Storage.get('bookmarkCollections') || [];
            
            this.bookmarks.clear();
            this.collections.clear();

            // Load bookmarks
            storedBookmarksArray.forEach(bookmark => {
                this.bookmarks.set(bookmark.id, bookmark);
                
                // Extract tags and categories
                if (bookmark.tags) {
                    bookmark.tags.forEach(tag => this.tags.add(tag));
                }
                if (bookmark.category) {
                    this.categories.add(bookmark.category);
                }
            });

            // Load collections
            storedCollections.forEach(collection => {
                this.collections.set(collection.id, collection);
            });

            console.log(`⭐ Loaded ${this.bookmarks.size} bookmarks and ${this.collections.size} collections`);
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
        }
    }

    /**
     * Save bookmarks to storage
     */
    async saveBookmarks() {
        try {
            const bookmarksArray = Array.from(this.bookmarks.values());
            const collectionsArray = Array.from(this.collections.values());
            
            await Storage.set('bookmarks', bookmarksArray);
            await Storage.set('bookmarkCollections', collectionsArray);
            
            console.log(`⭐ Saved ${bookmarksArray.length} bookmarks and ${collectionsArray.length} collections`);
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
            throw error;
        }
    }

    /**
     * Create new bookmark
     */
    async createBookmark(data = {}) {
        const bookmark = {
            id: data.id || this.generateBookmarkId(),
            title: data.title || 'Új könyvjelző',
            description: data.description || '',
            url: data.url || window.location.href,
            section: data.section || this.app.currentSection,
            type: data.type || 'content', // content, code, demo, external
            category: data.category || 'general',
            tags: data.tags || [],
            created: data.created || new Date().toISOString(),
            modified: data.modified || new Date().toISOString(),
            pinned: data.pinned || false,
            collection: data.collection || null,
            metadata: data.metadata || {}, // Extra data like code snippet, colors, etc.
            clicks: data.clicks || 0,
            lastAccessed: data.lastAccessed || null
        };

        this.bookmarks.set(bookmark.id, bookmark);
        this.updateSearchIndex(bookmark);
        
        // Add tags to global set
        bookmark.tags.forEach(tag => this.tags.add(tag));
        
        await this.saveBookmarks();
        this.updateDashboard();
        
        this.app.showNotification('success', 'Könyvjelző hozzáadva', `"${bookmark.title}" elmentve`);
        
        return bookmark;
    }

    /**
     * Update existing bookmark
     */
    async updateBookmark(bookmarkId, updates) {
        const bookmark = this.bookmarks.get(bookmarkId);
        if (!bookmark) return null;

        const updatedBookmark = {
            ...bookmark,
            ...updates,
            modified: new Date().toISOString()
        };

        this.bookmarks.set(bookmarkId, updatedBookmark);
        this.updateSearchIndex(updatedBookmark);
        
        // Update tags
        if (updates.tags) {
            updates.tags.forEach(tag => this.tags.add(tag));
        }

        await this.saveBookmarks();
        return updatedBookmark;
    }

    /**
     * Delete bookmark
     */
    async deleteBookmark(bookmarkId) {
        const bookmark = this.bookmarks.get(bookmarkId);
        if (!bookmark) return false;

        const confirmed = confirm(`Biztosan törölni szeretnéd a könyvjelzőt: "${bookmark.title}"?`);
        if (!confirmed) return false;

        this.bookmarks.delete(bookmarkId);
        this.removeFromSearchIndex(bookmarkId);
        
        await this.saveBookmarks();
        this.updateDashboard();
        
        this.app.showNotification('success', 'Könyvjelző törölve', `"${bookmark.title}" törölve`);
        
        return true;
    }

    /**
     * Toggle bookmark for current content
     */
    async toggleBookmark(itemId, itemType = 'content') {
        const existingBookmark = this.findBookmarkByItem(itemId, itemType);
        
        if (existingBookmark) {
            await this.deleteBookmark(existingBookmark.id);
            return false;
        } else {
            const bookmarkData = this.extractBookmarkData(itemId, itemType);
            await this.createBookmark(bookmarkData);
            return true;
        }
    }

    /**
     * Quick bookmark current page/section
     */
    async quickBookmark() {
        const currentSection = this.app.currentSection;
        const sectionInfo = this.app.getModule('navigation')?.getSectionInfo(currentSection);
        
        const bookmarkData = {
            title: sectionInfo?.title || currentSection,
            description: sectionInfo?.description || `Könyvjelző: ${currentSection}`,
            section: currentSection,
            type: 'section',
            category: sectionInfo?.category || 'general'
        };

        await this.createBookmark(bookmarkData);
    }

    /**
     * Extract bookmark data from DOM element
     */
    extractBookmarkData(itemId, itemType) {
        let title = 'Új könyvjelző';
        let description = '';
        let metadata = {};
        let category = 'general';

        // Find the element
        const element = document.getElementById(itemId) || 
                       document.querySelector(`[data-id="${itemId}"]`) ||
                       document.querySelector(`[data-bookmark-id="${itemId}"]`);

        if (element) {
            // Extract title
            const titleElement = element.querySelector('h1, h2, h3, h4, .title, .concept-title');
            if (titleElement) {
                title = titleElement.textContent.trim();
            }

            // Extract description
            const descElement = element.querySelector('p, .description, .concept-description');
            if (descElement) {
                description = descElement.textContent.trim().substring(0, 200);
            }

            // Extract code if it's a code example
            if (itemType === 'code') {
                const codeElement = element.querySelector('pre code, .code-content');
                if (codeElement) {
                    metadata.code = codeElement.textContent.trim();
                    metadata.language = this.detectCodeLanguage(codeElement);
                }
            }

            // Extract demo info
            if (itemType === 'demo') {
                const demoElement = element.querySelector('.demo-output, .demo-container');
                if (demoElement) {
                    metadata.demoType = demoElement.dataset.type || 'interactive';
                }
            }

            // Determine category from section
            category = this.app.currentSection || 'general';
        }

        return {
            id: this.generateBookmarkId(),
            title,
            description,
            type: itemType,
            category,
            section: this.app.currentSection,
            metadata
        };
    }

    /**
     * Detect programming language from code element
     */
    detectCodeLanguage(codeElement) {
        const classList = Array.from(codeElement.classList);
        const langClass = classList.find(cls => cls.startsWith('lang-') || cls.startsWith('language-'));
        
        if (langClass) {
            return langClass.replace(/^(lang-|language-)/, '');
        }

        // Simple detection based on content
        const code = codeElement.textContent;
        if (code.includes('<!DOCTYPE') || code.includes('<html')) return 'html';
        if (code.includes('{') && code.includes(':') && code.includes(';')) return 'css';
        if (code.includes('function') || code.includes('const') || code.includes('let')) return 'javascript';
        
        return 'text';
    }

    /**
     * Find bookmark by item
     */
    findBookmarkByItem(itemId, itemType) {
        return Array.from(this.bookmarks.values()).find(bookmark => 
            bookmark.metadata?.itemId === itemId && bookmark.type === itemType
        );
    }

    /**
     * Generate unique bookmark ID
     */
    generateBookmarkId() {
        return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create bookmark collection
     */
    async createCollection(data = {}) {
        const collection = {
            id: data.id || `collection_${Date.now()}`,
            name: data.name || 'Új gyűjtemény',
            description: data.description || '',
            color: data.color || '#4fc3f7',
            icon: data.icon || '📁',
            created: data.created || new Date().toISOString(),
            modified: data.modified || new Date().toISOString(),
            bookmarkIds: data.bookmarkIds || []
        };

        this.collections.set(collection.id, collection);
        await this.saveBookmarks();
        
        this.app.showNotification('success', 'Gyűjtemény létrehozva', `"${collection.name}" gyűjtemény elkészült`);
        
        return collection;
    }

    /**
     * Add bookmark to collection
     */
    async addToCollection(bookmarkId, collectionId) {
        const bookmark = this.bookmarks.get(bookmarkId);
        const collection = this.collections.get(collectionId);
        
        if (!bookmark || !collection) return false;

        if (!collection.bookmarkIds.includes(bookmarkId)) {
            collection.bookmarkIds.push(bookmarkId);
            collection.modified = new Date().toISOString();
            
            bookmark.collection = collectionId;
            bookmark.modified = new Date().toISOString();
            
            await this.saveBookmarks();
            return true;
        }
        
        return false;
    }

    /**
     * Remove bookmark from collection
     */
    async removeFromCollection(bookmarkId, collectionId) {
        const bookmark = this.bookmarks.get(bookmarkId);
        const collection = this.collections.get(collectionId);
        
        if (!bookmark || !collection) return false;

        const index = collection.bookmarkIds.indexOf(bookmarkId);
        if (index > -1) {
            collection.bookmarkIds.splice(index, 1);
            collection.modified = new Date().toISOString();
            
            bookmark.collection = null;
            bookmark.modified = new Date().toISOString();
            
            await this.saveBookmarks();
            return true;
        }
        
        return false;
    }

    /**
     * Pin/unpin bookmark
     */
    async togglePin(bookmarkId) {
        const bookmark = this.bookmarks.get(bookmarkId);
        if (!bookmark) return false;

        bookmark.pinned = !bookmark.pinned;
        bookmark.modified = new Date().toISOString();
        
        await this.saveBookmarks();
        
        const action = bookmark.pinned ? 'kitűzve' : 'kitűzés eltávolítva';
        this.app.showNotification('success', 'Könyvjelző frissítve', `"${bookmark.title}" ${action}`);
        
        return bookmark.pinned;
    }

    /**
     * Access bookmark (track clicks)
     */
    async accessBookmark(bookmarkId) {
        const bookmark = this.bookmarks.get(bookmarkId);
        if (!bookmark) return false;

        bookmark.clicks = (bookmark.clicks || 0) + 1;
        bookmark.lastAccessed = new Date().toISOString();
        
        await this.saveBookmarks();

        // Navigate if it's a section
        if (bookmark.type === 'section' && bookmark.section) {
            this.app.navigateToSection(bookmark.section);
        }
        
        // Open external URL
        if (bookmark.type === 'external' && bookmark.url) {
            window.open(bookmark.url, '_blank');
        }

        return true;
    }

    /**
     * Search bookmarks
     */
    searchBookmarksAdvanced(query, options = {}) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [id, bookmark] of this.bookmarks) {
            let score = 0;
            
            // Title match (highest weight)
            if (bookmark.title.toLowerCase().includes(queryLower)) {
                score += 10;
            }
            
            // Description match
            if (bookmark.description.toLowerCase().includes(queryLower)) {
                score += 7;
            }
            
            // Tag match
            if (bookmark.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
                score += 8;
            }
            
            // Category match
            if (bookmark.category.toLowerCase().includes(queryLower)) {
                score += 5;
            }
            
            // Code content match
            if (bookmark.metadata?.code && bookmark.metadata.code.toLowerCase().includes(queryLower)) {
                score += 6;
            }
            
            // Apply filters
            if (options.category && bookmark.category !== options.category) continue;
            if (options.type && bookmark.type !== options.type) continue;
            if (options.collection && bookmark.collection !== options.collection) continue;
            if (options.pinned !== undefined && bookmark.pinned !== options.pinned) continue;
            
            if (score > 0) {
                results.push({ bookmark, score });
            }
        }
        
        return results
            .sort((a, b) => b.score - a.score)
            .map(result => result.bookmark);
    }

    /**
     * Get bookmarks by category
     */
    getBookmarksByCategory(category) {
        return Array.from(this.bookmarks.values())
            .filter(bookmark => bookmark.category === category)
            .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    }

    /**
     * Get bookmarks by collection
     */
    getBookmarksByCollection(collectionId) {
        const collection = this.collections.get(collectionId);
        if (!collection) return [];
        
        return collection.bookmarkIds
            .map(id => this.bookmarks.get(id))
            .filter(bookmark => bookmark)
            .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    }

    /**
     * Get pinned bookmarks
     */
    getPinnedBookmarksOnly() {
        return Array.from(this.bookmarks.values())
            .filter(bookmark => bookmark.pinned)
            .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    }

    /**
     * Get most accessed bookmarks
     */
    getMostAccessedBookmarksOnly(limit = 10) {
        return Array.from(this.bookmarks.values())
            .filter(bookmark => bookmark.clicks > 0)
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, limit);
    }

    /**
     * Get recent bookmarks
     */
    getRecentBookmarksOnly(limit = 10) {
        return Array.from(this.bookmarks.values())
            .sort((a, b) => new Date(b.created) - new Date(a.created))
            .slice(0, limit);
    }

    /**
     * Build search index
     */
    buildSearchIndex() {
        this.searchIndex.clear();
        
        for (const [id, bookmark] of this.bookmarks) {
            this.updateSearchIndex(bookmark);
        }
    }

    /**
     * Update search index for a bookmark
     */
    updateSearchIndex(bookmark) {
        const searchableText = [
            bookmark.title,
            bookmark.description,
            ...bookmark.tags,
            bookmark.category,
            bookmark.metadata?.code || ''
        ].join(' ').toLowerCase();
        
        this.searchIndex.set(bookmark.id, {
            id: bookmark.id,
            searchableText,
            keywords: this.extractKeywords(searchableText)
        });
    }

    /**
     * Remove bookmark from search index
     */
    removeFromSearchIndex(bookmarkId) {
        this.searchIndex.delete(bookmarkId);
    }

    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        const stopWords = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with']);
        
        return text
            .split(/\s+/)
            .map(word => word.replace(/[^\w]/g, '').toLowerCase())
            .filter(word => word.length > 2 && !stopWords.has(word))
            .filter((word, index, arr) => arr.indexOf(word) === index);
    }

    /**
     * Show context menu for bookmarking
     */
    showContextMenu(event, element) {
        // Remove existing context menu
        const existingMenu = document.querySelector('.bookmark-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'bookmark-context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${event.clientY}px;
            left: ${event.clientX}px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow);
            padding: var(--space-sm);
            z-index: 1000;
            min-width: 150px;
        `;

        const itemId = element.id || `item_${Date.now()}`;
        const itemType = element.classList.contains('code-example') ? 'code' : 
                        element.classList.contains('demo-container') ? 'demo' : 'content';

        menu.innerHTML = `
            <div class="context-menu-item" onclick="Bookmarks.bookmarkElement('${itemId}', '${itemType}')">
                ⭐ Könyvjelzőkhöz
            </div>
            <div class="context-menu-item" onclick="Bookmarks.shareElement('${itemId}')">
                📤 Megosztás
            </div>
            <div class="context-menu-item" onclick="Bookmarks.copyLink('${itemId}')">
                🔗 Link másolása
            </div>
        `;

        document.body.appendChild(menu);

        // Close menu on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    /**
     * Export bookmarks
     */
    async exportBookmarks(format = 'json') {
        const bookmarks = Array.from(this.bookmarks.values());
        const collections = Array.from(this.collections.values());
        
        let exportData;
        let filename;
        let mimeType;

        switch (format) {
            case 'json':
                exportData = JSON.stringify({
                    version: '1.0',
                    exported: new Date().toISOString(),
                    bookmarks: bookmarks,
                    collections: collections
                }, null, 2);
                filename = `webdevpro-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
                
            case 'html':
                exportData = this.bookmarksToHTML(bookmarks, collections);
                filename = `webdevpro-bookmarks-${new Date().toISOString().split('T')[0]}.html`;
                mimeType = 'text/html';
                break;
                
            default:
                throw new Error('Unsupported export format');
        }

        // Create and download file
        const blob = new Blob([exportData], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.app.showNotification('success', 'Könyvjelzők exportálva', `${bookmarks.length} könyvjelző exportálva ${format.toUpperCase()} formátumban`);
    }

    /**
     * Convert bookmarks to HTML
     */
    bookmarksToHTML(bookmarks, collections) {
        const bookmarksByCollection = {};
        
        // Group bookmarks by collection
        bookmarks.forEach(bookmark => {
            const collectionId = bookmark.collection || 'uncategorized';
            if (!bookmarksByCollection[collectionId]) {
                bookmarksByCollection[collectionId] = [];
            }
            bookmarksByCollection[collectionId].push(bookmark);
        });

        let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Web Dev Pro Bookmarks</TITLE>
<H1>Web Dev Pro Bookmarks</H1>
<DL><p>\n`;

        Object.entries(bookmarksByCollection).forEach(([collectionId, bookmarks]) => {
            const collection = collections.find(c => c.id === collectionId);
            const collectionName = collection?.name || 'Egyéb';
            
            html += `    <DT><H3>${collectionName}</H3>\n    <DL><p>\n`;
            
            bookmarks.forEach(bookmark => {
                const addDate = Math.floor(new Date(bookmark.created).getTime() / 1000);
                html += `        <DT><A HREF="${bookmark.url || '#'}" ADD_DATE="${addDate}">${bookmark.title}</A>\n`;
                if (bookmark.description) {
                    html += `        <DD>${bookmark.description}\n`;
                }
            });
            
            html += `    </DL><p>\n`;
        });

        html += `</DL><p>\n`;
        return html;
    }

    /**
     * Import bookmarks
     */
    async importBookmarks(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
                throw new Error('Invalid bookmarks file format');
            }

            let imported = 0;
            let skipped = 0;

            // Import collections first
            if (data.collections) {
                for (const collectionData of data.collections) {
                    const existingCollection = Array.from(this.collections.values())
                        .find(collection => collection.name === collectionData.name);
                    
                    if (!existingCollection) {
                        await this.createCollection({
                            ...collectionData,
                            id: this.generateBookmarkId() // Generate new ID
                        });
                    }
                }
            }

            // Import bookmarks
            for (const bookmarkData of data.bookmarks) {
                const existingBookmark = Array.from(this.bookmarks.values())
                    .find(bookmark => bookmark.title === bookmarkData.title && bookmark.url === bookmarkData.url);
                
                if (existingBookmark) {
                    skipped++;
                    continue;
                }

                await this.createBookmark({
                    ...bookmarkData,
                    id: this.generateBookmarkId() // Generate new ID
                });
                
                imported++;
            }

            this.buildSearchIndex();
            this.updateDashboard();

            this.app.showNotification('success', 'Könyvjelzők importálva', 
                `${imported} könyvjelző importálva, ${skipped} kihagyva (már létező)`);

        } catch (error) {
            console.error('Import failed:', error);
            this.app.showError('Importálási hiba', 'Nem sikerült importálni a könyvjelzőket');
        }
    }

    /**
     * Update dashboard with bookmarks count
     */
    updateDashboard() {
        const bookmarksCountElement = document.getElementById('bookmarksCount');
        if (bookmarksCountElement) {
            const count = this.bookmarks.size;
            this.app.animateCounter(bookmarksCountElement, count);
        }
    }

    /**
     * Get bookmarks statistics
     */
    getBookmarksStats() {
        const bookmarks = Array.from(this.bookmarks.values());
        const collections = Array.from(this.collections.values());
        
        const categoryStats = {};
        const typeStats = {};
        
        bookmarks.forEach(bookmark => {
            categoryStats[bookmark.category] = (categoryStats[bookmark.category] || 0) + 1;
            typeStats[bookmark.type] = (typeStats[bookmark.type] || 0) + 1;
        });

        return {
            total: bookmarks.length,
            collections: collections.length,
            pinned: bookmarks.filter(b => b.pinned).length,
            categories: Object.keys(categoryStats).length,
            mostAccessedCount: bookmarks.reduce((sum, b) => sum + (b.clicks || 0), 0),
            categoryStats,
            typeStats,
            averageClicksPerBookmark: bookmarks.length ? 
                Math.round(bookmarks.reduce((sum, b) => sum + (b.clicks || 0), 0) / bookmarks.length) : 0
        };
    }

    // Static methods for global access
    static bookmarkElement(itemId, itemType) {
        const bookmarksManager = window.App?.getModule('bookmarks');
        if (bookmarksManager) {
            bookmarksManager.toggleBookmark(itemId, itemType);
        }
    }

    static shareElement(itemId) {
        if (navigator.share) {
            navigator.share({
                title: 'Web Dev Pro',
                text: 'Hasznos webfejlesztési tartalom',
                url: window.location.href + '#' + itemId
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href + '#' + itemId);
        }
    }

    static copyLink(itemId) {
        const url = window.location.href + '#' + itemId;
        navigator.clipboard.writeText(url).then(() => {
            window.App?.showNotification('success', 'Link másolva', 'A link a vágólapra került');
        });
    }

    static togglePin(bookmarkId) {
        const bookmarksManager = window.App?.getModule('bookmarks');
        if (bookmarksManager) {
            bookmarksManager.togglePin(bookmarkId);
        }
    }

    static accessBookmark(bookmarkId) {
        const bookmarksManager = window.App?.getModule('bookmarks');
        if (bookmarksManager) {
            bookmarksManager.accessBookmark(bookmarkId);
        }
    }

    static deleteBookmark(bookmarkId) {
        const bookmarksManager = window.App?.getModule('bookmarks');
        if (bookmarksManager) {
            bookmarksManager.deleteBookmark(bookmarkId);
        }
    }
}

// Global functions
window.addBookmark = function() {
    const bookmarksManager = window.App?.getModule('bookmarks');
    if (bookmarksManager) {
        bookmarksManager.quickBookmark();
    }
};

// Make Bookmarks available globally
window.Bookmarks = BookmarksManager;