import { QuestionManager } from './questions.js';
import { ProgressBar } from '../ui/progress-bar.js';

export class AssessmentEngine {
    constructor(assessmentType) {
        this.assessmentType = assessmentType;
        this.questions = QuestionManager.getQuestions(assessmentType);
        this.currentQuestionIndex = 0;
        this.answers = new Array(this.questions.length).fill(null);
        this.isCompleted = false;
        
        this.progressBar = null;
        this.onProgressUpdate = null;
        this.onCompletion = null;
    }

    setProgressBar(progressBar) {
        this.progressBar = progressBar;
    }

    setCallbacks(onProgressUpdate, onCompletion) {
        this.onProgressUpdate = onProgressUpdate;
        this.onCompletion = onCompletion;
    }

    start() {
        this.currentQuestionIndex = 0;
        this.answers.fill(null);
        this.isCompleted = false;
        this.updateProgress();
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    answerCurrentQuestion(answerIndex) {
        if (this.isCompleted) return;

        this.answers[this.currentQuestionIndex] = answerIndex;
        
        if (this.onProgressUpdate) {
            this.onProgressUpdate(this.currentQuestionIndex, this.answers);
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.updateProgress();
            return true;
        } else {
            this.completeAssessment();
            return false;
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.updateProgress();
            return true;
        }
        return false;
    }

    updateProgress() {
        if (this.progressBar) {
            this.progressBar.updateProgress(
                this.currentQuestionIndex + 1,
                this.questions.length
            );
        }
    }

    completeAssessment() {
        this.isCompleted = true;
        if (this.onCompletion) {
            this.onCompletion(this.questions, this.answers, this.assessmentType);
        }
    }

    getProgress() {
        const answered = this.answers.filter(answer => answer !== null).length;
        return {
            current: this.currentQuestionIndex + 1,
            total: this.questions.length,
            answered: answered,
            percentage: Math.round((answered / this.questions.length) * 100)
        };
    }

    canProceed() {
        return this.answers[this.currentQuestionIndex] !== null;
    }

    hasPrevious() {
        return this.currentQuestionIndex > 0;
    }

    hasNext() {
        return this.currentQuestionIndex < this.questions.length - 1;
    }

    isLastQuestion() {
        return this.currentQuestionIndex === this.questions.length - 1;
    }
}