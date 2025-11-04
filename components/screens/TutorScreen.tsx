
import React, { useState, useRef, useEffect } from 'react';
import { useMemoryMasterContext } from '../../contexts/MemoryMasterContext';
import { ChatMessage } from '../../types';
import { SendIcon } from '../Icons';
import Spinner from '../common/Spinner';

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${isModel ? 'bg-gray-200 dark:bg-gray-700 rounded-bl-none' : 'bg-primary-light dark:bg-primary-dark text-white rounded-br-none'}`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
        </div>
    );
};

const TutorScreen: React.FC = () => {
    const { tutorHistory, askTutor, isLoading } = useMemoryMasterContext();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [tutorHistory]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            askTutor(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-3xl font-bold text-center mb-4">Dr. Recall (AI Tutor)</h1>
            <div className="flex-1 overflow-y-auto space-y-4 p-2">
                {tutorHistory.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-subtle-light dark:text-subtle-dark">
                        <p className="text-lg">Stuck on a concept?</p>
                        <p>Ask Dr. Recall to explain it in a simple, high-yield way!</p>
                    </div>
                )}
                {tutorHistory.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                 {isLoading && tutorHistory.length > 0 && tutorHistory[tutorHistory.length - 1].role === 'user' && (
                    <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                           <Spinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="mt-4 flex items-center space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Dr. Recall..."
                    className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-full bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-transparent transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-primary-light dark:bg-primary-dark text-white rounded-full disabled:bg-gray-400 transition-colors"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
};

export default TutorScreen;
