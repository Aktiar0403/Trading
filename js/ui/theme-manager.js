import { StorageManager } from '../data/storage.js';

export class ThemeManager {
    constructor() {
        this.themeStylesheet = document.getElementById('theme-stylesheet');
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
        this.currentTheme = StorageManager.getTheme();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.themeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        StorageManager.saveTheme(this.currentTheme);
        this.updateToggleButton();
    }

    applyTheme(theme) {
        const themePath = `css/themes/${theme}.css`;
        this.themeStylesheet.setAttribute('href', themePath);
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateToggleButton() {
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