import { createContext } from 'react';

import type { ChipColor, ChipShape, ChipSize, ChipValue, ChipVariant } from './chip-types';

export interface ChipGroupContextValue {
    multiple: boolean;
    isSelected: (value: ChipValue) => boolean;
    isBlocked: (value: ChipValue) => boolean;
    toggle: (value: ChipValue) => void;
    size?: ChipSize;
    variant?: ChipVariant;
    shape?: ChipShape;
    color?: ChipColor;
    disabled?: boolean;
    showCheckmark?: boolean;
}

export const ChipGroupContext = createContext<ChipGroupContextValue | null>(null);
