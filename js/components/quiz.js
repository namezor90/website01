/**
 * ================================
 * QUIZ SYSTEM
 * Interactive quiz component with progress tracking
 * ================================
 */

class QuizSystem {
    constructor() {
        this.questions = new Map();
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.timeStart = null;
        this.categories = ['html', 'css', 'javascript', 'general'];
        this.container = null;
    }

    static init(container) {
        const quiz = new QuizSystem();
        quiz.container = container;
        quiz.loadQuestions();
        quiz.render();
        return quiz;
    }

    loadQuestions() {
        // HTML Questions
        this.questions.set('html', [
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
            },
            {
                question: "Melyik elem használatos felsorolások létrehozására?",
                options: ["<list>", "<ul>", "<ol>", "Mind a kettő: <ul> és <ol>"],
                correct: 3,
                explanation: "Mind az <ul> (rendezetlen) és az <ol> (rendezett) lista elemek használhatók felsorolásokhoz."
            },
            {
                question: "Mi a <meta> elem célja?",
                options: ["Stílus megadása", "Metaadatok megadása", "Linkek létrehozása", "Szöveg formázása"],
                correct: 1,
                explanation: "A <meta> elem metaadatokat ad meg a dokumentumról, mint charset, viewport, stb."
            },
            {
                question: "Melyik attribútum kötelező az <img> elemnél?",
                options: ["src", "alt", "width", "Mind a kettő: src és alt"],
                correct: 3,
                explanation: "Mind a 'src' (forrás) és az 'alt' (alternatív szöveg) attribútum fontos a hozzáférhetőség miatt."
            }
        ]);

