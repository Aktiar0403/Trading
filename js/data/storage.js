import { STORAGE_KEYS } from '../utils/constants.js';
import { Helpers } from '../utils/helpers.js';

export class StorageManager {
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    static saveAssessmentResult(result) {
        const results = this.getAssessmentResults();
        result.id = Helpers.generateId();
        result.timestamp = new Date().toISOString();
        results.unshift(result);
        this.setItem(STORAGE_KEYS.ASSESSMENT_RESULTS, results);
        return result.id;
    }

    static getAssessmentResults() {
        return this.getItem(STORAGE_KEYS.ASSESSMENT_RESULTS, []);
    }

    static getAssessmentResult(id) {
        const results = this.getAssessmentResults();
        return results.find(result => result.id === id);
    }

    static saveUserPreferences(preferences) {
        return this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
    }

    static getUserPreferences() {
        return this.getItem(STORAGE_KEYS.USER_PREFERENCES, {
            theme: 'light',
            notifications: true
        });
    }

    static saveTheme(theme) {
        return this.setItem(STORAGE_KEYS.THEME, theme);
    }

    static getTheme() {
        return this.getItem(STORAGE_KEYS.THEME, 'light');
    }
}