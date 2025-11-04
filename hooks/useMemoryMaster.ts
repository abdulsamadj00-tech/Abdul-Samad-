
import { useState, useCallback } from 'react';
import { LearningMaterial, Flashcard, Stats, ChatMessage, ProgressRecord, MCQ } from '../types';
import * as geminiService from '../services/geminiService';

export enum Screen {
    Home = 'Home',
    Summary = 'Summary',
    Recall = 'Recall',
    Visuals = 'Visuals',
    Analytics = 'Analytics',
    Tutor = 'Tutor'
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const initialStats: Stats = {
    recallStrength: 0,
    topicsMastered: 0,
    streak: 0,
    progressHistory: [{ date: getTodayDateString(), correct: 0, incorrect: 0 }],
};

export const useMemoryMaster = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userContent, setUserContent] = useState<string>('');
    const [learningMaterial, setLearningMaterial] = useState<LearningMaterial | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [stats, setStats] = useState<Stats>(initialStats);
    const [tutorHistory, setTutorHistory] = useState<ChatMessage[]>([]);

    const generateAndSetVisualAids = useCallback(async (cards: Flashcard[]) => {
        for (const card of cards) {
            if (card.visualAidPrompt && !card.imageUrl) {
                setFlashcards(prev => prev.map(c => c.id === card.id ? { ...c, isGeneratingVisual: true } : c));
                try {
                    const imageB64 = await geminiService.generateVisualAid(card.visualAidPrompt);
                    setFlashcards(prev => prev.map(c => c.id === card.id ? { ...c, isGeneratingVisual: false, imageUrl: `data:image/png;base64,${imageB64}` } : c));
                } catch (e) {
                    console.error(`Failed to generate visual for card ${card.id}`, e);
                    setFlashcards(prev => prev.map(c => c.id === card.id ? { ...c, isGeneratingVisual: false } : c));
                }
            }
        }
    }, []);

    const generateStudyMaterials = useCallback(async (content: string) => {
        setIsLoading(true);
        setError(null);
        try {
            setUserContent(content);
            const [material, cardData, generatedMcqs] = await Promise.all([
                geminiService.generateLearningMaterial(content),
                geminiService.generateFlashcards(content),
                geminiService.generateMCQs(content)
            ]);

            setLearningMaterial(material);
            setMcqs(generatedMcqs);

            const newFlashcards: Flashcard[] = cardData.map((card, index) => ({
                ...card,
                id: `${Date.now()}-${index}`,
                performance: 'new',
                lastReviewed: null,
                reviewCount: 0,
                imageUrl: undefined,
                isGeneratingVisual: false,
            }));
            setFlashcards(newFlashcards);
            
            generateAndSetVisualAids(newFlashcards);

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [generateAndSetVisualAids]);

    const updateFlashcardPerformance = useCallback((cardId: string, performance: 'hard' | 'good' | 'easy') => {
        const knewIt = performance === 'good' || performance === 'easy';

        setFlashcards(prev => prev.map(card => {
            if (card.id === cardId) {
                return {
                    ...card,
                    performance,
                    lastReviewed: new Date(),
                    reviewCount: card.reviewCount + 1,
                };
            }
            return card;
        }));

        setStats(prev => {
            const today = getTodayDateString();
            const history = [...prev.progressHistory];
            let todayRecord = history.find(r => r.date === today);

            if (!todayRecord) {
                todayRecord = { date: today, correct: 0, incorrect: 0 };
                history.push(todayRecord);
            }

            if (knewIt) {
                todayRecord.correct++;
            } else {
                todayRecord.incorrect++;
            }

            const totalCorrect = history.reduce((sum, r) => sum + r.correct, 0);
            const totalAnswered = history.reduce((sum, r) => sum + r.correct + r.incorrect, 0);
            const recallStrength = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
            const topicsMastered = flashcards.filter(c => c.performance === 'good' || c.performance === 'easy').length;
            
            const newStreak = knewIt ? prev.streak + 1 : 0;

            return {
                ...prev,
                progressHistory: history,
                recallStrength,
                topicsMastered,
                streak: newStreak
            };
        });
    }, [flashcards]);

    const askTutor = useCallback(async (question: string) => {
        setIsLoading(true);
        setError(null);
        const userMessage: ChatMessage = { role: 'user', text: question };
        setTutorHistory(prev => [...prev, userMessage]);

        try {
            const responseText = await geminiService.getTutorResponse(tutorHistory, question, userContent);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setTutorHistory(prev => [...prev.slice(0, -1), userMessage, modelMessage]);
        } catch (e: any) {
            const errorMessage: ChatMessage = { role: 'model', text: `Sorry, I encountered an error: ${e.message}` };
            setTutorHistory(prev => [...prev.slice(0, -1), userMessage, errorMessage]);
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [userContent, tutorHistory]);
    
    const resetSession = useCallback(() => {
        setUserContent('');
        setLearningMaterial(null);
        setFlashcards([]);
        setMcqs([]);
        setStats(initialStats);
        setTutorHistory([]);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        isLoading,
        error,
        userContent,
        learningMaterial,
        flashcards,
        mcqs,
        stats,
        tutorHistory,
        generateStudyMaterials,
        updateFlashcardPerformance,
        askTutor,
        resetSession,
    };
};
