/**
 * ================================
 * NOTES MANAGER
 * Advanced note-taking with markdown support
 * ================================
 */

class NotesManager {
    constructor(app) {
        this.app = app;
        this.notes = new Map();
        this.currentNote = null;
        this.searchIndex = new Map();
        this.tags = new Set();
        this.categories = new Set(['general', 'html', 'css', 'javascript', 'tips']);
        this.autoSaveTimer = null;
        this.autoSaveDelay = 2000; // 2 seconds
    }

    /**
     * Initialize notes system
     */
    async init() {
        await this.loadNotes();
        this.setupEventListeners();
        this.buildSearchIndex();
        console.log('📝 Notes system initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Note modal events
        const noteModal = document.getElementById('noteModal');
        if (noteModal) {
            const titleInput = document.getElementById('noteTitle');
            const contentTextarea = document.getElementById('noteContent');
            const tagsInput = document.getElementById('noteTags');

            // Auto-save while typing
            if (titleInput) {
                titleInput.addEventListener('input', () => this.scheduleAutoSave());
            }
            if (contentTextarea) {
                contentTextarea.addEventListener('input', () => this.scheduleAutoSave());
            }
            if (tagsInput) {
                tagsInput.addEventListener('input', () => this.scheduleAutoSave());
            }

            // Keyboard shortcuts in note modal
            noteModal.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    this.saveCurrentNote();
                }
            });
        }

        // Global note shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                this.openNoteModal();
            }
        });

        // FAB note button
        document.addEventListener('click', (e) => {
            if (e.target.closest('[onclick*="addNote"]')) {
                this.openNoteModal();
            }
        });
    }

    /**
     * Load notes from storage
     */
    async loadNotes() {
        try {
            const storedNotes = await Storage.get('notes') || [];
            this.notes.clear();
            
            storedNotes.forEach(note => {
                this.notes.set(note.id, note);
                
                // Extract tags
                if (note.tags) {
                    note.tags.forEach(tag => this.tags.add(tag));
                }
                
                // Extract categories
                if (note.category) {
                    this.categories.add(note.category);
                }
            });

            console.log(`📝 Loaded ${this.notes.size} notes`);
        } catch (error) {
            console.error('Failed to load notes:', error);
        }
    }

    /**
     * Save notes to storage
     */
    async saveNotes() {
        try {
            const notesArray = Array.from(this.notes.values());
            await Storage.set('notes', notesArray);
            console.log(`📝 Saved ${notesArray.length} notes`);
        } catch (error) {
            console.error('Failed to save notes:', error);
            throw error;
        }
    }

    /**
     * Create new note
     */
    createNote(data = {}) {
        const note = {
            id: data.id || this.generateNoteId(),
            title: data.title || 'Új jegyzet',
            content: data.content || '',
            tags: data.tags || [],
            category: data.category || 'general',
            created: data.created || new Date().toISOString(),
            modified: data.modified || new Date().toISOString(),
            pinned: data.pinned || false,
            archived: data.archived || false,
            color: data.color || 'default',
            section: data.section || null // Associated section
        };

        this.notes.set(note.id, note);
        this.updateSearchIndex(note);
        
        // Add tags to global set
        note.tags.forEach(tag => this.tags.add(tag));
        
        return note;
    }

    /**
     * Update existing note
     */
    updateNote(noteId, updates) {
        const note = this.notes.get(noteId);
        if (!note) return null;

        const updatedNote = {
            ...note,
            ...updates,
            modified: new Date().toISOString()
        };

        this.notes.set(noteId, updatedNote);
        this.updateSearchIndex(updatedNote);
        
        // Update tags
        if (updates.tags) {
            updates.tags.forEach(tag => this.tags.add(tag));
        }

        return updatedNote;
    }

    /**
     * Delete note
     */
    async deleteNote(noteId) {
        const note = this.notes.get(noteId);
        if (!note) return false;

        // Confirm deletion
        const confirmed = confirm(`Biztosan törölni szeretnéd a jegyzetet: "${note.title}"?`);
        if (!confirmed) return false;

        this.notes.delete(noteId);
        this.removeFromSearchIndex(noteId);
        
        await this.saveNotes();
        this.app.showNotification('success', 'Jegyzet törölve', `"${note.title}" törölve`);
        
        return true;
    }

    /**
     * Generate unique note ID
     */
    generateNoteId() {
        return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Open note modal
     */
    openNoteModal(noteId = null) {
        const modal = document.getElementById('noteModal');
        if (!modal) return;

        const titleInput = document.getElementById('noteTitle');
        const contentTextarea = document.getElementById('noteContent');
        const tagsInput = document.getElementById('noteTags');

        if (noteId) {
            // Edit existing note
            const note = this.notes.get(noteId);
            if (note) {
                this.currentNote = note;
                titleInput.value = note.title;
                contentTextarea.value = note.content;
                tagsInput.value = note.tags.join(', ');
            }
        } else {
            // Create new note
            this.currentNote = null;
            titleInput.value = '';
            contentTextarea.value = '';
            tagsInput.value = '';
        }

        modal.classList.remove('hidden');
        titleInput.focus();
    }

    /**
     * Close note modal
     */
    closeNoteModal() {
        const modal = document.getElementById('noteModal');
        if (modal) {
            modal.classList.add('hidden');
            this.currentNote = null;
            this.clearAutoSave();
        }
    }

    /**
     * Save current note
     */
    async saveCurrentNote() {
        const titleInput = document.getElementById('noteTitle');
        const contentTextarea = document.getElementById('noteContent');
        const tagsInput = document.getElementById('noteTags');

        if (!titleInput || !contentTextarea) return;

        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);

        if (!title && !content) {
            this.app.showNotification('warning', 'Üres jegyzet', 'Add meg legalább a címet vagy a tartalmat');
            return;
        }

        try {
            let note;
            
            if (this.currentNote) {
                // Update existing note
                note = this.updateNote(this.currentNote.id, {
                    title: title || 'Névtelen jegyzet',
                    content,
                    tags
                });
            } else {
                // Create new note
                note = this.createNote({
                    title: title || 'Névtelen jegyzet',
                    content,
                    tags,
                    section: this.app.currentSection
                });
            }

            await this.saveNotes();
            this.closeNoteModal();
            
            this.app.showNotification('success', 'Jegyzet mentve', `"${note.title}" sikeresen mentve`);
            
            // Update dashboard if visible
            this.updateDashboard();
            
        } catch (error) {
            console.error('Failed to save note:', error);
            this.app.showError('Mentési hiba', 'Nem sikerült menteni a jegyzetet');
        }
    }

    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        this.clearAutoSave();
        this.autoSaveTimer = setTimeout(() => {
            this.autoSave();
        }, this.autoSaveDelay);
    }

    /**
     * Clear auto-save timer
     */
    clearAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Auto-save current note
     */
    async autoSave() {
        if (!this.currentNote) return;

        const titleInput = document.getElementById('noteTitle');
        const contentTextarea = document.getElementById('noteContent');
        const tagsInput = document.getElementById('noteTags');

        if (!titleInput || !contentTextarea) return;

        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);

        try {
            this.updateNote(this.currentNote.id, {
                title: title || 'Névtelen jegyzet',
                content,
                tags
            });

            await this.saveNotes();
            
            // Show subtle auto-save indicator
            this.showAutoSaveIndicator();
            
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    /**
     * Show auto-save indicator
     */
    showAutoSaveIndicator() {
        const modal = document.getElementById('noteModal');
        if (!modal) return;

        let indicator = modal.querySelector('.auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'auto-save-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 50px;
                background: var(--success);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            indicator.textContent = '✓ Automatikusan mentve';
            modal.querySelector('.modal-content').appendChild(indicator);
        }

        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }

    /**
     * Search notes
     */
    searchNotes(query, options = {}) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const [id, note] of this.notes) {
            if (note.archived && !options.includeArchived) continue;
            
            let score = 0;
            
            // Title match (highest weight)
            if (note.title.toLowerCase().includes(queryLower)) {
                score += 10;
            }
            
            // Content match
            if (note.content.toLowerCase().includes(queryLower)) {
                score += 5;
            }
            
            // Tag match
            if (note.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
                score += 8;
            }
            
            // Category match
            if (note.category.toLowerCase().includes(queryLower)) {
                score += 3;
            }
            
            if (score > 0) {
                results.push({ note, score });
            }
        }
        
        return results
            .sort((a, b) => b.score - a.score)
            .map(result => result.note);
    }

    /**
     * Build search index for notes
     */
    buildSearchIndex() {
        this.searchIndex.clear();
        
        for (const [id, note] of this.notes) {
            this.updateSearchIndex(note);
        }
    }

    /**
     * Update search index for a note
     */
    updateSearchIndex(note) {
        const searchableText = [
            note.title,
            note.content,
            ...note.tags,
            note.category
        ].join(' ').toLowerCase();
        
        this.searchIndex.set(note.id, {
            id: note.id,
            searchableText,
            keywords: this.extractKeywords(searchableText)
        });
    }

    /**
     * Remove note from search index
     */
    removeFromSearchIndex(noteId) {
        this.searchIndex.delete(noteId);
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
     * Get notes by category
     */
    getNotesByCategory(category) {
        return Array.from(this.notes.values())
            .filter(note => note.category === category && !note.archived)
            .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    }

    /**
     * Get notes by tag
     */
    getNotesByTag(tag) {
        return Array.from(this.notes.values())
            .filter(note => note.tags.includes(tag) && !note.archived)
            .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    }

    /**
     * Get recent notes
     */
    getRecentNotes(limit = 10) {
        return Array.from(this.notes.values())
            .filter(note => !note.archived)
            .sort((a, b) => new Date(b.modified) - new Date(a.modified))
            .slice(0, limit);
    }

    /**
     * Get pinned notes
     */
    getPinnedNotes() {
        return Array.from(this.notes.values())
            .filter(note => note.pinned && !note.archived)
            .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    }

    /**
     * Pin/unpin note
     */
    async togglePin(noteId) {
        const note = this.notes.get(noteId);
        if (!note) return false;

        note.pinned = !note.pinned;
        note.modified = new Date().toISOString();
        
        await this.saveNotes();
        
        const action = note.pinned ? 'kitűzve' : 'kitűzés eltávolítva';
        this.app.showNotification('success', 'Jegyzet frissítve', `"${note.title}" ${action}`);
        
        return note.pinned;
    }

    /**
     * Archive/unarchive note
     */
    async toggleArchive(noteId) {
        const note = this.notes.get(noteId);
        if (!note) return false;

        note.archived = !note.archived;
        note.modified = new Date().toISOString();
        
        await this.saveNotes();
        
        const action = note.archived ? 'archiválva' : 'archiválás visszavonva';
        this.app.showNotification('success', 'Jegyzet frissítve', `"${note.title}" ${action}`);
        
        return note.archived;
    }

    /**
     * Set note color
     */
    async setNoteColor(noteId, color) {
        const note = this.notes.get(noteId);
        if (!note) return false;

        note.color = color;
        note.modified = new Date().toISOString();
        
        await this.saveNotes();
        return true;
    }

    /**
     * Get all tags
     */
    getAllTags() {
        return Array.from(this.tags).sort();
    }

    /**
     * Get all categories
     */
    getAllCategories() {
        return Array.from(this.categories).sort();
    }

    /**
     * Create notes list UI
     */
    createNotesListUI(container, options = {}) {
        if (!container) return;

        const {
            showSearch = true,
            showFilters = true,
            limit = null,
            category = null,
            tag = null
        } = options;

        let notes = Array.from(this.notes.values());
        
        // Apply filters
        if (category) {
            notes = notes.filter(note => note.category === category);
        }
        
        if (tag) {
            notes = notes.filter(note => note.tags.includes(tag));
        }
        
        if (!options.includeArchived) {
            notes = notes.filter(note => !note.archived);
        }
        
        // Sort notes
        notes.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.modified) - new Date(a.modified);
        });
        
        if (limit) {
            notes = notes.slice(0, limit);
        }

        const notesHTML = `
            <div class="notes-container">
                ${showSearch ? this.createSearchUI() : ''}
                ${showFilters ? this.createFiltersUI() : ''}
                <div class="notes-list">
                    ${notes.length ? 
                        notes.map(note => this.createNoteCardHTML(note)).join('') :
                        '<div class="no-notes">📝 Még nincsenek jegyzetek</div>'
                    }
                </div>
            </div>
        `;

        container.innerHTML = notesHTML;
        this.setupNotesListEvents(container);
    }

    /**
     * Create search UI for notes
     */
    createSearchUI() {
        return `
            <div class="notes-search">
                <input type="text" class="notes-search-input" placeholder="Keresés a jegyzetekben..." id="notesSearchInput">
                <button class="notes-search-btn">🔍</button>
            </div>
        `;
    }

    /**
     * Create filters UI
     */
    createFiltersUI() {
        const categories = this.getAllCategories();
        const tags = this.getAllTags();

        return `
            <div class="notes-filters">
                <select class="notes-category-filter" id="notesCategoryFilter">
                    <option value="">Minden kategória</option>
                    ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
                
                <select class="notes-tag-filter" id="notesTagFilter">
                    <option value="">Minden címke</option>
                    ${tags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
                </select>
                
                <label class="notes-archive-toggle">
                    <input type="checkbox" id="showArchivedNotes"> Archivált jegyzetek
                </label>
            </div>
        `;
    }

    /**
     * Create note card HTML
     */
    createNoteCardHTML(note) {
        const excerpt = note.content.length > 150 ? 
            note.content.substring(0, 150) + '...' : 
            note.content;

        const timeAgo = this.getTimeAgo(note.modified);
        const colorClass = note.color !== 'default' ? `note-color-${note.color}` : '';

        return `
            <div class="note-card ${colorClass}" data-note-id="${note.id}">
                <div class="note-header">
                    <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        ${note.pinned ? '<span class="note-pinned" title="Kitűzött">📌</span>' : ''}
                        <button class="note-action-btn" onclick="Notes.togglePin('${note.id}')" title="Kitűzés">📌</button>
                        <button class="note-action-btn" onclick="Notes.editNote('${note.id}')" title="Szerkesztés">✏️</button>
                        <button class="note-action-btn" onclick="Notes.deleteNote('${note.id}')" title="Törlés">🗑️</button>
                    </div>
                </div>
                
                <div class="note-content">
                    ${this.escapeHtml(excerpt)}
                </div>
                
                <div class="note-footer">
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="note-meta">
                        <span class="note-category">${note.category}</span>
                        <span class="note-time">${timeAgo}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup notes list event listeners
     */
    setupNotesListEvents(container) {
        // Search input
        const searchInput = container.querySelector('#notesSearchInput');
        if (searchInput) {
            let searchTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    this.filterNotesList(container, e.target.value);
                }, 300);
            });
        }

        // Category filter
        const categoryFilter = container.querySelector('#notesCategoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterNotesList(container, null, e.target.value);
            });
        }

        // Tag filter
        const tagFilter = container.querySelector('#notesTagFilter');
        if (tagFilter) {
            tagFilter.addEventListener('change', (e) => {
                this.filterNotesList(container, null, null, e.target.value);
            });
        }

        // Archive toggle
        const archiveToggle = container.querySelector('#showArchivedNotes');
        if (archiveToggle) {
            archiveToggle.addEventListener('change', (e) => {
                this.filterNotesList(container, null, null, null, e.target.checked);
            });
        }
    }

    /**
     * Filter notes list
     */
    filterNotesList(container, searchQuery = null, category = null, tag = null, showArchived = false) {
        let notes = Array.from(this.notes.values());

        // Apply search
        if (searchQuery) {
            notes = this.searchNotes(searchQuery, { includeArchived: showArchived });
        }

        // Apply category filter
        if (category) {
            notes = notes.filter(note => note.category === category);
        }

        // Apply tag filter
        if (tag) {
            notes = notes.filter(note => note.tags.includes(tag));
        }

        // Apply archive filter
        if (!showArchived) {
            notes = notes.filter(note => !note.archived);
        }

        // Sort notes
        notes.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.modified) - new Date(a.modified);
        });

        // Update list
        const notesList = container.querySelector('.notes-list');
        if (notesList) {
            notesList.innerHTML = notes.length ?
                notes.map(note => this.createNoteCardHTML(note)).join('') :
                '<div class="no-notes">📝 Nincs találat</div>';
        }
    }

    /**
     * Get time ago string
     */
    getTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Most';
        if (diffMinutes < 60) return `${diffMinutes} perce`;
        if (diffHours < 24) return `${diffHours} órája`;
        if (diffDays < 7) return `${diffDays} napja`;
        
        return date.toLocaleDateString('hu-HU');
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
     * Update dashboard with notes count
     */
    updateDashboard() {
        const notesCountElement = document.getElementById('notesCount');
        if (notesCountElement) {
            const count = Array.from(this.notes.values()).filter(note => !note.archived).length;
            this.app.animateCounter(notesCountElement, count);
        }
    }

    /**
     * Export all notes
     */
    async exportNotes(format = 'json') {
        const notes = Array.from(this.notes.values());
        
        let exportData;
        let filename;
        let mimeType;

        switch (format) {
            case 'json':
                exportData = JSON.stringify({
                    version: '1.0',
                    exported: new Date().toISOString(),
                    notes: notes
                }, null, 2);
                filename = `webdevpro-notes-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
                
            case 'markdown':
                exportData = this.notesToMarkdown(notes);
                filename = `webdevpro-notes-${new Date().toISOString().split('T')[0]}.md`;
                mimeType = 'text/markdown';
                break;
                
            case 'txt':
                exportData = this.notesToText(notes);
                filename = `webdevpro-notes-${new Date().toISOString().split('T')[0]}.txt`;
                mimeType = 'text/plain';
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
        
        this.app.showNotification('success', 'Jegyzetek exportálva', `${notes.length} jegyzet exportálva ${format.toUpperCase()} formátumban`);
    }

    /**
     * Convert notes to markdown
     */
    notesToMarkdown(notes) {
        const sections = notes.map(note => {
            const tags = note.tags.length ? `\n\nCímkék: ${note.tags.map(tag => `#${tag}`).join(' ')}` : '';
            const category = note.category ? `\nKategória: ${note.category}` : '';
            
            return `# ${note.title}

${note.content}${tags}${category}

---

Létrehozva: ${new Date(note.created).toLocaleString('hu-HU')}
Módosítva: ${new Date(note.modified).toLocaleString('hu-HU')}

---
`;
        });

        return `# Web Dev Pro Jegyzetek

Exportálva: ${new Date().toLocaleString('hu-HU')}
Összesen: ${notes.length} jegyzet

---

${sections.join('\n\n')}`;
    }

    /**
     * Convert notes to plain text
     */
    notesToText(notes) {
        const sections = notes.map(note => {
            const tags = note.tags.length ? `\nCímkék: ${note.tags.join(', ')}` : '';
            const category = note.category ? `\nKategória: ${note.category}` : '';
            
            return `${note.title}
${'='.repeat(note.title.length)}

${note.content}${tags}${category}

Létrehozva: ${new Date(note.created).toLocaleString('hu-HU')}
Módosítva: ${new Date(note.modified).toLocaleString('hu-HU')}

${'─'.repeat(50)}`;
        });

        return `Web Dev Pro Jegyzetek

Exportálva: ${new Date().toLocaleString('hu-HU')}
Összesen: ${notes.length} jegyzet

${'═'.repeat(50)}

${sections.join('\n\n')}`;
    }

    /**
     * Import notes from file
     */
    async importNotes(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.notes || !Array.isArray(data.notes)) {
                throw new Error('Invalid notes file format');
            }

            let imported = 0;
            let skipped = 0;

            for (const noteData of data.notes) {
                // Check if note already exists
                const existingNote = Array.from(this.notes.values())
                    .find(note => note.title === noteData.title && note.content === noteData.content);
                
                if (existingNote) {
                    skipped++;
                    continue;
                }

                // Create new note with new ID
                this.createNote({
                    ...noteData,
                    id: this.generateNoteId() // Generate new ID to avoid conflicts
                });
                
                imported++;
            }

            await this.saveNotes();
            this.buildSearchIndex();
            this.updateDashboard();

            this.app.showNotification('success', 'Jegyzetek importálva', 
                `${imported} jegyzet importálva, ${skipped} kihagyva (már létező)`);

        } catch (error) {
            console.error('Import failed:', error);
            this.app.showError('Importálási hiba', 'Nem sikerült importálni a jegyzeteket');
        }
    }

    /**
     * Get notes statistics
     */
    getNotesStats() {
        const notes = Array.from(this.notes.values());
        const activeNotes = notes.filter(note => !note.archived);
        const archivedNotes = notes.filter(note => note.archived);
        const pinnedNotes = notes.filter(note => note.pinned);
        
        const categoryStats = {};
        notes.forEach(note => {
            categoryStats[note.category] = (categoryStats[note.category] || 0) + 1;
        });

        const tagStats = {};
        notes.forEach(note => {
            note.tags.forEach(tag => {
                tagStats[tag] = (tagStats[tag] || 0) + 1;
            });
        });

        return {
            total: notes.length,
            active: activeNotes.length,
            archived: archivedNotes.length,
            pinned: pinnedNotes.length,
            categories: Object.keys(categoryStats).length,
            tags: Object.keys(tagStats).length,
            categoryStats,
            tagStats,
            averageLength: notes.length ? 
                Math.round(notes.reduce((sum, note) => sum + note.content.length, 0) / notes.length) : 0
        };
    }

    // Static methods for global access
    static togglePin(noteId) {
        const notesManager = window.App?.getModule('notes');
        if (notesManager) {
            notesManager.togglePin(noteId);
        }
    }

    static editNote(noteId) {
        const notesManager = window.App?.getModule('notes');
        if (notesManager) {
            notesManager.openNoteModal(noteId);
        }
    }

    static deleteNote(noteId) {
        const notesManager = window.App?.getModule('notes');
        if (notesManager) {
            notesManager.deleteNote(noteId);
        }
    }
}

// Global functions for modal usage
window.addNote = function() {
    const notesManager = window.App?.getModule('notes');
    if (notesManager) {
        notesManager.openNoteModal();
    }
};

window.saveNote = function() {
    const notesManager = window.App?.getModule('notes');
    if (notesManager) {
        notesManager.saveCurrentNote();
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
};

// Make Notes available globally
window.Notes = NotesManager;