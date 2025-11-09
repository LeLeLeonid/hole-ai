import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { useSettings } from './contexts/SettingsContext';
import { useGameLoop } from './hooks/useGameLoop';
import type { GameState, Character, Scenario, PanelId, PanelState, SaveSlot, PlayerPath, CharaCardV3 } from './types';
import { MainMenu } from './components/MainMenu';
import { SettingsMenu } from './components/SettingsMenu';
import { Header } from './components/Header';
import { GameLog } from './components/GameLog';
import { InputHandler } from './components/InputHandler';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Panel } from './components/Panel';
import { PovPanel, PlayerStatsPanel, InventoryPanel, NpcPanel, GameScreen } from './components/GamePanels';
import { generateRandomScenario, generateScenarioFromCard } from './services/geminiService';
import { SplashScreen } from './components/SplashScreen';
import { IntroSequence } from './components/IntroSequence';
import { LoadMenu } from './components/LoadMenu';
import { CreatorToolsMenu } from './components/CreatorToolsMenu';
import { ScenarioMenu } from './components/ScenarioMenu';
import { CharacterMenu } from './components/CharacterMenu';
import { ContentEditor } from './components/ContentEditor';

type AppScreen = 'loading' | 'intro' | 'splash' | 'main-menu' | 'settings' | 'load-game' | 'game' | 'new-game-scenario' | 'new-game-character' | 'creator-tools' | 'content-editor';

