
import { createContext, useContext } from 'react';
import { useMemoryMaster, Screen } from '../hooks/useMemoryMaster';

type MemoryMasterContextType = ReturnType<typeof useMemoryMaster> & {
    currentScreen: Screen;
    setCurrentScreen: (screen: Screen) => void;
};

export const MemoryMasterContext = createContext<MemoryMasterContextType | null>(null);

export const useMemoryMasterContext = () => {
    const context = useContext(MemoryMasterContext);
    if (!context) {
        throw new Error('useMemoryMasterContext must be used within a MemoryMasterProvider');
    }
    return context;
};
