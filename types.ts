export interface Item {
  name: string;
  description: string;
  quantity: number;
}

export interface NPC {
  name: string;
  description: string;
  faceDescription: string;
  clothingDescription: string;
  notes: string[];
}

export interface Player {
  name:string;
  description: string;
  inventory: Item[];
  stats: Record<string, string | number>;
  pov: string; // First-person point of view ASCII or text
}

export interface Location {
  name: string;
  description: string;
  asciiMap: string;
}

export interface ContextualWindow {
    id: string;
    title: string;
    type: 'STATS' | 'POV' | 'INTERNET' | 'TEXT';
}

export interface GameState {
  player: Player;
  location: Location;
  npcs: NPC[];
  log: string[];
  suggestedActions: string[];
  turn: number;
  contextualWindows: ContextualWindow[];
}

export interface ThemeColors {
  bg: string;
  text: string;
  accent1: string;
  accent2: string;
  highlightBg: string;
  highlightText: string;
  disabledBg: string;
  disabledText: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
}

export type TextSpeed = 'instant' | 'fast' | 'normal';
export type BackgroundStyle = 'night-sky' | 'matrix' | 'ascii' | 'none';

export interface Settings {
    scale: number;
    textSpeed: TextSpeed;
    background: BackgroundStyle;
}

export interface SaveSlot {
    id: string;
    timestamp: number;
    gameState: GameState;
    windowState: Record<WindowId, WindowState>;
    themeName: string;
    settings: Settings;
}

export type WindowPosition = { x: number; y: number };
export type WindowSize = { width: number; height: number };
export type WindowId = string;
export type SnapState = { top: boolean, right: boolean, bottom: boolean, left: boolean };

export interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isSnapped: SnapState;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  type?: ContextualWindow['type'];
  previousPosition?: WindowPosition;
  previousSize?: WindowSize;
}