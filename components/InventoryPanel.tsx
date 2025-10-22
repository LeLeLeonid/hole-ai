import React, { useState } from 'react';
import type { Item } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface InventoryPanelProps {
    inventory: Item[];
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory }) => {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const { theme } = useTheme();

    return (
        <div 
            className="h-full flex flex-col"
        >
            <div className="flex-grow overflow-y-auto">
                {inventory.length === 0 ? (
                    <p className="p-1" style={{color: theme.colors.disabledText}}>Your pockets are empty.</p>
                ) : (
                    <ul className="space-y-1">
                        {inventory.map((item) => (
                            <li key={item.name}>
                                <button 
                                    className="w-full text-left p-1"
                                    style={{
                                        backgroundColor: selectedItem?.name === item.name ? theme.colors.highlightBg : 'transparent',
                                        color: selectedItem?.name === item.name ? theme.colors.highlightText : theme.colors.text,
                                    }}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="h-28 mt-2 pt-2" style={{borderTop: `1px solid ${theme.colors.accent1}`}}>
                <h3 className="text-xl">Details</h3>
                {selectedItem ? (
                    <p className="text-base whitespace-pre-wrap">{selectedItem.description}</p>
                ) : (
                    <p style={{color: theme.colors.disabledText}}>Select an item to view its details.</p>
                )}
            </div>
        </div>
    );
};