/**
 * ================================
 * STORAGE SYSTEM
 * Advanced storage with IndexedDB support
 * ================================
 */

class StorageManager {
    constructor() {
        this.dbName = 'WebDevProDB';
        this.dbVersion = 1;
        this.db = null;
        this.isIndexedDBAvailable = false;
        this.storeName = 'keyValueStore';
    }

    /**
     * Initialize IndexedDB
     */
    async initIndexedDB() {
        if (!('indexedDB' in window)) {
            console.warn('IndexedDB not supported, falling back to localStorage');
            return false;
        }

        try {
            this.db = await this.openDatabase();
            this.isIndexedDBAvailable = true;
            console.log('✅ IndexedDB initialized');
            return true;
        } catch (error) {
            console.warn('IndexedDB init failed, using localStorage:', error);
            return false;
        }
    }

    /**
     * Open IndexedDB database
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Set data in storage
     */
    async set(key, value) {
        const data = {
            key,
            value: JSON.stringify(value),
            timestamp: new Date().toISOString(),
            type: typeof value
        };

        if (this.isIndexedDBAvailable) {
            return this.setIndexedDB(data);
        } else {
            return this.setLocalStorage(key, data);
        }
    }

    /**
     * Get data from storage
     */
    async get(key) {
        if (this.isIndexedDBAvailable) {
            return this.getIndexedDB(key);
        } else {
            return this.getLocalStorage(key);
        }
    }

    /**
     * Remove data from storage
     */
    async remove(key) {
        if (this.isIndexedDBAvailable) {
            return this.removeIndexedDB(key);
        } else {
            return this.removeLocalStorage(key);
        }
    }

    /**
     * Clear all data
     */
    async clear() {
        if (this.isIndexedDBAvailable) {
            return this.clearIndexedDB();
        } else {
            return this.clearLocalStorage();
        }
    }

    /**
     * Get all keys
     */
    async keys() {
        if (this.isIndexedDBAvailable) {
            return this.getKeysIndexedDB();
        } else {
            return this.getKeysLocalStorage();
        }
    }

    /**
     * Get storage size info
     */
    async getStorageInfo() {
        if (this.isIndexedDBAvailable) {
            return this.getIndexedDBInfo();
        } else {
            return this.getLocalStorageInfo();
        }
    }

