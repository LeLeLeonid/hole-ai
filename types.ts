export type TextSpeed = 'instant' | 'fast' | 'normal';
export type BackgroundStyle = 'night-sky' | 'matrix' | 'ascii' | 'none';
export type Difficulty = 'EASY' | 'REALISTIC' | 'HARD';
export type PlayerPath = 'keeper' | 'synthesizer' | 'none';

export interface Settings {
    scale: number;
    textSpeed: TextSpeed;
    background: BackgroundStyle;
    difficulty: Difficulty;
    path: PlayerPath;
    introCompleted: boolean;
}

export interface Theme {
    name: string;
    colors: {
        bg: string;
        text: string;
        accent1: string;
        accent2: string;
        highlightBg: string;
        highlightText: string;
        disabledBg: string;
        disabledText: string;
    };
}

export interface Item {
    name: string;
    description: string;
    quantity: number;
}

export interface NPC {
    name: string;
    knownAs: string;
    isNameKnown: boolean;
    description: string;
    faceDescription: string;
    clothingDescription: string;
    notes: string[];
}

export interface Character {
    name:string;
    description: string;
    inventory: Item[];
    stats: Record<string, string | number>;
    pov: string;
}

export interface Location {
    name: string;
    description: string;
    asciiMap: string;
}

export type PanelId = 'pov' | 'stats' | 'inventory' | 'npcs' | 'map';

export interface PanelState {
    id: PanelId;
    title: string;
    isOpen: boolean;
    position: { x: number, y: number };
    size: { width: number, height: number };
}

export interface GameState {
    player: Character;
    location: Location;
    npcs: NPC[];
    log: string[];
    suggestedActions: string[];
    turn: number;
    contextualWindows: any[]; // Or define a more specific type
    scenario: {
        name: string;
        description: string;
    }
}

export interface Scenario {
    name: string;
    description: string;
    initialState: Partial<GameState>;
}

export interface SaveSlot {
    gameState: GameState;
    themeName: string;
    settings: Settings;
    timestamp: number;
    screenshot?: string;
}

// Based on https://github.com/malfoys/character-card-spec-v2
export interface CharaCardV3 {
    spec: 'chara_card_v3';
    spec_version: string;
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    creatorcomment: string;
    avatar: string;
    talkativeness: string;
    fav: boolean;
    tags: string[];
    create_date: string;
    data: {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        tags: string[];
        creator: string;
        character_version: string;
        alternate_greetings: string[];
        extensions: {
            talkativeness: string;
            fav: boolean;
            world: string;
            depth_prompt: {
                prompt: string;
                depth: number;
                role: string;
            };
        };
        group_only_greetings: any[];
    };
}

export type CustomContentType = 'scenario' | 'character';

export interface CustomContentItem {
  type: CustomContentType;
  card: CharaCardV3;
}