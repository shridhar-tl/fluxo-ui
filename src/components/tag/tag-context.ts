import { createContext } from 'react';

import type { TagShape, TagSize, TagVariant } from './tag-types';

export interface TagGroupDefaults {
    size?: TagSize;
    variant?: TagVariant;
    shape?: TagShape;
    color?: string;
}

export const TagGroupContext = createContext<TagGroupDefaults | null>(null);
