import { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { en } from '../locales/en';
import { ru } from '../locales/ru';

const translations = { en, ru };

export const useTranslation = () => {
    const { settings } = useSettings();
    const lang = settings.language || 'en';

    const t = useMemo(() => {
        return (key: keyof typeof en) => {
            return translations[lang][key] || translations['en'][key] || key;
        };
    }, [lang]);

    return t;
};