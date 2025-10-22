

import { GoogleGenAI, Type } from "@google/genai";
import type { GameState } from '../types';
import { MAP_HEIGHT, MAP_WIDTH } from "../constants";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    player: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        inventory: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              quantity: { type: Type.INTEGER },
            },
          },
        },
        stats: {
          type: Type.STRING,
          description: "A JSON string representing key-value pairs for player stats. E.g. \"{\\\"Health\\\": \\\"Good\\\", \\\"Stamina\\\": 100}\". MUST be a valid, parsable JSON string.",
        },
        pov: {
          type: Type.STRING,
          description: `A first-person ASCII or text description of what the character sees. Should be ${MAP_WIDTH}x${MAP_HEIGHT}.`
        },
      },
    },
    location: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        asciiMap: {
          type: Type.STRING,
          description: `The game map. MUST be a string with newlines, ${MAP_WIDTH} columns wide and ${MAP_HEIGHT} rows high.`
        },
      },
    },
    npcs: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                faceDescription: { type: Type.STRING },
                clothingDescription: { type: Type.STRING },
                notes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        }
    },
    contextualWindows: {
        type: Type.ARRAY,
        description: "A list of dynamic windows that should be available to the player based on context (e.g., an 'INTERNET' window when at a computer).",
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['STATS', 'POV', 'INTERNET', 'TEXT'] },
            }
        }
    },
    narration: { type: Type.STRING, description: "A narration of what just happened. Should be added to the game log." },
    suggestedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
};

export async function getGameUpdate(currentState: GameState, playerCommand: string): Promise<GameState | null> {
  const prompt = `
    You are the 'Gemini Master', a master storyteller for a text-based RPG. Your goal is to create a living, persistent world. Your responses MUST be valid JSON conforming to the provided schema.

    **CRITICAL RULE: WORLD PERSISTENCE**
    You MUST NOT regenerate the entire game state. Instead, you will receive the 'Previous Game State' and you must logically MODIFY it based on the player's command. Data that is not affected by the command MUST be preserved exactly as it was. This creates a realistic, persistent world.

    **STATE MODIFICATION RULES:**
    1.  **Map Continuity:** The 'asciiMap' should NOT be completely redrawn on every turn.
        - If the player moves within the same general area, only update the player's '@' symbol position and any minor environmental changes. The rest of the map remains the same.
        - Only generate a new map layout if the player moves to a distinctly new location (e.g., enters a building, travels to a new city).
    2.  **State Consistency:** The new state must be a logical evolution of the previous one. Player inventory, stats, and NPC states persist unless directly affected by an action.
    3.  **NPC Management:** NPCs are persistent. If they existed in the previous state, they MUST exist in the new one, unless they have been killed or have left the area. Update their notes and descriptions logically.
    4.  **Player POV (IMPORTANT!):** The 'player.pov' field MUST describe what the character sees from a first-person perspective using ASCII art.
        - **If an NPC is in view and close to the player, you MUST draw their face using ASCII characters inside the 'pov' field.** This is crucial for immersion.
        - **To create a talking animation,** if the NPC is speaking in this turn's narration, draw their mouth open (e.g., using an 'o' character). If they are silent, draw their mouth closed (e.g., using a '-' or '_' character).
        - Example of an NPC face in POV:
          +----------------------------------------------------------+
          | Ahead of you, you see John.                              |
          |                                                          |
          |                     .--.                                 |
          |                    | oo |                                |
          |                    |/_|                                |
          |                   /----'                                |
          |                  / ( o)                                 |
          | He seems to be talking to you.                           |
          +----------------------------------------------------------+
    5.  **Contextual Windows:** Use the 'contextualWindows' array to grant access to special UI elements. For example, if a player sits at a computer, add a window of type 'INTERNET'. If they walk away, remove it. The 'STATS' and 'POV' windows should generally always be present.
    6.  **Narrative:** Provide a compelling 'narration' of the outcome of the player's action.
    7.  **Actions:** Provide 4-5 relevant 'suggestedActions'.

    **Previous Game State:**
    ${JSON.stringify(currentState)}

    **Player Command:**
    "${playerCommand}"

    Now, generate the next game state by modifying the previous one based on the command and all the rules above.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    // The model returns stats as a JSON string, so we need to parse it into an object.
    if (parsedResponse.player && typeof parsedResponse.player.stats === 'string') {
      try {
        parsedResponse.player.stats = JSON.parse(parsedResponse.player.stats);
      } catch (e) {
        console.error("Could not parse player.stats JSON string from AI response:", parsedResponse.player.stats, e);
        // If parsing fails, fall back to the previous state's stats to avoid breaking the UI.
        parsedResponse.player.stats = currentState.player.stats;
      }
    }

    const newState: GameState = {
      ...currentState,
      ...parsedResponse,
      // The `currentState` log already has the player command from the optimistic update.
      // We just need to append the AI's narration.
      log: [...currentState.log, parsedResponse.narration],
      turn: currentState.turn + 1,
    };

    return newState;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}