import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BUILT_IN_SCENARIOS, RANDOM_SCENARIO_TEMPLATE } from '../scenarios';
import type { Scenario, CharaCardV3 } from '../types';
import { useCustomContent } from '../hooks/useCustomContent';

interface ScenarioMenuProps {
  onSelect: (selection: Scenario | CharaCardV3) => void;
  onBack: () => void;
  onAddScenario: () => void;
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

export const ScenarioMenu: React.FC<ScenarioMenuProps> = ({ onSelect, onBack, onAddScenario, isGenerating }) => {
  const { theme } = useTheme();
  const { customContent } = useCustomContent();
  
  const allScenarios = [...BUILT_IN_SCENARIOS, RANDOM_SCENARIO_TEMPLATE];
  const customScenarios = customContent.filter(item => item.type === 'scenario');
  
  const [selected, setSelected] = useState<Scenario | CharaCardV3 | null>(null);

  const getSelectionName = (selection: Scenario | CharaCardV3) => 'spec' in selection ? selection.data.name : selection.name;
  const getSelectionDescription = (selection: Scenario | CharaCardV3) => 'spec' in selection ? selection.data.scenario || selection.data.description : selection.description;

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl tracking-widest mb-8" style={{ color: theme.colors.accent1 }}>[ CHOOSE SCENARIO ]</h1>
      
      <div className="w-full max-w-4xl h-80 flex gap-4 mb-8">
        {/* Scenario List */}
        <div className="flex-1 overflow-y-auto" style={{ border: `1px solid ${theme.colors.accent1}` }}>
            <div className="p-2 opacity-70">Built-in</div>
            {allScenarios.map(sc => (
                <div
                    key={sc.name}
                    onClick={() => !isGenerating && setSelected(sc)}
                    className="p-2 cursor-pointer"
                    style={{
                        backgroundColor: selected && getSelectionName(selected) === sc.name ? theme.colors.highlightBg : 'transparent',
                        color: selected && getSelectionName(selected) === sc.name ? theme.colors.highlightText : theme.colors.text,
                        opacity: isGenerating ? 0.5 : 1,
                    }}
                >
                    <h3 className="text-xl">{sc.name}</h3>
                </div>
            ))}

            {customScenarios.length > 0 && <div className="p-2 opacity-70 mt-4">Custom</div>}
            {customScenarios.map(item => (
                 <div
                    key={item.card.data.name}
                    onClick={() => !isGenerating && setSelected(item.card)}
                    className="p-2 cursor-pointer"
                    style={{
                        backgroundColor: selected && getSelectionName(selected) === item.card.data.name ? theme.colors.highlightBg : 'transparent',
                        color: selected && getSelectionName(selected) === item.card.data.name ? theme.colors.highlightText : theme.colors.text,
                        opacity: isGenerating ? 0.5 : 1,
                    }}
                >
                    <h3 className="text-xl">{item.card.data.name}</h3>
                </div>
            ))}

            <div
                onClick={onAddScenario}
                className="p-2 cursor-pointer"
                style={{
                    color: theme.colors.accent2,
                }}
            >
                <h3 className="text-xl">[+] Import / Create...</h3>
            </div>
        </div>
        {/* Scenario Details */}
        <div className="flex-[2] p-2 overflow-y-auto" style={{ border: `1px solid ${theme.colors.accent1}` }}>
            {selected ? (
                <div>
                    <h2 className="text-2xl" style={{color: theme.colors.accent2}}>{getSelectionName(selected)}</h2>
                    <p className="mt-2 whitespace-pre-wrap">{getSelectionDescription(selected)}</p>
                </div>
            ) : (
                <p className="text-center" style={{color: theme.colors.disabledText}}>Select a scenario to see its description.</p>
            )}
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        <MenuButton onClick={() => selected && onSelect(selected)} disabled={!selected || isGenerating}>
            {isGenerating ? 'GENERATING WORLD...' : 'CONTINUE'}
        </MenuButton>
        <MenuButton onClick={onBack} disabled={isGenerating}>BACK</MenuButton>
      </div>
    </div>
  );
};