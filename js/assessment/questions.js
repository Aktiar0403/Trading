import { PSYCHOLOGICAL_ASPECTS } from '../utils/constants.js';

export const QUESTION_SETS = {
    full: [
        {
            id: 1,
            text: "When a trade goes against you, what is your typical reaction?",
            aspect: PSYCHOLOGICAL_ASPECTS.EMOTIONAL_CONTROL,
            options: [
                { text: "I immediately close the position to limit losses", value: 1 },
                { text: "I review my analysis and adjust my stop loss if needed", value: 3 },
                { text: "I add to my position to average down", value: 2 },
                { text: "I stick to my original plan without emotional reaction", value: 4 }
            ]
        },
        {
            id: 2,
            text: "How do you feel after experiencing a significant trading loss?",
            aspect: PSYCHOLOGICAL_ASPECTS.MINDSET,
            options: [
                { text: "Devastated and hesitant to trade again", value: 1 },
                { text: "Frustrated but determined to recover", value: 2 },
                { text: "I analyze what went wrong and learn from it", value: 4 },
                { text: "It's part of trading; I move on to the next opportunity", value: 3 }
            ]
        },
        {
            id: 3,
            text: "When you see a trading opportunity but it doesn't meet all your criteria, what do you do?",
            aspect: PSYCHOLOGICAL_ASPECTS.DISCIPLINE,
            options: [
                { text: "I take the trade anyway; FOMO is strong", value: 1 },
                { text: "I take a smaller position than usual", value: 2 },
                { text: "I wait for a better setup that meets all my criteria", value: 4 },
                { text: "I might take it if I'm feeling confident", value: 3 }
            ]
        },
        {
            id: 4,
            text: "How do you handle a series of winning trades?",
            aspect: PSYCHOLOGICAL_ASPECTS.EMOTIONAL_CONTROL,
            options: [
                { text: "I increase my position sizes significantly", value: 1 },
                { text: "I become more cautious, expecting a loss soon", value: 2 },
                { text: "I stick to my trading plan and risk management", value: 4 },
                { text: "I look for more opportunities to capitalize on my streak", value: 3 }
            ]
        },
        {
            id: 5,
            text: "When do you typically exit a profitable trade?",
            aspect: PSYCHOLOGICAL_ASPECTS.RISK_MANAGEMENT,
            options: [
                { text: "As soon as it shows a small profit", value: 1 },
                { text: "When I hit my predetermined profit target", value: 4 },
                { text: "When the market shows signs of reversal", value: 3 },
                { text: "I let it run as long as possible", value: 2 }
            ]
        }
        // Add more questions up to 20 for full assessment
    ],
    
    quick: [
        // 10 quick assessment questions (subset of full)
        {
            id: 1,
            text: "When a trade goes against you, what is your typical reaction?",
            aspect: PSYCHOLOGICAL_ASPECTS.EMOTIONAL_CONTROL,
            options: [
                { text: "I immediately close the position", value: 1 },
                { text: "I stick to my original plan", value: 4 },
                { text: "I add to my position", value: 2 }
            ]
        },
        // Add 9 more questions
    ],
    
    risk: [
        // Specialized risk tolerance questions
        {
            id: 1,
            text: "What percentage of your trading capital are you willing to risk on a single trade?",
            aspect: PSYCHOLOGICAL_ASPECTS.RISK_MANAGEMENT,
            options: [
                { text: "More than 5%", value: 1 },
                { text: "3-5%", value: 2 },
                { text: "1-2%", value: 4 },
                { text: "Less than 1%", value: 3 }
            ]
        },
        // Add more risk-specific questions
    ]
};

export class QuestionManager {
    static getQuestions(assessmentType) {
        return QUESTION_SETS[assessmentType] || QUESTION_SETS.quick;
    }

    static getQuestionCount(assessmentType) {
        return this.getQuestions(assessmentType).length;
    }

    static validateAnswer(question, answerIndex) {
        if (answerIndex < 0 || answerIndex >= question.options.length) {
            throw new Error('Invalid answer index');
        }
        return question.options[answerIndex].value;
    }
}