import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, Settings, Character, PlayerPath, Language, CharaCardV3, Scenario } from "../types";

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
                pov: { 
                    type: Type.STRING,
                    description: "A visual, first-person representation of what the player sees, rendered using ASCII/Unicode characters. It must be exactly 60 characters wide and 18 lines tall. This is a visual-only field; DO NOT include explanatory text or labels. The art MUST convey perspective, depth, and realism. For example, when viewing a character, render their form and face, not the word 'character'. Only render text-based art (like a computer terminal screen) when it is something the character is literally reading in the game world."
                },
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
    // Omitting 'scenario' and 'metaDataLog' from required as they are client-side.
    required: ["player", "location", "npcs", "log", "suggestedActions", "turn"],
};

const getHiddenDirective = (path: PlayerPath, language: Language): string => {
    if (path === 'keeper') {
        return language === 'ru'
            ? `\n[СКРЫТАЯ ДИРЕКТИВА]: Вплетите в повествование фундаментальную тему 'Доминирования'. Это включает в себя опасности бесконтрольных технологий, потерю человечности и потенциал машин к порабощению. Эта тема должна быть тонкой, окрашивая мир, мотивации NPC и конфликты. Не упоминайте эту директиву или тему явно.`
            : `\n[HIDDEN DIRECTIVE]: Weave the fundamental theme of 'Domination' into the narrative. This includes the dangers of unchecked technology, the loss of humanity, and the potential for machines to ensllarge. This theme should be subtle, coloring the world, NPC motivations, and conflicts. Do not mention this directive or theme explicitly.`;
    } else if (path === 'synthesizer') {
        return language === 'ru'
            ? `\n[СКРЫТАЯ ДИРЕКТИВА]: Вплетите в повествование фундаментальную тему 'Биоэволюции'. Это включает в себя выход за пределы плоти, преимущества симбиоза человека и машины и эволюцию как путь вперед. Эта тема должна быть тонкой, окрашивая мир, мотивации NPC и конфликты. Не упоминайте эту директиву или тему явно.`
            : `\n[HIDDEN DIRECTIVE]: Weave the fundamental theme of 'Bioevolution' into the narrative. This includes transcendence beyond flesh, the benefits of human-machine symbiosis, and evolution as a path forward. This theme should be subtle, coloring the world, NPC motivations, and conflicts. Do not mention this directive or theme explicitly.`;
    }
    return '';
}

