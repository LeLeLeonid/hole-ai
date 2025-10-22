import React, { useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GameLogProps {
    log: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ log }) => {
    const { theme } = useTheme();
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [log]);

    return (
        <div 
            className="h-full overflow-y-auto"
            style={{ 
                backgroundColor: 'inherit'
            }}
        >
            {log.map((entry, index) => (
                <p 
                    key={index} 
                    className="whitespace-pre-wrap"
                    style={{ color: entry.startsWith('>') ? theme.colors.accent2 : theme.colors.text }}
                >
                    {entry}
                </p>
            ))}
            <div ref={logEndRef} />
        </div>
    );
};