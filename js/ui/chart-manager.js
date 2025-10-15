export class ChartManager {
    constructor() {
        this.charts = new Map();
        this.liveData = {
            emotions: [],
            confidence: [],
            riskTolerance: [],
            stressLevel: [],
            focusLevel: [],
            timestamp: []
        };
    }

    createMindsetChart(canvasId, type = 'line') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element with id ${canvasId} not found`);
            return null;
        }

        // Destroy existing chart if it exists
        this.destroyChart(canvasId);

        const chart = new Chart(ctx, {
            type: type,
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Confidence Level',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Stress Level',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Focus Level',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Live Trading Mindset Analysis'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Intensity Level (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    createEmotionRadarChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Destroy existing chart if it exists
        this.destroyChart(canvasId);

        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Confidence', 'Discipline', 'Patience', 'Risk Awareness', 'Emotional Control', 'Focus'],
                datasets: [{
                    label: 'Current Mindset',
                    data: [50, 50, 50, 50, 50, 50],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    createPsychologyBreakdownChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Destroy existing chart if it exists
        this.destroyChart(canvasId);

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Confident', 'Anxious', 'Focused', 'Distracted', 'Patient', 'Impulsive'],
                datasets: [{
                    data: [30, 20, 25, 10, 10, 5],
                    backgroundColor: [
                        '#10b981',
                        '#ef4444',
                        '#3b82f6',
                        '#f59e0b',
                        '#8b5cf6',
                        '#ec4899'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Psychology State Breakdown'
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    createPerformanceCorrelationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Destroy existing chart if it exists
        this.destroyChart(canvasId);

        const chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Trade Performance vs Confidence',
                    data: [
                        {x: 75, y: 2.5},
                        {x: 60, y: 1.2},
                        {x: 85, y: 3.1},
                        {x: 45, y: -1.5},
                        {x: 90, y: 2.8},
                        {x: 30, y: -2.2}
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3b82f6',
                    pointRadius: 8,
                    pointHoverRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Confidence vs Trade Performance'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Confidence: ${context.parsed.x}%, P&L: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Confidence Level (%)'
                        },
                        min: 0,
                        max: 100
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Trade Performance (%)'
                        }
                    }
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    updateLiveData(metric, value) {
        const timestamp = new Date().toLocaleTimeString();
        
        this.liveData[metric].push(value);
        this.liveData.timestamp.push(timestamp);

        // Keep only last 20 data points
        if (this.liveData[metric].length > 20) {
            this.liveData[metric].shift();
            this.liveData.timestamp.shift();
        }

        this.updateCharts();
    }

    updateCharts() {
        this.charts.forEach((chart, canvasId) => {
            if (canvasId === 'mindset-chart') {
                chart.data.labels = this.liveData.timestamp;
                chart.data.datasets[0].data = this.liveData.confidence;
                chart.data.datasets[1].data = this.liveData.stressLevel;
                chart.data.datasets[2].data = this.liveData.focusLevel;
            }
            chart.update('none');
        });
    }

    addTradeMarker(timestamp, tradeType, outcome) {
        this.charts.forEach((chart, canvasId) => {
            if (chart.options.plugins?.annotation) {
                // Add annotation for trade entry/exit
                const annotation = {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: timestamp,
                    borderColor: outcome === 'win' ? '#10b981' : '#ef4444',
                    borderWidth: 2,
                    label: {
                        display: true,
                        content: `${tradeType} - ${outcome}`,
                        position: 'start'
                    }
                };
                
                if (!chart.options.plugins.annotation.annotations) {
                    chart.options.plugins.annotation.annotations = [];
                }
                chart.options.plugins.annotation.annotations.push(annotation);
                chart.update();
            }
        });
    }

    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    destroyAllCharts() {
        this.charts.forEach((chart, canvasId) => {
            chart.destroy();
        });
        this.charts.clear();
    }

    // New method to check if chart exists
    hasChart(canvasId) {
        return this.charts.has(canvasId);
    }

    // New method to get existing chart
    getChart(canvasId) {
        return this.charts.get(canvasId);
    }
}