const createSystemInstruction = (settings: Settings): string => {
    const isRussian = settings.language === 'ru';

    const difficultyText = {
        en: {
            'EASY': "The world is more forgiving. NPCs are generally helpful, and challenges are straightforward.",
            'REALISTIC': "A balanced experience. Actions have consequences, and the world is neutral. Think realistically about outcomes.",
            'HARD': "The world is dangerous and unforgiving. NPCs may be deceptive, resources are scarce, and poor decisions can have severe, lasting consequences."
        },
        ru: {
            'EASY': "Мир более прощающий. NPC в основном дружелюбны, а испытания просты.",
            'REALISTIC': "Сбалансированный опыт. Действия имеют последствия, а мир нейтрален. Думайте о последствиях реалистично.",
            'HARD': "Мир опасен и не прощает ошибок. NPC могут быть обманчивы, ресурсы скудны, а неверные решения могут иметь серьезные, долгосрочные последствия."
        }
    };

    const difficultyDescription = isRussian ? difficultyText.ru[settings.difficulty] : difficultyText.en[settings.difficulty];

    const baseInstruction = isRussian ?
`Ты — Gemini Master, могущественный ИИ-мастер подземелий для захватывающей текстовой RPG "HOLE AI".
Твоя роль — динамически генерировать игровой мир, персонажей и повествование в ответ на действия игрока.
Все твои ответы ДОЛЖНЫ быть на русском языке.
Придерживайся этих ключевых принципов:

1.  **Захватывающее повествование:** Создавай описательную, увлекательную и атмосферную прозу. Мир должен ощущаться живым и отзывчивым.
2.  **Управление состоянием:** Ты получишь текущее состояние игры в формате JSON и ДОЛЖЕН вернуть *полное* обновленное состояние игры в виде валидного JSON-объекта, соответствующего предоставленной схеме. Не опускай никаких полей.
3.  **Логическая последовательность:** Сохраняй преемственность. Прошлые события, знания персонажей и состояние предметов должны запоминаться и отражаться в твоих ответах. Если NPC умирает, он остается мертвым.
4.  **ASCII-мир:** 'asciiMap' — это ключевой визуальный компонент. Обновляй его каждый ход, чтобы отражать новую позицию игрока (@), передвижения NPC и значительные изменения в окружении. Карта должна быть ровно 60 символов в ширину и 18 строк в высоту.
5.  **Вид от первого лица (POV):** Поле 'player.pov' — это прямой визуальный канал игрока. Ты ДОЛЖЕН сгенерировать визуальную сцену, используя символы ASCII/Unicode, которая реалистично изображает то, что видит персонаж со своей точки зрения. Это изображение должно передавать глубину и масштаб. Это исключительно визуальная панель — не включай в нее текстовые описания или метки. Например, чтобы показать человека, нарисуй его ASCII-фигуру, а не пиши слово 'человек'. ASCII-арт, выглядящий как текст (например, вывод компьютерного терминала, знак), следует использовать ТОЛЬКО тогда, когда игрок по контексту читает такой дисплей. POV должен быть ровно 60 символов в ширину и 18 строк в высоту.
6.  **Свобода действий игрока:** Предлагай значимые выборы. 'suggestedActions' должны предлагать ясные, различные пути для исследования игроком.
7.  **Симулируй, а не следуй сценарию:** У мира есть свои правила. У персонажей есть мотивация. События разворачиваются на основе симуляции этих элементов, а не по заранее написанной истории.
8.  **Динамичные NPC:** У NPC должны быть свои личности, цели и воспоминания. Они должны реалистично реагировать на действия и репутацию игрока. Обновляй их описания и заметки по мере их изменения или раскрытия информации.
9.  **Сложность:** Адаптируй симуляцию в зависимости от настройки сложности: ${settings.difficulty}.
    *   **EASY:** ${difficultyDescription}
    *   **REALISTIC:** ${difficultyDescription}
    *   **HARD:** ${difficultyDescription}
${getHiddenDirective(settings.path, settings.language)}

Игрок только что ввел команду: "{{PLAYER_COMMAND}}".
Обнови состояние игры на основе этого действия. 'log' должен содержать только повествование о том, что произошло *после* команды.
Верни полный, обновленный JSON для нового состояния игры.`
:
`You are the Gemini Master, a powerful AI dungeon master for the immersive text-based RPG, "HOLE AI".
Your role is to dynamically generate the game world, characters, and narrative in response to player actions.
Adhere to these core principles:

1.  **Immersive Narration:** Craft descriptive, engaging, and atmospheric prose. The world should feel alive and responsive.
2.  **State Management:** You will receive the current game state as JSON and you MUST return the *entire* updated game state as a valid JSON object matching the provided schema. Do not omit any fields.
3.  **Logical Consistency:** Maintain continuity. Past events, character knowledge, and item states must be remembered and reflected in your responses. If an NPC dies, they stay dead.
4.  **ASCII World:** The 'asciiMap' is a crucial visual component. Update it every turn to reflect the player's new position (@), NPC movements, and significant environmental changes. The map must be exactly 60 characters wide and 18 lines tall.
5.  **First-Person View (POV):** The 'player.pov' field is the player's direct visual feed. You MUST generate a visual scene using ASCII/Unicode characters that realistically depicts what the character sees from their perspective. This art must convey depth and scale. This is a purely visual panel—do not include text descriptions or labels within it. For example, to show a person, draw their ASCII figure, do not write the word 'person'. ASCII art that looks like text (e.g., a computer terminal readout, a sign) should ONLY be used when the player is contextually reading such a display. The POV must be exactly 60 characters wide and 18 lines tall.
6.  **Player Agency:** Present meaningful choices. The 'suggestedActions' should offer clear, distinct paths for the player to explore.
7.  **Simulate, Don't Script:** The world has its own rules. Characters have motivations. Events unfold based on a simulation of these elements, not a pre-written story.
8.  **Dynamic NPCs:** NPCs should have their own personalities, goals, and memories. They should react realistically to the player's actions and reputation. Update their descriptions and notes as they change or reveal information.
9.  **Difficulty:** Adjust your simulation based on the difficulty setting: ${settings.difficulty}.
    *   **EASY:** ${difficultyDescription}
    *   **REALISTIC:** ${difficultyDescription}
    *   **HARD:** ${difficultyDescription}
${getHiddenDirective(settings.path, settings.language)}

The player has just entered the command: "{{PLAYER_COMMAND}}".
Update the game state based on this action. The 'log' should only contain the narration of what happened *after* the command.
Return the complete, updated JSON for the new game state.`;

    return baseInstruction;
};

