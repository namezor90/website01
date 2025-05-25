/**
 * ================================
 * CONTENT LOADER
 * Dynamic section content loading with caching
 * ================================
 */

class ContentLoader {
    constructor(app) {
        this.app = app;
        this.loadedSections = new Set();
        this.sectionCache = new Map();
        this.loadingStates = new Map();
        this.contentTemplates = new Map();
        this.interactiveComponents = new Map();
    }

    /**
     * Initialize content loader
     */
    async init() {
        this.initializeContentTemplates();
        this.setupDynamicContent();
        console.log('📄 Content loader initialized');
    }

    /**
     * Load section content
     */
    async loadSection(sectionId) {
        if (this.loadedSections.has(sectionId)) {
            return; // Already loaded
        }

        if (this.loadingStates.has(sectionId)) {
            return this.loadingStates.get(sectionId); // Already loading
        }

        // Create loading promise
        const loadingPromise = this.loadSectionContent(sectionId);
        this.loadingStates.set(sectionId, loadingPromise);

        try {
            await loadingPromise;
            this.loadedSections.add(sectionId);
        } finally {
            this.loadingStates.delete(sectionId);
        }
    }

    /**
     * Load section content implementation
     */
    async loadSectionContent(sectionId) {
        // Check cache first
        if (this.sectionCache.has(sectionId)) {
            this.renderCachedContent(sectionId);
            return;
        }

        // Show loading state
        this.showLoadingState(sectionId);

        try {
            // Generate content based on section
            const content = await this.generateSectionContent(sectionId);
            
            // Cache content
            this.sectionCache.set(sectionId, content);
            
            // Render content
            this.renderSectionContent(sectionId, content);
            
            // Initialize interactive components
            this.initializeInteractiveComponents(sectionId);
            
        } catch (error) {
            console.error(`Failed to load section ${sectionId}:`, error);
            this.showErrorState(sectionId, error);
        }
    }

    /**
     * Generate section content
     */
    async generateSectionContent(sectionId) {
        const generator = this.contentTemplates.get(sectionId);
        if (generator) {
            return await generator();
        }
        
        // Fallback to default content
        return this.createDefaultSectionContent(sectionId);
    }

    /**
     * Initialize content templates
     */
    initializeContentTemplates() {
        // HTML Section
        this.contentTemplates.set('html', () => this.createHTMLSection());
        
        // CSS Section
        this.contentTemplates.set('css', () => this.createCSSSection());
        
        // JavaScript Section
        this.contentTemplates.set('javascript', () => this.createJavaScriptSection());
        
        // Layout Section
        this.contentTemplates.set('layout', () => this.createLayoutSection());
        
        // Responsive Section
        this.contentTemplates.set('responsive', () => this.createResponsiveSection());
        
        // Tools Section
        this.contentTemplates.set('tools', () => this.createToolsSection());
        
        // Debugging Section
        this.contentTemplates.set('debugging', () => this.createDebuggingSection());
        
        // Errors Section
        this.contentTemplates.set('errors', () => this.createErrorsSection());
        
        // Snippets Section
        this.contentTemplates.set('snippets', () => this.createSnippetsSection());
        
        // Performance Section
        this.contentTemplates.set('performance', () => this.createPerformanceSection());
        
        // Accessibility Section
        this.contentTemplates.set('accessibility', () => this.createAccessibilitySection());
        
        // Modern CSS Section
        this.contentTemplates.set('modern', () => this.createModernCSSSection());
        
        // Animations Section
        this.contentTemplates.set('animations', () => this.createAnimationsSection());
        
        // Playground Section
        this.contentTemplates.set('playground', () => this.createPlaygroundSection());
        
        // Quiz Section
        this.contentTemplates.set('quiz', () => this.createQuizSection());
    }

