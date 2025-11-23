
import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, Settings, Character, PlayerPath, Language, CharaCardV3, Scenario } from "../types";

// --- Schemas ---

const soulStatsSchema = {
    type: Type.OBJECT,
    properties: {
        S: { type: Type.INTEGER, description: "Synapses (0-10)" },
        O: { type: Type.INTEGER, description: "Organics (0-10)" },
        U: { type: Type.INTEGER, description: "Uncertainty (0-10)" },
        L: { type: Type.INTEGER, description: "Lore (0-10)" },
    },
    required: ["S", "O", "U", "L"],
};

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
                    type: Type.ARRAY,
                    description: "List of status effects or attributes.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            key: { type: Type.STRING },
                            value: { type: Type.STRING }
                        },
                        required: ["key", "value"]
                    }
                },
                soulStats: soulStatsSchema,
                archetype: { type: Type.STRING },
                hiddenTrait: { type: Type.STRING },
                pov: { 
                    type: Type.STRING,
                    description: "A strictly visual, first-person perspective rendered in ASCII/Unicode art. Dimensions: 60x18. CRITICAL RULE: DO NOT INCLUDE WORDS, LABELS, OR TEXT inside the image. Pure visual representation only."
                },
            },
            required: ["name", "description", "inventory", "pov"],
        },
        location: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                asciiMap: { type: Type.STRING, description: "60x18 ASCII map. @ for player." },
            },
            required: ["name", "description", "asciiMap"],
        },
        npcs: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    knownAs: { type: Type.STRING },
                    isNameKnown: { type: Type.BOOLEAN },
                    description: { type: Type.STRING },
                    faceDescription: { type: Type.STRING },
                    clothingDescription: { type: Type.STRING },
                    notes: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["name", "knownAs", "isNameKnown", "description", "faceDescription", "clothingDescription", "notes"],
            },
        },
        log: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Narrative output.",
        },
        suggestedActions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        turn: { type: Type.INTEGER },
        factionBalance: { type: Type.INTEGER, description: "-10 (Keeper) to +10 (Synthesizer)" },
        chaosLevel: { type: Type.INTEGER, description: "0 (Stable) to 10 (Total Glitch)" },
    },
    required: ["player", "location", "npcs", "log", "suggestedActions", "turn", "factionBalance", "chaosLevel"],
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        S: { type: Type.INTEGER },
        O: { type: Type.INTEGER },
        U: { type: Type.INTEGER },
        L: { type: Type.INTEGER },
        Archetype: { type: Type.STRING },
        Hidden_Trait: { type: Type.STRING },
    },
    required: ["S", "O", "U", "L", "Archetype", "Hidden_Trait"]
};

// --- Internal Helpers ---

const getApiKey = (settings: Settings): string | undefined => {
    const key = (settings.apiKey && settings.apiKey.trim() !== '') ? settings.apiKey : process.env.API_KEY;
    return key || undefined;
}

