import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GameScreenProps {
  asciiMap: string;
}

export const GameScreen: React.FC<GameScreenProps> = ({ asciiMap }) => {
  const { theme } = useTheme();
  return (
    <div 
        className="w-full h-full leading-tight overflow-hidden"
        style={{ 
            backgroundColor: 'inherit',
        }}
    >
      <pre 
        className="p-1 whitespace-pre"
        style={{
            color: theme.colors.accent2,
            fontSize: '0.85em', // Adjusted for better fit
            lineHeight: '1.1',  // Adjusted for better fit
        }}
      >
        {asciiMap}
      </pre>
    </div>
  );
};