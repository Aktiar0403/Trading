// Assessment types
export const ASSESSMENT_TYPES = {
    FULL: 'full',
    QUICK: 'quick',
    RISK: 'risk'
};

// Score categories
export const SCORE_CATEGORIES = {
    LOW: { min: 0, max: 59, label: 'Needs Improvement', class: 'score-low' },
    MEDIUM: { min: 60, max: 79, label: 'Good', class: 'score-medium' },
    HIGH: { min: 80, max: 100, label: 'Excellent', class: 'score-high' }
};

// Storage keys
export const STORAGE_KEYS = {
    ASSESSMENT_RESULTS: 'trading_psychology_results',
    USER_PREFERENCES: 'trading_psychology_preferences',
    THEME: 'trading_psychology_theme'
};

// Psychological aspects for breakdown
export const PSYCHOLOGICAL_ASPECTS = {
    RISK_MANAGEMENT: 'Risk Management',
    EMOTIONAL_CONTROL: 'Emotional Control',
    DISCIPLINE: 'Discipline & Patience',
    PREPARATION: 'Preparation & Analysis',
    MINDSET: 'Trading Mindset'
};