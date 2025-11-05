import React, { useState } from 'react';
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
    <span
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered || isActive ? theme.colors.highlightBg : 'transparent',
        color: isHovered || isActive ? theme.colors.highlightText : theme.colors.text,
        cursor: 'pointer',
      }}
      className="px-1"
    >
      [ {children} ]
    </span>
  );
};

const DropdownMenuItem: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => {
    const { theme } = useTheme();
    return (
        <div 
            onClick={onClick} 
            className="whitespace-nowrap cursor-pointer p-1 flex items-center"
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

export const Header: React.FC<HeaderProps> = ({ 
    characterName, location, onMenu, onSettings, onSave, 
    panels, onPanelToggle, isLogOnlyMode, onToggleLogOnlyMode
}) => {
    const { theme } = useTheme();
    const [showWindowsMenu, setShowWindowsMenu] = useState(false);
    
    return (
        <header 
            className="p-2 mb-2 text-lg flex-shrink-0"
            style={{ border: `1px solid ${theme.colors.accent1}` }}
        >
            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <HeaderButton onClick={onMenu}>Main Menu</HeaderButton>
                    <HeaderButton onClick={onSettings}>Settings</HeaderButton>
                    <HeaderButton onClick={onSave}>Save Game</HeaderButton>
                    <div 
                        className="relative"
                        onMouseLeave={() => setShowWindowsMenu(false)}
                    >
                        <span
                            onClick={onToggleLogOnlyMode}
                            onMouseEnter={() => setShowWindowsMenu(true)}
                            className="px-1"
                            style={{
                                cursor: 'pointer',
                                backgroundColor: isLogOnlyMode ? theme.colors.highlightBg : 'transparent',
                                color: isLogOnlyMode ? theme.colors.highlightText : theme.colors.text,
                            }}
                            aria-haspopup="true"
                            aria-expanded={showWindowsMenu}
                        >
                          [ Windows ▼ ]
                        </span>
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
                <h1 style={{color: theme.colors.accent1}} className="whitespace-pre">HOLE A! v.0.3</h1>
            </div>
            <div className="mt-2 pt-2 flex justify-between" style={{ borderTop: `1px solid ${theme.colors.accent1}` }}>
                <span className="whitespace-pre">{`CHARACTER: ${characterName}`}</span>
                <span className="whitespace-pre">{`LOCATION: ${location}`}</span>
            </div>
        </header>
    );
};