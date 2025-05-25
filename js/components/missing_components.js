// ================================
// HIÁNYZÓ KOMPONENSEK
// js/components/color-generator.js
// ================================

class ColorGenerator {
    constructor() {
        this.currentPalette = [];
        this.colorHistory = [];
        this.container = null;
        this.colorFormats = ['hex', 'rgb', 'hsl', 'hsb'];
        this.currentFormat = 'hex';
    }

    static init(container) {
        const generator = new ColorGenerator();
        generator.container = container;
        generator.render();
        return generator;
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="color-generator">
                <div class="generator-controls">
                    <div class="control-group">
                        <label>Alap szín:</label>
                        <input type="color" id="baseColor" value="#4fc3f7">
                    </div>
                    <div class="control-group">
                        <label>Paletta típus:</label>
                        <select id="paletteType">
                            <option value="complementary">Komplementer</option>
                            <option value="analogous">Analóg</option>
                            <option value="triadic">Háromszög</option>
                            <option value="monochromatic">Monokromatikus</option>
                            <option value="split">Osztott komplementer</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Színek száma:</label>
                        <input type="range" id="colorCount" min="3" max="10" value="5">
                        <span id="colorCountValue">5</span>
                    </div>
                    <button class="btn-primary" onclick="ColorGenerator.generate()">🎨 Generálás</button>
                    <button class="btn-secondary" onclick="ColorGenerator.randomize()">🎲 Véletlen</button>
                </div>

                <div id="colorPalette" class="color-palette">
                    <!-- Színpaletta itt jelenik meg -->
                </div>

                <div class="format-controls">
                    <label>Formátum:</label>
                    <div class="format-buttons">
                        <button class="format-btn active" data-format="hex">HEX</button>
                        <button class="format-btn" data-format="rgb">RGB</button>
                        <button class="format-btn" data-format="hsl">HSL</button>
                        <button class="format-btn" data-format="hsb">HSB</button>
                    </div>
                </div>

                <div class="export-controls">
                    <button class="btn-secondary" onclick="ColorGenerator.exportCSS()">📄 CSS Export</button>
                    <button class="btn-secondary" onclick="ColorGenerator.exportJSON()">📋 JSON Export</button>
                    <button class="btn-secondary" onclick="ColorGenerator.copyAll()">📋 Összes másolása</button>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.generateInitialPalette();
    }

