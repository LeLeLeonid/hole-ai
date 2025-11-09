import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Item, NPC } from '../types';

// --- GameScreen (Map) Panel ---
interface GameScreenProps {
  asciiMap: string;
}
export const GameScreen: React.FC<GameScreenProps> = ({ asciiMap }) => {
  const { theme } = useTheme();
  return (
    <div 
        className="w-full h-full leading-tight overflow-hidden"
        style={{ 
            backgroundColor: 'inherit',
        }}
    >
      <pre 
        className="p-1 whitespace-pre"
        style={{
            color: theme.colors.accent2,
            fontSize: '0.85em', // Adjusted for better fit
            lineHeight: '1.0',  // Adjusted to make map more square
            margin: 0, // Prevent extra spacing causing scrollbars
        }}
      >
        {asciiMap}
      </pre>
    </div>
  );
};


// --- Inventory Panel ---
interface InventoryPanelProps {
    inventory: Item[];
}
export const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory }) => {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const { theme } = useTheme();

    return (
        <div 
            className="h-full flex flex-col"
        >
            <div className="flex-grow overflow-y-auto">
                {inventory.length === 0 ? (
                    <p className="p-1" style={{color: theme.colors.disabledText}}>Your pockets are empty.</p>
                ) : (
                    <ul className="space-y-1">
                        {inventory.map((item) => (
                            <li key={item.name}>
                                <button 
                                    className="w-full text-left p-1"
                                    style={{
                                        backgroundColor: selectedItem?.name === item.name ? theme.colors.highlightBg : 'transparent',
                                        color: selectedItem?.name === item.name ? theme.colors.highlightText : theme.colors.text,
                                    }}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="h-28 mt-2 pt-2" style={{borderTop: `1px solid ${theme.colors.accent1}`}}>
                <h3 className="text-xl">Details</h3>
                {selectedItem ? (
                    <p className="text-base whitespace-pre-wrap">{selectedItem.description}</p>
                ) : (
                    <p style={{color: theme.colors.disabledText}}>Select an item to view its details.</p>
                )}
            </div>
        </div>
    );
};


// --- NPC Panel ---
interface NpcPanelProps {
    npcs: NPC[];
}
export const NpcPanel: React.FC<NpcPanelProps> = ({ npcs }) => {
    const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
    const { theme } = useTheme();

    return (
        <div 
            className="h-full flex flex-col"
        >
            <div className="flex-grow overflow-y-auto">
                {npcs.length === 0 ? (
                    <p className="p-1" style={{color: theme.colors.disabledText}}>You haven't met anyone yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {npcs.map((npc) => (
                            <li key={npc.name}>
                                <button 
                                    className="w-full text-left p-1"
                                    style={{
                                        backgroundColor: selectedNpc?.name === npc.name ? theme.colors.highlightBg : 'transparent',
                                        color: selectedNpc?.name === npc.name ? theme.colors.highlightText : theme.colors.text,
                                    }}
                                    onClick={() => setSelectedNpc(npc)}
                                >
                                    {npc.isNameKnown ? npc.name : npc.knownAs}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="h-28 mt-2 pt-2 overflow-y-auto" style={{borderTop: `1px solid ${theme.colors.accent1}`}}>
                <h3 className="text-xl">Details</h3>
                {selectedNpc ? (
                    <>
                        <p className="text-base whitespace-pre-wrap">{selectedNpc.description}</p>
                        {selectedNpc.notes.length > 0 && (
                            <div className="mt-2 text-base">
                                {selectedNpc.notes.map((note, i) => (
                                    <p key={i} style={{color: theme.colors.accent2}}>- {note}</p>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p style={{color: theme.colors.disabledText}}>Select a character to view details.</p>
                )}
            </div>
        </div>
    );
};


// --- Player Stats Panel ---
interface PlayerStatsPanelProps {
    stats: Record<string, string | number>;
}
export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ stats }) => {
    const { theme } = useTheme();

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto">
                <ul className="space-y-2 p-1">
                    {Object.entries(stats).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                            <span style={{color: theme.colors.text}}>{key}:</span>
                            <span style={{color: theme.colors.accent2}}>{value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


// --- POV Panel ---
interface PovPanelProps {
  pov: string;
}
export const PovPanel: React.FC<PovPanelProps> = ({ pov }) => {
  const { theme } = useTheme();
  return (
    <div 
        className="w-full h-full text-lg leading-tight overflow-auto"
        style={{ 
            backgroundColor: 'inherit',
        }}
    >
      <pre className="p-1 h-full whitespace-pre" style={{color: theme.colors.accent2, margin: 0}}>
        {pov}
      </pre>
    </div>
  );
};