
import React, { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { PREDEFINED_CHARACTERS } from '../characters';
import type { Scenario, Character, CharaCardV3 } from '../types';
import { useCustomContent } from '../hooks/useCustomContent';
import { useTranslation } from '../hooks/useTranslation';

interface CharacterMenuProps {
  scenario: Scenario;
  onSelect: (character: Character) => void;
  onBack: () => void;
  isGenerating: boolean;
  onQuickstart: () => void;
  onAddCharacter: () => void;
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

// Helper function outside the component for robustness
const getCharacterKey = (name: string): string | null => {
    if (name.includes('Elias') || name.includes('Jax')) return 'elias';
    if (name.includes('Kaelen')) return 'kaelen';
    if (name.includes('NEXUS') || name.includes('The Preserved')) return 'nexus';
    return null;
};


export const CharacterMenu: React.FC<CharacterMenuProps> = ({ scenario, onSelect, onBack, isGenerating, onQuickstart, onAddCharacter }) => {
  const { theme } = useTheme();
  const { customContent } = useCustomContent();
  const t = useTranslation();
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  
  const allCharacters = useMemo(() => {
    const customCharacters = customContent
        .filter(item => item.type === 'character')
        .map(item => mapCardToCharacter(item.card));
    return [...PREDEFINED_CHARACTERS, ...customCharacters];
  }, [customContent]);

  const getTranslatedCharacter = (char: Character) => {
    // Only translate if it's one of the original, predefined characters
    if (PREDEFINED_CHARACTERS.some(predefined => predefined.name === char.name)) {
      const keyBase = getCharacterKey(char.name);
      if (keyBase) {
        return {
          ...char,
          name: t(`character_${keyBase}_name` as any),
          description: t(`character_${keyBase}_description` as any),
        };
      }
    }
    return char;
  };

  const selectedTranslatedChar = selectedChar ? getTranslatedCharacter(selectedChar) : null;

  const scenarioNameKey = `scenario_${scenario.name.toLowerCase()}_name` as any;


  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl tracking-widest mb-2" style={{ color: theme.colors.accent1 }}>{t('chooseCharacter')}</h1>
      <p className="text-xl mb-6" style={{ color: theme.colors.accent2 }}>{t('forScenario')}: {t(scenarioNameKey) || scenario.name}</p>
      
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
                    <h3 className="text-xl">{getTranslatedCharacter(char).name}</h3>
                </div>
            ))}

            <div
                onClick={onAddCharacter}
                className="p-2 cursor-pointer mt-2 border-t border-gray-800 hover:bg-gray-900"
                style={{
                    color: theme.colors.accent2,
                }}
            >
                <h3 className="text-xl">[+] {t('importCreate')}</h3>
            </div>
        </div>
        {/* Character Details */}
        <div className="flex-[2] p-2 overflow-y-auto" style={{ border: `1px solid ${theme.colors.accent1}` }}>
            {selectedTranslatedChar ? (
                <div>
                    <h2 className="text-2xl" style={{color: theme.colors.accent2}}>{selectedTranslatedChar.name}</h2>
                    <p className="my-2 whitespace-pre-wrap">{selectedTranslatedChar.description}</p>
                    <h4 className="mt-4 text-lg" style={{color: theme.colors.accent1}}>S.O.U.L. Stats</h4>
                    {selectedTranslatedChar.soulStats ? (
                         <div className="grid grid-cols-2 gap-2 mt-2">
                             <div>S (Synapses): {selectedTranslatedChar.soulStats.S}</div>
                             <div>O (Organics): {selectedTranslatedChar.soulStats.O}</div>
                             <div>U (Uncertainty): {selectedTranslatedChar.soulStats.U}</div>
                             <div>L (Lore): {selectedTranslatedChar.soulStats.L}</div>
                         </div>
                    ) : (
                        <p className="italic">Stats will be generated.</p>
                    )}
                     <h4 className="mt-4">{t('startingInventory')}</h4>
                    <ul className="list-disc list-inside">
                        {selectedTranslatedChar.inventory.map(item => <li key={item.name}>{item.name}</li>)}
                    </ul>
                </div>
            ) : (
                <p className="text-center" style={{color: theme.colors.disabledText}}>{t('selectCharacterPrompt')}</p>
            )}
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        <MenuButton onClick={() => selectedChar && onSelect(selectedChar)} disabled={!selectedChar || isGenerating}>
            {isGenerating ? t('generatingWorld') : t('startGame')}
        </MenuButton>
        <MenuButton onClick={onQuickstart} disabled={isGenerating}>
            {t('quickstart')}
        </MenuButton>
        <MenuButton onClick={onBack} disabled={isGenerating}>{t('back')}</MenuButton>
      </div>
    </div>
  );
};
