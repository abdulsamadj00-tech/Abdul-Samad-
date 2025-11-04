
import React, { useState } from 'react';
import { useMemoryMasterContext } from '../../contexts/MemoryMasterContext';
import Card from '../common/Card';
import { Screen } from '../../hooks/useMemoryMaster';
import { MCQ } from '../../types';

const MCQCard: React.FC<{ mcq: MCQ, index: number }> = ({ mcq, index }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const handleSelectOption = (option: string) => {
        if (showAnswer) return;
        setSelectedOption(option);
    };

    const isCorrect = selectedOption === mcq.answer;

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <p className="font-semibold">{index + 1}. {mcq.question}</p>
            {mcq.source && <p className="text-xs text-subtle-light dark:text-subtle-dark italic mb-2">Source: {mcq.source}</p>}
            <div className="space-y-2 my-4">
                {mcq.options.map((option) => (
                    <button
                        key={option}
                        onClick={() => handleSelectOption(option)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedOption === option ? 'border-primary-light dark:border-primary-dark' : 'border-gray-300 dark:border-gray-600'} ${showAnswer && option === mcq.answer && 'bg-green-100 dark:bg-green-900 border-green-500'} ${showAnswer && selectedOption === option && !isCorrect && 'bg-red-100 dark:bg-red-900 border-red-500'}`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <button
                onClick={() => setShowAnswer(true)}
                disabled={!selectedOption}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md disabled:opacity-50"
            >
                Check Answer
            </button>
            {showAnswer && (
                <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                    <h4 className="font-bold">{isCorrect ? 'Correct!' : 'Incorrect.'}</h4>
                    <p className="font-semibold mt-2">Explanation:</p>
                    <p>{mcq.explanation}</p>
                </div>
            )}
        </div>
    );
};


const SummaryScreen: React.FC = () => {
    const { learningMaterial, mcqs, setCurrentScreen } = useMemoryMasterContext();

    if (!learningMaterial) {
        return (
            <div className="text-center">
                <p>No material generated. Go to the Home screen to start.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-center">Study Guide</h1>

            <Card>
                <h2 className="text-2xl font-semibold mb-2 text-primary-light dark:text-primary-dark">High-Yield Summary</h2>
                {learningMaterial.source && <p className="text-xs text-subtle-light dark:text-subtle-dark italic mb-4">Source Verified From: {learningMaterial.source}</p>}
                <p className="leading-relaxed">{learningMaterial.summary}</p>
            </Card>

            <Card>
                <h2 className="text-2xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Key Points</h2>
                <ul className="list-disc list-inside space-y-2">
                    {learningMaterial.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
            </Card>

            {learningMaterial.mnemonics.length > 0 && (
                <Card>
                    <h2 className="text-2xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Memory Aids (Mnemonics)</h2>
                    <div className="space-y-4">
                        {learningMaterial.mnemonics.map((item, index) => (
                            <div key={index}>
                                <h3 className="font-semibold">{item.concept}</h3>
                                <p className="text-subtle-light dark:text-subtle-dark italic">"{item.mnemonic}"</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {mcqs.length > 0 && (
                 <Card>
                    <h2 className="text-2xl font-semibold mb-4 text-primary-light dark:text-primary-dark">Question Bank</h2>
                    {mcqs.map((mcq, index) => (
                        <MCQCard key={index} mcq={mcq} index={index} />
                    ))}
                </Card>
            )}
            
            <div className="text-center pt-4">
                <button
                    onClick={() => setCurrentScreen(Screen.Recall)}
                    className="px-8 py-3 bg-secondary-light dark:bg-secondary-dark text-white font-bold rounded-lg shadow-md hover:opacity-90 transition-opacity"
                >
                    Start Recall Session!
                </button>
            </div>
        </div>
    );
};

export default SummaryScreen;
