
import React, { useState } from 'react';
import { useMemoryMasterContext } from '../../contexts/MemoryMasterContext';
import Spinner from '../common/Spinner';
import { Screen } from '../../hooks/useMemoryMaster';

const HomeScreen: React.FC = () => {
    const { generateStudyMaterials, isLoading, error, learningMaterial, setCurrentScreen, resetSession } = useMemoryMasterContext();
    const [content, setContent] = useState('');

    const handleGenerate = async () => {
        if (content.trim()) {
            await generateStudyMaterials(content);
        }
    };
    
    if (learningMaterial) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold mb-4 text-secondary-light dark:text-secondary-dark">High-Yield Study Session Ready!</h2>
                <p className="mb-6 text-subtle-light dark:text-subtle-dark">
                    We've generated a summary, flashcards with visuals, and MCQs for you.
                </p>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setCurrentScreen(Screen.Summary)}
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                    >
                        Start Studying
                    </button>
                    <button
                        onClick={resetSession}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-on-surface-light dark:text-on-surface-dark font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        New Topic
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6">
            <h1 className="text-3xl font-bold text-center">Welcome to AI MedMemory Pro</h1>
            <p className="text-center text-subtle-light dark:text-subtle-dark">
                Paste your lecture notes, a chapter, or any medical text to begin.
            </p>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your notes from Pathoma, Boards & Beyond, First Aid, etc..."
                className="w-full h-64 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition"
                disabled={isLoading}
            />

            {error && <p className="text-red-500 text-center">{error}</p>}

            <button
                onClick={handleGenerate}
                disabled={isLoading || !content.trim()}
                className="w-full py-3 px-4 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
                {isLoading ? <Spinner /> : 'Generate High-Yield Material'}
            </button>
        </div>
    );
};

export default HomeScreen;
