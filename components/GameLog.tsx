import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';

const AnimatedLogEntry: React.FC<{ entry: string, onUpdate: () => void }> = ({ entry, onUpdate }) => {
    const { settings } = useSettings();
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const { theme } = useTheme();

    const speed = settings.textSpeed === 'fast' ? 15 : settings.textSpeed === 'normal' ? 40 : 0;

    useEffect(() => {
        setDisplayedText('');
        setIsTyping(true);
        if (!entry) {
            setIsTyping(false);
            return;
        }

        // If instant speed or it's a user command, just set the text and scroll once.
        if (speed === 0 || entry.startsWith('>')) {
            setDisplayedText(entry);
            setIsTyping(false);
            onUpdate();
            return;
        }

        let i = 0;
        const intervalId = setInterval(() => {
            // Use functional update to avoid stale closures and ensure correct state progression
            setDisplayedText(current => current + entry.charAt(i));
            i++;
            onUpdate(); // Scroll on each character update
            if (i >= entry.length) {
                clearInterval(intervalId);
                setIsTyping(false);
            }
        }, speed);

        // Cleanup function to clear interval on component unmount or re-render
        return () => clearInterval(intervalId);
    }, [entry, speed, onUpdate]);

    return (
        <p 
            className="whitespace-pre-wrap"
            style={{ 
                color: entry.startsWith('>') ? theme.colors.accent2 : theme.colors.text,
                wordBreak: 'break-word',
            }}
        >
            {displayedText}
            {/* Blinking cursor effect at the end of typing */}
            {isTyping && <span className="blinking-cursor">_</span>}
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

    const lastLogEntry = log[log.length - 1] ?? '';
    const previousLogEntries = log.slice(0, -1);

    return (
        <div ref={logContainerRef} className="h-full overflow-y-auto">
            {previousLogEntries.map((entry, index) => (
                <p 
                    key={index} 
                    className="whitespace-pre-wrap"
                    style={{ 
                        color: entry.startsWith('>') ? theme.colors.accent2 : theme.colors.text,
                        wordBreak: 'break-word',
                    }}
                >
                    {entry}
                </p>
            ))}
            {/* Only render the animated component if there's a last entry */}
            {lastLogEntry && <AnimatedLogEntry entry={lastLogEntry} onUpdate={scrollToBottom} />}
        </div>
    );
};