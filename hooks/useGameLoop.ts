import { useState, useCallback } from 'react';
import type { GameState, Settings } from '../types';
import { getGameUpdate } from '../services/geminiService';

const MAX_LOG_ENTRIES = 200;

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startGame = useCallback(async (initialState: GameState) => {
    setIsLoading(true);
    setGameState(initialState);
    setIsLoading(false);
  }, []);

  const processPlayerCommand = useCallback(async (command: string, settings: Settings) => {
    if (!gameState) return;

    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Local command handling for 'see'
    const seeCommandMatch = trimmedCommand.match(/^see (.*?)(?:'s (face|clothing))?$/i);
    if (seeCommandMatch) {
      const npcIdentifier = seeCommandMatch[1].trim().toLowerCase();
      const detail = seeCommandMatch[2]?.trim().toLowerCase();
      
      const npc = gameState.npcs.find(n => 
        (n.isNameKnown && n.name.toLowerCase() === npcIdentifier) || 
        (!n.isNameKnown && n.knownAs.toLowerCase() === npcIdentifier)
      );

      if (npc) {
        const displayName = npc.isNameKnown ? npc.name : npc.knownAs;
        let narration = '';
        if (detail === 'face') {
          narration = `You look closely at ${displayName}'s face.\n${npc.faceDescription}`;
        } else if (detail === 'clothing') {
          narration = `You examine ${displayName}'s clothing.\n${npc.clothingDescription}`;
        } else {
          narration = `You observe ${displayName}.\n${npc.description}`;
        }
        
        if (npc.notes.length > 0) {
            narration += `\n- ${npc.notes.join('\n- ')}`;
        }

        setGameState(prev => prev ? {
          ...prev,
          log: [...prev.log, `> ${command}`, narration].slice(-MAX_LOG_ENTRIES),
        } : null);
        return;
      }
    }

    // Gemini command handling
    setIsLoading(true);
    
    // Add command to log for immediate feedback
    const currentStateForApi = {
        ...gameState,
        log: [...gameState.log, `> ${command}`].slice(-MAX_LOG_ENTRIES)
    };
    setGameState(currentStateForApi);

    // Get update from Gemini
    const newState = await getGameUpdate(currentStateForApi, command, settings);
    
    if (newState) {
      newState.log = newState.log.slice(-MAX_LOG_ENTRIES);
      setGameState(newState);
    } else {
      // Handle API error
      setGameState(prev => prev ? {
        ...prev,
        log: [...prev.log, "A strange energy crackles, and the world seems to pause. (Error connecting to the Gemini Master)"].slice(-MAX_LOG_ENTRIES)
      } : null);
    }
    setIsLoading(false);
  }, [gameState]);

  return { gameState, setGameState, processPlayerCommand, isLoading, startGame };
};