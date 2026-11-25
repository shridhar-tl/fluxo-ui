import type React from 'react';

import type { ToneColor } from '../../utils/color-tone';
import type { IconProp } from '../../utils/render-icon';

export type ChipVariant = 'filled' | 'soft' | 'outlined' | 'elevated';
export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipShape = 'pill' | 'rounded';
export type ChipColor = ToneColor | (string & {});
export type ChipValue = string | number;

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'onClick' | 'children'> {
    children?: React.ReactNode;
    label?: React.ReactNode;
    value?: ChipValue;
    color?: ChipColor;
    textColor?: string;
    variant?: ChipVariant;
    size?: ChipSize;
    shape?: ChipShape;
    icon?: IconProp;
    trailingIcon?: IconProp;
    avatar?: React.ReactNode;
    selectable?: boolean;
    selected?: boolean;
    defaultSelected?: boolean;
    onSelectedChange?: (selected: boolean, event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
    showCheckmark?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    href?: string;
    target?: React.HTMLAttributeAnchorTarget;
    removable?: boolean;
    onRemove?: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLElement>) => void;
    removeIcon?: React.ReactNode;
    removeLabel?: string;
    disabled?: boolean;
    maxWidth?: number | string;
}

export interface ChipOption {
    value: ChipValue;
    label: React.ReactNode;
    icon?: IconProp;
    avatar?: React.ReactNode;
    disabled?: boolean;
    color?: ChipColor;
}

interface ChipGroupBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'color'> {
    children?: React.ReactNode;
    options?: ChipOption[];
    size?: ChipSize;
    variant?: ChipVariant;
    shape?: ChipShape;
    color?: ChipColor;
    disabled?: boolean;
    showCheckmark?: boolean;
    wrap?: boolean;
    gap?: 'xs' | 'sm' | 'md' | 'lg' | number;
    ariaLabel?: string;
}

export interface ChipGroupSingleProps extends ChipGroupBaseProps {
    multiple?: false;
    value?: ChipValue | null;
    defaultValue?: ChipValue | null;
    onChange?: (value: ChipValue | null) => void;
    required?: boolean;
    maxSelected?: never;
}

export interface ChipGroupMultipleProps extends ChipGroupBaseProps {
    multiple: true;
    value?: ChipValue[];
    defaultValue?: ChipValue[];
    onChange?: (value: ChipValue[]) => void;
    required?: boolean;
    maxSelected?: number;
}

export type ChipGroupProps = ChipGroupSingleProps | ChipGroupMultipleProps;
