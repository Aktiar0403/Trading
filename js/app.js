import { AssessmentEngine } from './assessment/assessment-engine.js';
import { ProgressBar } from './ui/progress-bar.js';
import { ResultsRenderer } from './ui/results-renderer.js';
import { ThemeManager } from './ui/theme-manager.js';
import { StorageManager } from './data/storage.js';

class TradingPsychologyApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.assessmentEngine = null;
        this.progressBar = null;
        this.themeManager = null;
        this.currentResults = null;
        
        this.initializeApp();
    }

    initializeApp() {
        try {
            this.cacheDomElements();
            this.initializeManagers();
            this.bindEventListeners();
            this.showScreen('welcome');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    cacheDomElements() {
        // Screens
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            assessment: document.getElementById('assessment-screen'),
            results: document.getElementById('results-screen'),
            dashboard: document.getElementById('dashboard-screen')
        };

        // Buttons
        this.startButtons = document.querySelectorAll('[data-assessment-type]');
        this.prevButton = document.getElementById('prev-btn');
        this.nextButton = document.getElementById('next-btn');
        this.retakeButton = document.getElementById('retake-btn');
        this.detailedReportButton = document.getElementById('detailed-report-btn');
        this.saveResultsButton = document.getElementById('save-results-btn');
        this.backToWelcomeButton = document.getElementById('back-to-welcome');
        this.viewHistoryButton = document.getElementById('view-history-btn');
        this.backToHomeButton = document.getElementById('back-to-home-btn');

        // Containers
        this.questionContainer = document.getElementById('question-container');
        this.resultsContent = document.getElementById('results-content');
        this.historyContainer = document.getElementById('history-container');
        this.assessmentTitle = document.getElementById('assessment-title');

        // Progress elements
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');

        // Validate required elements
        if (!this.progressFill || !this.progressText) {
            console.warn('Progress bar elements not found');
        }
    }

    initializeManagers() {
        try {
            // Initialize theme manager
            this.themeManager = new ThemeManager();
            this.themeManager.init();

            // Initialize progress bar
            if (this.progressFill && this.progressText) {
                this.progressBar = new ProgressBar(this.progressFill, this.progressText);
            }
        } catch (error) {
            console.error('Error initializing managers:', error);
        }
    }

    bindEventListeners() {
        // Start assessment buttons
        this.startButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const assessmentType = e.target.dataset.assessmentType;
                this.startAssessment(assessmentType);
            });
        });

        // Assessment navigation
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.previousQuestion());
        }
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextQuestion());
        }

        // Results actions
        if (this.retakeButton) {
            this.retakeButton.addEventListener('click', () => this.retakeAssessment());
        }
        if (this.detailedReportButton) {
            this.detailedReportButton.addEventListener('click', () => this.showDetailedReport());
        }
        if (this.saveResultsButton) {
            this.saveResultsButton.addEventListener('click', () => this.saveResults());
        }

        // Navigation buttons
        if (this.backToWelcomeButton) {
            this.backToWelcomeButton.addEventListener('click', () => this.showScreen('welcome'));
        }
        if (this.viewHistoryButton) {
            this.viewHistoryButton.addEventListener('click', () => this.showScreen('dashboard'));
        }
        if (this.backToHomeButton) {
            this.backToHomeButton.addEventListener('click', () => this.showScreen('welcome'));
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentScreen === 'assessment') {
                this.showScreen('welcome');
            }
        });
    }

    startAssessment(assessmentType) {
        try {
            this.assessmentEngine = new AssessmentEngine(assessmentType);
            
            if (this.progressBar) {
                this.assessmentEngine.setProgressBar(this.progressBar);
            }
            
            this.assessmentEngine.setCallbacks(
                (index, answers) => this.onAssessmentProgress(index, answers),
                (questions, answers, type) => this.onAssessmentComplete(questions, answers, type)
            );

            this.assessmentEngine.start();
            this.showScreen('assessment');
            this.renderCurrentQuestion();
            this.updateNavigationButtons();
        } catch (error) {
            console.error('Error starting assessment:', error);
            alert('Error starting assessment. Please try again.');
        }
    }

    renderCurrentQuestion() {
        if (!this.assessmentEngine || !this.questionContainer) return;

        const question = this.assessmentEngine.getCurrentQuestion();
        const currentAnswer = this.assessmentEngine.answers[this.assessmentEngine.currentQuestionIndex];

        this.questionContainer.innerHTML = `
            <div class="question-text">${question.text}</div>
            <div class="options-grid">
                ${question.options.map((option, index) => `
                    <div class="option ${currentAnswer === index ? 'selected' : ''}" 
                         data-index="${index}">
                        ${option.text}
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners to options
        this.questionContainer.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', (e) => {
                const answerIndex = parseInt(e.currentTarget.dataset.index);
                this.selectAnswer(answerIndex);
            });
        });
    }

    selectAnswer(answerIndex) {
        if (!this.assessmentEngine) return;

        this.assessmentEngine.answerCurrentQuestion(answerIndex);
        this.renderCurrentQuestion();
        this.updateNavigationButtons();
    }

    previousQuestion() {
        if (this.assessmentEngine && this.assessmentEngine.previousQuestion()) {
            this.renderCurrentQuestion();
            this.updateNavigationButtons();
        }
    }

    nextQuestion() {
        if (!this.assessmentEngine) return;

        if (!this.assessmentEngine.canProceed()) {
            alert('Please select an answer before proceeding.');
            return;
        }

        if (this.assessmentEngine.nextQuestion()) {
            this.renderCurrentQuestion();
            this.updateNavigationButtons();
        }
    }

    updateNavigationButtons() {
        if (!this.assessmentEngine || !this.prevButton || !this.nextButton) return;

        this.prevButton.disabled = !this.assessmentEngine.hasPrevious();
        
        if (this.assessmentEngine.isLastQuestion()) {
            this.nextButton.innerHTML = 'Submit <span class="nav-icon">✓</span>';
        } else {
            this.nextButton.innerHTML = 'Next <span class="nav-icon">→</span>';
        }
    }

    onAssessmentProgress(currentIndex, answers) {
        console.log(`Progress: ${currentIndex + 1}/${answers.length}`);
    }

    onAssessmentComplete(questions, answers, assessmentType) {
        try {
            const results = {
                questions,
                answers,
                type: assessmentType,
                score: this.calculateScore(questions, answers),
                timestamp: new Date().toISOString()
            };

            this.showResults(results);
        } catch (error) {
            console.error('Error completing assessment:', error);
            alert('Error calculating results. Please try again.');
        }
    }

    calculateScore(questions, answers) {
        let totalScore = 0;
        let maxScore = 0;

        answers.forEach((answer, index) => {
            if (answer !== null) {
                const question = questions[index];
                const optionValue = question.options[answer].value;
                totalScore += optionValue;
                maxScore += 4;
            }
        });

        return Math.round((totalScore / maxScore) * 100);
    }

    showResults(results) {
        if (!this.resultsContent) return;

        try {
            this.resultsContent.innerHTML = ResultsRenderer.renderResults(
                results.questions,
                results.answers,
                results.type
            );

            this.currentResults = results;
            this.showScreen('results');
        } catch (error) {
            console.error('Error showing results:', error);
            alert('Error displaying results. Please try again.');
        }
    }

    retakeAssessment() {
        if (this.currentResults) {
            this.startAssessment(this.currentResults.type);
        } else {
            this.showScreen('welcome');
        }
    }

    showDetailedReport() {
        alert('Detailed report feature coming soon!');
    }

    saveResults() {
        if (this.currentResults) {
            try {
                const id = StorageManager.saveAssessmentResult(this.currentResults);
                alert('Results saved successfully!');
            } catch (error) {
                console.error('Error saving results:', error);
                alert('Error saving results. Please try again.');
            }
        }
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });

        // Show target screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }

        // Screen-specific initialization
        if (screenName === 'dashboard') {
            this.loadAssessmentHistory();
        }
    }

    loadAssessmentHistory() {
        if (!this.historyContainer) return;

        try {
            const assessments = StorageManager.getAssessmentResults();
            this.historyContainer.innerHTML = ResultsRenderer.renderHistory(assessments);

            // Add event listeners to view details buttons
            this.historyContainer.querySelectorAll('.view-details-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const assessmentId = e.target.dataset.id;
                    this.viewAssessmentDetails(assessmentId);
                });
            });
        } catch (error) {
            console.error('Error loading assessment history:', error);
            this.historyContainer.innerHTML = '<p class="text-center">Error loading assessment history.</p>';
        }
    }

    viewAssessmentDetails(assessmentId) {
        try {
            const assessment = StorageManager.getAssessmentResult(assessmentId);
            if (assessment) {
                this.currentResults = assessment;
                this.showResults(assessment);
            }
        } catch (error) {
            console.error('Error viewing assessment details:', error);
            alert('Error loading assessment details.');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TradingPsychologyApp();
});