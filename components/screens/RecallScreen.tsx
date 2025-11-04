import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useMemoryMasterContext } from '../../contexts/MemoryMasterContext';
import { Flashcard as FlashcardType } from '../../types';
import Spinner from '../common/Spinner';
import { MicrophoneIcon, CheckIcon, XIcon } from '../Icons';

const Flashcard: React.FC<{ card: FlashcardType; onAnswer: (performance: 'hard' | 'good' | 'easy') => void; isFlipped: boolean; onFlip: () => void; }> = ({ card, onAnswer, isFlipped, onFlip }) => {
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Fix: Cast window to `any` to access non-standard SpeechRecognition APIs.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSpokenText(transcript);
                // Simple check: does spoken text contain keywords from the answer?
                const answerKeywords = card.answer.toLowerCase().split(' ').filter(word => word.length > 3);
                const transcriptKeywords = transcript.toLowerCase().split(' ');
                const match = answerKeywords.some(keyword => transcriptKeywords.includes(keyword));
                setIsCorrect(match);
                setTimeout(() => { // Show feedback for a moment
                     setIsCorrect(null);
                     setSpokenText('');
                }, 2000);
            };
        }
    }, [card.answer]);

    const handleMicClick = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };
    
    return (
        <div className="w-full max-w-lg mx-auto" style={{ perspective: '1000px' }}>
            <div
                className={`relative w-full h-96 transition-transform duration-500`}
                style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
                {/* Front of the card */}
                <div className="absolute w-full h-full bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg flex flex-col justify-center items-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
                    <p className="text-subtle-light dark:text-subtle-dark mb-4 text-sm">Question</p>
                    <p className="text-2xl font-semibold">{card.question}</p>
                </div>

                {/* Back of the card */}
                <div className="absolute w-full h-full bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg flex flex-col p-6 overflow-y-auto" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <p className="text-subtle-light dark:text-subtle-dark mb-2 text-sm">Answer</p>
                    <p className="text-xl font-medium mb-4">{card.answer}</p>
                    {card.source && <p className="text-xs text-subtle-light dark:text-subtle-dark italic mb-4">Source: {card.source}</p>}
                    
                    {card.isGeneratingVisual && <div className="flex flex-col items-center justify-center h-32"><Spinner /><p className="text-sm mt-2">Generating visual...</p></div>}
                    {card.imageUrl && (
                        <>
                            <p className="text-subtle-light dark:text-subtle-dark mt-auto mb-2 text-sm">Visual Aid</p>
                            <img src={card.imageUrl} alt={card.visualAidPrompt} className="w-full h-auto object-contain rounded-lg" />
                        </>
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-col space-y-4">
                {!isFlipped ? (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onFlip}
                            className="w-full py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
                        >
                            Show Answer
                        </button>
                         <button onClick={handleMicClick} className={`p-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-secondary-light dark:bg-secondary-dark'} text-white shadow-md`} aria-label="Use voice recall">
                            <MicrophoneIcon className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2 sm:space-x-4">
                        <button onClick={() => onAnswer('hard')} className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors">Hard</button>
                        <button onClick={() => onAnswer('good')} className="w-full py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors">Good</button>
                        <button onClick={() => onAnswer('easy')} className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors">Easy</button>
                    </div>
                )}
                 {spokenText && (
                    <div className="text-center p-2 border rounded-md">
                        <p className="text-sm text-subtle-light dark:text-subtle-dark">You said: "{spokenText}"</p>
                        {isCorrect !== null && (isCorrect ? <CheckIcon className="w-6 h-6 text-green-500 mx-auto" /> : <XIcon className="w-6 h-6 text-red-500 mx-auto" />)}
                    </div>
                )}
            </div>
        </div>
    );
};

const RecallScreen: React.FC = () => {
    const { flashcards, updateFlashcardPerformance } = useMemoryMasterContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    const cardQueue = useMemo(() => {
        const hard = flashcards.filter(c => c.performance === 'hard');
        const neu = flashcards.filter(c => c.performance === 'new');
        const good = flashcards.filter(c => c.performance === 'good');
        // Heavily prioritize hard cards, then new cards, then good ones. Easy ones are not in queue unless all are easy.
        const queue = [...hard, ...hard, ...neu, ...good];
        return queue.length > 0 ? queue : flashcards;
    }, [flashcards]);

    const currentCard = cardQueue[currentIndex];

    const handleAnswer = (performance: 'hard' | 'good' | 'easy') => {
        if (!currentCard) return;
        updateFlashcardPerformance(currentCard.id, performance);
        
        setTimeout(() => {
            setIsFlipped(false);
            if (currentIndex < cardQueue.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setSessionComplete(true);
            }
        }, 500);
    };
    
    useEffect(() => {
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionComplete(false);
    }, [flashcards]);

    if (!flashcards || flashcards.length === 0) {
        return <div className="text-center">No flashcards available.</div>;
    }
    
    if (sessionComplete || !currentCard) {
        return (
            <div className="text-center flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">Great job!</h2>
                <p className="mb-6">You've completed this high-yield recall session.</p>
                <button
                    onClick={() => {
                        setCurrentIndex(0);
                        setSessionComplete(false);
                    }}
                    className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
                >
                    Practice Again
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2">Recall Practice</h1>
            <p className="text-subtle-light dark:text-subtle-dark mb-8">Card {currentIndex + 1} of {cardQueue.length}</p>
            <Flashcard
                card={currentCard}
                onAnswer={handleAnswer}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(true)}
            />
        </div>
    );
};

export default RecallScreen;