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
      bg: '#0D1F2D',
      text: '#39FF14',
      accent1: '#39FF14',
      accent2: '#28a745',
      highlightBg: '#39FF14',
      highlightText: '#0D1F2D',
      disabledBg: '#333333',
      disabledText: '#777777',
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