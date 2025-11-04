
import React from 'react';
import { useMemoryMasterContext } from '../contexts/MemoryMasterContext';
import { Screen } from '../hooks/useMemoryMaster';
import { HomeIcon, LearnIcon, RecallIcon, StatsIcon, TutorIcon, VisualsIcon } from './Icons';

interface NavItemProps {
    icon: React.ReactNode;
    label: string; // Use string for display
    screen: Screen; // Use enum for logic
    isActive: boolean;
    onClick: () => void;
    disabled: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, disabled }) => {
    const activeClasses = 'text-primary-light dark:text-primary-dark';
    const inactiveClasses = 'text-subtle-light dark:text-subtle-dark';
    const disabledClasses = 'opacity-50 cursor-not-allowed';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ease-in-out ${disabled ? disabledClasses : 'hover:text-primary-light dark:hover:text-primary-dark'}`}
            aria-label={`Navigate to ${label}`}
        >
            <div className={`w-6 h-6 ${isActive ? activeClasses : inactiveClasses}`}>{icon}</div>
            <span className={`text-xs mt-1 ${isActive ? activeClasses : inactiveClasses}`}>{label}</span>
        </button>
    );
};

const Navbar: React.FC = () => {
    const { currentScreen, setCurrentScreen, learningMaterial, flashcards } = useMemoryMasterContext();
    const isMaterialGenerated = !!learningMaterial;
    const hasVisuals = flashcards.some(c => c.imageUrl);

    const navItems = [
        { icon: <HomeIcon className="w-full h-full" />, label: 'Home', screen: Screen.Home, disabled: false },
        { icon: <LearnIcon className="w-full h-full" />, label: 'Summary', screen: Screen.Summary, disabled: !isMaterialGenerated },
        { icon: <RecallIcon className="w-full h-full" />, label: 'Recall', screen: Screen.Recall, disabled: !isMaterialGenerated },
        { icon: <VisualsIcon className="w-full h-full" />, label: 'Visuals', screen: Screen.Visuals, disabled: !hasVisuals },
        { icon: <StatsIcon className="w-full h-full" />, label: 'Analytics', screen: Screen.Analytics, disabled: !isMaterialGenerated },
        { icon: <TutorIcon className="w-full h-full" />, label: 'Tutor', screen: Screen.Tutor, disabled: !isMaterialGenerated },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 flex justify-around items-center shadow-lg">
            {navItems.map(item => (
                <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    screen={item.screen}
                    isActive={currentScreen === item.screen}
                    onClick={() => setCurrentScreen(item.screen)}
                    disabled={item.disabled}
                />
            ))}
        </nav>
    );
};

export default Navbar;
