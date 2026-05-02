import classNames from 'classnames';
import { themes } from '../themes';
import { BaseComponentProps } from '../types';

export const generateId = () => {
    return `ui-${Math.random().toString(36).substring(2, 9)}`;
};

export const getComponentClasses = (baseProps: BaseComponentProps, additionalClasses?: string) => {
    const { size, theme, className, disabled } = baseProps;
    const finalSize = size || 'md';
    const finalTheme = theme || 'default';

    return classNames(
        `eui-size-${finalSize}`,
        `eui-theme-${finalTheme}`,
        { 'eui-component-disabled': disabled },
        additionalClasses,
        className,
    );
};

export const getComponentStyles = (baseProps: BaseComponentProps): React.CSSProperties => {
    const finalSize = baseProps.size || 'md';
    const finalTheme = baseProps.theme || 'default';
    const themeConfig = themes[finalTheme] ?? themes.default;
    const sizeStyles = (themeConfig.sizes as Record<string, { fontSize: string; padding: string; height: string; borderRadius: string }>)[finalSize];

    return {
        borderRadius: baseProps.borderRadius || sizeStyles.borderRadius,
        ...(baseProps.borderColor ? { borderColor: baseProps.borderColor } : {}),
        borderWidth: baseProps.borderWidth || themeConfig.borderWidth,
        ...(baseProps.backgroundColor ? { backgroundColor: baseProps.backgroundColor } : {}),
        fontSize: baseProps.fontSize || sizeStyles.fontSize,
        ...(baseProps.fontColor ? { color: baseProps.fontColor } : {}),
        padding: sizeStyles.padding,
        height: sizeStyles.height,
    };
};

export const getResolvedSize = (baseProps: BaseComponentProps): string => {
    return baseProps.size || 'md';
};

export const formatValue = (value: unknown, type: 'string' | 'number' | 'boolean' | 'date' = 'string') => {
    if (value === null || value === undefined) return '';

    switch (type) {
        case 'number':
            return typeof value === 'number' ? value : parseFloat(value as string) || 0;
        case 'boolean':
            return Boolean(value);
        case 'date':
            return value instanceof Date ? value : new Date(value as string | number);
        default:
            return String(value);
    }
};

export const filterItems = <T extends { label?: unknown }>(items: T[], query: string): T[] => {
    if (!query.trim()) return items;

    const lowercaseQuery = query.toLowerCase();
    return items.filter((item) => item.label && String(item.label).toLowerCase().includes(lowercaseQuery));
};

export const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};
