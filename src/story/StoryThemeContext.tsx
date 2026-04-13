import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type StoryMode = 'dark' | 'light';
export type ColorTheme =
    | 'blue'
    | 'lara'
    | 'green'
    | 'purple'
    | 'orange'
    | 'indigo'
    | 'rose'
    | 'amber'
    | 'teal'
    | 'emerald'
    | 'fuchsia'
    | 'slate';

export const colorThemes: ColorTheme[] = [
    'blue',
    'lara',
    'green',
    'purple',
    'orange',
    'indigo',
    'rose',
    'amber',
    'teal',
    'emerald',
    'fuchsia',
    'slate',
];

interface StoryThemeContextValue {
    theme: StoryMode;
    colorTheme: ColorTheme;
    toggleTheme: () => void;
    setColorTheme: (t: ColorTheme) => void;
    isDark: boolean;
}

const StoryThemeContext = createContext<StoryThemeContextValue>({
    theme: 'dark',
    colorTheme: 'blue',
    toggleTheme: () => {},
    setColorTheme: () => {},
    isDark: true,
});

const modeKey = 'fluxo-ui-story-theme';
const colorKey = 'fluxo-ui-story-color-theme';

export const StoryThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<StoryMode>(() => {
        const saved = localStorage.getItem(modeKey);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
        const saved = localStorage.getItem(colorKey);
        if (saved && colorThemes.includes(saved as ColorTheme)) return saved as ColorTheme;
        return 'blue';
    });

    useEffect(() => {
        localStorage.setItem(modeKey, theme);
        document.documentElement.setAttribute('data-story-theme', theme);
        if (theme === 'dark') {
            document.body.classList.add('mode-dark');
        } else {
            document.body.classList.remove('mode-dark');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(colorKey, colorTheme);
        colorThemes.forEach((t) => document.body.classList.remove(`theme-${t}`));
        document.body.classList.add(`theme-${colorTheme}`);
    }, [colorTheme]);

    const toggleTheme = useCallback(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

    const setColorTheme = useCallback((t: ColorTheme) => setColorThemeState(t), []);

    const value = useMemo(
        () => ({
            theme,
            colorTheme,
            toggleTheme,
            setColorTheme,
            isDark: theme === 'dark',
        }),
        [theme, colorTheme, toggleTheme, setColorTheme],
    );

    return <StoryThemeContext.Provider value={value}>{children}</StoryThemeContext.Provider>;
};

export const useStoryTheme = () => useContext(StoryThemeContext);
