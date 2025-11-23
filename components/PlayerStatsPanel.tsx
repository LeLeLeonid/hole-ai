
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import type { SoulStats } from '../types';

interface PlayerStatsPanelProps {
    stats: Record<string, string | number> | string; 
    soulStats?: SoulStats;
    archetype?: string;
    hiddenTrait?: string;
}

export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ stats, soulStats, archetype, hiddenTrait }) => {
    const { theme } = useTheme();
    const t = useTranslation();

    const renderBar = (label: string, value: number, max: number, color: string) => (
        <div className="mb-2">
            <div className="flex justify-between text-sm uppercase">
                <span>{label}</span>
                <span>{value}/{max}</span>
            </div>
            <div className="w-full h-2 bg-gray-900 border border-gray-600 relative">
                <div 
                    style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color, height: '100%' }}
                />
            </div>
        </div>
    );
    
    // Robust checking for stats presence and extraction of S.O.U.L if passed in generic stats
    let displaySoul: SoulStats = { S: 0, O: 0, U: 0, L: 0 };
    let hasSoul = false;
    
    if (soulStats) {
        displaySoul = soulStats;
        hasSoul = true;
    } else if (stats && typeof stats === 'object') {
        // Fallback: Try to parse generic stats if soulStats isn't passed explicitly
        const s = Number((stats as any)['S']);
        const o = Number((stats as any)['O']);
        const u = Number((stats as any)['U']);
        const l = Number((stats as any)['L']);
        if (!isNaN(s) && !isNaN(o) && !isNaN(u) && !isNaN(l)) {
            displaySoul = { S: s, O: o, U: u, L: l };
            hasSoul = true;
        }
    }

    // Prepare general stats for display
    let displayStats: [string, string | number][] = [];
    
    if (typeof stats === 'string') {
        displayStats = [['Status', stats]];
    } else if (stats && typeof stats === 'object') {
        // Filter out S,O,U,L keys and also numeric keys (0, 1, 2...) which appear if stats behaves like an array/string object
        displayStats = (Object.entries(stats) as [string, string | number][]).filter(([key]) => {
             if (['S','O','U','L'].includes(key)) return false;
             // Check if key is a number (index), which indicates malformed array-like object
             if (!isNaN(Number(key))) return false; 
             return true;
        });
    }

    // Derived Stats
    // HP based on Organics (Base 20 + O * 10)
    const maxHp = 20 + (displaySoul.O * 10);
    const hp = maxHp; // Currently assume full HP as we don't track damage yet
    
    // Stamina based on Organics + Synapses (Base 20 + (O+S)*5)
    const maxStamina = 20 + ((displaySoul.O + displaySoul.S) * 5);
    const stamina = maxStamina;

    return (
        <div className="h-full flex flex-col font-mono">
            <div className="flex-grow overflow-y-auto p-2">
                
                {archetype && (
                    <div className="mb-4 text-center pb-2" style={{borderBottom: `1px dashed ${theme.colors.disabledText}`}}>
                         <span className="text-xs tracking-widest" style={{color: theme.colors.disabledText}}>[ARCHETYPE]</span><br/>
                         <span className="text-lg font-bold" style={{color: theme.colors.accent1}}>{archetype}</span>
                    </div>
                )}

                {/* VITALITY SECTION */}
                <div className="mb-4 pb-2" style={{borderBottom: `1px dashed ${theme.colors.disabledText}`}}>
                     <h3 className="text-center mb-2 font-bold text-xs tracking-widest" style={{color: theme.colors.accent2}}>- VITALITY -</h3>
                     {renderBar("HP", hp, maxHp, "#ff3333")}
                     {renderBar("STAMINA", stamina, maxStamina, "#00ccff")}
                </div>

                {/* SOUL SECTION */}
                <div className="mb-4 pb-2" style={{borderBottom: `1px dashed ${theme.colors.disabledText}`}}>
                    <h3 className="text-center mb-2 font-bold text-xs tracking-widest" style={{color: theme.colors.accent2}}>- S.O.U.L. -</h3>
                    {hasSoul ? (
                        <>
                            {renderBar("SYNAPSES", displaySoul.S, 10, "#00ccff")}
                            {renderBar("ORGANICS", displaySoul.O, 10, "#ff3333")}
                            {renderBar("UNCERTAINTY", displaySoul.U, 10, "#cc00ff")}
                            {renderBar("LORE", displaySoul.L, 10, "#ffff00")}
                        </>
                    ) : (
                         <div className="text-center opacity-50 text-xs py-2">
                            [BIOMETRICS OFFLINE]
                        </div>
                    )}
                </div>
                
                {hiddenTrait && (
                    <div className="mb-4 text-center">
                         <span className="text-xs tracking-widest" style={{color: theme.colors.disabledText}}>[HIDDEN TRAIT]</span><br/>
                         <p className="text-sm italic text-gray-400">{hiddenTrait}</p>
                    </div>
                )}

                {displayStats.length > 0 && (
                    <>
                        <h3 className="text-center mb-2 font-bold text-xs tracking-widest" style={{color: theme.colors.accent2}}>- STATUS -</h3>
                        <ul className="space-y-1">
                            {displayStats.map(([key, value]) => (
                                <li key={key} className="flex justify-between text-sm">
                                    <span style={{color: theme.colors.text}}>{key}:</span>
                                    <span style={{color: theme.colors.accent1}}>{value}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
};
