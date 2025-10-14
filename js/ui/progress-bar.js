export class ProgressBar {
    constructor(progressFillElement, progressTextElement) {
        this.progressFill = progressFillElement;
        this.progressText = progressTextElement;
    }

    updateProgress(current, total) {
        const percentage = (current / total) * 100;
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `Question ${current} of ${total}`;
    }

    reset() {
        this.progressFill.style.width = '0%';
        this.progressText.textContent = 'Question 1 of 0';
    }

    animateTo(percentage, duration = 500) {
        this.progressFill.style.transition = `width ${duration}ms ease`;
        this.progressFill.style.width = `${percentage}%`;
        
        setTimeout(() => {
            this.progressFill.style.transition = '';
        }, duration);
    }
}