import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GameScreenProps {
  asciiMap: string;
}

export const GameScreen: React.FC<GameScreenProps> = ({ asciiMap }) => {
  const { theme } = useTheme();
  return (
    <div 
        className="w-full h-full text-lg leading-tight overflow-auto"
        style={{ 
            backgroundColor: 'inherit',
        }}
    >
      <pre className="p-1 h-full whitespace-pre-wrap" style={{color: theme.colors.accent2}}>
        {asciiMap}
      </pre>
    </div>
  );
};