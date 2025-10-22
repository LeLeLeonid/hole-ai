import { useState, useCallback } from 'react';
import type { GameState } from '../types';
import { INITIAL_GAME_STATE } from '../constants';
import { getGameUpdate } from '../services/geminiService';

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const startGame = useCallback(async () => {
    setIsLoading(true);
    setGameState(INITIAL_GAME_STATE); // Reset to initial state for new game
    setGameStarted(true);
    setIsLoading(false);
  }, []);

  const processPlayerCommand = useCallback(async (command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Local command handling for 'see'
    const seeCommandMatch = trimmedCommand.match(/^see (.*?)(?:'s (face|clothing))?$/i);

    if (seeCommandMatch) {
      const npcName = seeCommandMatch[1].trim();
      const detail = seeCommandMatch[2]?.trim().toLowerCase();
      const npc = gameState.npcs.find(n => n.name.toLowerCase() === npcName.toLowerCase());

      if (npc) {
        let narration = '';
        if (detail === 'face') {
          narration = `You look closely at ${npc.name}'s face.\n${npc.faceDescription}`;
        } else if (detail === 'clothing') {
          narration = `You examine ${npc.name}'s clothing.\n${npc.clothingDescription}`;
        } else {
          narration = `You observe ${npc.name}.\n${npc.description}`;
        }
        
        if (npc.notes.length > 0) {
            narration += `\n- ${npc.notes.join('\n- ')}`;
        }

        setGameState(prev => ({
          ...prev,
          log: [...prev.log, `> ${command}`, narration],
        }));
        return; // Skip API call
      }
    }

    setIsLoading(true);
    
    const currentStateForApi = {
        ...gameState,
        log: [...gameState.log, `> ${command}`]
    };

    setGameState(currentStateForApi);

    const newState = await getGameUpdate(currentStateForApi, command);
    
    if (newState) {
      setGameState(newState);
    } else {
      setGameState(prev => ({
        ...prev,
        log: [...prev.log, "A strange energy crackles, and the world seems to pause. (Error connecting to the Gemini Master)"]
      }));
    }
    setIsLoading(false);
  }, [gameState]);

  return { gameState, setGameState, processPlayerCommand, isLoading, gameStarted, startGame };
};