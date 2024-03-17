import { JSX } from 'react';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Theme = 'default' | 'primary' | 'secondary' | 'success' | 'dark';
export type ButtonVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'secondary';

export type PlacementCorners = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'auto';

export interface ListItem {
    [key: string]: any;
    value?: any;
    label?: any;
    disabled?: boolean;
    icon?: React.ComponentType<any> | JSX.Element;
}

export interface ListItemGroup {
    label: any;
    icon?: React.ComponentType<any> | JSX.Element;
    items: ListItem[];
}

export interface ComponentEvent<T = any> {
    event?: React.SyntheticEvent;
    target?: any;
    value: T;
    name?: string;
    args?: any;
}

export interface BaseComponentProps {
    size?: Size;
    theme?: Theme;
    name?: string;
    id?: string;
    args?: any;
    className?: string;
    disabled?: boolean;
    borderRadius?: string;
    borderColor?: string;
    borderWidth?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontColor?: string;
}

export interface ThemeConfig {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        danger: string;
        warning: string;
        info: string;
        light: string;
        dark: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        focus: string;
        hover: string;
        disabled: string;
        placeholder: string;
    };
    sizes: {
        sm: {
            fontSize: string;
            padding: string;
            height: string;
            borderRadius: string;
        };
        md: {
            fontSize: string;
            padding: string;
            height: string;
            borderRadius: string;
        };
        lg: {
            fontSize: string;
            padding: string;
            height: string;
            borderRadius: string;
        };
        xl: {
            fontSize: string;
            padding: string;
            height: string;
            borderRadius: string;
        };
    };
    borderWidth: string;
    borderRadius: string;
    fontSize: string;
    fontColor: string;
    backgroundColor: string;
    borderColor: string;
    placeholderStyles: {
        fontSize: string;
        color: string;
        fontStyle: string;
    };
}
