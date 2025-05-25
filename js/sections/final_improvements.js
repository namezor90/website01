// ================================
// VÉGSŐ FEJLESZTÉSEK
// További szükséges komponensek és javítások
// ================================

// 1. CONTENT LOADER KIEGÉSZÍTÉS - További szekciók
// js/sections/content-loader.js folytatása

/**
 * Create JavaScript Section
 */
createJavaScriptSection() {
    return `
        <section id="javascript" class="content-section">
            <div class="section-header">
                <h1>⚡ JavaScript Alapok</h1>
                <p>A JavaScript a weboldalak interaktivitásáért és dinamikus viselkedéséért felelős programozási nyelv.</p>
            </div>
            
            <div class="concept-grid">
                <div class="concept-card" id="js-variables">
                    <h3 class="concept-title">
                        <span class="concept-icon">📦</span>
                        Változók és Adattípusok
                    </h3>
                    <p class="concept-description">JavaScript változók deklarálása és használata</p>
                    
                    <div class="code-example">
                        <div class="code-header">
                            <span>JavaScript Változók</span>
                            <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                        </div>
                        <div class="code-content">
                            <pre><code><span class="comment">// Változó deklarálás</span>
<span class="js-keyword">let</span> <span class="js-variable">name</span> = <span class="js-string">'Kiss János'</span>;
<span class="js-keyword">const</span> <span class="js-variable">age</span> = <span class="js-number">25</span>;
<span class="js-keyword">var</span> <span class="js-variable">city</span> = <span class="js-string">'Budapest'</span>; <span class="comment">// kerülendő</span>

<span class="comment">// Adattípusok</span>
<span class="js-keyword">let</span> <span class="js-variable">text</span> = <span class="js-string">'Hello World'</span>; <span class="comment">// string</span>
<span class="js-keyword">let</span> <span class="js-variable">number</span> = <span class="js-number">42</span>; <span class="comment">// number</span>
<span class="js-keyword">let</span> <span class="js-variable">isActive</span> = <span class="js-boolean">true</span>; <span class="comment">// boolean</span>
<span class="js-keyword">let</span> <span class="js-variable">items</span> = [<span class="js-string">'alma'</span>, <span class="js-string">'körte'</span>, <span class="js-string">'barack'</span>]; <span class="comment">// array</span>
<span class="js-keyword">let</span> <span class="js-variable">person</span> = { <span class="js-property">name</span>: <span class="js-string">'Anna'</span>, <span class="js-property">age</span>: <span class="js-number">30</span> }; <span class="comment">// object</span>

<span class="comment">// Típus ellenőrzés</span>
<span class="js-function">console.log</span>(<span class="js-keyword">typeof</span> text); <span class="comment">// "string"</span>
<span class="js-function">console.log</span>(<span class="js-keyword">typeof</span> number); <span class="comment">// "number"</span></code></pre>
                        </div>
                    </div>
                    
                    <div class="demo-container">
                        <h4>Interaktív típus ellenőrző:</h4>
                        <div class="demo-controls">
                            <input type="text" id="typeCheckInput" placeholder="Írj be valamit..." style="margin-right: 10px;">
                            <button class="demo-btn" onclick="checkInputType()">Típus ellenőrzése</button>
                        </div>
                        <div id="typeResult" class="demo-output" style="display: none;"></div>
                    </div>
                </div>

                <div class="concept-card" id="js-functions">
                    <h3 class="concept-title">
                        <span class="concept-icon">⚙️</span>
                        Függvények
                    </h3>
                    <p class="concept-description">JavaScript függvények létrehozása és használata</p>
                    
                    <div class="code-example">
                        <div class="code-header">
                            <span>JavaScript Függvények</span>
                            <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                        </div>
                        <div class="code-content">
                            <pre><code><span class="comment">// Hagyományos függvény</span>
<span class="js-keyword">function</span> <span class="js-function">greeting</span>(<span class="js-variable">name</span>) {
    <span class="js-keyword">return</span> <span class="js-string">'Helló, '</span> + <span class="js-variable">name</span> + <span class="js-string">'!'</span>;
}

<span class="comment">// Arrow function (ES6+)</span>
<span class="js-keyword">const</span> <span class="js-function">add</span> = (<span class="js-variable">a</span>, <span class="js-variable">b</span>) => <span class="js-variable">a</span> + <span class="js-variable">b</span>;

<span class="comment">// Összetettebb arrow function</span>
<span class="js-keyword">const</span> <span class="js-function">calculateArea</span> = (<span class="js-variable">width</span>, <span class="js-variable">height</span>) => {
    <span class="js-keyword">const</span> <span class="js-variable">area</span> = <span class="js-variable">width</span> * <span class="js-variable">height</span>;
    <span class="js-keyword">return</span> <span class="js-variable">area</span>;
};

<span class="comment">// Alapértelmezett paraméterek</span>
<span class="js-keyword">function</span> <span class="js-function">createUser</span>(<span class="js-variable">name</span>, <span class="js-variable">role</span> = <span class="js-string">'user'</span>) {
    <span class="js-keyword">return</span> {
        <span class="js-property">name</span>: <span class="js-variable">name</span>,
        <span class="js-property">role</span>: <span class="js-variable">role</span>,
        <span class="js-property">created</span>: <span class="js-keyword">new</span> <span class="js-function">Date</span>()
    };
}

<span class="comment">// Függvény használata</span>
<span class="js-function">console.log</span>(<span class="js-function">greeting</span>(<span class="js-string">'Anna'</span>)); <span class="comment">// "Helló, Anna!"</span>
<span class="js-function">console.log</span>(<span class="js-function">add</span>(<span class="js-number">5</span>, <span class="js-number">3</span>)); <span class="comment">// 8</span></code></pre>
                        </div>
                    </div>
                </div>

                <div class="concept-card" id="js-dom">
                    <h3 class="concept-title">
                        <span class="concept-icon">🏗️</span>
                        DOM Manipuláció
                    </h3>
                    <p class="concept-description">HTML elemek kezelése JavaScript segítségével</p>
                    
                    <div class="code-example">
                        <div class="code-header">
                            <span>DOM Kezelés</span>
                            <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                        </div>
                        <div class="code-content">
                            <pre><code><span class="comment">// Elemek kiválasztása</span>
<span class="js-keyword">const</span> <span class="js-variable">element</span> = <span class="js-object">document</span>.<span class="js-function">getElementById</span>(<span class="js-string">'myId'</span>);
<span class="js-keyword">const</span> <span class="js-variable">elements</span> = <span class="js-object">document</span>.<span class="js-function">querySelectorAll</span>(<span class="js-string">'.myClass'</span>);
<span class="js-keyword">const</span> <span class="js-variable">firstP</span> = <span class="js-object">document</span>.<span class="js-function">querySelector</span>(<span class="js-string">'p'</span>);

<span class="comment">// Tartalom módosítása</span>
<span class="js-variable">element</span>.<span class="js-property">textContent</span> = <span class="js-string">'Új szöveg'</span>;
<span class="js-variable">element</span>.<span class="js-property">innerHTML</span> = <span class="js-string">'&lt;strong&gt;Félkövér szöveg&lt;/strong&gt;'</span>;

<span class="comment">// Attribútumok kezelése</span>
<span class="js-variable">element</span>.<span class="js-function">setAttribute</span>(<span class="js-string">'class'</span>, <span class="js-string">'active'</span>);
<span class="js-variable">element</span>.<span class="js-property">classList</span>.<span class="js-function">add</span>(<span class="js-string">'highlight'</span>);
<span class="js-variable">element</span>.<span class="js-property">classList</span>.<span class="js-function">remove</span>(<span class="js-string">'hidden'</span>);
<span class="js-variable">element</span>.<span class="js-property">classList</span>.<span class="js-function">toggle</span>(<span class="js-string">'active'</span>);

<span class="comment">// Stílus módosítása</span>
<span class="js-variable">element</span>.<span class="js-property">style</span>.<span class="js-property">color</span> = <span class="js-string">'red'</span>;
<span class="js-variable">element</span>.<span class="js-property">style</span>.<span class="js-property">backgroundColor</span> = <span class="js-string">'yellow'</span>;

<span class="comment">// Eseménykezelés</span>
<span class="js-variable">element</span>.<span class="js-function">addEventListener</span>(<span class="js-string">'click'</span>, <span class="js-keyword">function</span>() {
    <span class="js-function">alert</span>(<span class="js-string">'Elemre kattintottál!'</span>);
});

<span class="comment">// Arrow function eseménykezelővel</span>
<span class="js-variable">element</span>.<span class="js-function">addEventListener</span>(<span class="js-string">'mouseover'</span>, () => {
    <span class="js-variable">element</span>.<span class="js-property">style</span>.<span class="js-property">backgroundColor</span> = <span class="js-string">'lightblue'</span>;
});</code></pre>
                        </div>
                    </div>
                    
                    <div class="demo-container">
                        <h4>DOM Manipuláció Demo:</h4>
                        <div class="demo-output">
                            <p id="demoText">Ez egy demo szöveg</p>
                            <div class="demo-controls">
                                <button class="demo-btn" onclick="changeText()">Szöveg változtatása</button>
                                <button class="demo-btn" onclick="changeColor()">Szín változtatása</button>
                                <button class="demo-btn" onclick="toggleClass()">Osztály váltása</button>
                                <button class="demo-btn" onclick="resetDemo()">Visszaállítás</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="concept-card" id="js-events">
                    <h3 class="concept-title">
                        <span class="concept-icon">⚡</span>
                        Események és Aszinkron JavaScript
                    </h3>
                    <p class="concept-description">Események kezelése és aszinkron programozás</p>
                    
                    <div class="code-example">
                        <div class="code-header">
                            <span>Események és Async/Await</span>
                            <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                        </div>
                        <div class="code-content">
                            <pre><code><span class="comment">// Eseménykezelés</span>
<span class="js-object">document</span>.<span class="js-function">addEventListener</span>(<span class="js-string">'DOMContentLoaded'</span>, () => {
    <span class="js-function">console.log</span>(<span class="js-string">'Oldal betöltődött!'</span>);
});

<span class="comment">// Promise alapú aszinkron művelet</span>
<span class="js-keyword">function</span> <span class="js-function">fetchData</span>() {
    <span class="js-keyword">return</span> <span class="js-keyword">new</span> <span class="js-function">Promise</span>(<span class="js-variable">resolve</span> => {
        <span class="js-function">setTimeout</span>(() => {
            <span class="js-function">resolve</span>(<span class="js-string">'Adatok betöltve!'</span>);
        }, <span class="js-number">2000</span>);
    });
}

<span class="comment">// Async/await használata</span>
<span class="js-keyword">async</span> <span class="js-keyword">function</span> <span class="js-function">loadData</span>() {
    <span class="js-keyword">try</span> {
        <span class="js-function">console.log</span>(<span class="js-string">'Betöltés kezdése...'</span>);
        <span class="js-keyword">const</span> <span class="js-variable">data</span> = <span class="js-keyword">await</span> <span class="js-function">fetchData</span>();
        <span class="js-function">console.log</span>(<span class="js-variable">data</span>);
    } <span class="js-keyword">catch</span> (<span class="js-variable">error</span>) {
        <span class="js-function">console.error</span>(<span class="js-string">'Hiba:'</span>, <span class="js-variable">error</span>);
    }
}

<span class="comment">// Fetch API használata</span>
<span class="js-keyword">async</span> <span class="js-keyword">function</span> <span class="js-function">fetchUserData</span>(<span class="js-variable">userId</span>) {
    <span class="js-keyword">try</span> {
        <span class="js-keyword">const</span> <span class="js-variable">response</span> = <span class="js-keyword">await</span> <span class="js-function">fetch</span>(<span class="js-string">\`/api/users/\${userId}\`</span>);
        <span class="js-keyword">const</span> <span class="js-variable">userData</span> = <span class="js-keyword">await</span> <span class="js-variable">response</span>.<span class="js-function">json</span>();
        <span class="js-keyword">return</span> <span class="js-variable">userData</span>;
    } <span class="js-keyword">catch</span> (<span class="js-variable">error</span>) {
        <span class="js-function">console.error</span>(<span class="js-string">'Felhasználó betöltése sikertelen:'</span>, <span class="js-variable">error</span>);
    }
}</code></pre>
                        </div>
                    </div>
                </div>
            </div>

            <div class="quick-tips">
                <h3 class="tips-title">💡 JavaScript Gyors Tippek</h3>
                <div class="tips-grid">
                    <div class="tip-item">
                        <span class="tip-icon">🔧</span>
                        <div class="tip-content">
                            <strong>Modern JS:</strong> Használj const-ot állandókhoz, let-et változókhoz. Kerüld a var-t!
                        </div>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">⚡</span>
                        <div class="tip-content">
                            <strong>Arrow functions:</strong> Rövidebb szintaxis és lexikális this binding.
                        </div>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🎯</span>
                        <div class="tip-content">
                            <strong>DOM:</strong> Használj querySelector/All-t getElementById helyett a konzisztencia érdekében.
                        </div>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">🔄</span>
                        <div class="tip-content">
                            <strong>Async/Await:</strong> Olvassa könnyebben, mint a Promise.then() láncolás.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// 2. HIÁNYZÓ GLOBAL FÜGGVÉNYEK IMPLEMENTÁLÁSA

// JavaScript demo functions
window.checkInputType = function() {
    const input = document.getElementById('typeCheckInput');
    const result = document.getElementById('typeResult');
    
    if (input && result) {
        const value = input.value;
        let actualValue = value;
        
        // Try to parse as number
        if (!isNaN(value) && value.trim() !== '') {
            actualValue = Number(value);
        }
        // Try to parse as boolean
        else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            actualValue = value.toLowerCase() === 'true';
        }
        // Check for null/undefined
        else if (value.toLowerCase() === 'null') {
            actualValue = null;
        }
        else if (value.toLowerCase() === 'undefined') {
            actualValue = undefined;
        }
        
        const type = typeof actualValue;
        result.innerHTML = `
            <div style="padding: 15px; background: var(--bg-secondary); border-radius: 8px; margin-top: 10px;">
                <strong>Érték:</strong> ${value}<br>
                <strong>Típus:</strong> <span style="color: var(--accent-primary);">${type}</span><br>
                <strong>Konvertált érték:</strong> ${JSON.stringify(actualValue)}
            </div>
        `;
        result.style.display = 'block';
    }
};

// DOM manipulation demo functions
window.changeText = function() {
    const element = document.getElementById('demoText');
    if (element) {
        const texts = [
            'Ez egy megváltoztatott szöveg!',
            'JavaScript DOM manipuláció',
            'Dinamikus tartalom',
            'Ez egy demo szöveg'
        ];
        const currentText = element.textContent;
        const currentIndex = texts.indexOf(currentText);
        const nextIndex = (currentIndex + 1) % texts.length;
        element.textContent = texts[nextIndex];
    }
};

window.changeColor = function() {
    const element = document.getElementById('demoText');
    if (element) {
        const colors = ['red', 'blue', 'green', 'purple', 'orange', 'var(--text-primary)'];
        const currentColor = element.style.color || 'var(--text-primary)';
        const currentIndex = colors.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        element.style.color = colors[nextIndex];
    }
};

window.toggleClass = function() {
    const element = document.getElementById('demoText');
    if (element) {
        element.classList.toggle('demo-highlight');
        // Add CSS if not exists
        if (!document.getElementById('demo-highlight-style')) {
            const style = document.createElement('style');
            style.id = 'demo-highlight-style';
            style.textContent = `
                .demo-highlight {
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
                    color: white !important;
                    padding: 10px !important;
                    border-radius: 8px !important;
                    transform: scale(1.05) !important;
                    transition: all 0.3s ease !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
};

window.resetDemo = function() {
    const element = document.getElementById('demoText');
    if (element) {
        element.textContent = 'Ez egy demo szöveg';
        element.style.color = '';
        element.classList.remove('demo-highlight');
    }
};

// 3. OFFLINE FUNCTIONALITY ENHANCEMENT

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        this.syncInProgress = false;
    }

    init() {
        this.setupEventListeners();
        this.loadOfflineQueue();
        console.log('📱 Offline manager initialized');
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.handleOffline();
        });

        // Intercept failed network requests
        this.interceptFailedRequests();
    }

    handleOnline() {
        console.log('📡 Connection restored');
        document.body.classList.remove('offline-mode');
        
        if (window.App) {
            window.App.showNotification('success', 'Kapcsolat helyreállt', 'Szinkronizálás folyamatban...');
        }
        
        this.syncOfflineData();
    }

    handleOffline() {
        console.log('📵 Connection lost');
        document.body.classList.add('offline-mode');
        
        if (window.App) {
            window.App.showNotification('warning', 'Offline mód', 'Nincs internetkapcsolat - offline módban dolgozol');
        }
    }

    addToOfflineQueue(action) {
        this.offlineQueue.push({
            ...action,
            timestamp: new Date().toISOString(),
            id: Date.now() + Math.random()
        });
        
        this.saveOfflineQueue();
    }

    async syncOfflineData() {
        if (this.syncInProgress || this.offlineQueue.length === 0) return;
        
        this.syncInProgress = true;
        
        try {
            for (const action of this.offlineQueue) {
                await this.executeOfflineAction(action);
            }
            
            this.offlineQueue = [];
            this.saveOfflineQueue();
            
            if (window.App) {
                window.App.showNotification('success', 'Szinkronizálás kész', 'Offline módosítások szinkronizálva');
            }
            
        } catch (error) {
            console.error('Sync failed:', error);
            if (window.App) {
                window.App.showNotification('error', 'Szinkronizálási hiba', 'Nem sikerült szinkronizálni az offline módosításokat');
            }
        } finally {
            this.syncInProgress = false;
        }
    }

    async executeOfflineAction(action) {
        switch (action.type) {
            case 'save_note':
                await this.syncNote(action.data);
                break;
            case 'save_bookmark':
                await this.syncBookmark(action.data);
                break;
            case 'update_progress':
                await this.syncProgress(action.data);
                break;
            default:
                console.log('Unknown offline action:', action.type);
        }
    }

    async syncNote(noteData) {
        const notesManager = window.App?.getModule('notes');
        if (notesManager) {
            await notesManager.saveNotes();
        }
    }

    async syncBookmark(bookmarkData) {
        const bookmarksManager = window.App?.getModule('bookmarks');
        if (bookmarksManager) {
            await bookmarksManager.saveBookmarks();
        }
    }

    async syncProgress(progressData) {
        const progressManager = window.App?.getModule('progress');
        if (progressManager) {
            await progressManager.saveProgress();
        }
    }

    interceptFailedRequests() {
        // Override fetch to handle offline scenarios
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            try {
                return await originalFetch.apply(this, args);
            } catch (error) {
                if (!navigator.onLine) {
                    console.log('Request failed offline, queuing for later sync');
                    // Queue request for later
                    return Promise.reject(new Error('Offline - request queued'));
                }
                throw error;
            }
        };
    }

    saveOfflineQueue() {
        try {
            localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
        } catch (error) {
            console.error('Failed to save offline queue:', error);
        }
    }

    loadOfflineQueue() {
        try {
            const stored = localStorage.getItem('offlineQueue');
            if (stored) {
                this.offlineQueue = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load offline queue:', error);
            this.offlineQueue = [];
        }
    }

    getOfflineStats() {
        return {
            isOnline: this.isOnline,
            queuedActions: this.offlineQueue.length,
            lastSync: localStorage.getItem('lastSyncTime'),
            syncInProgress: this.syncInProgress
        };
    }
}

// Initialize Offline Manager
const offlineManager = new OfflineManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => offlineManager.init());
} else {
    offlineManager.init();
}

// Make globally available
window.OfflineManager = offlineManager;

// 4. ANALYTICS ÉS TELEMETRIA

class Analytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
    }

    init() {
        this.setupEventListeners();
        this.startSession();
        console.log('📊 Analytics initialized');
    }

    setupEventListeners() {
        // Track page views
        document.addEventListener('sectionchange', (e) => {
            this.track('page_view', {
                section: e.detail.section,
                previousSection: e.detail.previousSection
            });
        });

        // Track user interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .nav-btn, .action-btn, .demo-btn')) {
                this.track('interaction', {
                    type: 'click',
                    element: e.target.className,
                    text: e.target.textContent?.substring(0, 50)
                });
            }
        });

        // Track errors
        window.addEventListener('error', (e) => {
            this.track('error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Track session end
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.track('page_blur');
            } else {
                this.track('page_focus');
            }
        });
    }

    track(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                sessionId: this.session