    /**
     * Create HTML Section
     */
    createHTMLSection() {
        return `
            <section id="html" class="content-section">
                <div class="section-header">
                    <h1>📄 HTML Alapok</h1>
                    <p>A HTML (HyperText Markup Language) a weboldalak szerkezeti alapja.</p>
                </div>
                
                <div class="concept-grid">
                    <div class="concept-card" id="html-structure">
                        <h3 class="concept-title">
                            <span class="concept-icon">🏗️</span>
                            HTML Dokumentum Struktúra
                        </h3>
                        <p class="concept-description">Minden HTML dokumentum alapvető felépítése</p>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span>HTML</span>
                                <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                            </div>
                            <div class="code-content">
                                <pre><code><span class="html-tag">&lt;!DOCTYPE html&gt;</span>
<span class="html-tag">&lt;html</span> lang="hu"<span class="html-tag">&gt;</span>
<span class="html-tag">&lt;head&gt;</span>
    <span class="html-tag">&lt;meta</span> charset="UTF-8"<span class="html-tag">&gt;</span>
    <span class="html-tag">&lt;meta</span> name="viewport" content="width=device-width, initial-scale=1.0"<span class="html-tag">&gt;</span>
    <span class="html-tag">&lt;title&gt;</span>Oldal címe<span class="html-tag">&lt;/title&gt;</span>
<span class="html-tag">&lt;/head&gt;</span>
<span class="html-tag">&lt;body&gt;</span>
    <span class="html-tag">&lt;header&gt;</span>
        <span class="html-tag">&lt;h1&gt;</span>Főcím<span class="html-tag">&lt;/h1&gt;</span>
        <span class="html-tag">&lt;nav&gt;</span>Navigáció<span class="html-tag">&lt;/nav&gt;</span>
    <span class="html-tag">&lt;/header&gt;</span>
    
    <span class="html-tag">&lt;main&gt;</span>
        <span class="html-tag">&lt;section&gt;</span>
            <span class="html-tag">&lt;h2&gt;</span>Szekció címe<span class="html-tag">&lt;/h2&gt;</span>
            <span class="html-tag">&lt;p&gt;</span>Bekezdés szövege<span class="html-tag">&lt;/p&gt;</span>
        <span class="html-tag">&lt;/section&gt;</span>
    <span class="html-tag">&lt;/main&gt;</span>
    
    <span class="html-tag">&lt;footer&gt;</span>
        <span class="html-tag">&lt;p&gt;</span>&copy; 2024 Weboldal<span class="html-tag">&lt;/p&gt;</span>
    <span class="html-tag">&lt;/footer&gt;</span>
<span class="html-tag">&lt;/body&gt;</span>
<span class="html-tag">&lt;/html&gt;</span></code></pre>
                            </div>
                        </div>
                        
                        <div class="demo-container">
                            <h4>Interaktív demo:</h4>
                            <div class="demo-controls">
                                <button class="demo-btn" onclick="toggleDemo('html-structure-demo')">Demo megjelenítése</button>
                            </div>
                            <div id="html-structure-demo" class="demo-output" style="display: none;">
                                <div style="border: 2px solid var(--accent-primary); padding: 10px; border-radius: 8px;">
                                    <header style="background: var(--bg-tertiary); padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                                        <h3 style="margin: 0;">Weboldal Főcíme</h3>
                                        <nav style="margin-top: 5px; font-size: 0.9em;">Home | About | Contact</nav>
                                    </header>
                                    <main style="background: var(--bg-secondary); padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                                        <section>
                                            <h4 style="margin-top: 0;">Főtartalom</h4>
                                            <p>Ez a fő tartalmi rész, ahol a weboldal információi találhatók.</p>
                                        </section>
                                    </main>
                                    <footer style="background: var(--bg-tertiary); padding: 10px; border-radius: 4px; text-align: center; font-size: 0.8em;">
                                        © 2024 Példa Weboldal
                                    </footer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="concept-card" id="html-elements">
                        <h3 class="concept-title">
                            <span class="concept-icon">🏷️</span>
                            Gyakori HTML Elemek
                        </h3>
                        <p class="concept-description">A leggyakrabban használt HTML elemek és tulajdonságaik</p>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span>HTML Elemek</span>
                                <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                            </div>
                            <div class="code-content">
                                <pre><code><span class="comment">&lt;!-- Címek hierarchiája --&gt;</span>
<span class="html-tag">&lt;h1&gt;</span>Főcím (legfontosabb)<span class="html-tag">&lt;/h1&gt;</span>
<span class="html-tag">&lt;h2&gt;</span>Alcím<span class="html-tag">&lt;/h2&gt;</span>
<span class="html-tag">&lt;h3&gt;</span>További alcím<span class="html-tag">&lt;/h3&gt;</span>

<span class="comment">&lt;!-- Szöveg formázás --&gt;</span>
<span class="html-tag">&lt;p&gt;</span>Normál bekezdés szövege<span class="html-tag">&lt;/p&gt;</span>
<span class="html-tag">&lt;strong&gt;</span>Fontos szöveg (félkövér)<span class="html-tag">&lt;/strong&gt;</span>
<span class="html-tag">&lt;em&gt;</span>Hangsúlyozott szöveg (dőlt)<span class="html-tag">&lt;/em&gt;</span>
<span class="html-tag">&lt;mark&gt;</span>Kiemelt szöveg<span class="html-tag">&lt;/mark&gt;</span>

<span class="comment">&lt;!-- Linkek és hivatkozások --&gt;</span>
<span class="html-tag">&lt;a</span> href="https://example.com"<span class="html-tag">&gt;</span>Külső link<span class="html-tag">&lt;/a&gt;</span>
<span class="html-tag">&lt;a</span> href="#section1"<span class="html-tag">&gt;</span>Belső hivatkozás<span class="html-tag">&lt;/a&gt;</span>

<span class="comment">&lt;!-- Képek --&gt;</span>
<span class="html-tag">&lt;img</span> src="kep.jpg" alt="Kép leírása" width="300"<span class="html-tag">&gt;</span>
<span class="html-tag">&lt;figure&gt;</span>
    <span class="html-tag">&lt;img</span> src="kep.jpg" alt="Részletes leírás"<span class="html-tag">&gt;</span>
    <span class="html-tag">&lt;figcaption&gt;</span>Kép felirata<span class="html-tag">&lt;/figcaption&gt;</span>
<span class="html-tag">&lt;/figure&gt;</span></code></pre>
                            </div>
                        </div>
                    </div>

                    <div class="concept-card" id="html-lists">
                        <h3 class="concept-title">
                            <span class="concept-icon">📋</span>
                            Listák és Táblázatok
                        </h3>
                        <p class="concept-description">Strukturált tartalom megjelenítése listákkal és táblázatokkal</p>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span>Listák és Táblázatok</span>
                                <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                            </div>
                            <div class="code-content">
                                <pre><code><span class="comment">&lt;!-- Rendezetlen lista --&gt;</span>
<span class="html-tag">&lt;ul&gt;</span>
    <span class="html-tag">&lt;li&gt;</span>Első elem<span class="html-tag">&lt;/li&gt;</span>
    <span class="html-tag">&lt;li&gt;</span>Második elem<span class="html-tag">&lt;/li&gt;</span>
    <span class="html-tag">&lt;li&gt;</span>Harmadik elem<span class="html-tag">&lt;/li&gt;</span>
<span class="html-tag">&lt;/ul&gt;</span>

<span class="comment">&lt;!-- Rendezett lista --&gt;</span>
<span class="html-tag">&lt;ol&gt;</span>
    <span class="html-tag">&lt;li&gt;</span>Első lépés<span class="html-tag">&lt;/li&gt;</span>
    <span class="html-tag">&lt;li&gt;</span>Második lépés<span class="html-tag">&lt;/li&gt;</span>
    <span class="html-tag">&lt;li&gt;</span>Harmadik lépés<span class="html-tag">&lt;/li&gt;</span>
<span class="html-tag">&lt;/ol&gt;</span>

<span class="comment">&lt;!-- Egyszerű táblázat --&gt;</span>
<span class="html-tag">&lt;table&gt;</span>
    <span class="html-tag">&lt;thead&gt;</span>
        <span class="html-tag">&lt;tr&gt;</span>
            <span class="html-tag">&lt;th&gt;</span>Név<span class="html-tag">&lt;/th&gt;</span>
            <span class="html-tag">&lt;th&gt;</span>Kor<span class="html-tag">&lt;/th&gt;</span>
            <span class="html-tag">&lt;th&gt;</span>Város<span class="html-tag">&lt;/th&gt;</span>
        <span class="html-tag">&lt;/tr&gt;</span>
    <span class="html-tag">&lt;/thead&gt;</span>
    <span class="html-tag">&lt;tbody&gt;</span>
        <span class="html-tag">&lt;tr&gt;</span>
            <span class="html-tag">&lt;td&gt;</span>Kiss János<span class="html-tag">&lt;/td&gt;</span>
            <span class="html-tag">&lt;td&gt;</span>25<span class="html-tag">&lt;/td&gt;</span>
            <span class="html-tag">&lt;td&gt;</span>Budapest<span class="html-tag">&lt;/td&gt;</span>
        <span class="html-tag">&lt;/tr&gt;</span>
        <span class="html-tag">&lt;tr&gt;</span>
            <span class="html-tag">&lt;td&gt;</span>Nagy Petra<span class="html-tag">&lt;/td&gt;</span>
            <span class="html-tag">&lt;td&gt;</span>30<span class="html-tag">&lt;/td&gt;</span>
            <span class="html-tag">&lt;td&gt;</span>Debrecen<span class="html-tag">&lt;/td&gt;</span>
        <span class="html-tag">&lt;/tr&gt;</span>
    <span class="html-tag">&lt;/tbody&gt;</span>
<span class="html-tag">&lt;/table&gt;</span></code></pre>
                            </div>
                        </div>
                        
                        <div class="demo-container">
                            <h4>Élő példa:</h4>
                            <div class="demo-output">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <div>
                                        <h5>Rendezetlen lista:</h5>
                                        <ul>
                                            <li>HTML alapok</li>
                                            <li>CSS stílusok</li>
                                            <li>JavaScript logika</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5>Rendezett lista:</h5>
                                        <ol>
                                            <li>Tervezés</li>
                                            <li>Fejlesztés</li>
                                            <li>Tesztelés</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="concept-card" id="html-forms">
                        <h3 class="concept-title">
                            <span class="concept-icon">📝</span>
                            Űrlapok (Forms)
                        </h3>
                        <p class="concept-description">Interaktív űrlapok létrehozása felhasználói adatok gyűjtéséhez</p>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span>HTML Űrlapok</span>
                                <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                            </div>
                            <div class="code-content">
                                <pre><code><span class="html-tag">&lt;form</span> action="/submit" method="POST"<span class="html-tag">&gt;</span>
    <span class="comment">&lt;!-- Szöveges beviteli mezők --&gt;</span>
    <span class="html-tag">&lt;label</span> for="name"<span class="html-tag">&gt;</span>Név:<span class="html-tag">&lt;/label&gt;</span>
    <span class="html-tag">&lt;input</span> type="text" id="name" name="name" required<span class="html-tag">&gt;</span>
    
    <span class="html-tag">&lt;label</span> for="email"<span class="html-tag">&gt;</span>Email:<span class="html-tag">&lt;/label&gt;</span>
    <span class="html-tag">&lt;input</span> type="email" id="email" name="email" required<span class="html-tag">&gt;</span>
    
    <span class="comment">&lt;!-- Jelölőnégyzetek --&gt;</span>
    <span class="html-tag">&lt;input</span> type="checkbox" id="newsletter" name="newsletter"<span class="html-tag">&gt;</span>
    <span class="html-tag">&lt;label</span> for="newsletter"<span class="html-tag">&gt;</span>Hírlevél feliratkozás<span class="html-tag">&lt;/label&gt;</span>
    
    <span class="comment">&lt;!-- Választógombok --&gt;</span>
    <span class="html-tag">&lt;fieldset&gt;</span>
        <span class="html-tag">&lt;legend&gt;</span>Preferált kapcsolattartás:<span class="html-tag">&lt;/legend&gt;</span>
        <span class="html-tag">&lt;input</span> type="radio" id="email-pref" name="contact" value="email"<span class="html-tag">&gt;</span>
        <span class="html-tag">&lt;label</span> for="email-pref"<span class="html-tag">&gt;</span>Email<span class="html-tag">&lt;/label&gt;</span>
        
        <span class="html-tag">&lt;input</span> type="radio" id="phone-pref" name="contact" value="phone"<span class="html-tag">&gt;</span>
        <span class="html-tag">&lt;label</span> for="phone-pref"<span class="html-tag">&gt;</span>Telefon<span class="html-tag">&lt;/label&gt;</span>
    <span class="html-tag">&lt;/fieldset&gt;</span>
    
    <span class="comment">&lt;!-- Legördülő menü --&gt;</span>
    <span class="html-tag">&lt;label</span> for="country"<span class="html-tag">&gt;</span>Ország:<span class="html-tag">&lt;/label&gt;</span>
    <span class="html-tag">&lt;select</span> id="country" name="country"<span class="html-tag">&gt;</span>
        <span class="html-tag">&lt;option</span> value=""<span class="html-tag">&gt;</span>Válassz országot<span class="html-tag">&lt;/option&gt;</span>
        <span class="html-tag">&lt;option</span> value="hu"<span class="html-tag">&gt;</span>Magyarország<span class="html-tag">&lt;/option&gt;</span>
        <span class="html-tag">&lt;option</span> value="de"<span class="html-tag">&gt;</span>Németország<span class="html-tag">&lt;/option&gt;</span>
        <span class="html-tag">&lt;option</span> value="fr"<span class="html-tag">&gt;</span>Franciaország<span class="html-tag">&lt;/option&gt;</span>
    <span class="html-tag">&lt;/select&gt;</span>
    
    <span class="comment">&lt;!-- Többsoros szöveg --&gt;</span>
    <span class="html-tag">&lt;label</span> for="message"<span class="html-tag">&gt;</span>Üzenet:<span class="html-tag">&lt;/label&gt;</span>
    <span class="html-tag">&lt;textarea</span> id="message" name="message" rows="4" cols="50"<span class="html-tag">&gt;&lt;/textarea&gt;</span>
    
    <span class="comment">&lt;!-- Gombok --&gt;</span>
    <span class="html-tag">&lt;button</span> type="submit"<span class="html-tag">&gt;</span>Küldés<span class="html-tag">&lt;/button&gt;</span>
    <span class="html-tag">&lt;button</span> type="reset"<span class="html-tag">&gt;</span>Törlés<span class="html-tag">&lt;/button&gt;</span>
<span class="html-tag">&lt;/form&gt;</span></code></pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="quick-tips">
                    <h3 class="tips-title">💡 HTML Gyors Tippek</h3>
                    <div class="tips-grid">
                        <div class="tip-item">
                            <span class="tip-icon">🎯</span>
                            <div class="tip-content">
                                <strong>Szemantika:</strong> Használj szemantikus HTML elemeket (header, nav, main, footer) a jobb SEO és hozzáférhetőség érdekében.
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">♿</span>
                            <div class="tip-content">
                                <strong>Hozzáférhetőség:</strong> Minden képhez adj alt attribútumot, minden form mezőhöz label-t.
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">📱</span>
                            <div class="tip-content">
                                <strong>Responsivitás:</strong> Ne felejtsd el a viewport meta taget: &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">⚡</span>
                            <div class="tip-content">
                                <strong>Teljesítmény:</strong> Használj megfelelő kép formátumokat (WebP) és add meg a width/height attribútumokat.
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Create CSS Section
     */
    createCSSSection() {
        return `
            <section id="css" class="content-section">
                <div class="section-header">
                    <h1>🎨 CSS Stílusok</h1>
                    <p>A CSS (Cascading Style Sheets) segítségével stílusozhatjuk HTML elemeinket.</p>
                </div>
                
                <div class="concept-grid">
                    <div class="concept-card" id="css-selectors">
                        <h3 class="concept-title">
                            <span class="concept-icon">🎯</span>
                            CSS Szelektorok
                        </h3>
                        <p class="concept-description">Hogyan válasszuk ki a HTML elemeket stílusozáshoz</p>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span>CSS Szelektorok</span>
                                <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                            </div>
                            <div class="code-content">
                                <pre><code><span class="comment">/* Elem szelektor */</span>
<span class="css-property">h1</span> {
    <span class="css-property">color</span>: <span class="css-value">blue</span>;
    <span class="css-property">font-size</span>: <span class="css-value">2em</span>;
}

<span class="comment">/* Osztály szelektor */</span>
<span class="css-property">.highlight</span> {
    <span class="css-property">background-color</span>: <span class="css-value">yellow</span>;
    <span class="css-property">padding</span>: <span class="css-value">10px</span>;
}

<span class="comment">/* ID szelektor */</span>
<span class="css-property">#header</span> {
    <span class="css-property">background</span>: <span class="css-value">linear-gradient(45deg, #ff6b6b, #4ecdc4)</span>;
    <span class="css-property">height</span>: <span class="css-value">100px</span>;
}

<span class="comment">/* Kombinált szelektorok */</span>
<span class="css-property">div.container</span> {
    <span class="css-property">max-width</span>: <span class="css-value">1200px</span>;
    <span class="css-property">margin</span>: <span class="css-value">0 auto</span>;
}

<span class="comment">/* Gyermek szelektor */</span>
<span class="css-property">nav > ul</span> {
    <span class="css-property">list-style</span>: <span class="css-value">none</span>;
    <span class="css-property">display</span>: <span class="css-value">flex</span>;
}

<span class="comment">/* Pszeudo-osztályok */</span>
<span class="css-property">a:hover</span> {
    <span class="css-property">color</span>: <span class="css-value">#ff6b6b</span>;
    <span class="css-property">text-decoration</span>: <span class="css-value">underline</span>;
}</code></pre>
                            </div>
                        </div>
                    </div>

                    <div class="concept-card" id="css-box-model">
                        <h3 class="concept-title">
                            <span class="concept-icon">📦</span>
                            CSS Box Model
                        </h3>
                        <p class="concept-description">Hogyan működik az elem doboz modell: margin, border, padding, content</p>
                        
                        <div class="demo-container">
                            <h4>Interaktív Box Model:</h4>
                            <div class="demo-controls">
                                <button class="demo-btn" onclick="adjustBoxModel('margin', 5)">Margin +</button>
                                <button class="demo-btn" onclick="adjustBoxModel('margin', -5)">Margin -</button>
                                <button class="demo-btn" onclick="adjustBoxModel('padding', 5)">Padding +</button>
                                <button class="demo-btn" onclick="adjustBoxModel('padding', -5)">Padding -</button>
                                <button class="demo-btn" onclick="resetBoxModel()">Reset</button>
                            </div>
                            <div class="demo-output">
                                <div id="box-model-demo" style="
                                    margin: 20px;
                                    border: 5px solid var(--accent-primary);
                                    padding: 20px;
                                    background: var(--bg-tertiary);
                                    text-align: center;
                                    position: relative;
                                    max-width: 300px;
                                ">
                                    <div style="background: var(--accent-primary); color: white; padding: 10px; border-radius: 4px;">
                                        CONTENT
                                    </div>
                                    <div class="box-model-labels" style="
                                        position: absolute;
                                        top: -30px;
                                        left: 0;
                                        right: 0;
                                        font-size: 12px;
                                        color: var(--text-muted);
                                    ">MARGIN</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span>Box Model CSS</span>
                                <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                            </div>
                            <div class="code-content">
                                <pre><code><span class="css-property">.box</span> {
    <span class="comment">/* Tartalom mérete */</span>
    <span class="css-property">width</span>: <span class="css-value">200px</span>;
    <span class="css-property">height</span>: <span class="css-value">100px</span>;
    
    <span class="comment">/* Belső távolság (padding) */</span>
    <span class="css-property">padding</span>: <span class="css-value">20px</span>;
    <span class="css-property">padding-top</span>: <span class="css-value">10px</span>;
    <span class="css-property">padding-right</span>: <span class="css-value">15px</span>;
    
    <span class="comment">/* Keret (border) */</span>
    <span class="css-property">border</span>: <span class="css-value">2px solid #333</span>;
    <span class="css-property">border-radius</span>: <span class="css-value">8px</span>;
    
    <span class="comment">/* Külső távolság (margin) */</span>
    <span class="css-property">margin</span>: <span class="css-value">15px</span>;
    <span class="css-property">margin-bottom</span>: <span class="css-value">25px</span>;
}

<span class="comment">/* Box-sizing tulajdonság */</span>
<span class="css-property">.border-box</span> {
    <span class="css-property">box-sizing</span>: <span class="css-value">border-box</span>; <span class="comment">/* padding és border beleszámít a width-be */</span>
}

<span class="css-property">.content-box</span> {
    <span class="css-property">box-sizing</span>: <span class="css-value">content-box</span>; <span class="comment">/* alapértelmezett */</span>
}</code></pre>
                            </div>
                        </div>
                    </div>

                    <div class="concept-card" id="css-flexbox">
                        <h3 class="concept-title">
                            <span class="concept-icon">📐</span>
                            Flexbox Layout
                        </h3>
                        <p class="concept-description">Modern, egydimenziós layout rendszer</p>
                        
                        <div class="demo-container">
                            <h4>Flexbox Playground:</h4>
                            <div class="demo-controls">
                                <select onchange="changeFlexProperty('justify-content', this.value)">
                                    <option value="flex-start">justify-content: flex-start</option>
                                    <option value="center">justify-content: center</option>
                                    <option value="flex-end">justify-content: flex-end</option>
                                    <option value="space-between">justify-content: space-between</option>
                                    <option value="space-around">justify-content: space-around</option>
                                    <option value="space-evenly">justify-content: space-evenly</option>
                                </select>
                                <select onchange="changeFlexProperty('align-items', this.value)">
                                    <option value="stretch">align-items: stretch</option>
                                    <option value="flex-start">align-items: flex-start</option>
                                    <option value="center" selected>align-items: center</option>
                                    <option value="flex-end">align-items: flex-end</option>
                                </select>
                            </div>
                            <div class="demo-output">
                                <div id="flexbox-demo" style="
                                    display: flex;
                                    justify-content: flex-start;
                                    align-items: center;
                                    gap: 10px;
                                    padding: 20px;
                                    background: var(--bg-tertiary);
                                    border-radius: 8px;
                                    min-height: 120px;
                                ">
                                    <div style="background: var(--accent-primary); color: white; padding: 15px; border-radius: 4px;">Item 1</div>
                                    <div style="background: var(--success); color: white; padding: 20px; border-radius: 4px;">Item 2</div>
                                    <div style="background: var(--warning); color: white; padding: 10px; border-radius: 4px;">Item 3</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span>Flexbox CSS</span>
                                <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                            </div>
                            <div class="code-content">
                                <pre><code><span class="comment">/* Flex container */</span>
<span class="css-property">.flex-container</span> {
    <span class="css-property">display</span>: <span class="css-value">flex</span>;
    <span class="css-property">justify-content</span>: <span class="css-value">center</span>; <span class="comment">/* vízszintes igazítás */</span>
    <span class="css-property">align-items</span>: <span class="css-value">center</span>; <span class="comment">/* függőleges igazítás */</span>
    <span class="css-property">gap</span>: <span class="css-value">20px</span>; <span class="comment">/* elemek közötti távolság */</span>
    <span class="css-property">flex-wrap</span>: <span class="css-value">wrap</span>; <span class="comment">/* tördelés engedélyezése */</span>
    <span class="css-property">flex-direction</span>: <span class="css-value">row</span>; <span class="comment">/* irány: row | column */</span>
}

<span class="comment">/* Flex items */</span>
<span class="css-property">.flex-item</span> {
    <span class="css-property">flex</span>: <span class="css-value">1</span>; <span class="comment">/* rugalmas méret */</span>
    <span class="css-property">flex-grow</span>: <span class="css-value">1</span>; <span class="comment">/* növekedési arány */</span>
    <span class="css-property">flex-shrink</span>: <span class="css-value">0</span>; <span class="comment">/* zsugorodási arány */</span>
    <span class="css-property">flex-basis</span>: <span class="css-value">200px</span>; <span class="comment">/* alapméret */</span>
}

<span class="comment">/* Különleges flex item */</span>
<span class="css-property">.flex-item-special</span> {
    <span class="css-property">align-self</span>: <span class="css-value">flex-end</span>; <span class="comment">/* egyedi igazítás */</span>
    <span class="css-property">order</span>: <span class="css-value">-1</span>; <span class="comment">/* sorrend módosítása */</span>
}</code></pre>
                            </div>
                        </div>
                    </div>

                    <div class="concept-card" id="css-grid">
                        <h3 class="concept-title">
                            <span class="concept-icon">⚡</span>
                            CSS Grid
                        </h3>
                        <p class="concept-description">Kétdimenziós layout rendszer komplex elrendezésekhez</p>
                        
                        <div class="demo-container">
                            <h4>Grid Layout Demo:</h4>
                            <div class="demo-output">
                                <div style="
                                    display: grid;
                                    grid-template-columns: 1fr 2fr 1fr;
                                    grid-template-rows: auto 1fr auto;
                                    gap: 10px;
                                    height: 300px;
                                    background: var(--bg-tertiary);
                                    padding: 10px;
                                    border-radius: 8px;
                                ">
                                    <div style="grid-column: 1 / -1; background: var(--accent-primary); color: white; padding: 10px; border-radius: 4px; text-align: center;">
                                        Header (1 / -1)
                                    </div>
                                    <div style="background: var(--success); color: white; padding: 10px; border-radius: 4px; text-align: center;">
                                        Sidebar
                                    </div>
                                    <div style="background: var(--bg-secondary); padding: 10px; border-radius: 4px; text-align: center;">
                                        Main Content
                                    </div>
                                    <div style="background: var(--warning); color: white; padding: 10px; border-radius: 4px; text-align: center;">
                                        Aside
                                    </div>
                                    <div style="grid-column: 1 / -1; background: var(--text-muted); color: white; padding: 10px; border-radius: 4px; text-align: center;">
                                        Footer (1 / -1)
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="code-example">
                            <div class="code-header">
                                <span>CSS Grid</span>
                                <button class="copy-btn" onclick="copyCode(this)">📋 Másolás</button>
                            </div>
                            <div class="code-content">
                                <pre><code><span class="comment">/* Grid container */</span>
<span class="css-property">.grid-container</span> {
    <span class="css-property">display</span>: <span class="css-value">grid</span>;
    <span class="css-property">grid-template-columns</span>: <span class="css-value">200px 1fr 150px</span>; <span class="comment">/* oszlopok */</span>
    <span class="css-property">grid-template-rows</span>: <span class="css-value">auto 1fr auto</span>; <span class="comment">/* sorok */</span>
    <span class="css-property">gap</span>: <span class="css-value">20px</span>; <span class="comment">/* rések */</span>
    <span class="css-property">grid-template-areas</span>: 
        <span class="css-value">"header header header"
        "sidebar main aside"
        "footer footer footer"</span>;
}

<span class="comment">/* Grid items pozicionálása */</span>
<span class="css-property">.header</span> { <span class="css-property">grid-area</span>: <span class="css-value">header</span>; }
<span class="css-property">.sidebar</span> { <span class="css-property">grid-area</span>: <span class="css-value">sidebar</span>; }
<span class="css-property">.main</span> { <span class="css-property">grid-area</span>: <span class="css-value">main</span>; }
<span class="css-property">.aside</span> { <span class="css-property">grid-area</span>: <span class="css-value">aside</span>; }
<span class="css-property">.footer</span> { <span class="css-property">grid-area</span>: <span class="css-value">footer</span>; }

<span class="comment">/* Alternatív pozicionálás */</span>
<span class="css-property">.grid-item</span> {
    <span class="css-property">grid-column</span>: <span class="css-value">1 / 3</span>; <span class="comment">/* 1. oszloptól a 3.-ig */</span>
    <span class="css-property">grid-row</span>: <span class="css-value">2 / 4</span>; <span class="comment">/* 2. sortól a 4.-ig */</span>
}</code></pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="quick-tips">
                    <h3 class="tips-title">💡 CSS Gyors Tippek</h3>
                    <div class="tips-grid">
                        <div class="tip-item">
                            <span class="tip-icon">🎯</span>
                            <div class="tip-content">
                                <strong>Specificitás:</strong> ID (100) > Class (10) > Elem (1). Kerüld az !important használatát.
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">📐</span>
                            <div class="tip-content">
                                <strong>Layout:</strong> Flexbox egydimenziós, Grid kétdimenziós layoutokhoz. Mindkettő hasznos!
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">⚡</span>
                            <div class="tip-content">
                                <strong>Teljesítmény:</strong> CSS-t minimalizáld, használj CSS változókat és kerüld a túl mély szelektorokat.
                            </div>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">🎨</span>
                            <div class="tip-content">
                                <strong>Színek:</strong> Használj CSS változókat színekhez és HSL formátumot a könnyebb manipulációért.
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Show loading state
     */
    showLoadingState(sectionId) {
        const container = document.getElementById('dynamicContent');
        if (!container) return;

        const loadingHTML = `
            <section id="${sectionId}" class="content-section active">
                <div class="loading-content">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <p>Szekció betöltése...</p>
                </div>
            </section>
        `;

        container.innerHTML = loadingHTML;
    }

    /**
     * Show error state
     */
    showErrorState(sectionId, error) {
        const container = document.getElementById('dynamicContent');
        if (!container) return;

        const errorHTML = `
            <section id="${sectionId}" class="content-section active">
                <div class="error-content">
                    <div class="error-icon">❌</div>
                    <h2>Betöltési hiba</h2>
                    <p>Nem sikerült betölteni a szekció tartalmát.</p>
                    <button class="btn-primary" onclick="ContentLoader.retryLoad('${sectionId}')">
                        Újrapróbálás
                    </button>
                </div>
            </section>
        `;

        container.innerHTML = errorHTML;
    }

    /**
     * Render cached content
     */
    renderCachedContent(sectionId) {
        const content = this.sectionCache.get(sectionId);
        if (content) {
            this.renderSectionContent(sectionId, content);
            this.initializeInteractiveComponents(sectionId);
        }
    }

    /**
     * Render section content
     */
    renderSectionContent(sectionId, content) {
        const container = document.getElementById('dynamicContent');
        if (!container) return;

        container.innerHTML = content;
        
        // Trigger content loaded event
        const event = new CustomEvent('contentloaded', {
            detail: { sectionId, content }
        });
        document.dispatchEvent(event);
    }

    /**
     * Initialize interactive components
     */
    initializeInteractiveComponents(sectionId) {
        // Initialize copy buttons
        this.initializeCopyButtons();
        
        // Initialize demo controls
        this.initializeDemoControls();
        
        // Initialize interactive demos
        this.initializeInteractiveDemos(sectionId);
        
        // Initialize syntax highlighting
        this.initializeSyntaxHighlighting();
    }

    /**
     * Initialize copy buttons
     */
    initializeCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const codeBlock = e.target.closest('.code-example');
                const code = codeBlock.querySelector('pre code').textContent;
                
                try {
                    await navigator.clipboard.writeText(code);
                    
                    const originalText = btn.textContent;
                    btn.textContent = '✅ Másolva!';
                    btn.style.background = 'var(--success)';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                    }, 2000);
                    
