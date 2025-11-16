import { useState, useCallback } from 'react';
import type { GameState, Settings } from '../types';
import { getGameUpdate } from '../services/geminiService';
import { en } from '../locales/en';
import { ru } from '../locales/ru';

const MAX_LOG_ENTRIES = 200;
const translations = { en, ru };

// Helper to format strings like "You see {0}"
const formatString = (str: string, ...args: string[]) => {
  return str.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

/**
 * Placeholder for the AI summarization function. In a real implementation,
 * this would call an external API (like Gemini) to summarize the text.
 * @param entries An array of narrative history strings to summarize.
 * @returns A promise that resolves to a summary string.
 */
const getSummaryFromAI = async (entries: string[]): Promise<string> => {
    console.log("AI Summary requested for:", entries);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`[This is an AI-generated summary of recent events.]`);
        }, 100);
    });
};

/**
 * Checks the turn count and, if it's a non-zero multiple of 10,
 * summarizes the last 10 narrative events and stores the summary.
 * @param gameState The current game state.
 * @returns An updated game state with the new summary, or the original state.
 */
const summarizeAndStoreHistory = async (gameState: GameState): Promise<GameState> => {
    // Trigger Condition: The function's core logic must only execute if the turn
    // is a multiple of 10 (e.g., at turns 10, 20, 30, etc.) and is not zero.
    if (gameState.turn > 0 && gameState.turn % 10 === 0) {
        // Select the last 10 entries from the narrative history (gameState.log).
        const historyToSummarize = gameState.log.slice(-10);

        // Call the placeholder asynchronous function getSummaryFromAI.
        const summary = await getSummaryFromAI(historyToSummarize);

        // Take the summary string and add it to the metaDataLog array.
        return {
            ...gameState,
            metaDataLog: [...(gameState.metaDataLog || []), summary],
        };
    }

    // If the condition is not met, return the original state.
    return gameState;
};


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

    const t = (key: keyof typeof en) => translations[settings.language][key] || en[key];
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    let commandForLog = `> ${trimmedCommand}`;
    const commandForApi = trimmedCommand;

    if (trimmedCommand.toLowerCase().startsWith('say ')) {
        const payload = trimmedCommand.substring(4).trim();
        if (payload) { // Only log if there's something to say
            commandForLog = `You say: "${payload}"`;
        }
    }

    // Local command handling for 'see <target>'
    const seeCommandMatch = trimmedCommand.match(/^see (.*?)(?:'s (face|clothing))?$/i);
    if (seeCommandMatch && seeCommandMatch[1]) { // ensure there is a target
      const npcIdentifier = seeCommandMatch[1].trim().toLowerCase();
      // Fix: Declare and initialize the 'detail' variable from the regex match.
      const detail = seeCommandMatch[2]?.toLowerCase();
      
      const npc = gameState.npcs.find(n => 
        (n.isNameKnown && n.name.toLowerCase() === npcIdentifier) || 
        (!n.isNameKnown && n.knownAs.toLowerCase() === npcIdentifier)
      );

      if (npc) {
        const displayName = npc.isNameKnown ? npc.name : npc.knownAs;
        let narration = '';
        if (detail === 'face') {
          narration = formatString(t('seeFace'), displayName, npc.faceDescription);
        } else if (detail === 'clothing') {
          narration = formatString(t('seeClothing'), displayName, npc.clothingDescription);
        } else {
          narration = formatString(t('seeDescription'), displayName, npc.description);
        }
        
        if (npc.notes.length > 0) {
            narration += `\n- ${npc.notes.join('\n- ')}`;
        }

        setGameState(prev => prev ? {
          ...prev,
          log: [...prev.log, `> ${trimmedCommand}`, narration].slice(-MAX_LOG_ENTRIES),
        } : null);
        return;
      }
    }

    // Gemini command handling
    setIsLoading(true);
    
    // Add command to log for immediate feedback
    const currentStateForApi = {
        ...gameState,
        log: [...gameState.log, commandForLog].slice(-MAX_LOG_ENTRIES)
    };
    setGameState(currentStateForApi);

    // Get update from Gemini
    const newStateFromAI = await getGameUpdate(currentStateForApi, commandForApi, settings);
    
    if (newStateFromAI) {
      newStateFromAI.log = newStateFromAI.log.slice(-MAX_LOG_ENTRIES);
      // Summarize history if needed before setting state
      const finalState = await summarizeAndStoreHistory(newStateFromAI);
      setGameState(finalState);
    } else {
      // Handle API error
       const errorMsg = settings.language === 'ru'
          ? "Странная энергия потрескивает, и мир, кажется, замирает. (Ошибка подключения к Gemini Master)"
          : "A strange energy crackles, and the world seems to pause. (Error connecting to the Gemini Master)";
      setGameState(prev => prev ? {
        ...prev,
        log: [...prev.log, errorMsg].slice(-MAX_LOG_ENTRIES)
      } : null);
    }
    setIsLoading(false);
  }, [gameState]);

  return { gameState, setGameState, processPlayerCommand, isLoading, startGame };
};