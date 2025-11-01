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
import type { GameState, SaveSlot, PanelState, PanelId } from './types';
import { LoadMenu } from './components/LoadMenu';
import { NpcPanel } from './components/NpcPanel';
import { AnimatedBackground } from './components/AnimatedBackground';
import { useSettings } from './contexts/SettingsContext';
import { PlayerStatsPanel } from './components/PlayerStatsPanel';
import { PovPanel } from './components/PovPanel';
import { Window } from './components/Window';

type GameView = 'menu' | 'settings' | 'game' | 'load';

// LAYOUT REFACTOR: Added `isMinimized` state for proper window controls.
const INITIAL_PANELS_STATE: Record<PanelId, PanelState> = {
  log: { id: 'log', title: 'LOG', isOpen: true, isMaximized: false, isMinimized: false, pos: {x:0, y:0}, size: {width: 0, height: 0}, zIndex: 1, minSize: { width: 300, height: 150 } },
  inventory: { id: 'inventory', title: 'INVENTORY', isOpen: true, isMaximized: false, isMinimized: false, pos: { x: 600, y: 340 }, size: { width: 320, height: 350 }, zIndex: 3, minSize: { width: 250, height: 200 } },
  map: { id: 'map', title: 'MAP', isOpen: true, isMaximized: false, isMinimized: false, pos: { x: 20, y: 20 }, size: { width: 560, height: 300 }, zIndex: 2, minSize: { width: 400, height: 250 } },
  stats: { id: 'stats', title: 'CHARACTER STATS', isOpen: true, type: 'STATS', isMaximized: false, isMinimized: false, pos: { x: 940, y: 20 }, size: { width: 300, height: 180 }, zIndex: 4, minSize: { width: 280, height: 150 } },
  allies: { id: 'allies', title: 'Details', isOpen: true, isMaximized: false, isMinimized: false, pos: { x: 940, y: 220 }, size: { width: 300, height: 250 }, zIndex: 2, minSize: { width: 250, height: 200 } },
  pov: { id: 'pov', title: 'POINT OF VIEW', isOpen: true, type: 'POV', isMaximized: false, isMinimized: false, pos: { x: 20, y: 340 }, size: { width: 560, height: 280 }, zIndex: 5, minSize: { width: 400, height: 250 } }
};


