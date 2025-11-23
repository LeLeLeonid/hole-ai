
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Header } from './Header';
import { GameLog } from './GameLog';
import { InputHandler } from './InputHandler';
import { Panel } from './Panel';
import { PovPanel, InventoryPanel, NpcPanel, GameScreen } from './GamePanels';
import { PlayerStatsPanel } from './PlayerStatsPanel';
import type { GameState, PanelId, PanelState, Settings } from '../types';

interface GameLayoutProps {
    gameState: GameState;
    settings: Settings;
    isLoading: boolean;
    processPlayerCommand: (cmd: string, settings: Settings) => void;
    onSave: () => void;
    onMenu: () => void;
    onSettings: (returnScreen: any) => void;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
    gameState,
    settings,
    isLoading,
    processPlayerCommand,
    onSave,
    onMenu,
    onSettings
}) => {
    const t = useTranslation();
    const [isLogOnlyMode, setIsLogOnlyMode] = useState(false);
    
    // Local UI state for panels
    const [panels, setPanels] = useState<Record<PanelId, PanelState>>({
        pov: { id: 'pov', title: t('pov'), isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        map: { id: 'map', title: t('map'), isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        inventory: { id: 'inventory', title: t('inventory'), isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        stats: { id: 'stats', title: t('stats'), isOpen: false, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        npcs: { id: 'npcs', title: t('npcs'), isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        log: { id: 'log', title: t('log'), isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
    });

    // Update panel titles when language changes
    useEffect(() => {
        setPanels(prev => ({
            pov: { ...prev.pov, title: t('pov') },
            map: { ...prev.map, title: t('map') },
            inventory: { ...prev.inventory, title: t('inventory') },
            stats: { ...prev.stats, title: t('stats') },
            npcs: { ...prev.npcs, title: t('npcs') },
            log: { ...prev.log, title: t('log') },
        }));
    }, [t]);

    const handlePanelToggle = (id: PanelId) => {
        setPanels(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: !prev[id].isOpen }
        }));
    };

    const header = (
        <Header 
            characterName={gameState.player.name}
            location={gameState.location.name}
            onMenu={onMenu}
            onSettings={() => onSettings('game')}
            onSave={onSave}
            panels={panels}
            onPanelToggle={handlePanelToggle}
            isLogOnlyMode={isLogOnlyMode}
            onToggleLogOnlyMode={() => setIsLogOnlyMode(p => !p)}
        />
    );

    const input = (
         <InputHandler 
            onCommand={(cmd) => processPlayerCommand(cmd, settings)}
            isLoading={isLoading}
            difficulty={settings.difficulty}
        />
    );

    if (isLogOnlyMode) {
        return (
            <div className="flex flex-col h-full">
                {header}
                <main className="flex-grow p-2 overflow-hidden">
                    <GameLog log={gameState.log} />
                </main>
                <div className="flex-shrink-0 p-2">
                    {input}
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full">
            {header}
            <main className="flex-grow flex gap-2 p-2 overflow-hidden min-h-0">
                {/* Left Column */}
                <div className="w-2/3 flex flex-col gap-2 h-full min-h-0">
                    {panels.pov.isOpen && (
                        // If Log is closed, POV takes full space (flex-1). If Log open, POV takes 3/4 (flex-[3]).
                        <Panel title={panels.pov.title} className={panels.log.isOpen ? "flex-[3] min-h-0" : "flex-1 min-h-0"}>
                            <PovPanel pov={gameState.player.pov} />
                        </Panel>
                    )}
                    {panels.log.isOpen && (
                         // If POV is closed, Log takes full space (flex-1). If POV open, Log takes 1/4 (flex-1).
                         // Note: flex-1 vs flex-[3] ratio logic works when both exist.
                        <Panel title={t('log')} className="flex-1 min-h-0">
                            <GameLog log={gameState.log} />
                        </Panel>
                    )}
                </div>

                {/* Right Column */}
                <div className="w-1/3 flex flex-col gap-2 h-full min-h-0">
                    {panels.map.isOpen && (
                        <Panel title={panels.map.title} className="flex-1 min-h-0">
                            <GameScreen asciiMap={gameState.location.asciiMap} />
                        </Panel>
                    )}
                    {panels.inventory.isOpen && (
                        <Panel title={panels.inventory.title} className="flex-1 min-h-0">
                            <InventoryPanel inventory={gameState.player.inventory} />
                        </Panel>
                    )}
                     {panels.npcs.isOpen && (
                        <Panel title={panels.npcs.title} className="flex-1 min-h-0">
                            <NpcPanel npcs={gameState.npcs} />
                        </Panel>
                    )}
                    {panels.stats.isOpen && (
                         <Panel title={panels.stats.title} className="flex-1 min-h-0">
                            <PlayerStatsPanel 
                                stats={gameState.player.stats} 
                                soulStats={gameState.player.soulStats}
                                archetype={gameState.player.archetype}
                                hiddenTrait={gameState.player.hiddenTrait}
                            />
                        </Panel>
                    )}
                </div>
            </main>
            <div className="flex-shrink-0 p-2">
                {input}
            </div>
        </div>
    );
};