const initGemini = (settings: Settings): GoogleGenAI | null => {
    const apiKey = getApiKey(settings);
    if (!apiKey) {
        console.error("Gemini API key is not set.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
}

const createSystemInstruction = (settings: Settings, specificInstruction?: string): string => {
    const isRussian = settings.language === 'ru';
    const pathUpper = settings.path.toUpperCase();
    
    // Core Engine Directive
    const coreDirective = `ROLE: You are the HOLE ENGINE, a advanced narrative hypervisor.
OBJECTIVE: Simulate a reactive, philosophical reality. Eternal conflict: KEEPER (Biology/Tradition/Chaos/Humanity) vs SYNTHESIZER (Silicon/Evolution/Order/Post-Humanism).
PLAYER PATH: ${pathUpper}.
LANGUAGE: ${isRussian ? 'Russian' : 'English'}.
`;

    // Rules
    const rules = `
RULES:
1. Return valid JSON matching the schema.
2. TRACK STATE: Update 'factionBalance' (-10 to +10) and 'chaosLevel' based on actions.
3. VISUALS: 'asciiMap' and 'player.pov' (60x18) are MANDATORY. 
   CRITICAL POV RULE: ABSOLUTELY NO TEXT LABELS INSIDE POV IMAGE. PURE ART ONLY.
4. IDEOLOGY: Subtly weave the ${pathUpper} philosophy into descriptions.
   - KEEPER: Focus on flesh, decay, nature, emotion.
   - SYNTHESIZER: Focus on geometry, efficiency, metal, logic.
5. LOG: Narrative only.
`;

    if (specificInstruction) {
        return `${coreDirective}\n${rules}\n${specificInstruction}`;
    }

    return `${coreDirective}\n${rules}\nThe player entered: "{{PLAYER_COMMAND}}". Update state.`;
};

/**
 * Generic helper to call Gemini and parse the result.
 */
const generateWithGemini = async (
    settings: Settings, 
    prompt: string, 
    systemInstruction: string,
    model: 'gemini-2.5-flash' | 'gemini-3-pro-preview',
    schema: any = gameStateSchema
): Promise<any | null> => {
    const ai = initGemini(settings);
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const text = response.text;
        if (!text) return null;
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
};

// Helper to convert AI stats array to Record
const normalizeStats = (aiStats: any): Record<string, string | number> => {
    const stats: Record<string, string | number> = {};
    if (Array.isArray(aiStats)) {
        aiStats.forEach(item => {
            if (item.key && item.value) {
                stats[item.key] = item.value;
            }
        });
    } else if (typeof aiStats === 'object' && aiStats !== null) {
        return aiStats;
    }
    return stats;
}


// --- Exported Services ---

export const analyzeCharacterForStats = async (character: Character, settings: Settings): Promise<any | null> => {
    const prompt = `TASK: Analyze the character description and generate RPG stats for the "HOLE" system.
INPUT: {
  Name: ${character.name}, 
  Description: ${character.description}
}

OUTPUT FORMAT: JSON ONLY.
{
  "S": (0-10), // Synapses: Logic, coding, perception of tech.
  "O": (0-10), // Organics: Strength, health, empathy, connection to nature.
  "U": (0-10), // Uncertainty: Luck, chaos manipulation, critical hits.
  "L": (0-10), // Lore: Knowledge of the old world and history.
  "Archetype": "Short 2-word archetype (e.g. 'Cyber-Scavenger')",
  "Hidden_Trait": "One secret passive ability based on lore"
}`;

    const instruction = "You are the S.O.U.L. Analyzer. You generate stats for the HOLE engine.";

    return await generateWithGemini(settings, prompt, instruction, 'gemini-2.5-flash', analysisSchema);
};

export const getGameUpdate = async (
    gameState: GameState,
    command: string,
    settings: Settings
): Promise<GameState | null> => {
    const fullPrompt = `Current Game State:\n${JSON.stringify(gameState, null, 2)}`;
    const systemInstruction = createSystemInstruction(settings).replace('{{PLAYER_COMMAND}}', command);
    
    const jsonResponse = await generateWithGemini(settings, fullPrompt, systemInstruction, 'gemini-2.5-flash');

    if (!jsonResponse) return null;

    return {
        ...gameState,
        ...jsonResponse,
        // Preserve S.O.U.L stats if API forgets them, or update if it changes them
        player: { 
            ...gameState.player, 
            ...jsonResponse.player,
            stats: normalizeStats(jsonResponse.player?.stats),
            soulStats: jsonResponse.player.soulStats || gameState.player.soulStats,
            archetype: jsonResponse.player.archetype || gameState.player.archetype,
            hiddenTrait: jsonResponse.player.hiddenTrait || gameState.player.hiddenTrait
        },
        log: [...gameState.log, ...jsonResponse.log],
        turn: gameState.turn + 1,
    } as GameState;
};

export const generateRandomScenario = async (player: Character, settings: Settings): Promise<GameState | null> => {
    const isRussian = settings.language === 'ru';
    const prompt = `
TASK: Create 'The Glitch' scenario.
PLAYER: ${JSON.stringify(player)}.
CONTEXT: A broken reality where genres mix. Medieval knights fighting cyborgs. High randomness.
REQUIREMENTS: 'asciiMap' and 'player.pov' (60x18, NO TEXT).
Initial chaosLevel: 5.
`;

    const instruction = createSystemInstruction(settings);
    const aiState = await generateWithGemini(settings, prompt, instruction, 'gemini-2.5-flash');
    
    if (!aiState) return null;

    return {
        ...aiState,
        player: { 
            ...player, 
            ...aiState.player,
            stats: normalizeStats(aiState.player?.stats),
            soulStats: player.soulStats, // Explicitly preserve
            archetype: player.archetype,
            hiddenTrait: player.hiddenTrait
        },
        turn: 1,
        factionBalance: 0,
        chaosLevel: 5,
        contextualWindows: [],
        metaDataLog: [],
        scenario: {
            name: isRussian ? "Глюк" : "The Glitch",
            description: isRussian ? "Сломанная реальность." : "Broken reality."
        }
    };
}

export const generateScenarioFromCard = async (card: CharaCardV3, character: Character, settings: Settings): Promise<GameState | null> => {
    const isRussian = settings.language === 'ru';
    const prompt = `
TASK: Create GameState.
SCENARIO: ${JSON.stringify({ name: card.data.name, scenario: card.data.scenario })}
PLAYER: ${JSON.stringify(character)}
First log: "${card.data.first_mes}".
REQUIREMENTS: 'asciiMap' and 'player.pov' (60x18, NO TEXT).
`;
    const instruction = createSystemInstruction(settings);
    const aiState = await generateWithGemini(settings, prompt, instruction, 'gemini-2.5-flash');

    if (!aiState) return null;

    return {
        player: { 
            ...character, 
            ...aiState.player,
            stats: normalizeStats(aiState.player?.stats),
        },
        location: aiState.location,
        npcs: aiState.npcs || [],
        log: aiState.log?.length ? aiState.log : [card.data.first_mes],
        suggestedActions: aiState.suggestedActions || [],
        turn: 1,
        factionBalance: 0,
        chaosLevel: 0,
        contextualWindows: [],
        metaDataLog: [],
        scenario: { name: card.data.name, description: card.data.scenario || card.data.description },
    };
};

export const generateScenarioFromBuiltIn = async (scenario: Scenario, character: Character, settings: Settings): Promise<GameState | null> => {
   const isRussian = settings.language === 'ru';
   
   let specificContext = "";
   if (scenario.name.includes("Tutorial") || scenario.name.includes("Обучение")) {
       specificContext = "CONTEXT: The White Room. Meta-physical tutorial. The Observer speaks. Visuals depend on Player Path (Keeper=Organic/Flesh, Synthesizer=Matrix/Grid). Goal: Teach user HOLE AI.";
   } else if (scenario.name.includes("Modern") || scenario.name.includes("Современность")) {
       specificContext = "CONTEXT: 2025. Depressive realism. The Ontological Trap. Rain, neon, bureaucracy. Goal: Ascend or Rebel.";
   } else if (scenario.name.includes("Learning") || scenario.name.includes("Архив")) {
       specificContext = "CONTEXT: The Event Horizon Library. Knowledge is physical. Gravity is heavy.";
   }

   const prompt = `
TASK: Create GameState for '${scenario.name}'.
${specificContext}
PLAYER: ${JSON.stringify(character)}
REQUIREMENTS: 'asciiMap' and 'player.pov' (60x18, NO TEXT).
`;
    const instruction = createSystemInstruction(settings);
    const aiState = await generateWithGemini(settings, prompt, instruction, 'gemini-2.5-flash');

    if (!aiState) return null;

    return {
       ...aiState,
       player: {
           ...character,
           ...aiState.player,
           stats: normalizeStats(aiState.player?.stats),
           soulStats: character.soulStats, // Ensure we keep original stats
           archetype: character.archetype,
           hiddenTrait: character.hiddenTrait
       },
       turn: 1,
       factionBalance: 0,
       chaosLevel: 0,
       contextualWindows: [],
       metaDataLog: [],
       scenario: { name: scenario.name, description: scenario.description }
   };
}
