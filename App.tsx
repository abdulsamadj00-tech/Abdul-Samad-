
import React, { useState, useCallback, useMemo } from 'react';
import { useMemoryMaster, Screen } from './hooks/useMemoryMaster';
import { MemoryMasterContext } from './contexts/MemoryMasterContext';
import Navbar from './components/Navbar';
import HomeScreen from './components/screens/HomeScreen';
import SummaryScreen from './components/screens/LearnScreen';
import RecallScreen from './components/screens/RecallScreen';
import AnalyticsScreen from './components/screens/StatsScreen';
import TutorScreen from './components/screens/TutorScreen';
import VisualsScreen from './components/screens/VisualsScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SunIcon, MoonIcon } from './components/Icons';

const AppContent: React.FC = () => {
    const memoryMasterState = useMemoryMaster();
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);
    const { theme, toggleTheme } = useTheme();

    const renderScreen = useCallback(() => {
        switch (currentScreen) {
            case Screen.Home:
                return <HomeScreen />;
            case Screen.Summary:
                return <SummaryScreen />;
            case Screen.Recall:
                return <RecallScreen />;
            case Screen.Visuals:
                return <VisualsScreen />;
            case Screen.Analytics:
                return <AnalyticsScreen />;
            case Screen.Tutor:
                return <TutorScreen />;
            default:
                return <HomeScreen />;
        }
    }, [currentScreen]);

    const contextValue = useMemo(() => ({
        ...memoryMasterState,
        currentScreen,
        setCurrentScreen
    }), [memoryMasterState, currentScreen, setCurrentScreen]);

    return (
        <MemoryMasterContext.Provider value={contextValue}>
            <div className={`flex flex-col h-screen font-sans bg-background-light dark:bg-background-dark text-on-surface-light dark:text-on-surface-dark transition-colors duration-300`}>
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-primary-light dark:text-primary-dark">
                        🩺 AI MedMemory Pro
                    </h1>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {theme === 'dark' ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-700" />}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 mb-16">
                    {renderScreen()}
                </main>

                <Navbar />
            </div>
        </MemoryMasterContext.Provider>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
