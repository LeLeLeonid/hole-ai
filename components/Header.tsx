import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { WindowId, WindowState } from '../types';

interface HeaderProps {
    characterName: string;
    location: string;
    onMenu: () => void;
    onSettings: () => void;
    onSave: () => void;
    windows: Record<WindowId, WindowState>;
    setWindows: React.Dispatch<React.SetStateAction<Record<WindowId, WindowState>>>;
    initialWindows: Record<WindowId, WindowState>;
}

const HeaderButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? theme.colors.highlightBg : 'transparent',
        color: isHovered ? theme.colors.highlightText : theme.colors.text,
        cursor: 'pointer',
      }}
      className="px-1"
    >
      [ {children} ]
    </span>
  );
};

const DropdownItem: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => {
    const { theme } = useTheme();
    return (
        <div 
            onClick={onClick} 
            className="whitespace-nowrap cursor-pointer hover:bg-gray-700 p-1"
            style={{
                '--hover-bg': theme.colors.highlightBg,
                '--hover-text': theme.colors.highlightText
            } as React.CSSProperties}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.highlightBg;
                e.currentTarget.style.color = theme.colors.highlightText;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.text;
            }}
        >
            {children}
        </div>
    )
}

export const Header: React.FC<HeaderProps> = ({ characterName, location, onMenu, onSettings, onSave, windows, setWindows, initialWindows }) => {
    const { theme } = useTheme();
    const [showWindowsMenu, setShowWindowsMenu] = useState(false);
    
    const showAllWindows = () => {
        setWindows(prev => {
            const newWindows = {...prev};
            Object.keys(newWindows).forEach(id => {
                newWindows[id].isOpen = true;
            });
            return newWindows;
        });
        setShowWindowsMenu(false);
    };
    
    const minimizeAllWindows = () => {
        setWindows(prev => {
            const newWindows = {...prev};
            Object.keys(newWindows).forEach(id => {
                if (newWindows[id].isOpen) {
                    newWindows[id].isMinimized = true;
                }
            });
            return newWindows;
        });
        setShowWindowsMenu(false);
    };

    const resetWindowLayout = () => {
        setWindows(initialWindows);
        setShowWindowsMenu(false);
    }

    return (
        <header 
            className="p-2 mb-4 text-lg"
            style={{ border: `1px solid ${theme.colors.accent1}` }}
        >
            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <HeaderButton onClick={onMenu}>Main Menu</HeaderButton>
                    <HeaderButton onClick={onSettings}>Settings</HeaderButton>
                    <HeaderButton onClick={onSave}>Save Game</HeaderButton>
                    <div className="relative">
                        <HeaderButton onClick={() => setShowWindowsMenu(s => !s)}>Windows</HeaderButton>
                        {showWindowsMenu && (
                            <div 
                                className="absolute top-full left-0 p-1" 
                                style={{backgroundColor: theme.colors.bg, border: `1px solid ${theme.colors.accent1}`, zIndex: 9999}}
                                onMouseLeave={() => setShowWindowsMenu(false)}
                            >
                               <DropdownItem onClick={showAllWindows}>Show All Windows</DropdownItem>
                               <DropdownItem onClick={minimizeAllWindows}>Minimize All Windows</DropdownItem>
                               <DropdownItem onClick={resetWindowLayout}>Reset Window Layout</DropdownItem>
                            </div>
                        )}
                    </div>
                </div>
                <h1 style={{color: theme.colors.accent1}} className="whitespace-pre">HOLE AI</h1>
            </div>
            <div className="mt-2 pt-2 flex justify-between" style={{ borderTop: `1px solid ${theme.colors.accent1}` }}>
                <span className="whitespace-pre">{`CHARACTER: ${characterName}`}</span>
                <span className="whitespace-pre">{`LOCATION: ${location}`}</span>
            </div>
        </header>
    );
};