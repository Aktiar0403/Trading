import { Helpers } from '../utils/helpers.js';
import { ScoringEngine } from '../assessment/scoring.js';

export class ResultsRenderer {
    static renderResults(questions, answers, assessmentType) {
        const overallScore = ScoringEngine.calculateOverallScore(questions, answers);
        const aspectScores = ScoringEngine.calculateAspectScores(questions, answers);
        const recommendations = ScoringEngine.generateRecommendations(overallScore, aspectScores);
        const scoreCategory = Helpers.calculateScoreCategory(overallScore);

        return `
            <div class="results-header text-center">
                <h2>Your ${this.getAssessmentTypeName(assessmentType)} Results</h2>
                <p>Completed on ${Helpers.formatDate(new Date())}</p>
                
                <div class="score-display">${overallScore}%</div>
                <div class="score-category ${scoreCategory.class}">${scoreCategory.label}</div>
            </div>

            <div class="results-breakdown mt-3">
                <h3>Detailed Breakdown</h3>
                ${this.renderAspectScores(aspectScores)}
            </div>

            <div class="recommendations mt-3">
                <h3>Recommendations for Improvement</h3>
                <div class="recommendations-list">
                    ${recommendations.map(rec => 
                        `<div class="recommendation-item">${rec}</div>`
                    ).join('')}
                </div>
            </div>

            <div class="results-summary mt-3">
                <h3>Assessment Summary</h3>
                <p>You completed ${questions.length} questions covering key aspects of trading psychology. 
                Focus on implementing the recommendations above to improve your trading performance.</p>
            </div>
        `;
    }

    static renderAspectScores(aspectScores) {
        return Object.entries(aspectScores).map(([aspect, score]) => {
            const category = Helpers.calculateScoreCategory(score);
            return `
                <div class="aspect-score mb-2">
                    <div class="aspect-header" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>${aspect}</span>
                        <span>${score}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${score}%; background: var(--${
                            category.class === 'score-high' ? 'success' : 
                            category.class === 'score-medium' ? 'warning' : 'error'
                        }-color)"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    static getAssessmentTypeName(assessmentType) {
        const names = {
            full: 'Comprehensive Assessment',
            quick: 'Quick Assessment',
            risk: 'Risk Tolerance Assessment'
        };
        return names[assessmentType] || 'Assessment';
    }

    static renderHistory(assessments) {
        if (assessments.length === 0) {
            return '<p class="text-center">No assessment history found.</p>';
        }

        return `
            <div class="history-list">
                ${assessments.map(assessment => `
                    <div class="history-item card mb-2">
                        <div class="history-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h4 style="margin: 0;">${this.getAssessmentTypeName(assessment.type)}</h4>
                            <span class="score-badge ${Helpers.calculateScoreCategory(assessment.score).class}" style="padding: 0.25rem 0.75rem; border-radius: 15px; font-weight: 600;">
                                ${assessment.score}%
                            </span>
                        </div>
                        <p class="history-date" style="color: var(--text-secondary); margin-bottom: 1rem;">${Helpers.formatDate(assessment.timestamp)}</p>
                        <button class="btn-secondary view-details-btn" data-id="${assessment.id}" style="width: 100%;">
                            View Details
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}