    // IndexedDB Methods
    async setIndexedDB(data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    try {
                        resolve(JSON.parse(result.value));
                    } catch (error) {
                        resolve(result.value);
                    }
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async removeIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getKeysIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getIndexedDBInfo() {
        try {
            const keys = await this.getKeysIndexedDB();
            const estimate = await navigator.storage?.estimate?.() || {};
            
            return {
                type: 'IndexedDB',
                itemCount: keys.length,
                quota: estimate.quota || 'Unknown',
                usage: estimate.usage || 'Unknown',
                available: estimate.quota - estimate.usage || 'Unknown'
            };
        } catch (error) {
            return { type: 'IndexedDB', error: error.message };
        }
    }

    // LocalStorage Methods
    setLocalStorage(key, data) {
        try {
            localStorage.setItem(`webdevpro_${key}`, JSON.stringify(data));
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    getLocalStorage(key) {
        try {
            const item = localStorage.getItem(`webdevpro_${key}`);
            if (item) {
                const data = JSON.parse(item);
                return Promise.resolve(JSON.parse(data.value));
            }
            return Promise.resolve(null);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(`webdevpro_${key}`);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    clearLocalStorage() {
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith('webdevpro_')
            );
            keys.forEach(key => localStorage.removeItem(key));
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    getKeysLocalStorage() {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith('webdevpro_'))
                .map(key => key.replace('webdevpro_', ''));
            return Promise.resolve(keys);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    getLocalStorageInfo() {
        try {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith('webdevpro_')
            );
            
            let totalSize = 0;
            keys.forEach(key => {
                totalSize += localStorage.getItem(key).length;
            });

            return Promise.resolve({
                type: 'localStorage',
                itemCount: keys.length,
                sizeBytes: totalSize,
                sizeKB: Math.round(totalSize / 1024),
                quota: '5-10MB (estimated)',
                usage: `${Math.round(totalSize / 1024)}KB`
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Export data for backup
     */
    async exportData() {
        try {
            const keys = await this.keys();
            const data = {};
            
            for (const key of keys) {
                data[key] = await this.get(key);
            }
            
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: data
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            throw new Error(`Export failed: ${error.message}`);
        }
    }

    /**
     * Import data from backup
     */
    async importData(jsonString) {
        try {
            const importData = JSON.parse(jsonString);
            
            if (!importData.data) {
                throw new Error('Invalid import format');
            }
            
            // Clear existing data
            await this.clear();
            
            // Import new data
            for (const [key, value] of Object.entries(importData.data)) {
                await this.set(key, value);
            }
            
            return {
                success: true,
                itemsImported: Object.keys(importData.data).length,
                timestamp: importData.timestamp
            };
        } catch (error) {
            throw new Error(`Import failed: ${error.message}`);
        }
    }

    /**
     * Get data with expiration support
     */
    async getWithExpiry(key) {
        const item = await this.get(key);
        if (!item) return null;
        
        if (item.expiry && new Date().getTime() > item.expiry) {
            await this.remove(key);
            return null;
        }
        
        return item.data || item;
    }

    /**
     * Set data with expiration
     */
    async setWithExpiry(key, value, ttlMs) {
        const expiryTime = new Date().getTime() + ttlMs;
        const data = {
            data: value,
            expiry: expiryTime
        };
        
        return this.set(key, data);
    }

    /**
     * Cache with automatic cleanup
     */
    async cache(key, fetchFunction, ttlMs = 3600000) { // 1 hour default
        const cached = await this.getWithExpiry(key);
        if (cached) {
            return cached;
        }
        
        const freshData = await fetchFunction();
        await this.setWithExpiry(key, freshData, ttlMs);
        return freshData;
    }

    /**
     * Clean up expired items
     */
    async cleanupExpired() {
        const keys = await this.keys();
        let cleanedCount = 0;
        
        for (const key of keys) {
            const item = await this.get(key);
            if (item && item.expiry && new Date().getTime() > item.expiry) {
                await this.remove(key);
                cleanedCount++;
            }
        }
        
        return cleanedCount;
    }

    /**
     * Batch operations
     */
    async setBatch(items) {
        const promises = items.map(({ key, value }) => this.set(key, value));
        return Promise.all(promises);
    }

    async getBatch(keys) {
        const promises = keys.map(key => this.get(key));
        const values = await Promise.all(promises);
        
        const result = {};
        keys.forEach((key, index) => {
            result[key] = values[index];
        });
        
        return result;
    }

    /**
     * Search functionality
     */
    async search(query, options = {}) {
        const keys = await this.keys();
        const results = [];
        
        for (const key of keys) {
            const value = await this.get(key);
            
            if (this.matchesQuery(key, value, query, options)) {
                results.push({ key, value });
            }
        }
        
        return results;
    }

    /**
     * Check if item matches search query
     */
    matchesQuery(key, value, query, options) {
        const searchText = query.toLowerCase();
        
        // Search in key
        if (key.toLowerCase().includes(searchText)) {
            return true;
        }
        
        // Search in value (if it's a string or has searchable properties)
        if (typeof value === 'string') {
            return value.toLowerCase().includes(searchText);
        }
        
        if (typeof value === 'object' && value !== null) {
            const searchableFields = options.fields || ['title', 'description', 'content', 'name'];
            
            for (const field of searchableFields) {
                if (value[field] && typeof value[field] === 'string') {
                    if (value[field].toLowerCase().includes(searchText)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * Get statistics about storage usage
     */
    async getStats() {
        const keys = await this.keys();
        const info = await this.getStorageInfo();
        
        const stats = {
            totalItems: keys.length,
            storageType: info.type,
            ...info
        };
        
        // Count items by type
        const typeCount = {};
        for (const key of keys) {
            const prefix = key.split('_')[0] || 'other';
            typeCount[prefix] = (typeCount[prefix] || 0) + 1;
        }
        
        stats.itemsByType = typeCount;
        
        return stats;
    }

    /**
     * Migrate data from old version
     */
    async migrate(fromVersion, toVersion) {
        console.log(`Migrating storage from v${fromVersion} to v${toVersion}`);
        
        // Add migration logic here for different versions
        switch (fromVersion) {
            case '1.0':
                // Example migration
                break;
            default:
                console.log('No migration needed');
        }
    }

    /**
     * Sync data across tabs (using BroadcastChannel)
     */
    setupSync() {
        if ('BroadcastChannel' in window) {
            this.syncChannel = new BroadcastChannel('webdevpro_sync');
            
            this.syncChannel.addEventListener('message', (event) => {
                const { type, key, value } = event.data;
                
                switch (type) {
                    case 'SET':
                        // Update local cache or trigger refresh
                        window.dispatchEvent(new CustomEvent('storage-updated', {
                            detail: { key, value }
                        }));
                        break;
                    case 'DELETE':
                        window.dispatchEvent(new CustomEvent('storage-deleted', {
                            detail: { key }
                        }));
                        break;
                }
            });
        }
    }

    /**
     * Broadcast storage changes to other tabs
     */
    broadcast(type, key, value = null) {
        if (this.syncChannel) {
            this.syncChannel.postMessage({ type, key, value });
        }
    }

    /**
     * Override set method to include broadcasting
     */
    async setWithSync(key, value) {
        await this.set(key, value);
        this.broadcast('SET', key, value);
    }

    /**
     * Override remove method to include broadcasting
     */
    async removeWithSync(key) {
        await this.remove(key);
        this.broadcast('DELETE', key);
    }
}

// Create global storage instance
const Storage = new StorageManager();

// Make it globally available
window.Storage = Storage;

// Setup sync on load
document.addEventListener('DOMContentLoaded', () => {
    Storage.setupSync();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}