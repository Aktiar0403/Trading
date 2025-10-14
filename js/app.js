import { AssessmentEngine } from './assessment/assessment-engine.js';
import { ProgressBar } from './ui/progress-bar.js';
import { ResultsRenderer } from './ui/results-renderer.js';
import { ThemeManager } from './ui/theme-manager.js';
import { StorageManager } from './data/storage.js';
import { LiveTradingMonitor } from './trading/live-monitor.js';
import { ChartManager } from './ui/chart-manager.js';

class TradingPsychologyApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.assessmentEngine = null;
        this.progressBar = null;
        this.themeManager = null;
        this.liveMonitor = null;
        this.chartManager = null;
        this.currentResults = null;
        this.metricsInterval = null;
        
        this.initializeApp();
    }

    initializeApp() {
        try {
            this.cacheDomElements();
            this.initializeManagers();
            this.initializeAnalytics();
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
            dashboard: document.getElementById('dashboard-screen'),
            analytics: document.getElementById('analytics-screen')
        };

        // Welcome Screen Elements
        this.startButtons = document.querySelectorAll('[data-assessment-type]');
        this.viewHistoryButton = document.getElementById('view-history-btn');
        this.viewAnalyticsButton = document.getElementById('view-analytics-btn');

        // Assessment Screen Elements
        this.prevButton = document.getElementById('prev-btn');
        this.nextButton = document.getElementById('next-btn');
        this.questionContainer = document.getElementById('question-container');
        this.assessmentTitle = document.getElementById('assessment-title');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');

        // Results Screen Elements
        this.retakeButton = document.getElementById('retake-btn');
        this.detailedReportButton = document.getElementById('detailed-report-btn');
        this.saveResultsButton = document.getElementById('save-results-btn');
        this.backToHomeButton = document.getElementById('back-to-home-btn');
        this.resultsContent = document.getElementById('results-content');

        // Dashboard Screen Elements
        this.historyContainer = document.getElementById('history-container');
        this.backToWelcomeButton = document.getElementById('back-to-welcome');

        // Analytics Screen Elements
        this.startMonitorBtn = document.getElementById('start-monitor-btn');
        this.stopMonitorBtn = document.getElementById('stop-monitor-btn');
        this.addTradeBtn = document.getElementById('add-trade-btn');
        this.backFromAnalyticsBtn = document.getElementById('back-from-analytics');
        this.viewSessionHistoryBtn = document.getElementById('view-session-history');
        this.alertsContainer = document.getElementById('alerts-container');
        this.sessionMetrics = document.getElementById('session-metrics');

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

    initializeAnalytics() {
        this.liveMonitor = new LiveTradingMonitor();
        this.chartManager = new ChartManager();
    }

    bindEventListeners() {
        // Welcome Screen Events
        this.startButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const assessmentType = e.target.dataset.assessmentType;
                this.startAssessment(assessmentType);
            });
        });

        if (this.viewHistoryButton) {
            this.viewHistoryButton.addEventListener('click', () => this.showScreen('dashboard'));
        }

        if (this.viewAnalyticsButton) {
            this.viewAnalyticsButton.addEventListener('click', () => this.showAnalytics());
        }

        // Assessment Screen Events
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.previousQuestion());
        }

        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextQuestion());
        }

        // Results Screen Events
        if (this.retakeButton) {
            this.retakeButton.addEventListener('click', () => this.retakeAssessment());
        }

        if (this.detailedReportButton) {
            this.detailedReportButton.addEventListener('click', () => this.showDetailedReport());
        }

        if (this.saveResultsButton) {
            this.saveResultsButton.addEventListener('click', () => this.saveResults());
        }

        if (this.backToHomeButton) {
            this.backToHomeButton.addEventListener('click', () => this.showScreen('welcome'));
        }

        // Dashboard Screen Events
        if (this.backToWelcomeButton) {
            this.backToWelcomeButton.addEventListener('click', () => this.showScreen('welcome'));
        }

        // Analytics Screen Events
        if (this.startMonitorBtn) {
            this.startMonitorBtn.addEventListener('click', () => this.startPsychologyMonitoring());
        }

        if (this.stopMonitorBtn) {
            this.stopMonitorBtn.addEventListener('click', () => this.stopPsychologyMonitoring());
        }

        if (this.addTradeBtn) {
            this.addTradeBtn.addEventListener('click', () => this.showTradeModal());
        }

        if (this.backFromAnalyticsBtn) {
            this.backFromAnalyticsBtn.addEventListener('click', () => this.showScreen('welcome'));
        }

        if (this.viewSessionHistoryBtn) {
            this.viewSessionHistoryBtn.addEventListener('click', () => this.showSessionHistory());
        }

        // Psychology Alert Events
        document.addEventListener('psychologyAlert', (e) => {
            this.handlePsychologyAlert(e.detail);
        });

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentScreen === 'assessment') {
                this.showScreen('welcome');
            }
            
            // Space bar to select option in assessment
            if (e.key === ' ' && this.currentScreen === 'assessment') {
                e.preventDefault();
                this.toggleOptionSelection();
            }
            
            // Arrow key navigation in assessment
            if (this.currentScreen === 'assessment') {
                if (e.key === 'ArrowLeft') {
                    this.previousQuestion();
                } else if (e.key === 'ArrowRight') {
                    this.nextQuestion();
                }
            }
        });
    }

    // Assessment Methods
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
            this.showError('Error starting assessment. Please try again.');
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
                         data-index="${index}"
                         tabindex="0"
                         role="button"
                         aria-label="Select option: ${option.text}">
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
            
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const answerIndex = parseInt(e.currentTarget.dataset.index);
                    this.selectAnswer(answerIndex);
                }
            });
        });
    }

    selectAnswer(answerIndex) {
        if (!this.assessmentEngine) return;

        this.assessmentEngine.answerCurrentQuestion(answerIndex);
        this.renderCurrentQuestion();
        this.updateNavigationButtons();
    }

    toggleOptionSelection() {
        // Auto-select first option if none selected (for space bar quick selection)
        const options = this.questionContainer.querySelectorAll('.option');
        if (options.length > 0 && !this.assessmentEngine.canProceed()) {
            this.selectAnswer(0);
        }
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
            this.showError('Please select an answer before proceeding.');
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
            this.nextButton.setAttribute('aria-label', 'Submit assessment');
        } else {
            this.nextButton.innerHTML = 'Next <span class="nav-icon">→</span>';
            this.nextButton.setAttribute('aria-label', 'Next question');
        }
    }

    onAssessmentProgress(currentIndex, answers) {
        console.log(`Progress: ${currentIndex + 1}/${answers.length}`);
        
        // Update progress for screen readers
        const progressElement = document.getElementById('progress-text');
        if (progressElement) {
            progressElement.setAttribute('aria-live', 'polite');
        }
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
            this.showError('Error calculating results. Please try again.');
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
            
            // Announce results to screen readers
            this.announceToScreenReader(`Assessment completed. Your score is ${results.score} percent.`);
        } catch (error) {
            console.error('Error showing results:', error);
            this.showError('Error displaying results. Please try again.');
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
        // Enhanced detailed report with charts
        this.showScreen('analytics');
        this.startPsychologyMonitoring();
    }

    saveResults() {
        if (this.currentResults) {
            try {
                const id = StorageManager.saveAssessmentResult(this.currentResults);
                this.showSuccess('Results saved successfully!');
            } catch (error) {
                console.error('Error saving results:', error);
                this.showError('Error saving results. Please try again.');
            }
        }
    }

    // Analytics Methods
    startPsychologyMonitoring() {
        if (!this.liveMonitor) return;

        try {
            this.liveMonitor.startMonitoring();
            this.startMonitorBtn.disabled = true;
            this.stopMonitorBtn.disabled = false;
            this.addTradeBtn.disabled = false;

            // Initialize charts
            this.initializeCharts();

            // Start updating session metrics
            this.startMetricsUpdate();

            this.showSuccess('Psychology monitoring started successfully!');
        } catch (error) {
            console.error('Error starting psychology monitoring:', error);
            this.showError('Error starting psychology monitoring.');
        }
    }

    stopPsychologyMonitoring() {
        if (!this.liveMonitor) return;

        try {
            this.liveMonitor.stopMonitoring();
            this.startMonitorBtn.disabled = false;
            this.stopMonitorBtn.disabled = true;
            this.addTradeBtn.disabled = true;

            // Stop metrics update
            this.stopMetricsUpdate();

            // Generate and show session report
            const report = this.liveMonitor.generateSessionReport();
            this.showSessionReport(report);

            this.showSuccess('Psychology monitoring stopped. Session report generated.');
        } catch (error) {
            console.error('Error stopping psychology monitoring:', error);
            this.showError('Error stopping psychology monitoring.');
        }
    }

    initializeCharts() {
        if (!this.chartManager) return;

        try {
            this.chartManager.createMindsetChart('mindset-chart');
            this.chartManager.createEmotionRadarChart('radar-chart');
            this.chartManager.createPsychologyBreakdownChart('breakdown-chart');
            this.chartManager.createPerformanceCorrelationChart('correlation-chart');
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    startMetricsUpdate() {
        this.metricsInterval = setInterval(() => {
            this.updateSessionMetrics();
        }, 2000);
    }

    stopMetricsUpdate() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
    }

    updateSessionMetrics() {
        if (!this.liveMonitor || !this.liveMonitor.isMonitoring || !this.sessionMetrics) return;

        const currentData = this.liveMonitor.getCurrentPsychologySnapshot();
        if (!currentData) return;

        this.sessionMetrics.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${Math.round(currentData.confidence)}%</div>
                    <div class="metric-label">Confidence</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${Math.round(currentData.stressLevel)}%</div>
                    <div class="metric-label">Stress Level</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${Math.round(currentData.focusLevel)}%</div>
                    <div class="metric-label">Focus Level</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${this.capitalizeFirstLetter(currentData.emotionalState)}</div>
                    <div class="metric-label">Emotional State</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${Math.round(currentData.riskTolerance)}%</div>
                    <div class="metric-label">Risk Tolerance</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${this.liveMonitor.currentSession?.trades?.length || 0}</div>
                    <div class="metric-label">Trades Recorded</div>
                </div>
            </div>
        `;
    }

    handlePsychologyAlert(alert) {
        if (!this.alertsContainer) return;

        const alertClass = `alert-${alert.level}`;
        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${alertClass}`;
        alertElement.innerHTML = `
            <strong>${alert.type.toUpperCase()} ALERT</strong>
            <p>${alert.message}</p>
            <small>${this.capitalizeFirstLetter(alert.metric)}: ${alert.value}% - ${new Date().toLocaleTimeString()}</small>
        `;

        this.alertsContainer.insertBefore(alertElement, this.alertsContainer.firstChild);

        // Show browser notification if available
        this.showBrowserNotification(alert);

        // Auto-remove alert after 15 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 15000);
    }

    showTradeModal() {
        if (!this.liveMonitor || !this.liveMonitor.isMonitoring) {
            this.showError('Please start monitoring first.');
            return;
        }

        // Create a simple modal for trade recording
        const tradeHtml = `
            <div class="trade-modal active">
                <div class="trade-modal-content card">
                    <h3>Record Trade</h3>
                    <div class="form-group">
                        <label for="trade-type">Trade Type:</label>
                        <select id="trade-type" class="form-control">
                            <option value="buy">Buy/Long</option>
                            <option value="sell">Sell/Short</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="trade-outcome">Outcome:</label>
                        <select id="trade-outcome" class="form-control">
                            <option value="win">Win</option>
                            <option value="loss">Loss</option>
                            <option value="break-even">Break Even</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="trade-notes">Notes (optional):</label>
                        <textarea id="trade-notes" class="form-control" rows="3" placeholder="Any additional notes about this trade..."></textarea>
                    </div>
                    <div class="modal-actions">
                        <button id="confirm-trade-btn" class="btn-primary">Record Trade</button>
                        <button id="cancel-trade-btn" class="btn-secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.querySelector('.trade-modal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', tradeHtml);

        // Add event listeners to modal buttons
        document.getElementById('confirm-trade-btn').addEventListener('click', () => {
            this.confirmTradeRecording();
        });

        document.getElementById('cancel-trade-btn').addEventListener('click', () => {
            this.closeTradeModal();
        });

        // Close modal on backdrop click
        document.querySelector('.trade-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('trade-modal')) {
                this.closeTradeModal();
            }
        });
    }

    confirmTradeRecording() {
        const tradeType = document.getElementById('trade-type').value;
        const outcome = document.getElementById('trade-outcome').value;
        const notes = document.getElementById('trade-notes').value;

        if (tradeType && outcome) {
            this.liveMonitor.recordTrade({
                type: tradeType,
                outcome: outcome,
                notes: notes,
                id: Date.now().toString(),
                timestamp: new Date()
            });

            this.showSuccess(`Trade recorded: ${tradeType} - ${outcome}`);
            this.closeTradeModal();
        } else {
            this.showError('Please select trade type and outcome.');
        }
    }

    closeTradeModal() {
        const modal = document.querySelector('.trade-modal');
        if (modal) {
            modal.remove();
        }
    }

    showSessionHistory() {
        const sessions = this.liveMonitor.getSessionHistory();
        
        if (sessions.length === 0) {
            this.showInfo('No trading sessions recorded yet.');
            return;
        }

        let historyHtml = '<div class="sessions-list">';
        sessions.forEach(session => {
            const sessionDate = new Date(session.session.startTime).toLocaleDateString();
            const duration = this.calculateSessionDuration(session.session.startTime, session.endTime);
            
            historyHtml += `
                <div class="session-item card">
                    <h4>Session - ${sessionDate}</h4>
                    <p><strong>Duration:</strong> ${duration}</p>
                    <p><strong>Average Confidence:</strong> ${Math.round(session.summary.averageConfidence)}%</p>
                    <p><strong>Average Stress:</strong> ${Math.round(session.summary.averageStress)}%</p>
                    <p><strong>Trades:</strong> ${session.session.trades.length}</p>
                    <button class="btn-secondary view-session-details" data-session-id="${session.id}">
                        View Details
                    </button>
                </div>
            `;
        });
        historyHtml += '</div>';

        // Show in a modal or replace current content
        this.showModal('Trading Session History', historyHtml);

        // Add event listeners to view details buttons
        document.querySelectorAll('.view-session-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const sessionId = e.target.dataset.sessionId;
                this.viewSessionDetails(sessionId);
            });
        });
    }

    viewSessionDetails(sessionId) {
        const sessions = this.liveMonitor.getSessionHistory();
        const session = sessions.find(s => s.id === sessionId);
        
        if (!session) {
            this.showError('Session not found.');
            return;
        }

        let detailsHtml = `
            <div class="session-details">
                <p><strong>Start Time:</strong> ${new Date(session.session.startTime).toLocaleString()}</p>
                <p><strong>End Time:</strong> ${new Date(session.endTime).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${this.calculateSessionDuration(session.session.startTime, session.endTime)}</p>
                
                <h4>Psychology Summary</h4>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${Math.round(session.summary.averageConfidence)}%</div>
                        <div class="metric-label">Avg Confidence</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Math.round(session.summary.averageStress)}%</div>
                        <div class="metric-label">Avg Stress</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Math.round(session.summary.averageFocus)}%</div>
                        <div class="metric-label">Avg Focus</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Math.round(session.summary.volatility)}</div>
                        <div class="metric-label">Psychology Volatility</div>
                    </div>
                </div>

                <h4>Recommendations</h4>
                <div class="recommendations-list">
                    ${session.recommendations.map(rec => `
                        <div class="recommendation-item">
                            <strong>${rec.type.replace('_', ' ').toUpperCase()}</strong>
                            <p>${rec.message}</p>
                            <ul>
                                ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.showModal('Session Details', detailsHtml);
    }

    showSessionReport(report) {
        let reportHtml = `
            <div class="session-report">
                <h3>Trading Session Report</h3>
                <div class="report-summary">
                    <h4>Session Summary</h4>
                    <p><strong>Duration:</strong> ${this.calculateSessionDuration(report.session.startTime, new Date())}</p>
                    <p><strong>Total Trades:</strong> ${report.session.trades.length}</p>
                    <p><strong>Psychology Snapshots:</strong> ${report.session.psychologySnapshots.length}</p>
                </div>

                <div class="report-metrics">
                    <h4>Key Metrics</h4>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${Math.round(report.summary.averageConfidence)}%</div>
                            <div class="metric-label">Average Confidence</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${Math.round(report.summary.averageStress)}%</div>
                            <div class="metric-label">Average Stress</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${Math.round(report.summary.averageFocus)}%</div>
                            <div class="metric-label">Average Focus</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${Math.round(report.summary.volatility)}</div>
                            <div class="metric-label">Psychology Volatility</div>
                        </div>
                    </div>
                </div>

                <div class="report-recommendations">
                    <h4>Recommendations</h4>
                    ${report.recommendations.map(rec => `
                        <div class="recommendation-item">
                            <h5>${rec.type.replace('_', ' ').toUpperCase()} (${rec.priority} priority)</h5>
                            <p>${rec.message}</p>
                            <ul>
                                ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.showModal('Session Report', reportHtml);
    }

    // Utility Methods
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
        } else if (screenName === 'analytics') {
            this.alertsContainer.innerHTML = '';
            this.sessionMetrics.innerHTML = '<p>Start monitoring to see live metrics...</p>';
        }

        // Update document title
        document.title = this.getScreenTitle(screenName) + ' - Trading Psychology Assessment';
    }

    showAnalytics() {
        this.showScreen('analytics');
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
            this.showError('Error loading assessment details.');
        }
    }

    // Helper Methods
    calculateSessionDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const duration = end - start;
        
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getScreenTitle(screenName) {
        const titles = {
            welcome: 'Welcome',
            assessment: 'Assessment',
            results: 'Results',
            dashboard: 'History',
            analytics: 'Live Analytics'
        };
        return titles[screenName] || 'Trading Psychology';
    }

    // Notification Methods
    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.app-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `app-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = `
                <style>
                    .app-notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 1000;
                        min-width: 300px;
                        max-width: 500px;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        border-left: 4px solid #3b82f6;
                    }
                    .notification-error { border-left-color: #ef4444; }
                    .notification-success { border-left-color: #10b981; }
                    .notification-info { border-left-color: #3b82f6; }
                    .notification-content {
                        padding: 1rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .notification-close {
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0;
                        margin-left: 1rem;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    showBrowserNotification(alert) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Trading Psychology Alert', {
                body: alert.message,
                icon: '/favicon.ico'
            });
        }
    }

    showModal(title, content) {
        // Remove existing modal
        const existingModal = document.querySelector('.app-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHtml = `
            <div class="app-modal active">
                <div class="modal-backdrop"></div>
                <div class="modal-content card">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" aria-label="Close modal">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Add event listeners
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.closeModal();
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modal = document.querySelector('.app-modal');
        if (modal) {
            modal.remove();
        }
    }

    announceToScreenReader(message) {
    // Create or get the live region
    let liveRegion = document.getElementById('screen-reader-announce');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'screen-reader-announce';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.classList.add('sr-only'); // Use CSS class for hiding
        document.body.appendChild(liveRegion);
    }
    
    // Clear previous message and set new one
    liveRegion.textContent = '';
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TradingPsychologyApp();
});

// Request notification permission
if ('Notification' in window) {
    Notification.requestPermission();
}