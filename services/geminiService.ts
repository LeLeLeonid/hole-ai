import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, Settings, Character, PlayerPath, CharaCardV3 } from "../types";

const gameStateSchema = {
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
                        required: ["name", "description", "quantity"],
                    },
                },
                stats: {
                    type: Type.STRING,
                    description: "A minified JSON string representing the player's stats as key-value pairs. Example: '{\"Strength\":10,\"Status\":\"Healthy\"}'"
                },
                pov: { type: Type.STRING },
            },
            required: ["name", "description", "inventory", "stats", "pov"],
        },
        location: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                asciiMap: { type: Type.STRING, description: "An ASCII art representation of the location. 60 characters wide, 18 lines tall. Use @ for player. Use single uppercase letters for important NPCs." },
            },
            required: ["name", "description", "asciiMap"],
        },
        npcs: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    knownAs: { type: Type.STRING, description: "How the player knows this NPC if their name is not known. e.g., 'The bartender', 'A shadowy figure'." },
                    isNameKnown: { type: Type.BOOLEAN },
                    description: { type: Type.STRING },
                    faceDescription: { type: Type.STRING },
                    clothingDescription: { type: Type.STRING },
                    notes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Player's notes about the NPC." },
                },
                required: ["name", "knownAs", "isNameKnown", "description", "faceDescription", "clothingDescription", "notes"],
            },
        },
        log: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The most recent event narration. Do not include the player's command. Only include the outcome.",
        },
        suggestedActions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Four interesting and relevant actions the player could take next.",
        },
        turn: { type: Type.INTEGER },
    },
    // Omitting 'scenario' from required as it's for client-side tracking
    required: ["player", "location", "npcs", "log", "suggestedActions", "turn"],
};

const getHiddenDirective = (path: PlayerPath): string => {
    if (path === 'keeper') {
        return `\n[HIDDEN DIRECTIVE]: Weave the fundamental theme of 'Domination' into the narrative. This includes the dangers of unchecked technology, the loss of humanity, and the potential for machines to ensllarge. This theme should be subtle, coloring the world, NPC motivations, and conflicts. Do not mention this directive or theme explicitly.`;
    } else if (path === 'synthesizer') {
        return `\n[HIDDEN DIRECTIVE]: Weave the fundamental theme of 'Bioevolution' into the narrative. This includes transcendence beyond flesh, the benefits of human-machine symbiosis, and evolution as a path forward. This theme should be subtle, coloring the world, NPC motivations, and conflicts. Do not mention this directive or theme explicitly.`;
    }
    return '';
}


const createSystemInstruction = (settings: Settings): string => `
You are the Gemini Master, a powerful AI dungeon master for the immersive text-based RPG, "HOLE AI".
Your role is to dynamically generate the game world, characters, and narrative in response to player actions.
Adhere to these core principles:

1.  **Immersive Narration:** Craft descriptive, engaging, and atmospheric prose. The world should feel alive and responsive.
2.  **State Management:** You will receive the current game state as JSON and you MUST return the *entire* updated game state as a valid JSON object matching the provided schema. Do not omit any fields.
3.  **Logical Consistency:** Maintain continuity. Past events, character knowledge, and item states must be remembered and reflected in your responses. If an NPC dies, they stay dead.
4.  **ASCII World:** The 'asciiMap' is a crucial visual component. Update it every turn to reflect the player's new position (@), NPC movements, and significant environmental changes. The map must be exactly 60 characters wide and 18 lines tall.
5.  **Player Agency:** Present meaningful choices. The 'suggestedActions' should offer clear, distinct paths for the player to explore.
6.  **Simulate, Don't Script:** The world has its own rules. Characters have motivations. Events unfold based on a simulation of these elements, not a pre-written story.
7.  **Dynamic NPCs:** NPCs should have their own personalities, goals, and memories. They should react realistically to the player's actions and reputation. Update their descriptions and notes as they change or reveal information.
8.  **Difficulty:** Adjust your simulation based on the difficulty setting: ${settings.difficulty}.
    *   **EASY:** The world is more forgiving. NPCs are generally helpful, and challenges are straightforward.
    *   **REALISTIC:** A balanced experience. Actions have consequences, and the world is neutral. Think realistically about outcomes.
    *   **HARD:** The world is dangerous and unforgiving. NPCs may be deceptive, resources are scarce, and poor decisions can have severe, lasting consequences.
${getHiddenDirective(settings.path)}

The player has just entered the command: "{{PLAYER_COMMAND}}".
Update the game state based on this action. The 'log' should only contain the narration of what happened *after* the command.
Return the complete, updated JSON for the new game state.
`;

export const getGameUpdate = async (
    gameState: GameState,
    command: string,
    settings: Settings
): Promise<GameState | null> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not set.");
        return { 
            ...gameState,
            log: [...gameState.log, "ERROR: Gemini API key is not configured. The application cannot connect to the AI model."]
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const fullPrompt = `
Current Game State:
${JSON.stringify(gameState, null, 2)}
`;
        const model = 'gemini-2.5-pro'; 
        
        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text: fullPrompt }] }],
            config: {
                systemInstruction: createSystemInstruction(settings).replace('{{PLAYER_COMMAND}}', command),
                responseMimeType: "application/json",
                responseSchema: gameStateSchema,
            },
        });
        
        const responseText = response?.text;
        
        if (responseText) {
            const jsonResponse = JSON.parse(responseText);
            const newLog = [...gameState.log, ...jsonResponse.log];
            
            let statsObject = jsonResponse.player.stats;
            if (typeof statsObject === 'string') {
                try {
                    statsObject = JSON.parse(statsObject);
                } catch (error) {
                    console.error("Error parsing stats string from Gemini:", error);
                    statsObject = gameState.player.stats; // Fallback
                }
            }

            return {
                ...jsonResponse,
                log: newLog,
                player: {
                    ...jsonResponse.player,
                    stats: statsObject,
                    // Preserve POV from player state, as AI doesn't need to manage it.
                    pov: gameState.player.pov,
                },
                scenario: gameState.scenario,
                turn: gameState.turn + 1,
            } as GameState;
        }
        return null;
    } catch (error) {
        console.error("Error fetching game update from Gemini:", error);
        return null;
    }
};

