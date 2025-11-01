import { Theme } from './types';

export const THEMES: Theme[] = [
  {
    name: '1-Bit',
    colors: {
      bg: '#000000',
      text: '#FFFFFF',
      accent1: '#FFFFFF',
      accent2: '#FFFFFF',
      highlightBg: '#FFFFFF',
      highlightText: '#000000',
      disabledBg: '#333333',
      disabledText: '#888888',
    },
  },
  {
    name: 'Terminal',
    colors: {
      bg: '#0a0f0d',       // Very dark green-black
      text: '#33ff33',     // Bright CRT green
      accent1: '#33ff33',    // Bright green for borders/titles
      accent2: '#22dd22',    // Slightly dimmer green for map/special text
      highlightBg: '#33ff33',// Bright green for selection background
      highlightText: '#0a0f0d',// Dark bg color for selection text
      disabledBg: '#05110a', // Darker background
      disabledText: '#226622', // Dim, desaturated green for disabled items
    },
  },
  {
    name: 'Amber',
    colors: {
      bg: '#2E1700',
      text: '#FFB000',
      accent1: '#FFB000',
      accent2: '#FFC400',
      highlightBg: '#FFB000',
      highlightText: '#2E1700',
      disabledBg: '#4A2500',
      disabledText: '#8D5F26',
    },
  },
  {
    name: 'Vaporwave',
    colors: {
      bg: '#0d0221',
      text: '#ff00ff', // Magenta
      accent1: '#00f0ff', // Cyan
      accent2: '#fa8bff', // Light Pink
      highlightBg: '#ff00ff',
      highlightText: '#0d0221',
      disabledBg: '#2a0a5e',
      disabledText: '#7b52ab',
    },
  },
];