import { ChartManager } from '../ui/chart-manager.js';

export class LiveTradingMonitor {
    constructor() {
        this.chartManager = new ChartManager();
        this.isMonitoring = false;
        this.monitorInterval = null;
        this.currentSession = null;
        this.psychologyData = [];
    }

    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.currentSession = {
            startTime: new Date(),
            psychologySnapshots: [],
            trades: []
        };

        // Initialize with baseline data
        this.initializeBaselineData();

        // Start periodic data collection
        this.monitorInterval = setInterval(() => {
            this.collectPsychologyData();
        }, 5000); // Collect data every 5 seconds

        console.log('Live trading psychology monitoring started');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }

        this.generateSessionReport();
        console.log('Live trading psychology monitoring stopped');
    }

    initializeBaselineData() {
        const baseline = {
            confidence: 50,
            stressLevel: 30,
            focusLevel: 70,
            riskTolerance: 60,
            emotionalState: 'neutral',
            timestamp: new Date()
        };

        this.psychologyData.push(baseline);
        this.currentSession.psychologySnapshots.push(baseline);
    }

    collectPsychologyData() {
        if (!this.isMonitoring) return;

        // Simulate real data collection (in real app, this would come from user input or biometrics)
        const newData = {
            confidence: Math.max(0, Math.min(100, this.psychologyData[this.psychologyData.length - 1].confidence + (Math.random() * 10 - 5))),
            stressLevel: Math.max(0, Math.min(100, this.psychologyData[this.psychologyData.length - 1].stressLevel + (Math.random() * 8 - 4))),
            focusLevel: Math.max(0, Math.min(100, this.psychologyData[this.psychologyData.length - 1].focusLevel + (Math.random() * 6 - 3))),
            riskTolerance: Math.max(0, Math.min(100, this.psychologyData[this.psychologyData.length - 1].riskTolerance + (Math.random() * 4 - 2))),
            emotionalState: this.calculateEmotionalState(),
            timestamp: new Date()
        };

        this.psychologyData.push(newData);
        this.currentSession.psychologySnapshots.push(newData);

        // Update charts
        this.chartManager.updateLiveData('confidence', newData.confidence);
        this.chartManager.updateLiveData('stressLevel', newData.stressLevel);
        this.chartManager.updateLiveData('focusLevel', newData.focusLevel);

        // Check for psychology alerts
        this.checkForAlerts(newData);
    }

    calculateEmotionalState() {
        const lastData = this.psychologyData[this.psychologyData.length - 1];
        
        if (lastData.confidence > 70 && lastData.stressLevel < 30) return 'confident';
        if (lastData.stressLevel > 70) return 'stressed';
        if (lastData.confidence < 30) return 'anxious';
        if (lastData.focusLevel > 80) return 'focused';
        return 'neutral';
    }

    checkForAlerts(currentData) {
        const alerts = [];

        if (currentData.stressLevel > 80) {
            alerts.push({
                type: 'warning',
                message: 'High stress level detected. Consider taking a break.',
                level: 'high',
                metric: 'stressLevel',
                value: currentData.stressLevel
            });
        }

        if (currentData.confidence < 20) {
            alerts.push({
                type: 'warning',
                message: 'Low confidence detected. Review your trading plan.',
                level: 'high',
                metric: 'confidence',
                value: currentData.confidence
            });
        }

        if (currentData.focusLevel < 40) {
            alerts.push({
                type: 'info',
                message: 'Focus level is decreasing. Minimize distractions.',
                level: 'medium',
                metric: 'focusLevel',
                value: currentData.focusLevel
            });
        }

        // Trigger alert events
        alerts.forEach(alert => {
            this.triggerAlert(alert);
        });
    }

    triggerAlert(alert) {
        // Create alert notification
        const alertEvent = new CustomEvent('psychologyAlert', {
            detail: alert
        });
        document.dispatchEvent(alertEvent);

        // Visual alert (you can enhance this with toast notifications)
        console.warn(`Psychology Alert: ${alert.message}`);
    }

    recordTrade(tradeData) {
        if (!this.isMonitoring) return;

        const trade = {
            ...tradeData,
            psychologySnapshot: this.getCurrentPsychologySnapshot(),
            timestamp: new Date()
        };

        this.currentSession.trades.push(trade);

        // Add trade marker to charts
        this.chartManager.addTradeMarker(
            trade.timestamp.toLocaleTimeString(),
            trade.type,
            trade.outcome
        );

        // Analyze psychology impact of trade
        this.analyzeTradePsychologyImpact(trade);
    }

    getCurrentPsychologySnapshot() {
        return this.psychologyData[this.psychologyData.length - 1];
    }

    analyzeTradePsychologyImpact(trade) {
        const impact = {
            tradeId: trade.id,
            preTradePsychology: trade.psychologySnapshot,
            psychologyChanges: this.calculatePsychologyChanges(trade)
        };

        console.log('Trade psychology impact:', impact);
        return impact;
    }

    calculatePsychologyChanges(trade) {
        // Calculate how the trade affected psychology metrics
        // This would be more sophisticated in a real implementation
        return {
            confidenceChange: trade.outcome === 'win' ? 5 : -10,
            stressChange: trade.outcome === 'win' ? -5 : 15,
            focusChange: -2 // Trading typically reduces focus temporarily
        };
    }

    generateSessionReport() {
        const report = {
            session: this.currentSession,
            summary: this.calculateSessionSummary(),
            recommendations: this.generateRecommendations()
        };

        // Save report to localStorage or send to server
        this.saveSessionReport(report);
        return report;
    }

    calculateSessionSummary() {
        const snapshots = this.currentSession.psychologySnapshots;
        
        return {
            averageConfidence: this.calculateAverage(snapshots, 'confidence'),
            averageStress: this.calculateAverage(snapshots, 'stressLevel'),
            averageFocus: this.calculateAverage(snapshots, 'focusLevel'),
            volatility: this.calculatePsychologyVolatility(snapshots),
            peakStress: Math.max(...snapshots.map(s => s.stressLevel)),
            lowestConfidence: Math.min(...snapshots.map(s => s.confidence))
        };
    }

    calculateAverage(snapshots, metric) {
        const sum = snapshots.reduce((acc, curr) => acc + curr[metric], 0);
        return sum / snapshots.length;
    }

    calculatePsychologyVolatility(snapshots) {
        // Calculate how much psychology metrics fluctuated during session
        const confidenceChanges = [];
        for (let i = 1; i < snapshots.length; i++) {
            confidenceChanges.push(Math.abs(snapshots[i].confidence - snapshots[i-1].confidence));
        }
        
        return confidenceChanges.reduce((a, b) => a + b, 0) / confidenceChanges.length;
    }

    generateRecommendations() {
        const summary = this.calculateSessionSummary();
        const recommendations = [];

        if (summary.averageStress > 60) {
            recommendations.push({
                type: 'stress_management',
                priority: 'high',
                message: 'Implement stress reduction techniques before trading sessions',
                actions: [
                    'Practice deep breathing exercises',
                    'Take regular breaks during trading',
                    'Set realistic profit/loss expectations'
                ]
            });
        }

        if (summary.volatility > 15) {
            recommendations.push({
                type: 'emotional_stability',
                priority: 'medium',
                message: 'Work on maintaining emotional consistency',
                actions: [
                    'Develop pre-trade routines',
                    'Use meditation to improve emotional control',
                    'Avoid trading during high emotional states'
                ]
            });
        }

        if (summary.averageConfidence < 40) {
            recommendations.push({
                type: 'confidence_building',
                priority: 'high',
                message: 'Focus on building trading confidence',
                actions: [
                    'Review and analyze successful trades',
                    'Paper trade to build skills without risk',
                    'Set smaller, achievable trading goals'
                ]
            });
        }

        return recommendations;
    }

    saveSessionReport(report) {
        const sessions = JSON.parse(localStorage.getItem('tradingSessions') || '[]');
        sessions.push({
            ...report,
            id: Date.now().toString(),
            endTime: new Date()
        });
        localStorage.setItem('tradingSessions', JSON.stringify(sessions));
    }

    getSessionHistory() {
        return JSON.parse(localStorage.getItem('tradingSessions') || '[]');
    }
}