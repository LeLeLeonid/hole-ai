import React, { useState, useEffect, useRef } from 'react';
import { GameScreen } from './components/GameScreen';
import { InputHandler } from './components/InputHandler';
import { InventoryPanel } from './components/InventoryPanel';
import { useGameLoop } from './hooks/useGameLoop';
import { Header } from './components/Header';
import { GameLog } from './components/GameLog';
import { MainMenu } from './components/MainMenu';
import { SettingsMenu } from './components/SettingsMenu';
import { useTheme } from './contexts/ThemeContext';
import type { GameState, SaveSlot, WindowState, WindowId, WindowPosition, WindowSize, SnapState } from './types';
import { LoadMenu } from './components/LoadMenu';
import { NpcPanel } from './components/NpcPanel';
import { AnimatedBackground } from './components/AnimatedBackground';
import { useSettings } from './contexts/SettingsContext';
import { DraggableWindow } from './components/DraggableWindow';
import { PlayerStatsPanel } from './components/PlayerStatsPanel';
import { PovPanel } from './components/PovPanel';

type GameView = 'menu' | 'settings' | 'game' | 'load';

const INITIAL_WINDOWS_STATE: Record<WindowId, WindowState> = {
  map: {
    id: 'map', title: 'MAP', isOpen: true, isMinimized: false, isMaximized: false,
    position: { x: 20, y: 100 }, size: { width: 650, height: 400 }, zIndex: 2,
    isSnapped: { top: false, right: false, bottom: false, left: false }
  },
  log: {
    id: 'log', title: 'LOG', isOpen: true, isMinimized: false, isMaximized: false,
    position: { x: 25, y: 520 }, size: { width: 640, height: 300 }, zIndex: 1,
    isSnapped: { top: false, right: false, bottom: false, left: false }
  },
  inventory: {
    id: 'inventory', title: 'INVENTORY', isOpen: true, isMinimized: false, isMaximized: false,
    position: { x: 720, y: 100 }, size: { width: 400, height: 350 }, zIndex: 3,
    isSnapped: { top: false, right: false, bottom: false, left: false }
  },
  allies: {
    id: 'allies', title: 'ALLIES', isOpen: true, isMinimized: false, isMaximized: false,
    position: { x: 720, y: 470 }, size: { width: 400, height: 350 }, zIndex: 4,
    isSnapped: { top: false, right: false, bottom: false, left: false }
  },
  pov: {
    id: 'pov', title: 'POINT OF VIEW', isOpen: true, isMinimized: false, isMaximized: false,
    position: { x: 1150, y: 100 }, size: { width: 500, height: 350 }, zIndex: 5,
    isSnapped: { top: false, right: false, bottom: false, left: false },
    type: 'POV'
  },
  stats: {
    id: 'stats', title: 'CHARACTER STATS', isOpen: true, isMinimized: false, isMaximized: false,
    position: { x: 1150, y: 470 }, size: { width: 500, height: 350 }, zIndex: 6,
    isSnapped: { top: false, right: false, bottom: false, left: false },
    type: 'STATS'
  }
};


