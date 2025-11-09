import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { PanelId, PanelState } from '../types';

interface HeaderProps {
    characterName: string;
    location: string;
    onMenu: () => void;
    onSettings: () => void;
    onSave: () => void;
    panels: Record<PanelId, PanelState>;
    onPanelToggle: (id: PanelId) => void;
    isLogOnlyMode: boolean;
    onToggleLogOnlyMode: () => void;
}

const HeaderButton: React.FC<{onClick: () => void, children: React.ReactNode, isActive?: boolean}> = ({ onClick, children, isActive }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered || isActive ? theme.colors.highlightBg : 'transparent',
        color: isHovered || isActive ? theme.colors.highlightText : theme.colors.text,
        cursor: 'pointer',
      }}
      className="px-1 bg-transparent border-none"
    >
      [ {children} ]
    </button>
  );
};

const DropdownMenuItem: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => {
    const { theme } = useTheme();
    return (
        <button 
            onClick={onClick} 
            className="whitespace-nowrap cursor-pointer p-1 flex items-center w-full text-left bg-transparent border-none"
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
        </button>
    )
}

export const Header: React.FC<HeaderProps> = ({ 
    characterName, location, onMenu, onSettings, onSave, 
    panels, onPanelToggle, isLogOnlyMode, onToggleLogOnlyMode
}) => {
    const { theme } = useTheme();
    const [showWindowsMenu, setShowWindowsMenu] = useState(false);
    const [isWindowsHovered, setIsWindowsHovered] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowWindowsMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);
    
    return (
        <header 
            className="relative p-2 mb-2 text-lg flex-shrink-0"
            style={{ 
                border: `1px solid ${theme.colors.accent1}`
            }}
        >
            <span className="absolute -top-px -left-px" style={{ color: theme.colors.accent1, lineHeight: '1' }}>+</span>
            <span className="absolute -top-px -right-px" style={{ color: theme.colors.accent1, lineHeight: '1' }}>+</span>
            <span className="absolute -bottom-px -left-px" style={{ color: theme.colors.accent1, lineHeight: '1' }}>+</span>
            <span className="absolute -bottom-px -right-px" style={{ color: theme.colors.accent1, lineHeight: '1' }}>+</span>

            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <HeaderButton onClick={onMenu}>Main Menu</HeaderButton>
                    <HeaderButton onClick={onSettings}>Settings</HeaderButton>
                    <HeaderButton onClick={onSave}>Save Game</HeaderButton>
                    <div className="relative" ref={menuRef}>
                        <div 
                            className="flex items-center"
                            onMouseEnter={() => setIsWindowsHovered(true)}
                            onMouseLeave={() => setIsWindowsHovered(false)}
                             style={{
                                backgroundColor: isWindowsHovered || showWindowsMenu || isLogOnlyMode ? theme.colors.highlightBg : 'transparent',
                                color: isWindowsHovered || showWindowsMenu || isLogOnlyMode ? theme.colors.highlightText : theme.colors.text,
                            }}
                        >
                            <button
                                onClick={onToggleLogOnlyMode}
                                className="pl-1 pr-0 bg-transparent border-none"
                                style={{
                                    color: 'inherit',
                                    cursor: 'pointer',
                                }}
                            >
                                [ Windows
                            </button>
                            <button
                                onClick={() => setShowWindowsMenu(p => !p)}
                                className="pr-1 pl-1 bg-transparent border-none"
                                style={{
                                    color: 'inherit',
                                    cursor: 'pointer',
                                }}
                            >
                                {showWindowsMenu ? '▲' : '▼'} ]
                            </button>
                        </div>
                        {showWindowsMenu && (
                            <div 
                                className="absolute top-full left-0 p-1 min-w-[200px]" 
                                style={{backgroundColor: theme.colors.bg, border: `1px solid ${theme.colors.accent1}`, zIndex: 9999}}
                            >
                               <div className="px-1 opacity-75">Toggle Panels</div>
                               {Object.values(panels).map((panel: PanelState) => (
                                   <DropdownMenuItem key={panel.id} onClick={() => onPanelToggle(panel.id)}>
                                       <span className="inline-block w-4 text-center">{panel.isOpen ? '✓' : '•'}</span> {panel.title}
                                   </DropdownMenuItem>
                               ))}
                            </div>
                        )}
                    </div>
                </div>
                <h1 style={{color: theme.colors.accent1}} className="whitespace-pre">HOLE AI v.0.4</h1>
            </div>
            <div className="mt-2 pt-2 flex justify-between" style={{ borderTop: `1px solid ${theme.colors.accent1}` }}>
                <span className="whitespace-pre">{`CHARACTER: ${characterName}`}</span>
                <span className="whitespace-pre">{`LOCATION: ${location}`}</span>
            </div>
        </header>
    );
};