export default function App() {
  const { gameState, setGameState, processPlayerCommand, startGame, isLoading } = useGameLoop();
  const [view, setView] = useState<GameView>('menu');
  const { theme, setTheme } = useTheme();
  const { settings, setSettings } = useSettings();
  
  const [panels, setPanels] = useState<Record<PanelId, PanelState>>(INITIAL_PANELS_STATE);
  const [showAllWindows, setShowAllWindows] = useState(false);
  const zIndexCounter = useRef(10);
  const mainViewRef = useRef<HTMLDivElement>(null);
  const [viewBounds, setViewBounds] = useState({ top: 0, left: 0, right: 0, bottom: 0 });

  // Calculate the bounds for window dragging and resizing.
  useEffect(() => {
    const calculateBounds = () => {
      if (mainViewRef.current) {
        const rect = mainViewRef.current.getBoundingClientRect();
        setViewBounds({
            top: 0,
            left: 0,
            right: rect.width,
            bottom: rect.height,
        });
      }
    };
    calculateBounds();
    window.addEventListener('resize', calculateBounds);
    return () => window.removeEventListener('resize', calculateBounds);
  }, [view, showAllWindows]); // Recalculate on view mode change

  // Sync contextual windows from game state to UI state
  useEffect(() => {
    setPanels(currentPanels => {
        const newPanels = { ...currentPanels };
        let hasChanged = false;
        
        gameState.contextualWindows.forEach(cw => {
            if (!newPanels[cw.id]) {
                newPanels[cw.id] = { 
                  id: cw.id, title: cw.title, type: cw.type, isOpen: true, isMaximized: false, isMinimized: false,
                  pos: { x: (viewBounds.right / 2) - 200, y: (viewBounds.bottom / 2) - 150 },
                  size: { width: 400, height: 300 },
                  minSize: { width: 300, height: 200 },
                  zIndex: zIndexCounter.current + 1
                };
                zIndexCounter.current += 1;
                hasChanged = true;
            } else if (newPanels[cw.id].title !== cw.title) {
                newPanels[cw.id].title = cw.title;
                hasChanged = true;
            }
        });
        
        return hasChanged ? newPanels : currentPanels;
    });
  }, [gameState.contextualWindows, viewBounds]);


  const handleStartGame = () => {
    startGame();
    setPanels(INITIAL_PANELS_STATE);
    setShowAllWindows(false); // Start in terminal mode
    setView('game');
  };

  const handleSaveGame = () => {
    try {
      const saves: SaveSlot[] = JSON.parse(localStorage.getItem('hole-ai-saves') || '[]');
      const newSave: SaveSlot = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        gameState: gameState,
        panelState: panels,
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
    setPanels(loadedSave.panelState || INITIAL_PANELS_STATE);
    setShowAllWindows(false); // Always load into terminal mode
    setTheme(loadedSave.themeName);
    setSettings(loadedSave.settings);
    setView('game');
  };

  const togglePanel = (id: PanelId) => {
    setPanels(p => ({
        ...p,
        [id]: { ...p[id], isOpen: !p[id].isOpen }
    }));
  }

  // --- WINDOW MANAGEMENT HANDLERS ---
  
  const handleAutoArrange = (isFirstShow = false) => {
    if (!mainViewRef.current) return;
    const { width, height } = mainViewRef.current.getBoundingClientRect();

    setPanels(currentPanels => {
        const newPanels = { ...currentPanels };
        const openPanelIds = isFirstShow
            ? Object.keys(INITIAL_PANELS_STATE)
            : Object.keys(newPanels).filter(id => newPanels[id as PanelId].isOpen);

        const margin = 10;
        const logHeight = Math.max(Math.floor(height * 0.25), 150) - margin;
        const mainAreaHeight = height - logHeight - margin * 2;
        
        const leftColWidth = Math.floor(width * 0.6) - margin * 1.5;
        const rightColWidth = width - leftColWidth - margin * 3;

        const leftColPanels = ['map', 'pov'];
        const rightColPanels = ['stats', 'inventory', 'allies'];
        
        if (openPanelIds.includes('log')) {
            newPanels['log'] = { ...newPanels['log'], pos: { x: margin, y: mainAreaHeight + margin }, size: { width: width - margin * 2, height: logHeight }, isMaximized: false, isMinimized: false };
        }

        const openLeftPanels = leftColPanels.filter(id => openPanelIds.includes(id));
        const leftPanelHeight = openLeftPanels.length > 0 ? (mainAreaHeight - (openLeftPanels.length - 1) * margin) / openLeftPanels.length : 0;
        let currentY = margin;
        openLeftPanels.forEach(id => {
            newPanels[id] = { ...newPanels[id], pos: { x: margin, y: currentY }, size: { width: leftColWidth, height: leftPanelHeight }, isMaximized: false, isMinimized: false };
            currentY += leftPanelHeight + margin;
        });
        
        const openRightPanels = rightColPanels.filter(id => openPanelIds.includes(id));
        const rightPanelHeight = openRightPanels.length > 0 ? (mainAreaHeight - (openRightPanels.length - 1) * margin) / openRightPanels.length : 0;
        currentY = margin;
        openRightPanels.forEach(id => {
            newPanels[id] = { ...newPanels[id], pos: { x: leftColWidth + margin * 2, y: currentY }, size: { width: rightColWidth, height: rightPanelHeight }, isMaximized: false, isMinimized: false };
            currentY += rightPanelHeight + margin;
        });

        return newPanels;
    });
};

  const bringWindowToFront = (id: PanelId) => {
    if (panels[id].zIndex >= zIndexCounter.current - 1) return;
    zIndexCounter.current += 1;
    setPanels(p => ({
        ...p,
        [id]: { ...p[id], zIndex: zIndexCounter.current }
    }));
  };
  
  const updateWindowPosition = (id: PanelId, pos: { x: number; y: number }) => {
    setPanels(p => ({ ...p, [id]: { ...p[id], pos } }));
  };

  const updateWindowSize = (id: PanelId, size: { width: number; height: number }) => {
    setPanels(p => ({ ...p, [id]: { ...p[id], size } }));
  };
  
  // FEATURE: Handler for the new minimize state.
  const toggleMinimizePanel = (id: PanelId) => {
    setPanels(p => {
        const currentPanel = p[id];
        const isMinimized = !currentPanel.isMinimized;
        // If we are minimizing, ensure maximized is false.
        // If we are un-minimizing, it returns to its previous normal/maximized state.
        const isMaximized = isMinimized ? false : currentPanel.isMaximized;

        return {
            ...p,
            [id]: {
                ...currentPanel,
                isMinimized: isMinimized,
                // Un-minimizing a maximized window should restore it to maximized state.
                isMaximized: isMinimized ? false : currentPanel.isMaximized,
            }
        };
    });
  };

  const toggleWindowMaximized = (id: PanelId) => {
    setPanels(p => {
        const currentPanel = p[id];
        const isCurrentlyMaximized = currentPanel.isMaximized;
        
        return {
            ...p,
            [id]: {
                ...currentPanel,
                isMaximized: !isCurrentlyMaximized,
                isMinimized: false, // Maximizing always un-minimizes
                prevPos: !isCurrentlyMaximized ? currentPanel.pos : currentPanel.prevPos,
                prevSize: !isCurrentlyMaximized ? currentPanel.size : currentPanel.prevSize,
                pos: isCurrentlyMaximized ? (currentPanel.prevPos || {x: 20, y: 20}) : { x: 0, y: 0 },
                size: isCurrentlyMaximized ? (currentPanel.prevSize || {width: 500, height: 400}) : { width: viewBounds.right, height: viewBounds.bottom }
            }
        }
    });
  };

  const renderGame = () => {
    const getPanelContent = (panel: PanelState) => {
        // Hide unsupported panel types gracefully
        switch (panel.id) {
            case 'map': return <GameScreen asciiMap={gameState.location.asciiMap} />;
            case 'log': return <GameLog log={gameState.log} />;
            case 'inventory': return <InventoryPanel inventory={gameState.player.inventory} />;
            case 'allies': return <NpcPanel npcs={gameState.npcs} />;
            case 'stats': return <PlayerStatsPanel stats={gameState.player.stats} />;
            case 'pov': return <PovPanel pov={gameState.player.pov} />;
            default: 
                if (panel.type) return <div>Content for {panel.title}</div>;
                return null;
        }
    };
    
    const windowPanels = Object.values(panels) as PanelState[];
    const commonHeader = (
        <Header 
          characterName={gameState.player.name} 
          location={gameState.location.name}
          onMenu={() => setView('menu')}
          onSettings={() => setView('settings')}
          onSave={handleSaveGame}
          panels={panels}
          onPanelToggle={togglePanel}
          onToggleAllWindows={() => {
            if (!showAllWindows) {
                setTimeout(() => handleAutoArrange(true), 0);
            }
            setShowAllWindows(s => !s);
          }}
          allWindowsVisible={showAllWindows}
          onAutoArrange={() => handleAutoArrange(false)}
        />
    );
    const commonFooter = (
        <footer className="mt-4 flex-shrink-0">
          <InputHandler 
            onCommand={processPlayerCommand} 
            isLoading={isLoading} 
            suggestedActions={gameState.suggestedActions} 
          />
        </footer>
    );

    // RENDER: Terminal mode (default)
    if (!showAllWindows) {
        return (
            <div className="flex flex-col flex-grow h-full overflow-hidden">
                {commonHeader}
                {/* FIX: The <main> element is now the scrolling container. 
                    `min-h-0` is crucial for flex-grow to work correctly with overflow. 
                    `overflow-y-auto` provides the scrollbar. */}
                <main 
                    ref={mainViewRef}
                    className="flex-grow relative min-h-0 p-2 overflow-y-auto" 
                    style={{ border: `1px solid ${theme.colors.accent1}` }}
                >
                    <GameLog log={gameState.log} />
                </main>
                {commonFooter}
            </div>
        );
    }

    // RENDER: Windowed mode
    return (
      <div className="flex flex-col flex-grow h-full overflow-hidden">
        {commonHeader}
        <main 
            ref={mainViewRef}
            className="flex-grow relative overflow-hidden"
        >
            {windowPanels.map(panel => {
                const panelContent = getPanelContent(panel);
                if (!panel.isOpen || !panelContent) return null;
                const id = panel.id as PanelId;
                return (
                    <Window
                        key={id}
                        panel={panel}
                        bounds={viewBounds}
                        onClose={() => togglePanel(id)}
                        onMinimize={() => toggleMinimizePanel(id)}
                        onMaximize={() => toggleWindowMaximized(id)}
                        onFocus={() => bringWindowToFront(id)}
                        onMove={(pos) => updateWindowPosition(id, pos)}
                        onResize={(size) => updateWindowSize(id, size)}
                    >
                        {panelContent}
                    </Window>
                );
            })}
        </main>
        {commonFooter}
      </div>
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