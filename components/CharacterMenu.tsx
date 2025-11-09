import React, { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { PREDEFINED_CHARACTERS } from '../characters';
import type { Scenario, Character, CharaCardV3 } from '../types';
import { useCustomContent } from '../hooks/useCustomContent';

interface CharacterMenuProps {
  scenario: Scenario;
  onSelect: (character: Character) => void;
  onBack: () => void;
  isGenerating: boolean;
}

const MenuButton: React.FC<{onClick: () => void, children: React.ReactNode, disabled?: boolean}> = ({ onClick, children, disabled }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
      <button 
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        disabled={disabled}
        style={{
          backgroundColor: isHovered ? theme.colors.highlightBg : 'transparent',
          color: disabled ? theme.colors.disabledText : (isHovered ? theme.colors.highlightText : theme.colors.text),
          cursor: disabled ? 'default' : 'pointer',
        }}
        className="p-2 text-2xl tracking-widest bg-transparent border-none"
      >
        [ {children} ]
      </button>
    );
};

const mapCardToCharacter = (card: CharaCardV3): Character => ({
  name: card.data.name,
  description: card.data.description,
  // The AI will fill in the blanks based on the description
  inventory: [], 
  stats: { 'Note': 'Stats to be determined by Gemini Master' },
  pov: card.data.first_mes || `Awaiting perspective for ${card.data.name}.`,
});


export const CharacterMenu: React.FC<CharacterMenuProps> = ({ scenario, onSelect, onBack, isGenerating }) => {
  const { theme } = useTheme();
  const { customContent } = useCustomContent();
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  
  const allCharacters = useMemo(() => {
    const customCharacters = customContent
        .filter(item => item.type === 'character')
        .map(item => mapCardToCharacter(item.card));
    return [...PREDEFINED_CHARACTERS, ...customCharacters];
  }, [customContent]);

  const handleQuickstart = () => {
    if (allCharacters.length === 0) return;
    const randomChar = allCharacters[Math.floor(Math.random() * allCharacters.length)];
    onSelect(randomChar);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl tracking-widest mb-2" style={{ color: theme.colors.accent1 }}>[ CHOOSE CHARACTER ]</h1>
      <p className="text-xl mb-6" style={{ color: theme.colors.accent2 }}>For Scenario: {scenario.name}</p>
      
      <div className="w-full max-w-4xl h-80 flex gap-4 mb-8">
        {/* Character List */}
        <div className="flex-1 overflow-y-auto" style={{ border: `1px solid ${theme.colors.accent1}` }}>
            {allCharacters.map(char => (
                <div
                    key={char.name}
                    onClick={() => !isGenerating && setSelectedChar(char)}
                    className="p-2 cursor-pointer"
                    style={{
                        backgroundColor: selectedChar?.name === char.name ? theme.colors.highlightBg : 'transparent',
                        color: selectedChar?.name === char.name ? theme.colors.highlightText : theme.colors.text,
                        opacity: isGenerating ? 0.5 : 1,
                    }}
                >
                    <h3 className="text-xl">{char.name}</h3>
                </div>
            ))}
        </div>
        {/* Character Details */}
        <div className="flex-[2] p-2 overflow-y-auto" style={{ border: `1px solid ${theme.colors.accent1}` }}>
            {selectedChar ? (
                <div>
                    <h2 className="text-2xl" style={{color: theme.colors.accent2}}>{selectedChar.name}</h2>
                    <p className="my-2 whitespace-pre-wrap">{selectedChar.description}</p>
                    <h4 className="mt-4">Starting Stats:</h4>
                    <ul className="list-disc list-inside">
                        {Object.entries(selectedChar.stats).map(([key, value]) => <li key={key}>{key}: {value}</li>)}
                    </ul>
                     <h4 className="mt-4">Starting Inventory:</h4>
                    <ul className="list-disc list-inside">
                        {selectedChar.inventory.map(item => <li key={item.name}>{item.name}</li>)}
                    </ul>
                </div>
            ) : (
                <p className="text-center" style={{color: theme.colors.disabledText}}>Select a character to see their details.</p>
            )}
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        <MenuButton onClick={() => selectedChar && onSelect(selectedChar)} disabled={!selectedChar || isGenerating}>
            {isGenerating ? 'GENERATING WORLD...' : 'START GAME'}
        </MenuButton>
        <MenuButton onClick={handleQuickstart} disabled={isGenerating}>
            QUICKSTART
        </MenuButton>
        <MenuButton onClick={onBack} disabled={isGenerating}>BACK</MenuButton>
      </div>
    </div>
  );
};