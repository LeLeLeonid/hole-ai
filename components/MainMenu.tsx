import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onCreatorTools: () => void;
  onSettings: () => void;
  isGameInProgress: boolean;
  onResumeGame: () => void;
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

const AsciiArtTitle = () => {
    const { theme } = useTheme();
    return (
        <pre 
            className="text-center text-lg leading-none md:text-2xl md:leading-none"
            style={{ color: theme.colors.accent1 }}
        >
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
};

export const MainMenu: React.FC<MainMenuProps> = ({ 
    onNewGame, 
    onLoadGame,
    onCreatorTools,
    onSettings, 
    isGameInProgress, 
    onResumeGame,
}) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
            <div className="mb-10">
                <AsciiArtTitle />
            </div>
            
            <div className="flex flex-col gap-4">
                {isGameInProgress && <MenuButton onClick={onResumeGame}>RESUME</MenuButton>}
                <MenuButton onClick={onNewGame}>NEW GAME</MenuButton>
                <MenuButton onClick={onLoadGame}>LOAD GAME</MenuButton>
                <MenuButton onClick={onCreatorTools}>CREATOR TOOLS / EDITOR</MenuButton>
                <MenuButton onClick={onSettings}>SETTINGS</MenuButton>
                <MenuButton onClick={() => alert("To exit, simply close the browser tab.")}>EXIT</MenuButton>
            </div>
        </div>
    );
};