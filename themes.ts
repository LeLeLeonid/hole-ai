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
      disabledBg: '#222222',
      disabledText: '#666666',
    },
  },
  {
    name: 'Terminal',
    colors: {
      bg: '#030702',
      text: '#00E84A',
      accent1: '#00E84A',
      accent2: '#00C83F',
      highlightBg: '#00E84A',
      highlightText: '#030702',
      disabledBg: '#020501',
      disabledText: '#005c1e',
    },
  },
  {
    name: 'Amber',
    colors: {
      bg: '#211200',
      text: '#FFB000',
      accent1: '#FFB000',
      accent2: '#FFC400',
      highlightBg: '#FFB000',
      highlightText: '#211200',
      disabledBg: '#3A2000',
      disabledText: '#785421',
    },
  },
  {
    name: 'Vaporwave',
    colors: {
      bg: '#0d0221',
      text: '#ff00ff', // Magenta
      accent1: '#00f0ff', // Cyan
      accent2: '#fa8bff', // Light Pink
      highlightBg: '#00f0ff',
      highlightText: '#0d0221',
      disabledBg: '#2a0a5e',
      disabledText: '#7b52ab',
    },
  },
];