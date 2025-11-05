import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface MainMenuProps {
  onStart: () => void;
  onSettings: () => void;
  onLoad: () => void;
}

const AsciiArtTitle = () => (
  <pre className="text-center text-lg leading-none md:text-2xl md:leading-none">
{`
██╗  ██╗ ██████╗ ██╗     ███████╗     █████╗ ██╗
██║  ██║██╔═══██╗██║     ██╔════╝    ██╔══██╗██╗
███████║██║   ██║██║     █████╗      ███████║██║
██╔══██║██║   ██║██║     ██╔══╝      ██╔══██║╚═╝
██║  ██║╚██████╔╝███████╗███████╗    ██║  ██║██╗
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝    ╚═╝  ╚═╝╚═╝
`}
  </pre>
);

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

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, onSettings, onLoad }) => {
  const { theme } = useTheme();
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 relative">
      <div className="text-center" style={{ color: theme.colors.accent1 }}>
        <AsciiArtTitle />
      </div>
      <div className="flex flex-col gap-4 mt-8">
        <MenuButton onClick={onStart}>NEW GAME</MenuButton>
        <MenuButton onClick={onLoad}>LOAD GAME</MenuButton>
        <MenuButton onClick={onSettings}>SETTINGS</MenuButton>
      </div>
      <div className="absolute bottom-4 text-center">
        <a 
          href="https://github.com/LeLeLeonid" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: theme.colors.accent2, opacity: 0.8 }}
        >
          Author: LeLeLeonid
        </a>
      </div>
    </div>
  );
};