export default function App() {
  const { gameState, setGameState, processPlayerCommand, startGame, isLoading } = useGameLoop();
  const [view, setView] = useState<GameView>('menu');
  const { theme, setTheme } = useTheme();
  const { settings, setSettings } = useSettings();
  const mainRef = useRef<HTMLElement>(null);
  const [bounds, setBounds] = useState<DOMRect | null>(null);

  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(INITIAL_WINDOWS_STATE);

  useEffect(() => {
    if (mainRef.current) {
        setBounds(mainRef.current.getBoundingClientRect());
    }
  }, [view]); // Recalculate on view change

  // Sync contextual windows from game state to UI state
  useEffect(() => {
    setWindows(currentWindows => {
        const newWindows = { ...currentWindows };
        let maxZ = Math.max(1, ...Object.values(newWindows).map((w: WindowState) => w.zIndex));
        
        gameState.contextualWindows.forEach((cw, index) => {
            if (!newWindows[cw.id]) {
                // Add new window if it doesn't exist
                newWindows[cw.id] = {
                    id: cw.id,
                    title: cw.title,
                    type: cw.type,
                    isOpen: true,
                    isMinimized: false,
                    isMaximized: false,
                    position: { x: 1150, y: 100 + (index * 400) },
                    size: { width: 500, height: 350 },
                    zIndex: ++maxZ,
                    isSnapped: { top: false, right: false, bottom: false, left: false },
                };
            } else {
                // Update title if it has changed
                newWindows[cw.id].title = cw.title;
            }
        });
        // Potentially remove windows that are no longer in context in the future
        return newWindows;
    });
  }, [gameState.contextualWindows]);

  const bringToFront = (id: WindowId) => {
    setWindows(currentWindows => {
      const maxZ = Math.max(...Object.values(currentWindows).map((w: WindowState) => w.zIndex));
      if (currentWindows[id].zIndex === maxZ) return currentWindows;
      return {
        ...currentWindows,
        [id]: { ...currentWindows[id], zIndex: maxZ + 1 }
      };
    });
  };

  const handleStartGame = () => {
    startGame();
    setWindows(INITIAL_WINDOWS_STATE);
    setView('game');
  };

  const handleSaveGame = () => {
    try {
      const saves: SaveSlot[] = JSON.parse(localStorage.getItem('hole-ai-saves') || '[]');
      const newSave: SaveSlot = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        gameState: gameState,
        windowState: windows,
        themeName: theme.name,
        settings: settings
      };
      const updatedSaves = [newSave, ...saves].slice(0, 10);
      localStorage.setItem('hole-ai-saves', JSON.stringify(updatedSaves));
      
      setGameState(prev => ({
        ...prev,
        log: [...prev.log, 'Game saved successfully.']
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
    setWindows(loadedSave.windowState);
    setTheme(loadedSave.themeName);
    setSettings(loadedSave.settings);
    setView('game');
  };
  
  const handleMaximize = (id: WindowId) => {
    setWindows(ws => {
      const currentWin = ws[id];
      const isMaximizing = !currentWin.isMaximized;
      if (isMaximizing && bounds) {
        return { ...ws, [id]: { 
            ...currentWin, 
            isMaximized: true,
            previousPosition: currentWin.position,
            previousSize: currentWin.size,
            position: { x: 0, y: 0 },
            size: { width: bounds.width -10, height: bounds.height -10 },
          }};
      } else {
        return { ...ws, [id]: { 
            ...currentWin, 
            isMaximized: false,
            position: currentWin.previousPosition || currentWin.position,
            size: currentWin.previousSize || currentWin.size,
          }};
      }
    });
  };

  const renderGame = () => {
    const openWindows = Object.values(windows)
      .filter((w: WindowState) => w.isOpen)
      .sort((a: WindowState, b: WindowState) => a.zIndex - b.zIndex);

    const getWindowContent = (win: WindowState) => {
        const id = win.id;
        switch (id) {
            case 'map': return <GameScreen asciiMap={gameState.location.asciiMap} />;
            case 'log': return <GameLog log={gameState.log} />;
            case 'inventory': return <InventoryPanel inventory={gameState.player.inventory} />;
            case 'allies': return <NpcPanel npcs={gameState.npcs} />;
            case 'stats': return <PlayerStatsPanel stats={gameState.player.stats} />;
            case 'pov': return <PovPanel pov={gameState.player.pov} />;
            default:
                switch (win.type) {
                    // This can be expanded for other dynamic types like INTERNET or TEXT
                    default: return <div>Unsupported window type: {win.type}</div>;
                }
        }
    };

    return (
      <>
        <Header 
          characterName={gameState.player.name} 
          location={gameState.location.name}
          onMenu={() => setView('menu')}
          onSettings={() => setView('settings')}
          onSave={handleSaveGame}
          windows={windows}
          setWindows={setWindows}
          initialWindows={INITIAL_WINDOWS_STATE}
        />
        
        <main ref={mainRef} className="flex-grow relative overflow-hidden">
          {openWindows.map((win: WindowState) => (
            <DraggableWindow
              key={win.id}
              title={win.title}
              position={win.position}
              size={win.size}
              zIndex={win.zIndex}
              isMinimized={win.isMinimized}
              isMaximized={win.isMaximized}
              isSnapped={win.isSnapped}
              parentBounds={bounds}
              onClose={() => setWindows(ws => ({ ...ws, [win.id]: { ...ws[win.id], isOpen: false } }))}
              onMinimize={() => setWindows(ws => ({ ...ws, [win.id]: { ...ws[win.id], isMinimized: !ws[win.id].isMinimized } }))}
              onMaximize={() => handleMaximize(win.id)}
              onPositionChange={(pos, snap) => setWindows(ws => ({ ...ws, [win.id]: { ...ws[win.id], position: pos, isSnapped: snap } }))}
              onSizeChange={(size) => setWindows(ws => ({ ...ws, [win.id]: { ...ws[win.id], size: size } }))}
              onFocus={() => bringToFront(win.id)}
            >
              {getWindowContent(win)}
            </DraggableWindow>
          ))}
        </main>

        <footer className="mt-4">
          <InputHandler 
            onCommand={processPlayerCommand} 
            isLoading={isLoading} 
            suggestedActions={gameState.suggestedActions} 
          />
        </footer>
      </>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col p-4 font-mono text-lg transition-all duration-300 overflow-hidden"
      style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
    >
      {view !== 'game' && <AnimatedBackground style={settings.background} />}
      <div className="relative z-10 flex flex-col flex-grow">
        {view === 'menu' && <MainMenu onStart={handleStartGame} onSettings={() => setView('settings')} onLoad={() => setView('load')} />}
        {view === 'settings' && <SettingsMenu onBack={() => setView('menu')} />}
        {view === 'load' && <LoadMenu onBack={() => setView('menu')} onLoadGame={handleLoadGame} />}
        {view === 'game' && renderGame()}
      </div>
    </div>
  );
}