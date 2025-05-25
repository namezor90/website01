/**
 * ================================
 * CODE PLAYGROUND
 * Interactive code editor with live preview
 * ================================
 */

class CodePlayground {
    constructor() {
        this.html = '';
        this.css = '';
        this.javascript = '';
        this.currentTab = 'html';
        this.autoRun = true;
        this.debounceTimer = null;
        this.savedProjects = new Map();
    }

    static init(container) {
        const playground = new CodePlayground();
        playground.container = container;
        playground.render();
        playground.setupEventListeners();
        playground.loadSavedCode();
        return playground;
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="code-playground">
                <div class="playground-toolbar">
                    <div class="toolbar-section">
                        <button class="btn-secondary" onclick="CodePlayground.runCode()">▶️ Futtatás (Ctrl+Enter)</button>
                        <button class="btn-secondary" onclick="CodePlayground.saveCode()">💾 Mentés</button>
                        <button class="btn-secondary" onclick="CodePlayground.loadCode()">📂 Betöltés</button>
                        <button class="btn-secondary" onclick="CodePlayground.clearCode()">🗑️ Törlés</button>
                    </div>
                    <div class="toolbar-section">
                        <label>
                            <input type="checkbox" id="autoRun" checked> Automatikus futtatás
                        </label>
                        <button class="btn-secondary" onclick="CodePlayground.openInNewWindow()">🔗 Új ablakban</button>
                    </div>
                </div>

                <div class="playground-content">
                    <div class="editors-panel">
                        <div class="editor-tabs">
                            <button class="tab-btn active" data-tab="html">HTML</button>
                            <button class="tab-btn" data-tab="css">CSS</button>
                            <button class="tab-btn" data-tab="javascript">JavaScript</button>
                        </div>
                        
                        <div class="editor-container">
                            <div class="editor-pane active" data-pane="html">
                                <textarea class="code-editor" id="htmlEditor" placeholder="HTML kód ide...">${this.getDefaultHTML()}</textarea>
                            </div>
                            <div class="editor-pane" data-pane="css">
                                <textarea class="code-editor" id="cssEditor" placeholder="CSS kód ide...">${this.getDefaultCSS()}</textarea>
                            </div>
                            <div class="editor-pane" data-pane="javascript">
                                <textarea class="code-editor" id="jsEditor" placeholder="JavaScript kód ide...">${this.getDefaultJS()}</textarea>
                            </div>
                        </div>
                    </div>

                    <div class="preview-panel">
                        <div class="preview-header">
                            <span>🔍 Előnézet</span>
                            <div class="preview-controls">
                                <button onclick="CodePlayground.refreshPreview()" title="Frissítés">🔄</button>
                                <button onclick="CodePlayground.toggleFullscreen()" title="Teljes képernyő">⛶</button>
                            </div>
                        </div>
                        <iframe class="preview-frame" id="previewFrame" sandbox="allow-scripts allow-same-origin"></iframe>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Code editors
        const htmlEditor = document.getElementById('htmlEditor');
        const cssEditor = document.getElementById('cssEditor');
        const jsEditor = document.getElementById('jsEditor');

        if (htmlEditor) {
            htmlEditor.addEventListener('input', (e) => {
                this.html = e.target.value;
                this.debounceRun();
                this.autoSave();
            });
        }

        if (cssEditor) {
            cssEditor.addEventListener('input', (e) => {
                this.css = e.target.value;
                this.debounceRun();
                this.autoSave();
            });
        }

        if (jsEditor) {
            jsEditor.addEventListener('input', (e) => {
                this.javascript = e.target.value;
                this.debounceRun();
                this.autoSave();
            });
        }

        // Auto-run checkbox
        const autoRunCheckbox = document.getElementById('autoRun');
        if (autoRunCheckbox) {
            autoRunCheckbox.addEventListener('change', (e) => {
                this.autoRun = e.target.checked;
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCode();
            }
        });

        // Tab key handling in editors
        [htmlEditor, cssEditor, jsEditor].forEach(editor => {
            if (editor) {
                editor.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = e.target.selectionStart;
                        const end = e.target.selectionEnd;
                        e.target.value = e.target.value.substring(0, start) + '    ' + e.target.value.substring(end);
                        e.target.selectionStart = e.target.selectionEnd = start + 4;
                    }
                });
            }
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active editor pane
        document.querySelectorAll('.editor-pane').forEach(pane => {
            pane.classList.toggle('active', pane.dataset.pane === tabName);
        });

