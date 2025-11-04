
export interface LearningMaterial {
    summary: string;
    keyPoints: string[];
    mnemonics: { concept: string; mnemonic: string }[];
    source?: string;
}

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    visualAidPrompt?: string;
    imageUrl?: string;
    isGeneratingVisual?: boolean;
    performance: 'new' | 'hard' | 'good' | 'easy';
    lastReviewed: Date | null;
    reviewCount: number;
    source?: string;
}

export interface ProgressRecord {
    date: string;
    correct: number;
    incorrect: number;
}

export interface Stats {
    recallStrength: number;
    topicsMastered: number;
    streak: number;
    progressHistory: ProgressRecord[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface MCQ {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    source?: string;
}
