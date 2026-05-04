import classNames from 'classnames';
import { themes } from '../themes';
import { BaseComponentProps } from '../types';

export const generateId = () => {
    return `ui-${Math.random().toString(36).substring(2, 9)}`;
};

const BASE_STYLE_PROP_KEYS = [
    'size',
    'theme',
    'borderRadius',
    'borderColor',
    'borderWidth',
    'backgroundColor',
    'fontSize',
    'fontColor',
] as const;

export const splitBaseAndNativeProps = <T extends Record<string, any>>(rest: T) => {
    const styleProps: Record<string, any> = {};
    const nativeProps: Record<string, any> = {};
    for (const key of Object.keys(rest)) {
        if ((BASE_STYLE_PROP_KEYS as readonly string[]).includes(key)) {
            styleProps[key] = rest[key];
        } else {
            nativeProps[key] = rest[key];
        }
    }
    return { styleProps, nativeProps };
};

const POINTER_EVENT_KEYS = new Set([
    'onClick',
    'onClickCapture',
    'onDoubleClick',
    'onDoubleClickCapture',
    'onMouseDown',
    'onMouseDownCapture',
    'onMouseUp',
    'onMouseUpCapture',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseMoveCapture',
    'onMouseOver',
    'onMouseOverCapture',
    'onMouseOut',
    'onMouseOutCapture',
    'onPointerDown',
    'onPointerDownCapture',
    'onPointerUp',
    'onPointerUpCapture',
    'onPointerMove',
    'onPointerMoveCapture',
    'onPointerEnter',
    'onPointerLeave',
    'onPointerOver',
    'onPointerOverCapture',
    'onPointerOut',
    'onPointerOutCapture',
    'onPointerCancel',
    'onPointerCancelCapture',
    'onGotPointerCapture',
    'onGotPointerCaptureCapture',
    'onLostPointerCapture',
    'onLostPointerCaptureCapture',
    'onContextMenu',
    'onContextMenuCapture',
    'onTouchStart',
    'onTouchStartCapture',
    'onTouchEnd',
    'onTouchEndCapture',
    'onTouchMove',
    'onTouchMoveCapture',
    'onTouchCancel',
    'onTouchCancelCapture',
    'onWheel',
    'onWheelCapture',
    'onDrag',
    'onDragCapture',
    'onDragStart',
    'onDragStartCapture',
    'onDragEnd',
    'onDragEndCapture',
    'onDragEnter',
    'onDragEnterCapture',
    'onDragLeave',
    'onDragLeaveCapture',
    'onDragOver',
    'onDragOverCapture',
    'onDragExit',
    'onDragExitCapture',
    'onDrop',
    'onDropCapture',
]);

export const splitVisibleAndHiddenProps = <T extends Record<string, any>>(nativeProps: T) => {
    const visibleProps: Record<string, any> = {};
    const hiddenInputProps: Record<string, any> = {};
    for (const key of Object.keys(nativeProps)) {
        if (POINTER_EVENT_KEYS.has(key) || key === 'style' || key === 'title') {
            visibleProps[key] = nativeProps[key];
        } else {
            hiddenInputProps[key] = nativeProps[key];
        }
    }
    return { visibleProps, hiddenInputProps };
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
