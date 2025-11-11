import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { Item, NPC } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

/**
 * Custom hook to calculate the optimal font size for ASCII art
 * to fit perfectly within a container while maintaining aspect ratio.
 */
const useAsciiArtScaler = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ fontSize: '10px', lineHeight: '1.0' });

  const calculateStyle = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) return;

    // For monospace fonts, character width is roughly 0.6 of its font-size (height).
    // We calculate the max possible font size that would fit both horizontally and vertically.
    const maxFontSizeBasedOnWidth = (containerWidth / MAP_WIDTH) / 0.6;
    const maxFontSizeBasedOnHeight = containerHeight / MAP_HEIGHT;

    // The actual font size is the smaller of the two to ensure it never overflows.
    const newFontSize = Math.floor(Math.min(maxFontSizeBasedOnWidth, maxFontSizeBasedOnHeight));
    
    // Enforce a minimum font size for readability.
    const finalFontSize = Math.max(newFontSize, 6);

    setStyle({
        fontSize: `${finalFontSize}px`,
        // Use a fixed line height to ensure character proportions are maintained (no stretching).
        lineHeight: `1.0`
    });
  }, []);

  useEffect(() => {
    const observerTarget = containerRef.current;
    if (!observerTarget) return;

    // Calculate on mount and when the hook is re-run
    calculateStyle();

    // Use ResizeObserver to automatically recalculate when the panel size changes.
    const resizeObserver = new ResizeObserver(calculateStyle);
    resizeObserver.observe(observerTarget);

    // Cleanup by disconnecting the observer.
    return () => {
      resizeObserver.unobserve(observerTarget);
    };
  }, [calculateStyle]);

  return { containerRef, style };
};


// --- GameScreen (Map) Panel ---
interface GameScreenProps {
  asciiMap: string;
}
export const GameScreen: React.FC<GameScreenProps> = ({ asciiMap }) => {
  const { theme } = useTheme();
  const { containerRef, style } = useAsciiArtScaler();
  
  return (
    <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        style={{ 
            backgroundColor: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
      <pre 
        className="whitespace-pre"
        style={{
            color: theme.colors.accent2,
            fontFamily: "'VT323', monospace",
            margin: 0,
            ...style,
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
    const t = useTranslation();

    return (
        <div 
            className="h-full flex flex-col"
        >
            <div className="flex-grow overflow-y-auto">
                {inventory.length === 0 ? (
                    <p className="p-1" style={{color: theme.colors.disabledText}}>{t('inventoryEmpty')}</p>
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
                <h3 className="text-xl">{t('details')}</h3>
                {selectedItem ? (
                    <p className="text-base whitespace-pre-wrap">{selectedItem.description}</p>
                ) : (
                    <p style={{color: theme.colors.disabledText}}>{t('selectItemPrompt')}</p>
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
    const t = useTranslation();

    return (
        <div 
            className="h-full flex flex-col"
        >
            <div className="flex-grow overflow-y-auto">
                {npcs.length === 0 ? (
                    <p className="p-1" style={{color: theme.colors.disabledText}}>{t('npcsEmpty')}</p>
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
                <h3 className="text-xl">{t('details')}</h3>
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
                    <p style={{color: theme.colors.disabledText}}>{t('selectNpcPrompt')}</p>
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
  const { containerRef, style } = useAsciiArtScaler();

  return (
    <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        style={{ 
            backgroundColor: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
      <pre 
        className="whitespace-pre" 
        style={{
            color: theme.colors.accent2, 
            fontFamily: "'VT323', monospace",
            margin: 0,
            ...style
        }}>
        {pov}
      </pre>
    </div>
  );
};