        // CSS Questions
        this.questions.set('css', [
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
            },
            {
                question: "Melyik érték teszi láthatatlanná az elemet, de megtartja a helyét?",
                options: ["display: none", "visibility: hidden", "opacity: 0", "position: absolute"],
                correct: 1,
                explanation: "A 'visibility: hidden' elrejti az elemet, de megtartja a helyét a layoutban."
            },
            {
                question: "Mi a flexbox fő tengelye alapértelmezetten?",
                options: ["column", "row", "diagonal", "center"],
                correct: 1,
                explanation: "A flexbox alapértelmezett flex-direction értéke 'row', vagyis vízszintes."
            },
            {
                question: "Melyik CSS tulajdonság használatos szöveg középre igazításához?",
                options: ["align: center", "text-align: center", "center: true", "justify: center"],
                correct: 1,
                explanation: "A 'text-align: center' tulajdonság igazítja középre a szöveget."
            }
        ]);

        // JavaScript Questions
        this.questions.set('javascript', [
            {
                question: "Hogyan deklarálunk változót JavaScript-ben (ES6+)?",
                options: ["var x = 5", "let x = 5", "const x = 5", "Mind a három helyes"],
                correct: 3,
                explanation: "ES6+ -ban használható var, let és const is, de let és const ajánlott."
            },
            {
                question: "Mi az eredménye: typeof null",
                options: ["'null'", "'undefined'", "'object'", "'boolean'"],
                correct: 2,
                explanation: "Ez egy híres JavaScript bug: typeof null eredménye 'object'."
            },
            {
                question: "Melyik metódus használatos HTML elem kiválasztására ID alapján?",
                options: ["document.getElementById()", "document.querySelector()", "document.getElement()", "Mind az első kettő helyes"],
                correct: 3,
                explanation: "Mind a getElementById() és a querySelector('#id') használható ID alapú kiválasztásra."
            },
            {
                question: "Mi a különbség a let és const között?",
                options: ["Nincs különbség", "let újraértékelhető, const nem", "const blokk szintű, let nem", "let gyorsabb"],
                correct: 1,
                explanation: "A let újraértékelhető változó, míg a const konstans (nem változtatható)."
            },
            {
                question: "Hogyan adunk hozzá eseménykezelőt egy elemhez?",
                options: ["element.onClick()", "element.addEventListener()", "element.addEvent()", "element.on()"],
                correct: 1,
                explanation: "Az addEventListener() metódus a modern és ajánlott módja az eseménykezelők hozzáadásának."
            }
        ]);

        // General Web Development Questions
        this.questions.set('general', [
            {
                question: "Mit jelent a 'responsive design'?",
                options: ["Gyors betöltés", "Mobilbarát design", "Interaktív elemek", "Színes design"],
                correct: 1,
                explanation: "A responsive design különböző képernyőméretekhez alkalmazkodó webdesignt jelent."
            },
            {
                question: "Mi a PWA?",
                options: ["Progressive Web App", "Public Web Access", "Private Web Application", "Portable Web Asset"],
                correct: 0,
                explanation: "PWA = Progressive Web App, egy webalkalmazás, ami natív app élményt nyújt."
            },
            {
                question: "Mit jelent az 'accessibility' webfejlesztésben?",
                options: ["Gyorsaság", "Hozzáférhetőség", "Biztonság", "Kompatibilitás"],
                correct: 1,
                explanation: "Az accessibility (a11y) a webtartalom hozzáférhetőségét jelenti mindenki számára."
            },
            {
                question: "Mi a CSS Grid előnye a Flexbox-szal szemben?",
                options: ["Gyorsabb", "Kétdimenziós layout", "Egyszerűbb", "Több böngésző támogatja"],
                correct: 1,
                explanation: "A CSS Grid kétdimenziós (sorok és oszlopok) layoutot tesz lehetővé."
            },
            {
                question: "Mi a 'SEO'?",
                options: ["Search Engine Optimization", "Secure Email Operation", "Social Event Organization", "Software Engineering Online"],
                correct: 0,
                explanation: "SEO = Search Engine Optimization, keresőoptimalizálás."
            }
        ]);
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-content">
                    <div class="quiz-header">
                        <h2>🧠 Webfejlesztési Kvíz</h2>
                        <p>Teszteld a tudásod interaktív kérdésekkel!</p>
                    </div>
                    
                    <div class="quiz-setup" id="quizSetup">
                        <div class="setup-options">
                            <div class="option-group">
                                <label for="categorySelect">Kategória:</label>
                                <select id="categorySelect" class="form-select">
                                    <option value="random">🎲 Vegyes kérdések</option>
                                    <option value="html">📄 HTML</option>
                                    <option value="css">🎨 CSS</option>
                                    <option value="javascript">⚡ JavaScript</option>
                                    <option value="general">🌐 Általános</option>
                                </select>
                            </div>
                            
                            <div class="option-group">
                                <label for="questionCount">Kérdések száma:</label>
                                <select id="questionCount" class="form-select">
                                    <option value="5">5 kérdés</option>
                                    <option value="10" selected>10 kérdés</option>
                                    <option value="15">15 kérdés</option>
                                    <option value="20">20 kérdés</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setup-actions">
                            <button class="btn-primary" onclick="Quiz.startQuiz()">🚀 Kvíz indítása</button>
                        </div>
                    </div>
                    
                    <div class="quiz-game hidden" id="quizGame">
                        <div class="quiz-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <span class="progress-text" id="progressText">1 / 10</span>
                        </div>
                        
                        <div class="question-container">
                            <div class="question-text" id="questionText"></div>
                            <div class="options-container" id="optionsContainer"></div>
                            <div class="question-explanation hidden" id="questionExplanation"></div>
                        </div>
                        
                        <div class="quiz-actions">
                            <button class="btn-secondary" id="nextBtn" onclick="Quiz.nextQuestion()" style="display: none;">Következő kérdés</button>
                        </div>
                    </div>
                    
                    <div class="quiz-results hidden" id="quizResults">
                        <!-- Results will be dynamically generated -->
                    </div>
                </div>
            </div>
        `;
    }

    startQuiz(category = null, questionCount = null) {
        const categorySelect = document.getElementById('categorySelect');
        const questionCountSelect = document.getElementById('questionCount');
        
        category = category || categorySelect?.value || 'random';
        questionCount = questionCount || parseInt(questionCountSelect?.value) || 10;

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
            if (window.App) {
                window.App.showNotification('warning', 'Nincs kérdés', 'Ehhez a kategóriához nincsenek kérdések');
            }
            return false;
        }

        // Shuffle and select questions
        const shuffled = this.shuffleArray([...allQuestions]);
        this.currentQuiz = shuffled.slice(0, Math.min(questionCount, shuffled.length));
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.timeStart = Date.now();

        // Hide setup, show game
        document.getElementById('quizSetup').classList.add('hidden');
        document.getElementById('quizGame').classList.remove('hidden');
        document.getElementById('quizResults').classList.add('hidden');

        this.renderQuestion();
        return true;
    }

    renderQuestion() {
        if (this.currentQuestion >= this.currentQuiz.length) {
            this.showResults();
            return;
        }

        const question = this.currentQuiz[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.currentQuiz.length) * 100;

        // Update progress
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${this.currentQuestion + 1} / ${this.currentQuiz.length}`;

        // Render question
        const questionText = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        const explanationDiv = document.getElementById('questionExplanation');
        const nextBtn = document.getElementById('nextBtn');

        if (questionText) questionText.textContent = question.question;
        if (nextBtn) nextBtn.style.display = 'none';
        if (explanationDiv) explanationDiv.classList.add('hidden');

        if (optionsContainer) {
            optionsContainer.innerHTML = question.options.map((option, index) => `
                <button class="option-btn" data-index="${index}" onclick="Quiz.selectAnswer(${index})">
                    <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${option}</span>
                </button>
            `).join('');
        }
    }

    selectAnswer(selectedIndex) {
        const question = this.currentQuiz[this.currentQuestion];
        const isCorrect = selectedIndex === question.correct;
        
        // Record answer
        this.answers.push({
            question: question.question,
            selected: selectedIndex,
            correct: question.correct,
            isCorrect: isCorrect,
            options: question.options,
            explanation: question.explanation
        });

        if (isCorrect) {
            this.score++;
        }

        // Update option buttons
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            btn.disabled = true;
            if (index === question.correct) {
                btn.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Show explanation
        const explanationDiv = document.getElementById('questionExplanation');
        if (explanationDiv) {
            explanationDiv.innerHTML = `
                <div class="explanation-content">
                    <h4>📚 Magyarázat</h4>
                    <p>${question.explanation}</p>
                </div>
            `;
            explanationDiv.classList.remove('hidden');
        }

        // Show next button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.style.display = 'block';
            if (this.currentQuestion === this.currentQuiz.length - 1) {
                nextBtn.textContent = 'Eredmények megtekintése';
            }
        }

        // Track answer for analytics
        if (window.App) {
            window.App.trackAnalytics('quiz_answer', {
                question: this.currentQuestion + 1,
                correct: isCorrect,
                category: question.category || 'general'
            });
        }
    }

    nextQuestion() {
        this.currentQuestion++;
        this.renderQuestion();
    }

    showResults() {
        const timeElapsed = Date.now() - this.timeStart;
        const percentage = Math.round((this.score / this.currentQuiz.length) * 100);
        
        // Hide game, show results
        document.getElementById('quizGame').classList.add('hidden');
        document.getElementById('quizResults').classList.remove('hidden');

        const resultsContainer = document.getElementById('quizResults');
        resultsContainer.innerHTML = this.generateResultsHTML(percentage, timeElapsed);

        // Save quiz result
        this.saveQuizResult(percentage, timeElapsed);

        // Track completion
        if (window.App) {
            window.App.trackAnalytics('quiz_completed', {
                score: this.score,
                total: this.currentQuiz.length,
                percentage: percentage,
                timeElapsed: timeElapsed
            });
        }
    }

    generateResultsHTML(percentage, timeElapsed) {
        const timeFormatted = this.formatTime(timeElapsed);
        const feedback = this.getFeedback(percentage);
        
        return `
            <div class="results-header">
                <h2>🎉 Kvíz befejezve!</h2>
            </div>
            
            <div class="score-display">
                <div class="score-circle">
                    <div class="score-percentage">${percentage}%</div>
                    <div class="score-fraction">${this.score}/${this.currentQuiz.length}</div>
                </div>
            </div>
            
            <div class="results-stats">
                <div class="stat-item">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${this.score}</div>
                    <div class="stat-label">Helyes válasz</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">❌</div>
                    <div class="stat-value">${this.currentQuiz.length - this.score}</div>
                    <div class="stat-label">Hibás válasz</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">${timeFormatted}</div>
                    <div class="stat-label">Idő</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${percentage}%</div>
                    <div class="stat-label">Pontszám</div>
                </div>
            </div>
            
            <div class="results-feedback">
                <h3>${feedback.title}</h3>
                <p>${feedback.message}</p>
            </div>
            
            <div class="results-actions">
                <button class="btn-primary" onclick="Quiz.restartQuiz()">🔄 Új kvíz</button>
                <button class="btn-secondary" onclick="Quiz.reviewAnswers()">📋 Válaszok áttekintése</button>
                <button class="btn-secondary" onclick="Quiz.shareResults()">📤 Eredmény megosztása</button>
            </div>
            
            <div class="detailed-results" id="detailedResults" style="display: none;">
                <h4>📝 Részletes eredmények</h4>
                <div class="answer-review">
                    ${this.generateAnswerReview()}
                </div>
            </div>
        `;
    }

    generateAnswerReview() {
        return this.answers.map((answer, index) => `
            <div class="answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <div class="answer-question">
                    <strong>${index + 1}. ${answer.question}</strong>
                </div>
                <div class="answer-details">
                    <div class="selected-answer">
                        <strong>Te válaszod:</strong> ${String.fromCharCode(65 + answer.selected)} - ${answer.options[answer.selected]}
                    </div>
                    <div class="correct-answer">
                        <strong>Helyes válasz:</strong> ${String.fromCharCode(65 + answer.correct)} - ${answer.options[answer.correct]}
                    </div>
                    <div class="explanation">
                        <strong>Magyarázat:</strong> ${answer.explanation}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getFeedback(percentage) {
        if (percentage >= 90) {
            return {
                title: "🏆 Kiváló!",
                message: "Fantasztikus teljesítmény! Mesterien ismered a webfejlesztést."
            };
        } else if (percentage >= 80) {
            return {
                title: "🎖️ Nagyon jó!",
                message: "Remek eredmény! Csak néhány apróságot érdemes még átnézni."
            };
        } else if (percentage >= 70) {
            return {
                title: "👍 Jó!",
                message: "Jó alapokkal rendelkezel, de van még mit tanulni."
            };
        } else if (percentage >= 50) {
            return {
                title: "📚 Közepes",
                message: "Nem rossz, de érdemes több gyakorlással mélyíteni a tudást."
            };
        } else {
            return {
                title: "💪 Gyakorolj még!",
                message: "Ne izgulj, mindenkinek időbe telik. Gyakorolj még és próbáld újra!"
            };
        }
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${seconds}s`;
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    restartQuiz() {
        // Reset quiz state
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.timeStart = null;

        // Show setup, hide others
        document.getElementById('quizSetup').classList.remove('hidden');
        document.getElementById('quizGame').classList.add('hidden');
        document.getElementById('quizResults').classList.add('hidden');
    }

    reviewAnswers() {
        const detailedResults = document.getElementById('detailedResults');
        if (detailedResults) {
            if (detailedResults.style.display === 'none') {
                detailedResults.style.display = 'block';
            } else {
                detailedResults.style.display = 'none';
            }
        }
    }

    shareResults() {
        const percentage = Math.round((this.score / this.currentQuiz.length) * 100);
        const shareText = `🧠 Web Dev Pro Kvíz eredményem: ${this.score}/${this.currentQuiz.length} (${percentage}%)!\n\nTeszteld te is a tudásod: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Web Dev Pro - Kvíz eredmény',
                text: shareText,
                url: window.location.href
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                if (window.App) {
                    window.App.showNotification('success', 'Eredmény másolva', 'Az eredmény a vágólapra került');
                }
            });
        } else {
            // Fallback
            prompt('Másold ki az eredményt:', shareText);
        }
    }

    saveQuizResult(percentage, timeElapsed) {
        try {
            const result = {
                id: Date.now(),
                score: this.score,
                total: this.currentQuiz.length,
                percentage: percentage,
                timeElapsed: timeElapsed,
                date: new Date().toISOString(),
                answers: this.answers
            };

            const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
            existingResults.push(result);
            
            // Keep only last 50 results
            if (existingResults.length > 50) {
                existingResults.splice(0, existingResults.length - 50);
            }
            
            localStorage.setItem('quizResults', JSON.stringify(existingResults));
        } catch (error) {
            console.warn('Failed to save quiz result:', error);
        }
    }

    getQuizHistory() {
        try {
            return JSON.parse(localStorage.getItem('quizResults') || '[]');
        } catch (error) {
            console.warn('Failed to load quiz history:', error);
            return [];
        }
    }

    getQuizStats() {
        const history = this.getQuizHistory();
        if (history.length === 0) {
            return {
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                totalTime: 0
            };
        }

        const totalQuizzes = history.length;
        const averageScore = Math.round(
            history.reduce((sum, result) => sum + result.percentage, 0) / totalQuizzes
        );
        const bestScore = Math.max(...history.map(result => result.percentage));
        const totalTime = history.reduce((sum, result) => sum + result.timeElapsed, 0);

        return {
            totalQuizzes,
            averageScore,
            bestScore,
            totalTime: this.formatTime(totalTime)
        };
    }

    // Static methods for global access
    static startQuiz(category, questionCount) {
        if (window.activeQuiz) {
            window.activeQuiz.startQuiz(category, questionCount);
        }
    }

    static selectAnswer(index) {
        if (window.activeQuiz) {
            window.activeQuiz.selectAnswer(index);
        }
    }

    static nextQuestion() {
        if (window.activeQuiz) {
            window.activeQuiz.nextQuestion();
        }
    }

    static restartQuiz() {
        if (window.activeQuiz) {
            window.activeQuiz.restartQuiz();
        }
    }

    static reviewAnswers() {
        if (window.activeQuiz) {
            window.activeQuiz.reviewAnswers();
        }
    }

    static shareResults() {
        if (window.activeQuiz) {
            window.activeQuiz.shareResults();
        }
    }
}

// Make Quiz available globally
window.Quiz = QuizSystem;