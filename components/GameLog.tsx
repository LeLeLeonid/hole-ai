
import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

const AnimatedLogEntry: React.FC<{ entry: string, onUpdate: () => void }> = ({ entry, onUpdate }) => {
    const { settings } = useSettings();
    const { theme } = useTheme();
    const [displayedText, setDisplayedText] = useState('');

    // Identify if this is a player command or system notification that should appear instantly.
    // Includes "You ..." style commands.
    const isUserCommand = entry.startsWith('>') || entry.startsWith('You ');
    
    // Only animate if it's NOT a user command and text speed is NOT instant.
    const shouldAnimate = settings.textSpeed !== 'instant' && !isUserCommand;
    
    const speed = settings.textSpeed === 'fast' ? 15 : settings.textSpeed === 'normal' ? 30 : 0;

    useEffect(() => {
        // If we shouldn't animate, show full text immediately.
        if (!shouldAnimate || !entry) {
            setDisplayedText(entry);
            onUpdate();
            return;
        }

        // Reset for new entry animation
        let charIndex = 0;
        setDisplayedText(''); // Ensure start empty
        
        const intervalId = setInterval(() => {
            charIndex++;
            // slice is safe, if index > length it just returns full string
            const nextText = entry.slice(0, charIndex);
            setDisplayedText(nextText);
            onUpdate();
            
            if (charIndex >= entry.length) {
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [entry, speed, shouldAnimate, onUpdate]);

    // Check if we should color this line as a player action
    const isPlayerLine = entry.startsWith('>') || entry.startsWith('You ');

    return (
        <p 
            className="whitespace-pre-wrap"
            style={{ 
                color: isPlayerLine ? theme.colors.accent2 : theme.colors.text,
                wordBreak: 'break-word',
            }}
        >
            {displayedText}
            {/* Only show cursor if we are currently animating and haven't finished */}
            {shouldAnimate && displayedText.length < entry.length && <span className="blinking-cursor">_</span>}
        </p>
    );
};

export const GameLog: React.FC<{ log: string[] }> = ({ log }) => {
    const { theme } = useTheme();
    const logContainerRef = useRef<HTMLDivElement>(null);

    // This callback is passed to the animated entry to trigger a scroll on each update
    const scrollToBottom = React.useCallback(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, []);

    // Ensure we always have content.
    if (!log || log.length === 0) return <div ref={logContainerRef} className="h-full" />;

    const lastLogEntry = log[log.length - 1];
    const previousLogEntries = log.slice(0, -1);

    return (
        <div ref={logContainerRef} className="h-full overflow-y-auto">
            {previousLogEntries.map((entry, index) => {
                 const isPlayerLine = entry.startsWith('>') || entry.startsWith('You ');
                 return (
                    <p 
                        key={index} 
                        className="whitespace-pre-wrap"
                        style={{ 
                            color: isPlayerLine ? theme.colors.accent2 : theme.colors.text,
                            wordBreak: 'break-word',
                        }}
                    >
                        {entry}
                    </p>
                );
            })}
            {/* Always render the last entry */}
            <AnimatedLogEntry entry={lastLogEntry} onUpdate={scrollToBottom} />
        </div>
    );
};
