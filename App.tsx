
import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { useSettings } from './contexts/SettingsContext';
import { useGameLoop } from './hooks/useGameLoop';
import type { GameState, Character, Scenario, SaveSlot, PlayerPath, CharaCardV3 } from './types';
import { MainMenu } from './components/MainMenu';
import { SettingsMenu } from './components/SettingsMenu';
import { AnimatedBackground } from './components/AnimatedBackground';
import { generateRandomScenario, generateScenarioFromCard, generateScenarioFromBuiltIn, analyzeCharacterForStats } from './services/geminiService';
import { SplashScreen } from './components/SplashScreen';
import { IntroSequence } from './components/IntroSequence';
import { LoadMenu } from './components/LoadMenu';
import { CreatorToolsMenu } from './components/CreatorToolsMenu';
import { ScenarioMenu } from './components/ScenarioMenu';
import { CharacterMenu } from './components/CharacterMenu';
import { ContentEditor } from './components/ContentEditor';
import { GameLayout } from './components/GameLayout';
import { CrtOverlay } from './components/CrtOverlay';

type AppScreen = 'loading' | 'intro' | 'splash' | 'main-menu' | 'settings' | 'load-game' | 'game' | 'new-game-scenario' | 'new-game-character' | 'creator-tools' | 'content-editor' | 'analyzing';

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
        setIsGeneratingScenario(true);
        let playerWithStats = { ...character };

        // --- S.O.U.L. CHECK ---
        if (!playerWithStats.soulStats) {
            setScreen('analyzing');
            // If stats are missing, ask Gemini to generate them
            const analysis = await analyzeCharacterForStats(character, settings);
            if (analysis) {
                playerWithStats = {
                    ...playerWithStats,
                    soulStats: { S: analysis.S, O: analysis.O, U: analysis.U, L: analysis.L },
                    archetype: analysis.Archetype,
                    hiddenTrait: analysis.Hidden_Trait
                };
            }
        }

        let finalState: GameState | null = null;
    
        if (selectedCard) {
            // Custom scenario card path
            finalState = await generateScenarioFromCard(selectedCard, playerWithStats, settings);
        } else if (selectedScenario) {
             if (selectedScenario.name === "Tutorial" || selectedScenario.name === "Обучение") {
                const tutorialState = { ...selectedScenario.initialState };
                tutorialState.player = {
                    ...playerWithStats,
                    pov: selectedScenario.initialState.player?.pov || "",
                };
                finalState = tutorialState as GameState;
            } else if (selectedScenario.name === "The Glitch" || selectedScenario.name === "Глюк") {
                finalState = await generateRandomScenario(playerWithStats, settings);
            } else {
                finalState = await generateScenarioFromBuiltIn(selectedScenario, playerWithStats, settings);
            }
        }
        
        setIsGeneratingScenario(false);
    
        if (finalState) {
            await startGame(finalState);
            setScreen('game');
        } else {
            alert("Failed to start the game. The HOLE ENGINE refused the connection.");
            setScreen('new-game-character');
        }
    };
    
    const handleQuickstart = async () => {
        setIsGeneratingScenario(true);
        
        const randomCharacterTemplate: Character = {
            name: "Random",
            description: "A character to be generated from scratch by the AI.",
            inventory: [],
            stats: {},
            pov: ""
        };

        const generatedState = await generateRandomScenario(randomCharacterTemplate, settings);
        
        setIsGeneratingScenario(false);

        if (generatedState) {
            await startGame(generatedState);
            setScreen('game');
        } else {
            alert("Failed to start the game.");
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
    
    const handleOpenSettings = (returnScreen: AppScreen) => {
        setSettingsReturnScreen(returnScreen);
        setScreen('settings');
    };

    const renderScreen = () => {
        switch (screen) {
            case 'loading':
                return null;
            case 'analyzing':
                return (
                    <div className="flex-grow flex flex-col items-center justify-center">
                        <p className="text-2xl blinking-cursor" style={{color: theme.colors.accent1}}>ANALYZING BIOMETRICS...</p>
                        <p className="text-sm opacity-50 mt-2">CALCULATING S.O.U.L. VECTORS</p>
                    </div>
                );
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
                    setScreen('new-game-scenario'); 
                    return null;
                }
                return (
                    <CharacterMenu 
                        scenario={selectedScenario} 
                        onSelect={handleCharacterSelect} 
                        onBack={() => setScreen('new-game-scenario')} 
                        isGenerating={isGeneratingScenario} 
                        onQuickstart={handleQuickstart} 
                        onAddCharacter={() => setScreen('content-editor')}
                    />
                );
            case 'settings':
                return <SettingsMenu onBack={() => setScreen(settingsReturnScreen)} />;
            case 'load-game':
                return <LoadMenu onBack={() => setScreen('main-menu')} onLoadGame={handleLoadGame} />;
            case 'creator-tools':
                return <CreatorToolsMenu onManageContent={() => setScreen('content-editor')} onBack={() => setScreen('main-menu')} />;
            case 'content-editor':
                return <ContentEditor onBack={() => setScreen('creator-tools')} />;
            case 'game':
                if (!gameState) return <div className="flex-grow flex items-center justify-center">Loading...</div>;
                return <GameLayout 
                    gameState={gameState} 
                    settings={settings} 
                    isLoading={isLoading} 
                    processPlayerCommand={processPlayerCommand} 
                    onSave={handleSaveGame}
                    onMenu={() => setScreen('main-menu')}
                    onSettings={handleOpenSettings}
                />;
            default:
                return <div>Unknown screen</div>;
        }
    };

    return (
        <div 
            className="w-screen h-screen font-mono text-base overflow-hidden"
            style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
        >
            <style>{`
                ::-webkit-scrollbar {
                    width: 14px;
                    height: 14px;
                }
                ::-webkit-scrollbar-track {
                    background: ${theme.colors.bg};
                    border-left: 1px solid ${theme.colors.accent1};
                }
                ::-webkit-scrollbar-thumb {
                    background: ${theme.colors.accent1}; 
                    border: 2px solid ${theme.colors.bg};
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: ${theme.colors.highlightText};
                    border-color: ${theme.colors.highlightBg};
                }
                ::-webkit-scrollbar-corner {
                    background: ${theme.colors.bg};
                }
                * {
                    scrollbar-width: auto;
                    scrollbar-color: ${theme.colors.accent1} ${theme.colors.bg};
                }
            `}</style>
            <AnimatedBackground style={settings.background} />
            {settings.crtEnabled && <CrtOverlay />}
            <div className="relative z-10 w-full h-full flex flex-col">
                {renderScreen()}
            </div>
        </div>
    );
};

export default App;
