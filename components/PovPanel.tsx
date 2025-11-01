import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface PovPanelProps {
  pov: string;
}

export const PovPanel: React.FC<PovPanelProps> = ({ pov }) => {
  const { theme } = useTheme();
  return (
    <div 
        className="w-full h-full text-lg leading-tight overflow-auto"
        style={{ 
            backgroundColor: 'inherit',
        }}
    >
      <pre className="p-1 h-full whitespace-pre" style={{color: theme.colors.accent2}}>
        {pov}
      </pre>
    </div>
  );
};