    setupEventListeners() {
        // Base color change
        const baseColor = document.getElementById('baseColor');
        if (baseColor) {
            baseColor.addEventListener('change', () => this.generate());
        }

        // Palette type change
        const paletteType = document.getElementById('paletteType');
        if (paletteType) {
            paletteType.addEventListener('change', () => this.generate());
        }

        // Color count slider
        const colorCount = document.getElementById('colorCount');
        const colorCountValue = document.getElementById('colorCountValue');
        if (colorCount && colorCountValue) {
            colorCount.addEventListener('input', (e) => {
                colorCountValue.textContent = e.target.value;
                this.generate();
            });
        }

        // Format buttons
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFormat = e.target.dataset.format;
                this.updatePaletteDisplay();
            });
        });
    }

    generateInitialPalette() {
        this.generate();
    }

    generate() {
        const baseColor = document.getElementById('baseColor')?.value || '#4fc3f7';
        const paletteType = document.getElementById('paletteType')?.value || 'complementary';
        const colorCount = parseInt(document.getElementById('colorCount')?.value || 5);

        this.currentPalette = this.generatePalette(baseColor, paletteType, colorCount);
        this.displayPalette();
    }

    generatePalette(baseColor, type, count) {
        const hsl = this.hexToHsl(baseColor);
        const colors = [];

        switch (type) {
            case 'complementary':
                colors.push(baseColor);
                colors.push(this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
                break;
            case 'analogous':
                for (let i = 0; i < count; i++) {
                    const hue = (hsl.h + (i * 30)) % 360;
                    colors.push(this.hslToHex(hue, hsl.s, hsl.l));
                }
                break;
            case 'triadic':
                colors.push(baseColor);
                colors.push(this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
                colors.push(this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
                break;
            case 'monochromatic':
                for (let i = 0; i < count; i++) {
                    const lightness = Math.max(10, Math.min(90, hsl.l + (i - Math.floor(count/2)) * 15));
                    colors.push(this.hslToHex(hsl.h, hsl.s, lightness));
                }
                break;
            case 'split':
                colors.push(baseColor);
                colors.push(this.hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l));
                colors.push(this.hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l));
                break;
        }

        // Fill remaining colors if needed
        while (colors.length < count) {
            const randomHue = Math.floor(Math.random() * 360);
            colors.push(this.hslToHex(randomHue, hsl.s, hsl.l));
        }

        return colors.slice(0, count);
    }

    displayPalette() {
        const paletteContainer = document.getElementById('colorPalette');
        if (!paletteContainer) return;

        paletteContainer.innerHTML = this.currentPalette.map((color, index) => `
            <div class="color-item" style="background-color: ${color}">
                <div class="color-info">
                    <div class="color-value" onclick="ColorGenerator.copyColor('${color}')">${color}</div>
                    <div class="color-name">${this.getColorName(color)}</div>
                </div>
                <div class="color-actions">
                    <button onclick="ColorGenerator.copyColor('${color}')" title="Másolás">📋</button>
                    <button onclick="ColorGenerator.editColor(${index})" title="Szerkesztés">✏️</button>
                </div>
            </div>
        `).join('');
    }

    updatePaletteDisplay() {
        this.currentPalette.forEach((color, index) => {
            const colorItem = document.querySelectorAll('.color-item')[index];
            if (colorItem) {
                const valueEl = colorItem.querySelector('.color-value');
                if (valueEl) {
                    valueEl.textContent = this.convertColor(color, this.currentFormat);
                }
            }
        });
    }

    convertColor(hex, format) {
        switch (format) {
            case 'hex':
                return hex;
            case 'rgb':
                const rgb = this.hexToRgb(hex);
                return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            case 'hsl':
                const hsl = this.hexToHsl(hex);
                return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
            case 'hsb':
                const hsb = this.hexToHsb(hex);
                return `hsb(${Math.round(hsb.h)}, ${Math.round(hsb.s)}%, ${Math.round(hsb.b)}%)`;
            default:
                return hex;
        }
    }

    // Color conversion utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return { h: 0, s: 0, l: 0 };

        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    hslToHex(h, s, l) {
        h = h % 360;
        s = s / 100;
        l = l / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    hexToHsb(hex) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return { h: 0, s: 0, b: 0 };

        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let h = 0;
        if (delta !== 0) {
            if (max === r) h = ((g - b) / delta) % 6;
            else if (max === g) h = (b - r) / delta + 2;
            else h = (r - g) / delta + 4;
            h *= 60;
            if (h < 0) h += 360;
        }

        const s = max === 0 ? 0 : (delta / max) * 100;
        const brightness = max * 100;

        return { h, s, b: brightness };
    }

    getColorName(hex) {
        // Simple color name mapping (could be expanded)
        const colorNames = {
            '#ff0000': 'Piros',
            '#00ff00': 'Zöld',
            '#0000ff': 'Kék',
            '#ffff00': 'Sárga',
            '#ff00ff': 'Magenta',
            '#00ffff': 'Cián',
            '#ffffff': 'Fehér',
            '#000000': 'Fekete'
        };
        
        return colorNames[hex.toLowerCase()] || 'Egyéni';
    }

    // Static methods for global access
    static generate() {
        // Find active generator and call generate
        if (window.activeColorGenerator) {
            window.activeColorGenerator.generate();
        }
    }

    static randomize() {
        const baseColor = document.getElementById('baseColor');
        if (baseColor) {
            baseColor.value = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            ColorGenerator.generate();
        }
    }

    static copyColor(color) {
        navigator.clipboard.writeText(color).then(() => {
            window.App?.showNotification('success', 'Szín másolva', `${color} a vágólapra került`);
        });
    }

    static editColor(index) {
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = window.activeColorGenerator?.currentPalette[index] || '#000000';
        colorPicker.onchange = (e) => {
            if (window.activeColorGenerator) {
                window.activeColorGenerator.currentPalette[index] = e.target.value;
                window.activeColorGenerator.displayPalette();
            }
        };
        colorPicker.click();
    }

    static exportCSS() {
        if (!window.activeColorGenerator) return;
        
        const colors = window.activeColorGenerator.currentPalette;
        let css = ':root {\n';
        colors.forEach((color, index) => {
            css += `  --color-${index + 1}: ${color};\n`;
        });
        css += '}';

        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.css';
        a.click();
        URL.revokeObjectURL(url);
    }

    static exportJSON() {
        if (!window.activeColorGenerator) return;
        
        const data = {
            palette: window.activeColorGenerator.currentPalette,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    static copyAll() {
        if (!window.activeColorGenerator) return;
        
        const colors = window.activeColorGenerator.currentPalette;
        const text = colors.join('\n');
        
        navigator.clipboard.writeText(text).then(() => {
            window.App?.showNotification('success', 'Paletta másolva', 'Összes szín a vágólapra került');
        });
    }
}

// Make ColorGenerator globally available
window.ColorGenerator = ColorGenerator;

// ================================
// HIÁNYZÓ KOMPONENS - Quiz System
// js/components/quiz.js
// ================================

class QuizSystem {
    constructor() {
        this.questions = new Map();
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.timeStart = null;
        this.categories = ['html', 'css', 'javascript', 'general'];
    }

    static init() {
        const quiz = new QuizSystem();
        quiz.loadQuestions();
        return quiz;
    }

    loadQuestions() {
        // Sample questions - could be loaded from external source
        const sampleQuestions = {
            html: [
                {
                    question: "Melyik HTML elem használatos bekezdések létrehozására?",
                    options: ["<p>", "<div>", "<span>", "<section>"],
                    correct: 0,
                    explanation: "A <p> elem (paragraph) szolgál bekezdések létrehozására HTML-ben."
                },
                {
                    question: "Mi a helyes DOCTYPE deklaráció HTML5-ben?",
                    options: ["<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<DOCTYPE html>", "<!HTML5>"],
                    correct: 0,
                    explanation: "HTML5-ben egyszerűen '<!DOCTYPE html>' kell használni."
                }
            ],
            css: [
                {
                    question: "Melyik CSS tulajdonság állítja be az elem háttérszínét?",
                    options: ["color", "background-color", "bg-color", "background"],
                    correct: 1,
                    explanation: "A 'background-color' tulajdonság állítja be az elem háttérszínét."
                },
                {
                    question: "Mi a CSS Box Model sorrendje kívülről befelé?",
                    options: ["margin, border, padding, content", "border, margin, padding, content", "padding, margin, border, content", "content, padding, border, margin"],
                    correct: 0,
                    explanation: "A Box Model sorrendje: margin (külső), border (keret), padding (belső), content (tartalom)."
                }
            ],
            javascript: [
                {
                    question: "Hogyan deklarálunk változót JavaScript-ben (ES6+)?",
                    options: ["var x = 5", "let x = 5", "const x = 5", "mind a három helyes"],
                    correct: 3,
                    explanation: "ES6+ -ban használható var, let és const is, de let és const ajánlott."
                },
                {
                    question: "Mi az eredménye: typeof null",
                    options: ["'null'", "'undefined'", "'object'", "'boolean'"],
                    correct: 2,
                    explanation: "Ez egy híres JavaScript bug: typeof null eredménye 'object'."
                }
            ]
        };

        Object.entries(sampleQuestions).forEach(([category, questions]) => {
            this.questions.set(category, questions);
        });
    }

    startQuiz(category = 'random', questionCount = 5) {
        let allQuestions = [];
        
        if (category === 'random') {
            // Collect all questions from all categories
            for (const questions of this.questions.values()) {
                allQuestions.push(...questions);
            }
        } else {
            allQuestions = this.questions.get(category) || [];
        }

        if (allQuestions.length === 0) {
            window.App?.showNotification('warning', 'Nincs kérdés', 'Ehhez a kategóriához nincsenek kérdések');
            return false;
        }

        // Shuffle and select questions
        const shuffled = this.shuffleArray([...allQuestions]);
        this.currentQuiz = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.timeStart = Date.now();

        this.renderQuiz();
        return true;
    }

    renderQuiz() {
        // Create quiz container if it doesn't exist
        let quizContainer = document.getElementById('quizContainer');
        if (!quizContainer) {
            quizContainer = document.createElement('div');
            quizContainer.id = 'quizContainer';
            quizContainer.className = 'quiz-container';
            
            const mainContent = document.querySelector('.main-content .container');
            if (mainContent) {
                mainContent.appendChild(quizContainer);
            }
        }

        if (this.currentQuestion >= this.currentQuiz.length) {
            this.showResults();
            return;
        }

        const question = this.currentQuiz[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.currentQuiz