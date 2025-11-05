import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className }) => {
  const { theme } = useTheme();
  return (
    <div 
      className={`flex flex-col overflow-hidden bg-opacity-50 ${className || ''}`}
      style={{ 
        border: `1px solid ${theme.colors.accent1}`,
        backgroundColor: `rgba(${parseInt(theme.colors.bg.slice(1,3),16)}, ${parseInt(theme.colors.bg.slice(3,5),16)}, ${parseInt(theme.colors.bg.slice(5,7),16)}, 0.5)`
      }}
    >
      <h2 
        className="p-1 text-center flex-shrink-0"
        style={{
          borderBottom: `1px solid ${theme.colors.accent1}`,
          color: theme.colors.accent2,
          textShadow: `0 0 3px ${theme.colors.accent2}`
        }}
      >
        -=[ {title} ]=-
      </h2>
      <div className="p-2 flex-grow overflow-auto relative">
        {children}
      </div>
    </div>
  );
};