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
        // The parent <main> element or <Window> now handles scrolling.
        // This div is just a simple container.
        <div>
            {log.map((entry, index) => (
                <p 
                    key={index} 
                    className="whitespace-pre-wrap"
                    style={{ 
                        color: entry.startsWith('>') ? theme.colors.accent2 : theme.colors.text,
                        wordBreak: 'break-word', // Ensures long strings without spaces will wrap.
                    }}
                >
                    {entry}
                </p>
            ))}
            <div ref={logEndRef} />
        </div>
    );
};