        this.currentTab = tabName;
    }

    debounceRun() {
        if (!this.autoRun) return;
        
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.runCode();
        }, 500);
    }

    runCode() {
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) return;

        const html = this.html || document.getElementById('htmlEditor')?.value || '';
        const css = this.css || document.getElementById('cssEditor')?.value || '';
        const js = this.javascript || document.getElementById('jsEditor')?.value || '';

        const combinedCode = `
            <!DOCTYPE html>
            <html lang="hu">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        margin: 0; 
                        padding: 20px; 
                        font-family: 'Segoe UI', sans-serif;
                        background: white;
                        color: #333;
                    }
                    ${css}
                </style>
            </head>
            <body>
                ${html}
                <script>
                    try {
                        ${js}
                    } catch (error) {
                        document.body.innerHTML += '<div style="background: #fee; color: #c33; padding: 10px; border: 1px solid #fbb; border-radius: 4px; margin-top: 10px;"><strong>JavaScript Error:</strong> ' + error.message + '</div>';
                    }
                </script>
            </body>
            </html>
        `;

        // Update iframe content
        previewFrame.srcdoc = combinedCode;
    }

    refreshPreview() {
        this.runCode();
    }

    saveCode() {
        const projectName = prompt('Projekt neve:', `Projekt_${Date.now()}`);
        if (!projectName) return;

        const project = {
            name: projectName,
            html: this.html || document.getElementById('htmlEditor')?.value || '',
            css: this.css || document.getElementById('cssEditor')?.value || '',
            javascript: this.javascript || document.getElementById('jsEditor')?.value || '',
            created: new Date().toISOString()
        };

        this.savedProjects.set(projectName, project);
        this.saveToStorage();
        
        if (window.App) {
            window.App.showNotification('success', 'Projekt mentve', `"${projectName}" sikeresen mentve`);
        }
    }

    loadCode() {
        const projects = Array.from(this.savedProjects.values());
        if (projects.length === 0) {
            if (window.App) {
                window.App.showNotification('warning', 'Nincs mentett projekt', 'Először ments el egy projektet');
            }
            return;
        }

        const projectNames = projects.map(p => p.name);
        const selectedName = prompt(`Válassz projektet:\n${projectNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\nAdd meg a projekt nevét:`);
        
        if (!selectedName) return;

        const project = this.savedProjects.get(selectedName);
        if (!project) {
            if (window.App) {
                window.App.showNotification('error', 'Projekt nem található', `"${selectedName}" nem létezik`);
            }
            return;
        }

        // Load code into editors
        const htmlEditor = document.getElementById('htmlEditor');
        const cssEditor = document.getElementById('cssEditor');
        const jsEditor = document.getElementById('jsEditor');

        if (htmlEditor) htmlEditor.value = project.html;
        if (cssEditor) cssEditor.value = project.css;
        if (jsEditor) jsEditor.value = project.javascript;

        this.html = project.html;
        this.css = project.css;
        this.javascript = project.javascript;

        this.runCode();

        if (window.App) {
            window.App.showNotification('success', 'Projekt betöltve', `"${selectedName}" betöltve`);
        }
    }

    clearCode() {
        if (!confirm('Biztosan törölni szeretnéd az összes kódot?')) return;

        const htmlEditor = document.getElementById('htmlEditor');
        const cssEditor = document.getElementById('cssEditor');
        const jsEditor = document.getElementById('jsEditor');

        if (htmlEditor) htmlEditor.value = '';
        if (cssEditor) cssEditor.value = '';
        if (jsEditor) jsEditor.value = '';

        this.html = '';
        this.css = '';
        this.javascript = '';

        this.runCode();
    }

    openInNewWindow() {
        const html = this.html || document.getElementById('htmlEditor')?.value || '';
        const css = this.css || document.getElementById('cssEditor')?.value || '';
        const js = this.javascript || document.getElementById('jsEditor')?.value || '';

        const combinedCode = `
            <!DOCTYPE html>
            <html lang="hu">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code Playground - Eredmény</title>
                <style>
                    body { 
                        margin: 0; 
                        padding: 20px; 
                        font-family: 'Segoe UI', sans-serif;
                    }
                    ${css}
                </style>
            </head>
            <body>
                ${html}
                <script>
                    ${js}
                </script>
            </body>
            </html>
        `;

        const newWindow = window.open('', '_blank');
        newWindow.document.write(combinedCode);
        newWindow.document.close();
    }

    toggleFullscreen() {
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) return;

        if (previewFrame.classList.contains('fullscreen')) {
            previewFrame.classList.remove('fullscreen');
        } else {
            previewFrame.classList.add('fullscreen');
        }
    }

    autoSave() {
        const autoSaveData = {
            html: this.html || document.getElementById('htmlEditor')?.value || '',
            css: this.css || document.getElementById('cssEditor')?.value || '',
            javascript: this.javascript || document.getElementById('jsEditor')?.value || '',
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem('playground_autosave', JSON.stringify(autoSaveData));
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    loadSavedCode() {
        try {
            const autoSaveData = localStorage.getItem('playground_autosave');
            if (autoSaveData) {
                const saved = JSON.parse(autoSaveData);
                
                const htmlEditor = document.getElementById('htmlEditor');
                const cssEditor = document.getElementById('cssEditor');
                const jsEditor = document.getElementById('jsEditor');

                if (htmlEditor && saved.html) htmlEditor.value = saved.html;
                if (cssEditor && saved.css) cssEditor.value = saved.css;
                if (jsEditor && saved.javascript) jsEditor.value = saved.javascript;

                this.html = saved.html || '';
                this.css = saved.css || '';
                this.javascript = saved.javascript || '';
            }

            // Load saved projects
            const savedProjects = localStorage.getItem('playground_projects');
            if (savedProjects) {
                const projects = JSON.parse(savedProjects);
                projects.forEach(project => {
                    this.savedProjects.set(project.name, project);
                });
            }
        } catch (error) {
            console.warn('Failed to load saved code:', error);
        }
    }

    saveToStorage() {
        try {
            const projects = Array.from(this.savedProjects.values());
            localStorage.setItem('playground_projects', JSON.stringify(projects));
        } catch (error) {
            console.warn('Failed to save projects:', error);
        }
    }

    getDefaultHTML() {
        return `<div class="container">
    <h1>Üdvözöl a Code Playground!</h1>
    <p>Írd át ezt a HTML kódot, és nézd meg élőben az eredményt.</p>
    
    <div class="card">
        <h2>Példa kártya</h2>
        <p>Ez egy példa kártya CSS stílusokkal.</p>
        <button id="exampleBtn">Kattints rám!</button>
    </div>
</div>`;
    }

    getDefaultCSS() {
        return `.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    color: #2563eb;
    text-align: center;
    margin-bottom: 30px;
}

.card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    text-align: center;
    margin: 20px 0;
}

button {
    background: #10b981;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

button:hover {
    background: #059669;
    transform: translateY(-2px);
}`;
    }

    getDefaultJS() {
        return `// JavaScript kód példa
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('exampleBtn');
    let clickCount = 0;
    
    button.addEventListener('click', function() {
        clickCount++;
        
        if (clickCount === 1) {
            button.textContent = 'Még egyszer!';
            button.style.background = '#f59e0b';
        } else if (clickCount === 2) {
            button.textContent = 'Fantasztikus! 🎉';
            button.style.background = '#dc2626';
        } else {
            button.textContent = \`\${clickCount} kattintás!\`;
            button.style.background = '#7c3aed';
        }
    });
    
    console.log('Playground inicializálva!');
});`;
    }

    // Static methods for global access
    static runCode() {
        if (window.activeCodePlayground) {
            window.activeCodePlayground.runCode();
        }
    }

    static saveCode() {
        if (window.activeCodePlayground) {
            window.activeCodePlayground.saveCode();
        }
    }

    static loadCode() {
        if (window.activeCodePlayground) {
            window.activeCodePlayground.loadCode();
        }
    }

    static clearCode() {
        if (window.activeCodePlayground) {
            window.activeCodePlayground.clearCode();
        }
    }

    static refreshPreview() {
        if (window.activeCodePlayground) {
            window.activeCodePlayground.refreshPreview();
        }
    }

    static openInNewWindow() {
        if (window.activeCodePlayground) {
            window.activeCodePlayground.openInNewWindow();
        }
    }

    static toggleFullscreen() {
        if (window.activeCodePlayground) {
            window.activeCodePlayground.toggleFullscreen();
        }
    }
}

// Make CodePlayground globally available
window.CodePlayground = CodePlayground;