const App: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { settings, setSettings, setPath, setIntroCompleted } = useSettings();
    const [screen, setScreen] = useState<AppScreen>('loading');
    const [settingsReturnScreen, setSettingsReturnScreen] = useState<AppScreen>('main-menu');
    const { gameState, setGameState, processPlayerCommand, isLoading, startGame } = useGameLoop();
    const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [selectedCard, setSelectedCard] = useState<CharaCardV3 | null>(null);

    useEffect(() => {
        if (screen === 'loading') {
            if (settings.introCompleted) {
                setScreen('splash');
            } else {
                setScreen('intro');
            }
        }
    }, [settings, screen]);


    const [panels, setPanels] = useState<Record<PanelId, PanelState>>({
        pov: { id: 'pov', title: 'POV', isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        map: { id: 'map', title: 'MAP', isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        inventory: { id: 'inventory', title: 'Inventory', isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        stats: { id: 'stats', title: 'Stats', isOpen: false, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
        npcs: { id: 'npcs', title: 'Allies/NPCs', isOpen: true, position: { x: 0, y: 0 }, size: { width: 0, height: 0 } },
    });
    
    const [isLogOnlyMode, setIsLogOnlyMode] = useState(false);

    useEffect(() => {
        document.body.style.backgroundColor = theme.colors.bg;
        document.body.style.color = theme.colors.text;
    }, [theme]);

    const handleIntroComplete = (path: PlayerPath) => {
        if (path !== 'none') {
            setPath(path);
        }
        setIntroCompleted(true);
        setScreen('main-menu');
    };

    const handleScenarioSelect = (selection: Scenario | CharaCardV3) => {
        if ('spec' in selection) {
            // It's a custom scenario card. Set it aside for later generation
            // and create a temporary Scenario object for the next screen.
            const scenarioForDisplay: Scenario = {
                name: selection.data.name,
                description: selection.data.scenario || selection.data.description,
                initialState: {}, // Not used, just for type compliance
            };
            setSelectedCard(selection);
            setSelectedScenario(scenarioForDisplay);
            setScreen('new-game-character');
        } else {
            // It's a built-in scenario.
            setSelectedScenario(selection);
            setSelectedCard(null); // Ensure card is cleared
            setScreen('new-game-character');
        }
    };

    const handleCharacterSelect = async (character: Character) => {
        let finalState: GameState | null = null;
    
        setIsGeneratingScenario(true); // Set loading state at the beginning
    
        if (selectedCard) {
            // Custom scenario path: generate world from card + selected character
            finalState = await generateScenarioFromCard(selectedCard, character, settings);
        } else if (selectedScenario) {
            // Built-in scenario path
            if (selectedScenario.name === "Random") {
                const generatedState = await generateRandomScenario(character, settings);
                if (generatedState) {
                    finalState = {
                        ...generatedState,
                        player: character,
                    };
                } else {
                    console.error("Failed to generate random scenario.");
                }
            } else {
                finalState = {
                    ...(selectedScenario.initialState as GameState),
                    player: character,
                    scenario: { name: selectedScenario.name, description: selectedScenario.description },
                    turn: 1,
                };
            }
        } else {
            console.error("handleCharacterSelect called without a selected scenario or card.");
        }
        
        setIsGeneratingScenario(false); // Unset loading state at the end
    
        if (finalState) {
            await startGame(finalState);
            setScreen('game');
        } else {
            // Common error handling for failed generation
            alert("Failed to start the game. The Gemini Master may be busy.");
        }
    };

    const handleLoadGame = (saveSlot: SaveSlot) => {
        setTheme(saveSlot.themeName);
        setSettings(saveSlot.settings);
        setGameState(saveSlot.gameState);
        setScreen('game');
    };
    
    const handleSaveGame = () => {
        if (!gameState) return;
        
        const saveSlot: SaveSlot = {
            gameState,
            themeName: theme.name,
            settings: settings,
            timestamp: Date.now(),
        };

        const blob = new Blob([JSON.stringify(saveSlot, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        const date = new Date(saveSlot.timestamp).toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        a.download = `hole-ai-save_${gameState.player.name}_${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    const handlePanelToggle = (id: PanelId) => {
        setPanels(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: !prev[id].isOpen }
        }));
    };
    
    const handleOpenSettings = (returnScreen: AppScreen) => {
        setSettingsReturnScreen(returnScreen);
        setScreen('settings');
    };

    const renderGame = () => {
        if (!gameState) return <div className="flex-grow flex items-center justify-center">Loading...</div>;
        
        const header = (
            <Header 
                characterName={gameState.player.name}
                location={gameState.location.name}
                onMenu={() => setScreen('main-menu')}
                onSettings={() => handleOpenSettings('game')}
                onSave={handleSaveGame}
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
                suggestedActions={gameState.suggestedActions}
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
                <main className="flex-grow flex gap-2 p-2 overflow-hidden">
                    {/* Left Column */}
                    <div className="w-2/3 flex flex-col gap-2">
                        {panels.pov.isOpen && (
                            <div className="h-3/4">
                                <Panel title={panels.pov.title} className="h-full">
                                    <PovPanel pov={gameState.player.pov} />
                                </Panel>
                            </div>
                        )}
                        <div className={panels.pov.isOpen ? "h-1/4" : "h-full"}>
                            <Panel title="LOG" className="h-full">
                                <GameLog log={gameState.log} />
                            </Panel>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-1/3 h-full flex flex-col gap-2">
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
                                <PlayerStatsPanel stats={gameState.player.stats} />
                            </Panel>
                        )}
                    </div>
                </main>
                <div className="flex-shrink-0 p-2">
                    {input}
                </div>
            </div>
        )
    };
    
    const renderScreen = () => {
        switch (screen) {
            case 'loading':
                return null; // Render nothing while deciding the first screen
            case 'intro':
                return <IntroSequence onIntroComplete={handleIntroComplete} />;
            case 'splash':
                return <SplashScreen onFinished={() => setScreen('main-menu')} />;
            case 'main-menu':
                return <MainMenu 
                    onNewGame={() => setScreen('new-game-scenario')} 
                    onLoadGame={() => setScreen('load-game')}
                    onCreatorTools={() => setScreen('creator-tools')}
                    onSettings={() => handleOpenSettings('main-menu')} 
                    isGameInProgress={!!gameState}
                    onResumeGame={() => setScreen('game')}
                />;
            case 'new-game-scenario':
                return <ScenarioMenu onSelect={handleScenarioSelect} onBack={() => setScreen('main-menu')} onAddScenario={() => setScreen('content-editor')} isGenerating={isGeneratingScenario} />;
            case 'new-game-character':
                if (!selectedScenario) {
                    setScreen('new-game-scenario'); // Should not happen, but as a fallback
                    return null;
                }
                return <CharacterMenu scenario={selectedScenario} onSelect={handleCharacterSelect} onBack={() => setScreen('new-game-scenario')} isGenerating={isGeneratingScenario} />;
            case 'settings':
                return <SettingsMenu onBack={() => setScreen(settingsReturnScreen)} />;
            case 'load-game':
                return <LoadMenu onBack={() => setScreen('main-menu')} onLoadGame={handleLoadGame} />;
            case 'creator-tools':
                return <CreatorToolsMenu onManageContent={() => setScreen('content-editor')} onBack={() => setScreen('main-menu')} />;
            case 'content-editor':
                return <ContentEditor onBack={() => setScreen('creator-tools')} />;
            case 'game':
                return renderGame();
            default:
                return <div>Unknown screen</div>;
        }
    };

    return (
        <div 
            className="w-screen h-screen font-mono text-base overflow-hidden"
            style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
        >
            <AnimatedBackground style={settings.background} />
            <div className="relative z-10 w-full h-full flex flex-col">
                {renderScreen()}
            </div>
        </div>
    );
};

export default App;