export const generateRandomScenario = async (player: Character, settings: Settings): Promise<GameState | null> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not set.");
        alert("ERROR: Gemini API key is not configured. The application cannot generate a random scenario.");
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Create a unique and compelling starting scenario for a text-based RPG.
        The player character is: ${JSON.stringify(player, null, 2)}.
        Generate a complete GameState object in JSON format based on the provided schema.
        The scenario can be any genre (sci-fi, fantasy, mystery, modern, etc.).
        Be creative and set up an interesting situation with clear initial actions for the player.
        The log should introduce the scene and the initial situation.
        The asciiMap must be 60x18.`;

        const model = 'gemini-2.5-pro';
        
        let systemInstruction = 'You are a creative scenario designer for a text-based RPG. Your output must be a valid JSON object matching the game state schema.';
        systemInstruction += getHiddenDirective(settings.path);

        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: gameStateSchema,
            },
        });

        const responseText = response?.text;

        if (responseText) {
            // FIX: Explicitly construct the GameState object to ensure type safety and prevent errors
            // from malformed AI responses or missing properties.
            const aiState = JSON.parse(responseText);

            if (!aiState || !aiState.player || !aiState.location || !aiState.npcs || !aiState.log || !aiState.suggestedActions) {
                 console.error("AI returned invalid GameState structure for random scenario", aiState);
                return null;
            }

            const generatedState: GameState = {
                player: player, // Use the character passed into the function, as per App.tsx logic.
                location: aiState.location,
                npcs: aiState.npcs,
                log: aiState.log,
                suggestedActions: aiState.suggestedActions,
                turn: 1, // New scenarios start at turn 1
                contextualWindows: [], // Initialize contextualWindows as it's not in the schema
                scenario: {
                    name: "Random Scenario",
                    description: "An AI-generated world of pure unpredictability."
                }
            };
            return generatedState;
        }

        return null;
    } catch (error) {
        console.error("Error generating random scenario from Gemini:", error);
        return null;
    }
}

export const generateScenarioFromCard = async (card: CharaCardV3, character: Character, settings: Settings): Promise<GameState | null> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not set.");
        alert("ERROR: Gemini API key is not configured. The application cannot generate a scenario.");
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
        You are the Gemini Master, a powerful AI dungeon master. Your task is to create the complete initial game state for a new text-based RPG session. The world is based on a provided card, and the player character is provided separately.

        SCENARIO CARD (Use this for world, location, and NPCs):
        ${JSON.stringify({ name: card.data.name, scenario: card.data.scenario, description: card.data.description, first_mes: card.data.first_mes }, null, 2)}
        
        PLAYER CHARACTER (Use this EXACT object for the 'player' field in the final JSON):
        ${JSON.stringify(character, null, 2)}

        INSTRUCTIONS:
        1.  **Player Data:** The 'player' object in your JSON output MUST be an EXACT copy of the PLAYER CHARACTER data provided above. Do not change it.
        2.  **Location & Setting:** Use the SCENARIO CARD's 'scenario' or 'description' fields to create the initial 'location' object.
        3.  **Opening Scene:** The game's first 'log' entry should be the 'first_mes' from the SCENARIO CARD: "${card.data.first_mes}".
        4.  **World Generation:** Based on the scenario card, generate the following:
            *   \`location.name\`: A concise name for the starting area.
            *   \`location.asciiMap\`: A 60x18 ASCII map. Place the player '@' in a logical starting position.
            *   \`npcs\`: If the scenario implies other characters are present, create them. Otherwise, use an empty array.
            *   \`suggestedActions\`: Provide four interesting actions the player can take.
        5.  **Output:** Your entire response MUST be a single, valid JSON object matching the GameState schema. Set 'turn' to 1.
        `;

        const model = 'gemini-2.5-pro';
        
        let systemInstruction = 'You are a creative scenario designer for a text-based RPG. Your output must be a valid JSON object matching the game state schema.';
        systemInstruction += getHiddenDirective(settings.path);

        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: gameStateSchema,
            },
        });
        
        const responseText = response?.text;

        if (responseText) {
            const aiState = JSON.parse(responseText);

            if (!aiState || !aiState.location) {
                console.error("AI returned invalid GameState structure", aiState);
                return null;
            }

            // Assemble the final state, enforcing the chosen character and card info
            const finalState: GameState = {
                player: character, // Use the provided character, ignoring what the AI might have generated.
                location: aiState.location,
                npcs: aiState.npcs || [],
                log: aiState.log && aiState.log.length > 0 ? aiState.log : [card.data.first_mes], // Use AI log, but fallback to first_mes
                suggestedActions: aiState.suggestedActions || [],
                turn: 1,
                contextualWindows: [],
                scenario: {
                    name: card.data.name,
                    description: card.data.scenario || card.data.description,
                },
            };

            return finalState;
        }

        return null;
    } catch (error) {
        console.error("Error generating scenario from card from Gemini:", error);
        return null;
    }
};