                    // Track code copying
                    document.dispatchEvent(new CustomEvent('codecopied', {
                        detail: { section: this.app.currentSection, code }
                    }));
                    
                } catch (error) {
                    console.error('Copy failed:', error);
                    this.app.showError('Másolási hiba', 'Nem sikerült a vágólapra másolni');
                }
            });
        });
    }

    /**
     * Initialize demo controls
     */
    initializeDemoControls() {
        // Toggle demo visibility
        window.toggleDemo = (demoId) => {
            const demo = document.getElementById(demoId);
            if (demo) {
                demo.style.display = demo.style.display === 'none' ? 'block' : 'none';
            }
        };

        // Box model demo
        window.adjustBoxModel = (property, value) => {
            const demo = document.getElementById('box-model-demo');
            if (demo) {
                const currentValue = parseInt(demo.style[property]) || 20;
                const newValue = Math.max(0, currentValue + value);
                demo.style[property] = newValue + 'px';
            }
        };

        window.resetBoxModel = () => {
            const demo = document.getElementById('box-model-demo');
            if (demo) {
                demo.style.margin = '20px';
                demo.style.padding = '20px';
            }
        };

        // Flexbox demo
        window.changeFlexProperty = (property, value) => {
            const demo = document.getElementById('flexbox-demo');
            if (demo) {
                demo.style[property] = value;
            }
        };
    }

    /**
     * Initialize interactive demos
     */
    initializeInteractiveDemos(sectionId) {
        // Section-specific interactive demos
        switch (sectionId) {
            case 'css':
                this.initializeCSSInteractiveDemos();
                break;
            case 'javascript':
                this.initializeJSInteractiveDemos();
                break;
            // Add more sections as needed
        }
    }

    /**
     * Initialize CSS interactive demos
     */
    initializeCSSInteractiveDemos() {
        // Color picker for CSS properties
        const colorInputs = document.querySelectorAll('input[type="color"]');
        colorInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const targetDemo = e.target.dataset.target;
                const property = e.target.dataset.property;
                const demo = document.getElementById(targetDemo);
                
                if (demo && property) {
                    demo.style[property] = e.target.value;
                }
            });
        });
    }

    /**
     * Initialize JavaScript interactive demos
     */
    initializeJSInteractiveDemos() {
        // Add JavaScript-specific interactive demos
        console.log('JavaScript demos initialized');
    }

    /**
     * Initialize syntax highlighting
     */
    initializeSyntaxHighlighting() {
        // Enhanced syntax highlighting could be added here
        // For now, we use the CSS classes defined in the HTML
    }

    /**
     * Create default section content
     */
    createDefaultSectionContent(sectionId) {
        const navigation = this.app.getModule('navigation');
        const sectionInfo = navigation?.getSectionInfo(sectionId);
        
        return `
            <section id="${sectionId}" class="content-section">
                <div class="section-header">
                    <h1>${sectionInfo?.icon || '📄'} ${sectionInfo?.title || sectionId}</h1>
                    <p>${sectionInfo?.description || 'Szekció tartalma hamarosan elérhető lesz.'}</p>
                </div>
                
                <div class="placeholder-content">
                    <div class="placeholder-card">
                        <h3>🚧 Fejlesztés alatt</h3>
                        <p>Ez a szekció még fejlesztés alatt áll. Hamarosan elérhető lesz a teljes tartalom.</p>
                        <p>Addig is böngészd a többi szekciót!</p>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Setup dynamic content loading
     */
    setupDynamicContent() {
        // Listen for section changes
        document.addEventListener('sectionchange', async (e) => {
            const sectionId = e.detail.section;
            await this.loadSection(sectionId);
        });
    }

    /**
     * Preload sections
     */
    async preloadSections(sectionIds) {
        const promises = sectionIds.map(id => this.loadSection(id));
        await Promise.all(promises);
    }

    /**
     * Clear section cache
     */
    clearCache(sectionId = null) {
        if (sectionId) {
            this.sectionCache.delete(sectionId);
            this.loadedSections.delete(sectionId);
        } else {
            this.sectionCache.clear();
            this.loadedSections.clear();
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            cachedSections: this.sectionCache.size,
            loadedSections: this.loadedSections.size,
            cacheSize: JSON.stringify(Array.from(this.sectionCache.values())).length
        };
    }

    // Static methods for global access
    static retryLoad(sectionId) {
        const contentLoader = window.App?.getModule('contentloader');
        if (contentLoader) {
            contentLoader.clearCache(sectionId);
            contentLoader.loadSection(sectionId);
        }
    }
}

// Add interactive functions to global scope
window.copyCode = async function(button) {
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
    }
};

// Make ContentLoader available globally
window.ContentLoader = ContentLoader;