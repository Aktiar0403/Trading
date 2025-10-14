import { SCORE_CATEGORIES } from './constants.js';

export class Helpers {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static calculateScoreCategory(percentage) {
        for (const [key, category] of Object.entries(SCORE_CATEGORIES)) {
            if (percentage >= category.min && percentage <= category.max) {
                return category;
            }
        }
        return SCORE_CATEGORIES.LOW;
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = `${current}%`;
            
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }
}