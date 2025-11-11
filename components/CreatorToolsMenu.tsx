import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

interface CreatorToolsMenuProps {
    onManageContent: () => void;
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

export const CreatorToolsMenu: React.FC<CreatorToolsMenuProps> = ({ onManageContent, onBack }) => {
    const { theme } = useTheme();
    const t = useTranslation();

    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl tracking-widest mb-10" style={{ color: theme.colors.accent1 }}>{t('creatorToolsTitle')}</h1>
            
            <div className="flex flex-col gap-4">
                <MenuButton onClick={onManageContent}>{t('manageContent')}</MenuButton>
                <MenuButton onClick={onBack}>{t('back')}</MenuButton>
            </div>
        </div>
    );
};