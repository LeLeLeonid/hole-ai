import React, { useState, useEffect, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<string>("Select a .json save file to load.");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFeedback("No file selected.");
      return;
    }
    
    setFeedback(`Reading ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("File could not be read as text.");
            const loadedSave = JSON.parse(text) as SaveSlot;
            
            // Basic validation to ensure it's a valid save file
            if (loadedSave.gameState && loadedSave.themeName && loadedSave.settings && loadedSave.timestamp) {
                onLoadGame(loadedSave);
            } else {
                setFeedback("Error: Invalid save file format.");
            }
        } catch (error) {
            console.error("Failed to load or parse save file:", error);
            setFeedback("Error loading file. It may be corrupted or not a valid save file.");
        }
    };
    reader.onerror = () => {
      setFeedback("Error reading the file.");
    }
    reader.readAsText(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl tracking-widest mb-8" style={{ color: theme.colors.accent1 }}>[ LOAD GAME ]</h1>
      
      <div className="w-full max-w-lg mb-8 p-4 text-center" style={{ border: `1px solid ${theme.colors.accent1}` }}>
          <p style={{color: theme.colors.text}}>{feedback}</p>
      </div>

      <input 
        type="file" 
        accept=".json,application/json" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileSelect} 
      />

      <div className="flex gap-4">
        <MenuButton onClick={triggerFileSelect}>LOAD FROM FILE</MenuButton>
        <MenuButton onClick={onBack}>BACK</MenuButton>
      </div>
    </div>
  );
};