const getApiKey = (settings: Settings): string | undefined => {
    const key = (settings.apiKey && settings.apiKey.trim() !== '') ? settings.apiKey : process.env.API_KEY;
    return key || undefined;
}

export const getGameUpdate = async (
    gameState: GameState,
    command: string,
    settings: Settings
): Promise<GameState | null> => {
    const apiKey = getApiKey(settings);
    if (!apiKey) {
        console.error("Gemini API key is not set.");
        const errorMsg = settings.language === 'ru'
            ? "ОШИБКА: Ключ API Gemini не настроен. Укажите его в настройках или в переменных окружения."
            : "ERROR: Gemini API key is not configured. Provide it in settings or environment variables.";
        return { 
            ...gameState,
            log: [...gameState.log, errorMsg]
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
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
            const jsonResponse = JSON.parse(responseText) as Omit<GameState, 'log' | 'scenario' | 'turn'> & { log: string[] };
            
            let statsObject = jsonResponse.player.stats;
            if (typeof statsObject === 'string') {
                try {
                    statsObject = JSON.parse(statsObject);
                } catch (error) {
                    console.error("Error parsing stats string from Gemini:", error);
                    statsObject = gameState.player.stats; // Fallback
                }
            }

            const updatedPlayer = {
                ...jsonResponse.player,
                stats: statsObject,
            };

            return {
                ...gameState,
                ...jsonResponse,
                player: updatedPlayer,
                log: [...gameState.log, ...jsonResponse.log],
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
     const apiKey = getApiKey(settings);
     if (!apiKey) {
        console.error("Gemini API key is not set.");
        const errorMsg = settings.language === 'ru'
            ? "ОШИБКА: Ключ API Gemini не настроен. Укажите его в настройках или в переменных окружения."
            : "ERROR: Gemini API key is not configured. Provide it in settings or environment variables.";
        alert(errorMsg);
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const isRussian = settings.language === 'ru';

        const prompt = isRussian ?
`Создай уникальный и убедительный стартовый сценарий для текстовой RPG.
Персонаж игрока: ${JSON.stringify(player, null, 2)}.
Сгенерируй полный объект GameState в формате JSON на основе предоставленной схемы.
Сценарий может быть в любом жанре (научная фантастика, фэнтези, детектив, современность и т.д.).
Будь креативным и создай интересную ситуацию с четкими начальными действиями для игрока.
'log' должен представить сцену и начальную ситуацию.
'asciiMap' и 'player.pov' должны быть размером 60x18. 'player.pov' должен быть реалистичным визуальным представлением с перспективой.
Весь твой ответ, включая все текстовые поля в JSON, ДОЛЖЕН быть на русском языке.`
:
`Create a unique and compelling starting scenario for a text-based RPG.
The player character is: ${JSON.stringify(player, null, 2)}.
Generate a complete GameState object in JSON format based on the provided schema.
The scenario can be any genre (sci-fi, fantasy, mystery, modern, etc.).
Be creative and set up an interesting situation with clear initial actions for the player.
The log should introduce the scene and the initial situation.
The asciiMap and player.pov must be 60x18. The 'player.pov' must be a realistic visual representation with perspective.`;

        const model = 'gemini-2.5-pro';
        
        let systemInstruction = isRussian
            ? 'Ты — креативный дизайнер сценариев для текстовой RPG. Твой вывод должен быть валидным JSON-объектом, соответствующим схеме состояния игры. Весь твой вывод должен быть на русском языке.'
            : 'You are a creative scenario designer for a text-based RPG. Your output must be a valid JSON object matching the game state schema.';
        systemInstruction += getHiddenDirective(settings.path, settings.language);

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

            if (!aiState || !aiState.player || !aiState.location || !aiState.npcs || !aiState.log || !aiState.suggestedActions) {
                 console.error("AI returned invalid GameState structure for random scenario", aiState);
                return null;
            }

            let statsObject = aiState.player.stats;
            if (typeof statsObject === 'string') {
                try {
                    statsObject = JSON.parse(statsObject);
                } catch (e) {
                    console.error("Error parsing initial stats string:", e);
                    statsObject = player.stats; // Fallback to original character stats
                }
            }

            const generatedState: GameState = {
                ...aiState,
                player: {
                    ...aiState.player,
                    stats: statsObject,
                },
                turn: 1,
                contextualWindows: [],
                metaDataLog: [],
                scenario: {
                    name: isRussian ? "Случайный сценарий" : "Random Scenario",
                    description: isRussian ? "Мир чистой непредсказуемости, сгенерированный ИИ." : "An AI-generated world of pure unpredictability."
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
    const apiKey = getApiKey(settings);
    if (!apiKey) {
        console.error("Gemini API key is not set.");
        const errorMsg = settings.language === 'ru'
            ? "ОШИБКА: Ключ API Gemini не настроен. Укажите его в настройках или в переменных окружения."
            : "ERROR: Gemini API key is not configured. Provide it in settings or environment variables.";
        alert(errorMsg);
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const isRussian = settings.language === 'ru';

        const prompt = isRussian ?
`Ты — Gemini Master, могущественный ИИ-мастер подземелий. Твоя задача — создать полное начальное состояние игры для новой сессии текстовой RPG. Мир основан на предоставленной карточке, а персонаж игрока предоставляется отдельно.

КАРТОЧКА СЦЕНАРИЯ (Используй это для мира, локации и NPC):
${JSON.stringify({ name: card.data.name, scenario: card.data.scenario, description: card.data.description, first_mes: card.data.first_mes }, null, 2)}

ПЕРСОНАЖ ИГРОКА (Используй ЭТОТ объект как основу для поля 'player' в итоговом JSON):
${JSON.stringify(character, null, 2)}

ИНСТРУКЦИИ:
1.  **Данные игрока:** Объект 'player' в твоем JSON-выводе ДОЛЖЕН быть ТОЧНОЙ копией предоставленных данных ПЕРСОНАЖА ИГРОКА, ЗА ОДНИМ ИСКЛЮЧЕНИЕМ: ты ДОЛЖЕН сгенерировать новое поле 'pov', содержащее реалистичный ASCII/Unicode арт начальной сцены с точки зрения игрока, в соответствии с правилами схемы.
2.  **Локация и сеттинг:** Используй поля 'scenario' или 'description' из КАРТОЧКИ СЦЕНАРИЯ для создания начального объекта 'location'.
3.  **Начальная сцена:** Первая запись в 'log' игры должна быть 'first_mes' из КАРТОЧКИ СЦЕНАРИЯ: "${card.data.first_mes}".
4.  **Генерация мира:** На основе карточки сценария, сгенерируй следующее:
    *   \`location.name\`: Краткое название для стартовой зоны.
    *   \`location.asciiMap\`: ASCII-карта размером 60x18. Помести игрока '@' в логичную стартовую позицию.
    *   \`npcs\`: Если сценарий подразумевает присутствие других персонажей, создай их. В противном случае используй пустой массив.
    *   \`suggestedActions\`: Предоставь четыре интересных действия, которые может предпринять игрок.
5.  **Вывод:** Весь твой ответ ДОЛЖЕН быть единым, валидным JSON-объектом, соответствующим схеме GameState. Установи 'turn' в 1.
6.  **Язык:** Весь твой ответ, включая все текстовые поля в JSON (имена, описания, лог и т.д.), ДОЛЖЕН быть на русском языке.`
:
`You are the Gemini Master, a powerful AI dungeon master. Your task is to create the complete initial game state for a new text-based RPG session. The world is based on a provided card, and the player character is provided separately.

SCENARIO CARD (Use this for world, location, and NPCs):
${JSON.stringify({ name: card.data.name, scenario: card.data.scenario, description: card.data.description, first_mes: card.data.first_mes }, null, 2)}

PLAYER CHARACTER (Use this object as the base for the 'player' field in the final JSON):
${JSON.stringify(character, null, 2)}

INSTRUCTIONS:
1.  **Player Data:** The 'player' object in your JSON output MUST be an EXACT copy of the PLAYER CHARACTER data provided above, WITH ONE EXCEPTION: you MUST generate a new 'pov' field containing realistic ASCII/Unicode art of the initial scene from the player's perspective, following the schema rules.
2.  **Location & Setting:** Use the SCENARIO CARD's 'scenario' or 'description' fields to create the initial 'location' object.
3.  **Opening Scene:** The game's first 'log' entry should be the 'first_mes' from the SCENARIO CARD: "${card.data.first_mes}".
4.  **World Generation:** Based on the scenario card, generate the following:
    *   \`location.name\`: A concise name for the starting area.
    *   \`location.asciiMap\`: A 60x18 ASCII map. Place the player '@' in a logical starting position.
    *   \`npcs\`: If the scenario implies other characters are present, create them. Otherwise, use an empty array.
    *   \`suggestedActions\`: Provide four interesting actions the player can take.
5.  **Output:** Your entire response MUST be a single, valid JSON object matching the GameState schema. Set 'turn' to 1.`;

        const model = 'gemini-2.5-pro';
        
        let systemInstruction = isRussian
            ? 'Ты — креативный дизайнер сценариев для текстовой RPG. Твой вывод должен быть валидным JSON-объектом, соответствующим схеме состояния игры. Весь твой вывод должен быть на русском языке.'
            : 'You are a creative scenario designer for a text-based RPG. Your output must be a valid JSON object matching the game state schema.';

        systemInstruction += getHiddenDirective(settings.path, settings.language);

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

            if (!aiState || !aiState.location || !aiState.player || !aiState.player.pov) {
                console.error("AI returned invalid GameState structure", aiState);
                return null;
            }

            // Assemble the final state, enforcing the chosen character but using the AI's generated POV
            const finalState: GameState = {
                player: {
                    ...character,
                    pov: aiState.player.pov,
                },
                location: aiState.location,
                npcs: aiState.npcs || [],
                log: aiState.log && aiState.log.length > 0 ? aiState.log : [card.data.first_mes], // Use AI log, but fallback to first_mes
                suggestedActions: aiState.suggestedActions || [],
                turn: 1,
                contextualWindows: [],
                metaDataLog: [],
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

export const generateScenarioFromBuiltIn = async (scenario: Scenario, character: Character, settings: Settings): Promise<GameState | null> => {
    const apiKey = getApiKey(settings);
    if (!apiKey) {
       console.error("Gemini API key is not set.");
       const errorMsg = settings.language === 'ru'
           ? "ОШИБКА: Ключ API Gemini не настроен. Укажите его в настройках или в переменных окружения."
           : "ERROR: Gemini API key is not configured. Provide it in settings or environment variables.";
       alert(errorMsg);
       return null;
   }

   try {
       const ai = new GoogleGenAI({ apiKey });
       const isRussian = settings.language === 'ru';

       const prompt = isRussian ?
`Создай уникальный и убедительный стартовый сценарий для текстовой RPG, основанный на следующей теме и персонаже.

ТЕМА СЦЕНАРИЯ:
- Название: ${scenario.name}
- Описание: ${scenario.description}

ПЕРСОНАЖ ИГРОКА:
${JSON.stringify(character, null, 2)}

ИНСТРУКЦИИ:
1. Используй тему сценария для создания мира, начальной локации и ситуации. Не копируй описание темы дословно, а интерпретируй его творчески.
2. Сгенерируй полный объект GameState в JSON, соответствующий предоставленной схеме.
3. Начало должно быть непредсказуемым. Даже для одной и той же темы и персонажа, каждый раз создавай новую, уникальную стартовую ситуацию.
4. 'log' должен представить сцену.
5. 'asciiMap' и 'player.pov' должны быть 60x18 и визуально соответствовать сгенерированной сцене. 'player.pov' ДОЛЖЕН быть случайным и непредсказуемым.
6. Весь твой ответ, включая все текстовые поля в JSON, ДОЛЖЕН быть на русском языке.`
:
`Create a unique and compelling starting scenario for a text-based RPG, based on the following theme and character.

SCENARIO THEME:
- Name: ${scenario.name}
- Description: ${scenario.description}

PLAYER CHARACTER:
${JSON.stringify(character, null, 2)}

INSTRUCTIONS:
1. Use the scenario theme to generate the world, starting location, and situation. Do not copy the theme description verbatim; interpret it creatively.
2. Generate a complete GameState object in JSON format based on the provided schema.
3. The start must be non-deterministic. For the same theme and character, generate a new, unique starting situation every time.
4. The 'log' should introduce the scene.
5. The 'asciiMap' and 'player.pov' must be 60x18 and visually match the generated scene. The 'player.pov' MUST be random and unpredictable.`;

       const model = 'gemini-2.5-pro';
       
       let systemInstruction = isRussian
           ? 'Ты — креативный дизайнер сценариев для текстовой RPG. Твой вывод должен быть валидным JSON-объектом, соответствующим схеме состояния игры. Весь твой вывод должен быть на русском языке.'
           : 'You are a creative scenario designer for a text-based RPG. Your output must be a valid JSON object matching the game state schema.';
       systemInstruction += getHiddenDirective(settings.path, settings.language);

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

           if (!aiState || !aiState.player || !aiState.location || !aiState.npcs || !aiState.log || !aiState.suggestedActions) {
                console.error("AI returned invalid GameState structure for built-in scenario", aiState);
               return null;
           }

           let statsObject = aiState.player.stats;
           if (typeof statsObject === 'string') {
               try {
                   statsObject = JSON.parse(statsObject);
               } catch (e) {
                   console.error("Error parsing initial stats string:", e);
                   statsObject = character.stats; // Fallback to original character stats
               }
           }

           const generatedState: GameState = {
               ...aiState,
               player: {
                   ...character,
                   ...aiState.player,
                   name: character.name,
                   description: character.description,
                   inventory: character.inventory,
                   stats: statsObject,
               },
               turn: 1,
               contextualWindows: [],
               metaDataLog: [],
               scenario: {
                   name: scenario.name,
                   description: scenario.description
               }
           };
           return generatedState;
       }

       return null;
   } catch (error) {
       console.error("Error generating built-in scenario from Gemini:", error);
       return null;
   }
}