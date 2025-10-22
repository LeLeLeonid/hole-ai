import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface PlayerStatsPanelProps {
    stats: Record<string, string | number>;
}

export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ stats }) => {
    const { theme } = useTheme();

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto">
                <ul className="space-y-2 p-1">
                    {Object.entries(stats).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                            <span style={{color: theme.colors.text}}>{key}:</span>
                            <span style={{color: theme.colors.accent2}}>{value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};