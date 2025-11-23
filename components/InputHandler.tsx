
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { Difficulty } from '../types';

interface InputHandlerProps {
  onCommand: (command: string) => void;
  isLoading: boolean;
  difficulty: Difficulty;
}

type CommandMode = 'do' | 'say' | 'story' | 'see';

const CommandBarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  disabled: boolean;
}> = ({ onClick, isActive, children, disabled }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    const baseStyle: React.CSSProperties = {
        padding: '0.25rem 0.5rem',
        border: 'none',
        borderRight: `1px solid ${theme.colors.accent1}`,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        backgroundColor: 'transparent',
        color: theme.colors.text
    };

    if (isActive) {
        baseStyle.backgroundColor = theme.colors.highlightBg;
        baseStyle.color = theme.colors.highlightText;
    } else if (isHovered && !disabled) {
        baseStyle.backgroundColor = theme.colors.highlightBg;
        baseStyle.color = theme.colors.highlightText;
    }

    return (
        <button
            onClick={disabled ? undefined : onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={baseStyle}
        >
            {children}
        </button>
    );
};


const spinnerChars = ['-', '\\', '|', '/'];

export const InputHandler: React.FC<InputHandlerProps> = ({ onCommand, isLoading, difficulty }) => {
  const [inputValue, setInputValue] = useState('');
  const { theme } = useTheme();
  const t = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [spinnerIndex, setSpinnerIndex] = React.useState(0);
  const [commandMode, setCommandMode] = useState<CommandMode>('do');

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading, commandMode]);
  
  React.useEffect(() => {
    if (isLoading) {
        const timer = setInterval(() => {
            setSpinnerIndex((prevIndex) => (prevIndex + 1) % spinnerChars.length);
        }, 150);
        return () => clearInterval(timer);
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !inputValue.trim()) return;

    const trimmedInput = inputValue.trim();
    const commandWords = ['do', 'say', 'story', 'see'];
    const firstWord = trimmedInput.split(' ')[0].toLowerCase();
    
    let commandToSend: string;
    
    // If the user manually typed "see something" while in "do" mode, respect it.
    if (commandWords.includes(firstWord)) {
        commandToSend = trimmedInput;
    } else {
        // Otherwise prefix with the selected mode
        commandToSend = `${commandMode} ${trimmedInput}`;
    }
    
    onCommand(commandToSend);
    setInputValue('');
  };

  const placeholderText = {
    do: t('inputPlaceholderDo'),
    say: t('inputPlaceholderSay'),
    story: t('inputPlaceholderStory'),
    see: t('inputPlaceholderSee'),
  }
  
  const isStoryEnabled = difficulty === 'EASY';

  return (
    <div className="relative p-2" style={{ 
        border: `1px solid ${theme.colors.accent1}`
    }}>
        <span className="absolute -top-px -left-px" style={{ color: theme.colors.accent1, lineHeight: '1' }}>+</span>
        <span className="absolute -top-px -right-px" style={{ color: theme.colors.accent1, lineHeight: '1' }}>+</span>
        <span className="absolute -bottom-px -left-px" style={{ color: theme.colors.accent1, lineHeight: '1' }}>+</span>
        <span className="absolute -bottom-px -right-px" style={{ color: theme.colors.accent1, lineHeight: '1' }}>+</span>
        
        <div className="mb-2" style={{backgroundColor: `rgba(${parseInt(theme.colors.bg.slice(1,3),16)}, ${parseInt(theme.colors.bg.slice(3,5),16)}, ${parseInt(theme.colors.bg.slice(5,7),16)}, 0.5)`}}>
            <div className="flex items-center" style={{ border: `1px solid ${theme.colors.accent1}` }}>
                <CommandBarButton onClick={() => setCommandMode('do')} isActive={commandMode === 'do'} disabled={isLoading}>
                    [ ! ] {t('commandDo')}
                </CommandBarButton>
                <CommandBarButton onClick={() => setCommandMode('say')} isActive={commandMode === 'say'} disabled={isLoading}>
                    [ " ] {t('commandSay')}
                </CommandBarButton>
                <CommandBarButton onClick={() => setCommandMode('story')} isActive={commandMode === 'story'} disabled={isLoading || !isStoryEnabled}>
                    [ ~ ] {t('commandStory')}
                </CommandBarButton>
                <CommandBarButton onClick={() => setCommandMode('see')} isActive={commandMode === 'see'} disabled={isLoading}>
                     [ O ] {t('commandSee')}
                </CommandBarButton>
            </div>
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
                placeholder={isLoading ? "" : placeholderText[commandMode]}
                disabled={isLoading}
                autoComplete="off"
            />
            {isLoading && <span className="text-xl" style={{color: theme.colors.accent1}}>{spinnerChars[spinnerIndex]}</span>}
        </form>
    </div>
  );
};
