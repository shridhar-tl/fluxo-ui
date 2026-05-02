import React, { createContext, ReactNode, useContext } from 'react';
import { themes } from '../../themes';
import { Size, Theme, ThemeConfig } from '../../types';

interface ThemeContextValue {
    size?: Size;
    theme?: Theme;
    borderRadius?: string;
    borderColor?: string;
    borderWidth?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontColor?: string;
    placeholderStyles?: {
        fontSize?: string;
        color?: string;
        fontStyle?: string;
    };
    getThemeConfig: () => ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps extends Partial<ThemeContextValue> {
    children: ReactNode;
}

/**
 * @deprecated Theme/dark-mode decisions should be driven by `--eui-*` CSS
 * variables and the `body.mode-dark` selector, not by React context. This
 * provider remains for backwards compatibility only and will be removed in a
 * future major release. New components should not consume `useTheme()`.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    size = 'md',
    theme = 'default',
    borderRadius,
    borderColor,
    borderWidth,
    backgroundColor,
    fontSize,
    fontColor,
    placeholderStyles,
}) => {
    const parentContext = useContext(ThemeContext);

    const getThemeConfig = (): ThemeConfig => {
        return themes[theme || 'default'];
    };

    const contextValue: ThemeContextValue = {
        size: size || parentContext?.size,
        theme: theme || parentContext?.theme,
        borderRadius: borderRadius || parentContext?.borderRadius,
        borderColor: borderColor || parentContext?.borderColor,
        borderWidth: borderWidth || parentContext?.borderWidth,
        backgroundColor: backgroundColor || parentContext?.backgroundColor,
        fontSize: fontSize || parentContext?.fontSize,
        fontColor: fontColor || parentContext?.fontColor,
        placeholderStyles: {
            ...parentContext?.placeholderStyles,
            ...placeholderStyles,
        },
        getThemeConfig,
    };

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/**
 * @deprecated Use `--eui-*` CSS variables and `body.mode-dark` selectors
 * instead. This hook will be removed in a future major release.
 */
export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            size: 'md',
            theme: 'default',
            getThemeConfig: () => themes.default,
        };
    }
    return context;
};
