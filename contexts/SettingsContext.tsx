
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Settings, TextSpeed, BackgroundStyle, Difficulty, PlayerPath, Language } from '../types';

interface SettingsContextType {
  settings: Settings;
  setScale: (scale: number) => void;
  setTextSpeed: (speed: TextSpeed) => void;
  setBackground: (background: BackgroundStyle) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setPath: (path: PlayerPath) => void;
  setIntroCompleted: (completed: boolean) => void;
  setSettings: (settings: Settings) => void;
  setLanguage: (language: Language) => void;
  setApiKey: (key: string | null) => void;
  setCrtEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
  scale: 1.0,
  textSpeed: 'normal',
  background: 'none',
  difficulty: 'REALISTIC',
  path: 'none',
  introCompleted: false,
  language: 'en',
  apiKey: null,
  crtEnabled: true,
};

const getInitialSettings = (): Settings => {
  try {
    const storedSettings = localStorage.getItem('hole-ai-settings');
    if (storedSettings) {
      // Merge stored settings with defaults to ensure all keys are present
      return { ...defaultSettings, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error("Failed to parse settings from localStorage", error);
  }
  return defaultSettings;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<Settings>(getInitialSettings);

  useEffect(() => {
    try {
      localStorage.setItem('hole-ai-settings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
    document.documentElement.style.fontSize = `${settings.scale * 100}%`;
  }, [settings]);

  const setScale = (scale: number) => {
    setSettingsState(s => ({ ...s, scale }));
  };

  const setTextSpeed = (speed: TextSpeed) => {
    setSettingsState(s => ({ ...s, textSpeed: speed }));
  };

  const setBackground = (background: BackgroundStyle) => {
    setSettingsState(s => ({ ...s, background }));
  };
  
  const setDifficulty = (difficulty: Difficulty) => {
    setSettingsState(s => ({...s, difficulty }));
  };

  const setPath = (path: PlayerPath) => {
    setSettingsState(s => ({ ...s, path }));
  };

  const setIntroCompleted = (completed: boolean) => {
    setSettingsState(s => ({ ...s, introCompleted: completed }));
  };

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };
  
  const setLanguage = (language: Language) => {
    setSettingsState(s => ({...s, language }));
  };

  const setApiKey = (key: string | null) => {
    setSettingsState(s => ({ ...s, apiKey: key }));
  };

  const setCrtEnabled = (enabled: boolean) => {
    setSettingsState(s => ({ ...s, crtEnabled: enabled }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setScale, setTextSpeed, setBackground, setDifficulty, setPath, setIntroCompleted, setSettings, setLanguage, setApiKey, setCrtEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
