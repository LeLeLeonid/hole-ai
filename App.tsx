import React, { useState, useEffect, useRef } from 'react';
import { InputHandler } from './components/InputHandler';
import { InventoryPanel } from './components/InventoryPanel';
import { useGameLoop } from './hooks/useGameLoop';
import { Header } from './components/Header';
import { GameLog } from './components/GameLog';
import { MainMenu } from './components/MainMenu';
import { SettingsMenu } from './components/SettingsMenu';
import { useTheme } from './contexts/ThemeContext';
import type { GameState, SaveSlot, PanelState, PanelId } from './types';
import { LoadMenu } from './components/LoadMenu';
import { NpcPanel } from './components/NpcPanel';
import { AnimatedBackground } from './components/AnimatedBackground';
import { useSettings } from './contexts/SettingsContext';
import { PlayerStatsPanel } from './components/PlayerStatsPanel';
import { PovPanel } from './components/PovPanel';
import { Panel } from './components/Panel';
import { GameScreen } from './components/GameScreen';

type GameView = 'menu' | 'settings' | 'game' | 'load';

const INITIAL_PANELS_STATE: Record<PanelId, PanelState> = {
  log: { id: 'log', title: 'LOG', isOpen: true },
  inventory: { id: 'inventory', title: 'INVENTORY', isOpen: true },
  map: { id: 'map', title: 'MAP', isOpen: true },
  stats: { id: 'stats', title: 'CHARACTER STATS', isOpen: false, type: 'STATS' },
  allies: { id: 'allies', title: 'ALLIES', isOpen: false },
  pov: { id: 'pov', title: 'POINT OF VIEW', isOpen: true, type: 'POV' }
};


export default function App() {
  const { gameState, setGameState, processPlayerCommand, startGame, isLoading } = useGameLoop();
  const [view, setView] = useState<GameView>('menu');
  const { theme, setTheme } = useTheme();
  const { settings, setSettings } = useSettings();
  
  const [panels, setPanels] = useState<Record<PanelId, PanelState>>(INITIAL_PANELS_STATE);
  const [isLogOnlyMode, setIsLogOnlyMode] = useState(false);
  const mainViewRef = useRef<HTMLDivElement>(null);

  const handleStartGame = () => {
    startGame();
    setPanels(INITIAL_PANELS_STATE);
    setView('game');
  };

  const handleSaveGame = () => {
    try {
      const saveState: SaveSlot = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        gameState: gameState,
        themeName: theme.name,
        settings: settings
      };
      
      const jsonString = JSON.stringify(saveState, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Create a clean filename
      a.download = `hole-ai-save-${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setGameState(prev => ({
        ...prev,
        log: [...prev.log, 'Game state saved to file.']
      }));

    } catch (error) {
      console.error("Failed to save game:", error);
      setGameState(prev => ({
        ...prev,
        log: [...prev.log, 'There was an error saving your game.']
      }));
    }
  };

  const handleLoadGame = (loadedSave: SaveSlot) => {
    setGameState(loadedSave.gameState);
    // Reset panels to initial state
    setPanels(INITIAL_PANELS_STATE); 
    setTheme(loadedSave.themeName);
    setSettings(loadedSave.settings);
    setView('game');
  };
  
  const togglePanel = (id: PanelId) => {
    setPanels(p => {
        const panel = p[id];
        if (!panel) return p;
        return {
            ...p,
            [id]: { ...panel, isOpen: !panel.isOpen }
        };
    });
  }

  const renderGame = () => {
    if (isLogOnlyMode) {
      return (
        <div className="flex flex-col flex-grow h-full overflow-hidden">
          <Header
            characterName={gameState.player.name}
            location={gameState.location.name}
            onMenu={() => setView('menu')}
            onSettings={() => setView('settings')}
            onSave={handleSaveGame}
            panels={panels}
            onPanelToggle={togglePanel}
            isLogOnlyMode={isLogOnlyMode}
            onToggleLogOnlyMode={() => setIsLogOnlyMode(p => !p)}
          />
          <main className="flex-grow flex flex-col overflow-hidden">
             {/* Render GameLog directly for a seamless, chrome-less view */}
             <GameLog log={gameState.log} />
          </main>
          <footer className="mt-2 flex-shrink-0">
            <InputHandler 
              onCommand={processPlayerCommand} 
              isLoading={isLoading} 
              suggestedActions={gameState.suggestedActions} 
            />
          </footer>
        </div>
      );
    }

    return (
      <div className="flex flex-col flex-grow h-full overflow-hidden">
        <Header 
          characterName={gameState.player.name} 
          location={gameState.location.name}
          onMenu={() => setView('menu')}
          onSettings={() => setView('settings')}
          onSave={handleSaveGame}
          panels={panels}
          onPanelToggle={togglePanel}
          isLogOnlyMode={isLogOnlyMode}
          onToggleLogOnlyMode={() => setIsLogOnlyMode(p => !p)}
        />
        <main 
            ref={mainViewRef}
            className="flex-grow flex flex-row gap-2 overflow-hidden"
        >
            {/* Left Column */}
            <div className="flex-[3] flex flex-col gap-2 overflow-hidden">
                {panels.pov.isOpen && <Panel title={panels.pov.title} className="flex-[2]"><PovPanel pov={gameState.player.pov} /></Panel>}
                {panels.log.isOpen && <Panel title={panels.log.title} className="flex-[1]"><GameLog log={gameState.log} /></Panel>}
            </div>
            {/* Right Column */}
            <div className="flex-[2] flex flex-col gap-2 overflow-y-auto pb-1">
                {panels.stats.isOpen && <Panel title={panels.stats.title}><PlayerStatsPanel stats={gameState.player.stats} /></Panel>}
                {panels.map.isOpen && <Panel title={panels.map.title}><GameScreen asciiMap={gameState.location.asciiMap} /></Panel>}
                {panels.inventory.isOpen && <Panel title={panels.inventory.title} className="flex-1"><InventoryPanel inventory={gameState.player.inventory} /></Panel>}
                {panels.allies.isOpen && <Panel title={panels.allies.title} className="flex-1"><NpcPanel npcs={gameState.npcs} /></Panel>}
            </div>
        </main>
        <footer className="mt-2 flex-shrink-0">
          <InputHandler 
            onCommand={processPlayerCommand} 
            isLoading={isLoading} 
            suggestedActions={gameState.suggestedActions} 
          />
        </footer>
      </div>
    );
  };

  return (
    <div 
      className="h-screen flex flex-col p-2 font-mono text-lg transition-all duration-300 overflow-hidden"
      style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
    >
      {view !== 'game' && <AnimatedBackground style={settings.background} />}
      <div className="relative z-10 flex flex-col flex-grow h-full">
        {view === 'menu' && <MainMenu onStart={handleStartGame} onSettings={() => setView('settings')} onLoad={() => setView('load')} />}
        {view === 'settings' && <SettingsMenu onBack={() => setView('menu')} />}
        {view === 'load' && <LoadMenu onBack={() => setView('menu')} onLoadGame={handleLoadGame} />}
        {view === 'game' && renderGame()}
      </div>
    </div>
  );
}