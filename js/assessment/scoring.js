import { PSYCHOLOGICAL_ASPECTS } from '../utils/constants.js';
import { Helpers } from '../utils/helpers.js';

export class ScoringEngine {
    static calculateOverallScore(questions, answers) {
        let totalScore = 0;
        let maxScore = 0;

        answers.forEach((answer, index) => {
            if (answer !== null) {
                const question = questions[index];
                const optionValue = question.options[answer].value;
                totalScore += optionValue;
                maxScore += 4; // Maximum value per question
            }
        });

        return Math.round((totalScore / maxScore) * 100);
    }

    static calculateAspectScores(questions, answers) {
        const aspectScores = {};
        const aspectMaxScores = {};
        const aspectCounts = {};

        // Initialize
        Object.values(PSYCHOLOGICAL_ASPECTS).forEach(aspect => {
            aspectScores[aspect] = 0;
            aspectMaxScores[aspect] = 0;
            aspectCounts[aspect] = 0;
        });

        // Calculate scores per aspect
        answers.forEach((answer, index) => {
            if (answer !== null) {
                const question = questions[index];
                const optionValue = question.options[answer].value;
                
                aspectScores[question.aspect] += optionValue;
                aspectMaxScores[question.aspect] += 4;
                aspectCounts[question.aspect]++;
            }
        });

        // Calculate percentages
        const aspectPercentages = {};
        Object.keys(aspectScores).forEach(aspect => {
            if (aspectCounts[aspect] > 0) {
                aspectPercentages[aspect] = Math.round(
                    (aspectScores[aspect] / aspectMaxScores[aspect]) * 100
                );
            } else {
                aspectPercentages[aspect] = 0;
            }
        });

        return aspectPercentages;
    }

    static generateRecommendations(overallScore, aspectScores) {
        const recommendations = [];

        // Overall score recommendations
        if (overallScore < 60) {
            recommendations.push(
                "Develop a detailed trading plan with clear entry and exit criteria",
                "Practice risk management by never risking more than 1-2% per trade",
                "Keep a trading journal to record trades and emotional state",
                "Consider paper trading to build confidence without financial risk"
            );
        } else if (overallScore < 80) {
            recommendations.push(
                "Refine your trading plan to address any recurring issues",
                "Review your trading journal regularly to identify patterns",
                "Implement mindfulness practices to improve emotional control",
                "Set specific goals for both profitability and psychological improvement"
            );
        } else {
            recommendations.push(
                "Continue following your proven trading plan and processes",
                "Consider mentoring other traders to reinforce your knowledge",
                "Explore advanced strategies that align with your psychological strengths",
                "Maintain your trading journal to continue tracking performance"
            );
        }

        // Aspect-specific recommendations
        Object.entries(aspectScores).forEach(([aspect, score]) => {
            if (score < 60) {
                recommendations.push(...this.getAspectSpecificRecommendations(aspect));
            }
        });

        return [...new Set(recommendations)]; // Remove duplicates
    }

    static getAspectSpecificRecommendations(aspect) {
        const recommendations = {
            [PSYCHOLOGICAL_ASPECTS.RISK_MANAGEMENT]: [
                "Implement strict position sizing rules",
                "Always use stop-loss orders",
                "Diversify your trading positions"
            ],
            [PSYCHOLOGICAL_ASPECTS.EMOTIONAL_CONTROL]: [
                "Practice meditation or breathing exercises",
                "Take breaks during trading sessions",
                "Avoid trading when emotionally compromised"
            ],
            [PSYCHOLOGICAL_ASPECTS.DISCIPLINE]: [
                "Create and stick to a trading checklist",
                "Avoid deviating from your trading plan",
                "Set specific criteria for trade entries and exits"
            ],
            [PSYCHOLOGICAL_ASPECTS.PREPARATION]: [
                "Develop a pre-market routine",
                "Review economic calendars regularly",
                "Keep up with market news and analysis"
            ],
            [PSYCHOLOGICAL_ASPECTS.MINDSET]: [
                "Focus on process over outcomes",
                "Accept losses as part of trading",
                "Celebrate good decisions regardless of outcome"
            ]
        };

        return recommendations[aspect] || [];
    }
}