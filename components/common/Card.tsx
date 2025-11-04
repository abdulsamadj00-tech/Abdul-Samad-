
import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-surface-light dark:bg-surface-dark p-6 rounded-xl shadow-md transition-colors duration-300 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
