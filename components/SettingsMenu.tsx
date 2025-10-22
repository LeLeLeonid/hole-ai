import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { TextSpeed, BackgroundStyle } from '../types';

interface SettingsMenuProps {
  onBack: () => void;
}

const MenuButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
      <div 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: isHovered ? theme.colors.highlightBg : 'transparent',
          color: isHovered ? theme.colors.highlightText : theme.colors.text,
          cursor: 'pointer',
        }}
        className="p-2 text-2xl tracking-widest"
      >
        [ {children} ]
      </div>
    );
};

const SettingOption: React.FC<{onClick: () => void, isSelected: boolean, children: React.ReactNode}> = ({ onClick, isSelected, children }) => {
    const { theme } = useTheme();
    return (
        <div 
            onClick={onClick}
            className="text-xl cursor-pointer p-1 text-center"
            style={{
                backgroundColor: isSelected ? theme.colors.highlightBg : 'transparent',
                color: isSelected ? theme.colors.highlightText : theme.colors.text,
            }}
        >
           {isSelected ? `> ${children} <` : `  ${children}  `}
        </div>
    );
};

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onBack }) => {
  const { theme, setTheme, themes } = useTheme();
  const { settings, setScale, setTextSpeed, setBackground } = useSettings();

  const scaleOptions = [0.8, 1.0, 1.2, 1.5];
  const textSpeedOptions: TextSpeed[] = ['instant', 'fast', 'normal'];
  const backgroundOptions: {value: BackgroundStyle, label: string}[] = [
      { value: 'night-sky', label: 'Night Sky'},
      { value: 'matrix', label: 'Matrix' },
      { value: 'ascii', label: 'ASCII' },
      { value: 'none', label: 'None' },
  ];

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl tracking-widest mb-8" style={{ color: theme.colors.accent1 }}>[ SETTINGS ]</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 w-full max-w-5xl">

        {/* Theme Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">Theme</p>
            {themes.map(t => (
                <SettingOption 
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    isSelected={theme.name === t.name}
                >
                    {t.name}
                </SettingOption>
            ))}
        </div>

        {/* Background Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">Background</p>
            {backgroundOptions.map(opt => (
                <SettingOption 
                    key={opt.value}
                    onClick={() => setBackground(opt.value)}
                    isSelected={settings.background === opt.value}
                >
                    {opt.label}
                </SettingOption>
            ))}
        </div>
        
        {/* Scale Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">Scale</p>
            {scaleOptions.map(s => (
                <SettingOption 
                    key={s}
                    onClick={() => setScale(s)}
                    isSelected={settings.scale === s}
                >
                    {s.toFixed(1)}x
                </SettingOption>
            ))}
        </div>

        {/* Text Speed Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">Text Speed</p>
            {textSpeedOptions.map(speed => (
                <SettingOption 
                    key={speed}
                    onClick={() => setTextSpeed(speed)}
                    isSelected={settings.textSpeed === speed}
                >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </SettingOption>
            ))}
        </div>

      </div>

      <MenuButton onClick={onBack}>BACK</MenuButton>
    </div>
  );
};