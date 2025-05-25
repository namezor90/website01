/**
 * ================================
 * SEARCH SYSTEM
 * Advanced search with fuzzy matching and filters
 * ================================
 */

class SearchManager {
    constructor(app) {
        this.app = app;
        this.searchIndex = new Map();
        this.searchHistory = [];
        this.maxHistoryLength = 20;
        this.debounceTimer = null;
        this.searchWorker = null;
        this.isIndexing = false;
    }

    /**
     * Initialize search system
     */
    async init() {
        this.setupEventListeners();
        await this.buildSearchIndex();
        this.loadSearchHistory();
        this.setupSearchWorker();
        console.log('🔍 Search system initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;

        // Main search input
        searchInput.addEventListener('input', (e) => {
            this.debounceSearch(e.target.value);
        });

        searchInput.addEventListener('focus', () => {
            this.showSearchSuggestions();
        });

        searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeydown(e);
        });

        // Click outside to close suggestions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchSuggestions();
            }
        });

        // Search shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        });
    }

    /**
     * Debounced search to avoid too many calls
     */
    debounceSearch(query) {
        clearTimeout(this.debounceTimer);
        
        if (query.length === 0) {
            this.hideSearchSuggestions();
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 150);
    }

    /**
     * Perform search
     */
    async performSearch(query) {
        if (query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }

        try {
            const startTime = performance.now();
            
            // Perform different types of searches
            const results = await Promise.all([
                this.searchContent(query),
                this.searchSections(query),
                this.searchCode(query),
                this.searchNotes(query),
                this.searchBookmarks(query)
            ]);

            // Combine and rank results
            const combinedResults = this.combineResults(results, query);
            
            const endTime = performance.now();
            const searchTime = Math.round(endTime - startTime);

            // Display results
            this.displaySearchResults(combinedResults, query, searchTime);
            
            // Add to search history
            this.addToSearchHistory(query, combinedResults.length);

            console.log(`🔍 Search completed in ${searchTime}ms for "${query}"`);

        } catch (error) {
            console.error('Search error:', error);
            this.app.showError('Keresési hiba', error.message);
        }
    }

    /**
     * Build search index
     */
    async buildSearchIndex() {
        if (this.isIndexing) return;
        
        this.isIndexing = true;
        console.log('🔍 Building search index...');

        try {
            // Index bookmarks
            const bookmarks = await Storage.get('bookmarks') || [];
            bookmarks.forEach(bookmark => {
                this.addToIndex({
                    id: `bookmark_${bookmark.id}`,
                    type: 'bookmark',
                    title: bookmark.title,
                    description: bookmark.description || '',
                    content: `${bookmark.title} ${bookmark.description || ''} ${bookmark.tags?.join(' ') || ''}`,
                    sectionId: bookmark.section,
                    weight: 5
                });
            });

        } catch (error) {
            console.warn('Could not index user data:', error);
        }
    }

    /**
     * Add item to search index
     */
    addToIndex(item) {
        const searchableText = this.createSearchableText(item);
        const keywords = this.extractKeywords(searchableText);
        
        this.searchIndex.set(item.id, {
            ...item,
            searchableText,
            keywords,
            indexed: new Date().toISOString()
        });
    }

    /**
     * Create searchable text from item
     */
    createSearchableText(item) {
        const parts = [
            item.title || '',
            item.description || '',
            item.content || '',
            item.category || '',
            item.sectionId || ''
        ];
        
        return parts.join(' ').toLowerCase();
    }

    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        const stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'és', 'egy', 'az', 'vagy', 'de'
        ]);
        
        return text
            .split(/\s+/)
            .map(word => word.replace(/[^\w]/g, '').toLowerCase())
            .filter(word => word.length > 2 && !stopWords.has(word))
            .filter((word, index, arr) => arr.indexOf(word) === index);
    }

    /**
     * Search content
     */
    async searchContent(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/);
        
        for (const [id, item] of this.searchIndex) {
            const score = this.calculateRelevanceScore(item, queryLower, queryWords);
            
            if (score > 0) {
                results.push({
                    ...item,
                    score,
                    type: item.type || 'content'
                });
            }
        }
        
        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate relevance score
     */
    calculateRelevanceScore(item, query, queryWords) {
        let score = 0;
        const text = item.searchableText;
        
        // Exact title match
        if (item.title && item.title.toLowerCase().includes(query)) {
            score += item.weight * 3;
        }
        
        // Partial title match
        queryWords.forEach(word => {
            if (item.title && item.title.toLowerCase().includes(word)) {
                score += item.weight * 2;
            }
        });
        
        // Description match
        if (item.description && item.description.toLowerCase().includes(query)) {
            score += item.weight * 2;
        }
        
        // Content match
        if (text.includes(query)) {
            score += item.weight;
        }
        
        // Keyword matches
        queryWords.forEach(word => {
            if (item.keywords && item.keywords.includes(word)) {
                score += item.weight * 0.5;
            }
        });
        
        // Fuzzy matching for typos
        score += this.fuzzyMatch(query, text) * item.weight * 0.3;
        
        return score;
    }

    /**
     * Simple fuzzy matching
     */
    fuzzyMatch(query, text) {
        if (text.includes(query)) return 1;
        
        let matches = 0;
        const queryChars = query.split('');
        let textIndex = 0;
        
        for (const char of queryChars) {
            const found = text.indexOf(char, textIndex);
            if (found !== -1) {
                matches++;
                textIndex = found + 1;
            }
        }
        
        return matches / query.length;
    }

    /**
     * Search sections
     */
    async searchSections(query) {
        const navigation = this.app.getModule('navigation');
        if (!navigation) return [];
        
        return navigation.searchSections(query).map(section => ({
            ...section,
            type: 'section',
            score: section.relevance * 10
        }));
    }

    /**
     * Search code examples
     */
    async searchCode(query) {
        const results = [];
        
        // Search in code blocks (would be enhanced with actual content)
        const codeItems = Array.from(this.searchIndex.values())
            .filter(item => item.type === 'code')
            .filter(item => item.searchableText.includes(query.toLowerCase()))
            .map(item => ({
                ...item,
                type: 'code',
                score: item.weight
            }));
        
        return codeItems;
    }

    /**
     * Search notes
     */
    async searchNotes(query) {
        try {
            const notes = await Storage.search(query, { fields: ['title', 'content', 'tags'] });
            return notes.map(({ key, value }) => ({
                id: key,
                type: 'note',
                title: value.title,
                description: value.content?.substring(0, 100) + '...',
                content: value.content,
                score: 5
            }));
        } catch (error) {
            console.warn('Note search failed:', error);
            return [];
        }
    }

    /**
     * Search bookmarks
     */
    async searchBookmarks(query) {
        try {
            const bookmarks = await Storage.get('bookmarks') || [];
            const queryLower = query.toLowerCase();
            
            return bookmarks
                .filter(bookmark => 
                    bookmark.title?.toLowerCase().includes(queryLower) ||
                    bookmark.description?.toLowerCase().includes(queryLower) ||
                    bookmark.tags?.some(tag => tag.toLowerCase().includes(queryLower))
                )
                .map(bookmark => ({
                    ...bookmark,
                    type: 'bookmark',
                    score: 4
                }));
        } catch (error) {
            console.warn('Bookmark search failed:', error);
            return [];
        }
    }

    /**
     * Combine search results
     */
    combineResults(resultArrays, query) {
        const combined = [];
        const seenIds = new Set();
        
        // Flatten and deduplicate results
        resultArrays.forEach(results => {
            results.forEach(result => {
                if (!seenIds.has(result.id)) {
                    seenIds.add(result.id);
                    combined.push(result);
                }
            });
        });
        
        // Sort by score
        combined.sort((a, b) => b.score - a.score);
        
        // Limit results
        return combined.slice(0, 20);
    }

    /**
     * Display search results
     */
    displaySearchResults(results, query, searchTime) {
        let container = document.querySelector('.search-results');
        
        if (!container) {
            container = this.createSearchResultsContainer();
        }
        
        if (results.length === 0) {
            container.innerHTML = this.createNoResultsHTML(query);
        } else {
            container.innerHTML = this.createResultsHTML(results, query, searchTime);
        }
        
        container.classList.remove('hidden');
        this.highlightSearchTerm(container, query);
    }

    /**
     * Create search results container
     */
    createSearchResultsContainer() {
        const container = document.createElement('div');
        container.className = 'search-results';
        container.innerHTML = '';
        
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(container);
        }
        
        return container;
    }

    /**
     * Create results HTML
     */
    createResultsHTML(results, query, searchTime) {
        const statsHTML = `
            <div class="search-stats">
                ${results.length} eredmény "${query}" kifejezésre (${searchTime}ms)
            </div>
        `;
        
        const resultsHTML = results.map(result => this.createResultItemHTML(result)).join('');
        
        return `
            ${statsHTML}
            <div class="search-items">
                ${resultsHTML}
            </div>
        `;
    }

    /**
     * Create result item HTML
     */
    createResultItemHTML(result) {
        const typeIcon = this.getTypeIcon(result.type);
        const typeLabel = this.getTypeLabel(result.type);
        
        return `
            <div class="search-item" data-type="${result.type}" onclick="SearchManager.handleResultClick('${result.id}', '${result.type}')">
                <div class="search-item-icon">${typeIcon}</div>
                <div class="search-item-content">
                    <div class="search-item-title">${result.title}</div>
                    <div class="search-item-description">${result.description || ''}</div>
                    <div class="search-item-meta">
                        <span class="search-item-type">${typeLabel}</span>
                        ${result.sectionId ? `<span class="search-item-section">${result.sectionId}</span>` : ''}
                    </div>
                </div>
                <div class="search-item-score">${Math.round(result.score)}</div>
            </div>
        `;
    }

    /**
     * Create no results HTML
     */
    createNoResultsHTML(query) {
        return `
            <div class="search-no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-title">Nincs találat</div>
                <div class="no-results-message">
                    Nem találtunk eredményt a(z) "${query}" kifejezésre.
                </div>
                <div class="search-suggestions">
                    <strong>Javaslatok:</strong>
                    <ul>
                        <li>Ellenőrizd a helyesírást</li>
                        <li>Próbálj általánosabb kifejezéseket</li>
                        <li>Használj szinonimákat</li>
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Get type icon
     */
    getTypeIcon(type) {
        const icons = {
            section: '📄',
            content: '📝',
            code: '💻',
            note: '📔',
            bookmark: '⭐',
            default: '📄'
        };
        return icons[type] || icons.default;
    }

    /**
     * Get type label
     */
    getTypeLabel(type) {
        const labels = {
            section: 'Szekció',
            content: 'Tartalom',
            code: 'Kód',
            note: 'Jegyzet',
            bookmark: 'Kedvenc',
            default: 'Elem'
        };
        return labels[type] || labels.default;
    }

    /**
     * Handle result click
     */
    static handleResultClick(resultId, type) {
        const searchManager = window.App?.getModule('search');
        if (searchManager) {
            searchManager.handleResultClick(resultId, type);
        }
    }

    /**
     * Handle result click
     */
    handleResultClick(resultId, type) {
        const result = this.searchIndex.get(resultId);
        if (!result) return;
        
        this.hideSearchSuggestions();
        
        switch (type) {
            case 'section':
                this.app.navigateToSection(result.sectionId);
                break;
            case 'content':
                this.app.navigateToSection(result.sectionId);
                break;
            case 'note':
                this.openNote(resultId);
                break;
            case 'bookmark':
                this.openBookmark(result);
                break;
            default:
                if (result.sectionId) {
                    this.app.navigateToSection(result.sectionId);
                }
        }
        
        // Track search click
        this.app.trackAnalytics('search_click', {
            resultId,
            type,
            query: document.getElementById('globalSearch').value
        });
    }

    /**
     * Show search suggestions
     */
    showSearchSuggestions() {
        const input = document.getElementById('globalSearch');
        if (!input.value) {
            this.showSearchHistory();
        }
    }

    /**
     * Show search history
     */
    showSearchHistory() {
        if (this.searchHistory.length === 0) return;
        
        const historyHTML = this.searchHistory
            .slice(0, 5)
            .map(item => `
                <div class="search-suggestion" onclick="SearchManager.selectSuggestion('${item.query}')">
                    <span class="suggestion-icon">🕒</span>
                    <span class="suggestion-text">${item.query}</span>
                    <span class="suggestion-count">${item.results} találat</span>
                </div>
            `).join('');
        
        const container = this.getOrCreateSearchResultsContainer();
        container.innerHTML = `
            <div class="search-history">
                <div class="search-history-title">Keresési előzmények</div>
                ${historyHTML}
            </div>
        `;
        container.classList.remove('hidden');
    }

    /**
     * Hide search suggestions
     */
    hideSearchSuggestions() {
        const container = document.querySelector('.search-results');
        if (container) {
            container.classList.add('hidden');
        }
    }

    /**
     * Handle search keydown
     */
    handleSearchKeydown(e) {
        const container = document.querySelector('.search-results');
        if (!container || container.classList.contains('hidden')) return;
        
        const items = container.querySelectorAll('.search-item, .search-suggestion');
        let currentIndex = Array.from(items).findIndex(item => 
            item.classList.contains('selected')
        );
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, items.length - 1);
                this.selectSearchItem(items, currentIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                this.selectSearchItem(items, currentIndex);
                break;
            case 'Enter':
                e.preventDefault();
                const selected = container.querySelector('.selected');
                if (selected) {
                    selected.click();
                }
                break;
            case 'Escape':
                this.hideSearchSuggestions();
                e.target.blur();
                break;
        }
    }

    /**
     * Select search item
     */
    selectSearchItem(items, index) {
        items.forEach(item => item.classList.remove('selected'));
        if (items[index]) {
            items[index].classList.add('selected');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    /**
     * Select suggestion
     */
    static selectSuggestion(query) {
        const input = document.getElementById('globalSearch');
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event('input'));
        }
    }

    /**
     * Highlight search term in results
     */
    highlightSearchTerm(container, query) {
        const terms = query.toLowerCase().split(/\s+/);
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
            let text = textNode.textContent;
            let hasMatch = false;
            
            terms.forEach(term => {
                if (text.toLowerCase().includes(term)) {
                    const regex = new RegExp(`(${term})`, 'gi');
                    text = text.replace(regex, '<mark>$1</mark>');
                    hasMatch = true;
                }
            });
            
            if (hasMatch) {
                const span = document.createElement('span');
                span.innerHTML = text;
                textNode.parentNode.replaceChild(span, textNode);
            }
        });
    }

    /**
     * Add to search history
     */
    addToSearchHistory(query, resultCount) {
        // Remove existing entry
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Add to beginning
        this.searchHistory.unshift({
            query,
            results: resultCount,
            timestamp: new Date().toISOString()
        });
        
        // Limit size
        if (this.searchHistory.length > this.maxHistoryLength) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryLength);
        }
        
        this.saveSearchHistory();
    }

    /**
     * Save search history
     */
    async saveSearchHistory() {
        try {
            await Storage.set('searchHistory', this.searchHistory);
        } catch (error) {
            console.warn('Could not save search history:', error);
        }
    }

    /**
     * Load search history
     */
    async loadSearchHistory() {
        try {
            const history = await Storage.get('searchHistory');
            if (history) {
                this.searchHistory = history;
            }
        } catch (error) {
            console.warn('Could not load search history:', error);
        }
    }

    /**
     * Clear search history
     */
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
    }

    /**
     * Setup search worker for heavy operations
     */
    setupSearchWorker() {
        // Web Worker for search indexing (simplified version)
        if (typeof Worker !== 'undefined') {
            try {
                this.searchWorker = new Worker('js/workers/search-worker.js');
                this.searchWorker.onmessage = (e) => {
                    const { type, data } = e.data;
                    if (type === 'indexComplete') {
                        console.log('Search worker completed indexing');
                    }
                };
            } catch (error) {
                console.warn('Search worker not available:', error);
            }
        }
    }

    /**
     * Re-index content
     */
    async reindex() {
        this.searchIndex.clear();
        await this.buildSearchIndex();
        this.app.showNotification('success', 'Index frissítve', 'A keresési index újraépítve');
    }

    /**
     * Get search statistics
     */
    getSearchStats() {
        return {
            indexSize: this.searchIndex.size,
            historySize: this.searchHistory.length,
            topSearches: this.getTopSearches()
        };
    }

    /**
     * Get top searches
     */
    getTopSearches(limit = 5) {
        const counts = {};
        this.searchHistory.forEach(item => {
            counts[item.query] = (counts[item.query] || 0) + 1;
        });
        
        return Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([query, count]) => ({ query, count }));
    }
}

// Make Search available globally
window.Search = SearchManager; sections
            await this.indexSections();
            
            // Index content
            await this.indexContent();
            
            // Index code examples
            await this.indexCodeExamples();
            
            // Index user data
            await this.indexUserData();
            
            console.log(`✅ Search index built with ${this.searchIndex.size} items`);
            
        } catch (error) {
            console.error('Failed to build search index:', error);
        } finally {
            this.isIndexing = false;
        }
    }

    /**
     * Index sections
     */
    async indexSections() {
        const navigation = this.app.getModule('navigation');
        if (!navigation) return;

        for (const [id, section] of navigation.sections) {
            this.addToIndex({
                id: `section_${id}`,
                type: 'section',
                title: section.title,
                description: section.description,
                category: section.category,
                icon: section.icon,
                sectionId: id,
                weight: 10
            });
        }
    }

    /**
     * Index content
     */
    async indexContent() {
        // This would index all the content from sections
        // For now, we'll add some sample content
        const contentItems = [
            {
                id: 'html_structure',
                type: 'content',
                title: 'HTML Dokumentum Struktúra',
                description: 'A HTML dokumentum alapvető felépítése',
                content: 'DOCTYPE html head body meta title',
                sectionId: 'html',
                weight: 8
            },
            {
                id: 'css_flexbox',
                type: 'content',
                title: 'Flexbox Layout',
                description: 'CSS Flexbox használata',
                content: 'display flex justify-content align-items flex-direction',
                sectionId: 'css',
                weight: 8
            },
            {
                id: 'js_functions',
                type: 'content',
                title: 'JavaScript Függvények',
                description: 'Függvények létrehozása és használata',
                content: 'function arrow function return parameters',
                sectionId: 'javascript',
                weight: 8
            }
        ];

        contentItems.forEach(item => this.addToIndex(item));
    }

    /**
     * Index code examples
     */
    async indexCodeExamples() {
        // Index code snippets and examples
        const codeExamples = [
            {
                id: 'margin_padding',
                type: 'code',
                title: 'Margin vs Padding',
                description: 'CSS margin és padding különbsége',
                content: 'margin padding border box-model spacing',
                sectionId: 'css',
                weight: 7
            },
            {
                id: 'dom_manipulation',
                type: 'code',
                title: 'DOM Manipuláció',
                description: 'HTML elemek kezelése JavaScripttel',
                content: 'getElementById querySelector innerHTML textContent addEventListener',
                sectionId: 'javascript',
                weight: 7
            }
        ];

        codeExamples.forEach(item => this.addToIndex(item));
    }

    /**
     * Index user data
     */
    async indexUserData() {
        try {
            // Index notes
            const notes = await Storage.get('notes') || [];
            notes.forEach(note => {
                this.addToIndex({
                    id: `note_${note.id}`,
                    type: 'note',
                    title: note.title,
                    description: note.content.substring(0, 100),
                    content: `${note.title} ${note.content} ${note.tags?.join(' ') || ''}`,
                    weight: 6
                });
            });

            // Index