import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { GameState, SaveSlot } from '../types';

interface LoadMenuProps {
  onBack: () => void;
  onLoadGame: (saveSlot: SaveSlot) => void;
}

const MenuButton: React.FC<{onClick: () => void, children: React.ReactNode, disabled?: boolean}> = ({ onClick, children, disabled }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
      <div 
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? theme.colors.highlightBg : 'transparent',
          color: disabled ? theme.colors.disabledText : (isHovered ? theme.colors.highlightText : theme.colors.text),
          cursor: disabled ? 'default' : 'pointer',
        }}
        className="p-2 text-2xl tracking-widest"
      >
        [ {children} ]
      </div>
    );
};

export const LoadMenu: React.FC<LoadMenuProps> = ({ onBack, onLoadGame }) => {
  const { theme } = useTheme();
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [selectedSave, setSelectedSave] = useState<SaveSlot | null>(null);

  useEffect(() => {
    try {
      const savedGames = localStorage.getItem('hole-ai-saves');
      if (savedGames) {
        setSaves(JSON.parse(savedGames));
      }
    } catch (error) {
      console.error("Failed to load saved games:", error);
    }
  }, []);

  const handleLoadClick = () => {
    if (selectedSave) {
      onLoadGame(selectedSave);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl tracking-widest mb-8" style={{ color: theme.colors.accent1 }}>[ LOAD GAME ]</h1>
      
      <div className="w-full max-w-lg mb-8 p-2" style={{ border: `1px solid ${theme.colors.accent1}` }}>
        <div className="h-64 overflow-y-auto">
            {saves.length === 0 ? (
                <p className="p-2" style={{color: theme.colors.disabledText}}>No saved games found.</p>
            ) : (
                saves.map(save => (
                    <div 
                        key={save.id}
                        onClick={() => setSelectedSave(save)}
                        className="text-xl cursor-pointer p-2"
                        style={{
                            backgroundColor: selectedSave?.id === save.id ? theme.colors.highlightBg : 'transparent',
                            color: selectedSave?.id === save.id ? theme.colors.highlightText : theme.colors.text,
                        }}
                    >
                        {`> Save from ${new Date(save.timestamp).toLocaleString()}`}
                        <br/>
                        <span className="text-base pl-4 opacity-80">{`${save.gameState.player.name} in ${save.gameState.location.name}`}</span>
                    </div>
                ))
            )}
        </div>
      </div>

      <div className="flex gap-4">
        <MenuButton onClick={handleLoadClick} disabled={!selectedSave}>LOAD</MenuButton>
        <MenuButton onClick={onBack}>BACK</MenuButton>
      </div>
    </div>
  );
};