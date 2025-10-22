import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface InputHandlerProps {
  onCommand: (command: string) => void;
  isLoading: boolean;
  suggestedActions: string[];
}

const ActionButton: React.FC<{onClick: () => void, disabled: boolean, children: React.ReactNode}> = ({ onClick, disabled, children }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);

    const getBackgroundColor = () => {
        if (disabled) return theme.colors.disabledBg;
        if (isHovered) return theme.colors.highlightBg;
        return 'transparent';
    }

    const getTextColor = () => {
        if (disabled) return theme.colors.disabledText;
        if (isHovered) return theme.colors.highlightText;
        return theme.colors.text;
    }

    return (
        <span 
            onClick={!disabled ? onClick : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: getBackgroundColor(),
                color: getTextColor(),
                border: `1px solid ${disabled ? theme.colors.disabledText : theme.colors.accent1}`,
                cursor: disabled ? 'default' : 'pointer',
            }}
            className="px-2 py-1"
        >
            {children}
        </span>
    )
}

export const InputHandler: React.FC<InputHandlerProps> = ({ onCommand, isLoading, suggestedActions }) => {
  const [inputValue, setInputValue] = useState('');
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !inputValue.trim()) return;
    onCommand(inputValue);
    setInputValue('');
  };

  const handleSuggestionClick = (action: string) => {
    if (isLoading) return;
    onCommand(action);
    setInputValue('');
  };

  return (
    <div className="p-2" style={{ border: `1px solid ${theme.colors.accent1}` }}>
        <div className="flex flex-wrap gap-2 mb-2">
            {suggestedActions.map((action, index) => (
                 <ActionButton 
                    key={index} 
                    onClick={() => handleSuggestionClick(action)}
                    disabled={isLoading}
                >
                    {action}
                </ActionButton>
            ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span style={{ color: theme.colors.text }} className="text-2xl">{'>'}</span>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ backgroundColor: 'transparent', color: theme.colors.text }}
                className="flex-grow border-none focus:outline-none text-xl p-1"
                placeholder={isLoading ? "The Gemini Master is weaving fate..." : "Enter your command..."}
                disabled={isLoading}
                autoComplete="off"
            />
            {isLoading && <div className="animate-spin h-5 w-5 border-2 rounded-full" style={{borderColor: theme.colors.accent1, borderTopColor: 'transparent'}}></div>}
        </form>
    </div>
  );
};