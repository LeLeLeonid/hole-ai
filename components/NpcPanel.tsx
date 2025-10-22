import React, { useState } from 'react';
import type { NPC } from '../types';
import { useTheme } from '../contexts/ThemeContext';

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
                                    {npc.name}
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