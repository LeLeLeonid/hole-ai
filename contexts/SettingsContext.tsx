import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Settings, TextSpeed, BackgroundStyle } from '../types';

interface SettingsContextType {
  settings: Settings;
  setScale: (scale: number) => void;
  setTextSpeed: (speed: TextSpeed) => void;
  setBackground: (background: BackgroundStyle) => void;
  setSettings: (settings: Settings) => void; // New function
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
  scale: 1.0,
  textSpeed: 'normal',
  background: 'none',
};

const getInitialSettings = (): Settings => {
  try {
    const storedSettings = localStorage.getItem('hole-ai-settings');
    if (storedSettings) {
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
    // Apply scale to root element for responsive UI scaling
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

  // New function to set the whole object
  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, setScale, setTextSpeed, setBackground, setSettings }}>
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