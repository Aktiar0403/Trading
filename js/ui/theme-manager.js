import { StorageManager } from '../data/storage.js';

export class ThemeManager {
    constructor() {
        this.themeStylesheet = document.getElementById('theme-stylesheet');
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.currentTheme = StorageManager.getTheme();
        
        // Fallback if stylesheet element is not found
        if (!this.themeStylesheet) {
            console.warn('Theme stylesheet element not found, creating fallback');
            this.createFallbackStylesheet();
        }
    }

    createFallbackStylesheet() {
        // Create a style element for theme management
        this.themeStylesheet = document.createElement('style');
        this.themeStylesheet.id = 'theme-stylesheet';
        document.head.appendChild(this.themeStylesheet);
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        } else {
            console.warn('Theme toggle button not found');
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        StorageManager.saveTheme(this.currentTheme);
        this.updateToggleButton();
    }

    applyTheme(theme) {
        // Use data-theme attribute on html element instead of switching stylesheets
        document.documentElement.setAttribute('data-theme', theme);
        this.updateToggleButton();
    }

    updateToggleButton() {
        if (!this.themeToggleBtn) return;
        
        const icon = this.currentTheme === 'light' ? '🌙' : '☀️';
        const text = this.currentTheme === 'light' ? 'Dark Mode' : 'Light Mode';
        
        this.themeToggleBtn.innerHTML = `
            <span class="theme-icon">${icon}</span>
            ${text}
        `;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}