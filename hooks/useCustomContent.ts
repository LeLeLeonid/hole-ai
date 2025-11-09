import { useState, useEffect, useCallback } from 'react';
import { CharaCardV3, CustomContentItem, CustomContentType } from '../types';

const STORAGE_KEY = 'hole-ai-custom-content';

export const useCustomContent = () => {
    const [customContent, setCustomContent] = useState<CustomContentItem[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Migration for old format (array of cards) to new format (array of {type, card})
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].spec) {
                    const migratedContent: CustomContentItem[] = parsed.map((card: CharaCardV3) => ({
                        type: 'scenario', // Assume all old content were scenarios
                        card: card,
                    }));
                    setCustomContent(migratedContent);
                    // Save migrated data back to localStorage
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedContent));
                } else if (Array.isArray(parsed) && (parsed.length === 0 || (parsed[0].type && parsed[0].card))) {
                     // It's the new format or an empty array
                    setCustomContent(parsed);
                }
            }
        } catch (e) { 
            console.error("Failed to load custom content from localStorage", e);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const saveContent = useCallback((content: CustomContentItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
            setCustomContent(content);
        } catch (e) { 
            console.error("Failed to save custom content to localStorage", e);
        }
    }, []);

    const addContent = useCallback((card: CharaCardV3, type: CustomContentType) => {
        setCustomContent(prev => {
            const exists = prev.some(c => c.card.data.name === card.data.name);
            if (!exists) {
                const newItem: CustomContentItem = { type, card };
                const newState = [...prev, newItem];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
                return newState;
            }
            // If it exists, you might want to alert the user or offer to overwrite.
            // For now, we just prevent duplicates by name.
            alert(`An item named "${card.data.name}" already exists.`);
            return prev;
        });
    }, []);
    
    const removeContent = useCallback((cardName: string) => {
        setCustomContent(prev => {
            const newState = prev.filter(c => c.card.data.name !== cardName);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            return newState;
        });
    }, []);

    return {
        customContent,
        addContent,
        removeContent,
        saveContent,
    };
};