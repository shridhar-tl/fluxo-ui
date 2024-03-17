import classNames from 'classnames';
import { useTheme } from '../components/context/ThemeContext';
import { BaseComponentProps } from '../types';

export const generateId = () => {
    return `ui-${Math.random().toString(36).substring(2, 9)}`;
};

export const getComponentClasses = (baseProps: BaseComponentProps, additionalClasses?: string) => {
    const { size, theme, className, disabled } = baseProps;
    const themeContext = useTheme();

    const finalSize = size || themeContext.size || 'md';
    const finalTheme = theme || themeContext.theme || 'default';

    return classNames(
        'transition-all duration-200 ease-in-out',
        `ui-size-${finalSize}`,
        `ui-theme-${finalTheme}`,
        {
            'opacity-50 cursor-not-allowed': disabled,
        },
        additionalClasses,
        className
    );
};

export const getComponentStyles = (baseProps: BaseComponentProps): React.CSSProperties => {
    const themeContext = useTheme();
    const themeConfig = themeContext.getThemeConfig();
    const finalSize = baseProps.size || themeContext.size || 'md';

    const sizeStyles = (themeConfig.sizes as any)[finalSize];

    return {
        borderRadius: baseProps.borderRadius || themeContext.borderRadius || sizeStyles.borderRadius,
        ...(baseProps.borderColor || themeContext.borderColor ? { borderColor: baseProps.borderColor || themeContext.borderColor } : {}),
        borderWidth: baseProps.borderWidth || themeContext.borderWidth || themeConfig.borderWidth,
        ...(baseProps.backgroundColor || themeContext.backgroundColor ? { backgroundColor: baseProps.backgroundColor || themeContext.backgroundColor } : {}),
        fontSize: baseProps.fontSize || themeContext.fontSize || sizeStyles.fontSize,
        ...(baseProps.fontColor || themeContext.fontColor ? { color: baseProps.fontColor || themeContext.fontColor } : {}),
        padding: sizeStyles.padding,
        height: sizeStyles.height,
    };
};

export const getResolvedSize = (baseProps: BaseComponentProps): string => {
    const themeContext = useTheme();
    return baseProps.size || themeContext.size || 'md';
};

export const formatValue = (value: any, type: 'string' | 'number' | 'boolean' | 'date' = 'string') => {
    if (value === null || value === undefined) return '';

    switch (type) {
        case 'number':
            return typeof value === 'number' ? value : parseFloat(value) || 0;
        case 'boolean':
            return Boolean(value);
        case 'date':
            return value instanceof Date ? value : new Date(value);
        default:
            return String(value);
    }
};

export const filterItems = <T extends { label?: any }>(items: T[], query: string): T[] => {
    if (!query.trim()) return items;

    const lowercaseQuery = query.toLowerCase();
    return items.filter((item) => item.label && String(item.label).toLowerCase().includes(lowercaseQuery));
};

export const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};
