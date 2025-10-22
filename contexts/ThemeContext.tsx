import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Theme } from '../types';
import { THEMES } from '../themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeName: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  try {
    const storedThemeName = localStorage.getItem('hole-ai-theme');
    if (storedThemeName) {
      const foundTheme = THEMES.find(t => t.name === storedThemeName);
      if (foundTheme) return foundTheme;
    }
  } catch (error) {
    console.error("Failed to parse theme from localStorage", error);
  }
  return THEMES[0]; // Default to 1-Bit theme
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    try {
      localStorage.setItem('hole-ai-theme', theme.name);
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
    }
  }, [theme]);

  const setTheme = (themeName: string) => {
    const newTheme = THEMES.find(t => t.name === themeName);
    if (newTheme) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};