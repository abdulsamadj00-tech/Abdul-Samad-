
import React from 'react';
import { useMemoryMasterContext } from '../../contexts/MemoryMasterContext';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

const VisualsScreen: React.FC = () => {
    const { flashcards } = useMemoryMasterContext();

    const visualCards = flashcards.filter(card => card.visualAidPrompt);

    if (visualCards.length === 0) {
        return (
            <div className="text-center">
                <p>No visual aids have been generated for this topic yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-center">Visuals Gallery</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visualCards.map(card => (
                    <Card key={card.id} className="flex flex-col">
                        <h3 className="font-semibold text-lg mb-2">{card.question}</h3>
                        <div className="flex-grow flex items-center justify-center bg-background-light dark:bg-background-dark rounded-lg mt-2 min-h-[200px]">
                            {card.isGeneratingVisual ? (
                                <div>
                                    <Spinner />
                                    <p className="text-sm mt-2 text-subtle-light dark:text-subtle-dark">Generating visual...</p>
                                </div>
                            ) : card.imageUrl ? (
                                <img 
                                    src={card.imageUrl} 
                                    alt={card.visualAidPrompt} 
                                    className="max-w-full max-h-64 h-auto object-contain rounded-md" 
                                />
                            ) : (
                                <p className="text-sm text-subtle-light dark:text-subtle-dark">No visual available.</p>
                            )}
                        </div>
                         {card.source && <p className="text-xs text-subtle-light dark:text-subtle-dark italic mt-2 text-right">Source: {card.source}</p>}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default VisualsScreen;
