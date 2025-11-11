import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { TextSpeed, BackgroundStyle, Difficulty, Language } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsMenuProps {
  onBack: () => void;
}

const MenuButton: React.FC<{onClick: () => void, children: React.ReactNode, disabled?: boolean}> = ({ onClick, children, disabled }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);
    
    return (
      <button 
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        disabled={disabled}
        style={{
          backgroundColor: isHovered ? theme.colors.highlightBg : 'transparent',
          color: disabled ? theme.colors.disabledText : (isHovered ? theme.colors.highlightText : theme.colors.text),
          cursor: disabled ? 'default' : 'pointer',
        }}
        className="p-2 text-2xl tracking-widest bg-transparent border-none"
      >
        [ {children} ]
      </button>
    );
};

const SettingOption: React.FC<{onClick: () => void, isSelected: boolean, children: React.ReactNode}> = ({ onClick, isSelected, children }) => {
    const { theme } = useTheme();
    return (
        <button 
            onClick={onClick}
            className="text-xl cursor-pointer p-1 text-center w-full bg-transparent border-none"
            style={{
                backgroundColor: isSelected ? theme.colors.highlightBg : 'transparent',
                color: isSelected ? theme.colors.highlightText : theme.colors.text,
            }}
        >
           {isSelected ? `> ${children} <` : `  ${children}  `}
        </button>
    );
};

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onBack }) => {
  const { theme, setTheme, themes } = useTheme();
  const { settings, setScale, setTextSpeed, setBackground, setDifficulty, setLanguage, setApiKey } = useSettings();
  const t = useTranslation();

  const scaleOptions = [0.8, 1.0, 1.2, 1.5];
  const textSpeedOptions: TextSpeed[] = ['instant', 'fast', 'normal'];
  const backgroundOptions: {value: BackgroundStyle, key: 'bgNightSky' | 'bgMatrix' | 'bgAscii' | 'bgNone'}[] = [
      { value: 'night-sky', key: 'bgNightSky'},
      { value: 'matrix', key: 'bgMatrix' },
      { value: 'ascii', key: 'bgAscii' },
      { value: 'none', key: 'bgNone' },
  ];
  const difficultyOptions: Difficulty[] = ['EASY', 'REALISTIC', 'HARD'];
  const languageOptions: {value: Language, label: string}[] = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
  ]
  

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl tracking-widest mb-8" style={{ color: theme.colors.accent1 }}>{t('settingsTitle')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8 w-full max-w-7xl">

        {/* Theme Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">{t('theme')}</p>
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
        
        {/* Language Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">{t('language')}</p>
            {languageOptions.map(opt => (
                <SettingOption 
                    key={opt.value}
                    onClick={() => setLanguage(opt.value)}
                    isSelected={settings.language === opt.value}
                >
                    {opt.label}
                </SettingOption>
            ))}
        </div>

        {/* Background Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">{t('background')}</p>
            {backgroundOptions.map(opt => (
                <SettingOption 
                    key={opt.value}
                    onClick={() => setBackground(opt.value)}
                    isSelected={settings.background === opt.value}
                >
                    {t(opt.key)}
                </SettingOption>
            ))}
        </div>
        
        {/* Scale Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">{t('scale')}</p>
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
            <p className="text-2xl text-center mb-2">{t('textSpeed')}</p>
            {textSpeedOptions.map(speed => (
                <SettingOption 
                    key={speed}
                    onClick={() => setTextSpeed(speed)}
                    isSelected={settings.textSpeed === speed}
                >
                    {t(speed)}
                </SettingOption>
            ))}
        </div>

        {/* Difficulty Settings */}
        <div className="flex flex-col items-center">
            <p className="text-2xl text-center mb-2">{t('difficulty')}</p>
            {difficultyOptions.map(level => (
                <SettingOption 
                    key={level}
                    onClick={() => setDifficulty(level)}
                    isSelected={settings.difficulty === level}
                >
                    {t(level.toLowerCase() as 'easy' | 'realistic' | 'hard')}
                </SettingOption>
            ))}
        </div>
      </div>

      {/* API Key Settings */}
      <div className="w-full max-w-2xl mt-4 text-center">
          <label htmlFor="apiKeyInput" className="text-2xl mb-2 block">{t('apiKey')}</label>
           <div className="relative w-full">
              <input
                id="apiKeyInput"
                type="password"
                value={settings.apiKey || ''}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 bg-black bg-opacity-30 border text-center"
                style={{
                  borderColor: theme.colors.accent1,
                  color: theme.colors.text,
                  paddingRight: '2.5rem' // Make space for the clear button
                }}
                placeholder={t('apiKeyPlaceholder')}
              />
              {(settings.apiKey || '') !== '' && (
                  <button
                      onClick={() => setApiKey(null)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-2xl"
                      style={{ color: theme.colors.accent2, cursor: 'pointer' }}
                      aria-label={t('clearApiKey')}
                  >
                      &times;
                  </button>
              )}
            </div>
      </div>


      <div className="mt-8">
        <MenuButton onClick={onBack}>{t('back')}</MenuButton>
      </div>
    </div>
  );
};