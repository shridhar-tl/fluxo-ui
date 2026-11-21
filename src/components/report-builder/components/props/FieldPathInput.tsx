import React, { useMemo } from 'react';
import { Autocomplete } from '../../../Autocomplete';
import type { ListItem } from '../../../../types';

interface FieldPathInputProps {
    value: string;
    onChange: (value: string) => void;
    fieldPaths: string[];
    placeholder?: string;
    ariaLabel: string;
    id?: string;
}

export const FieldPathInput: React.FC<FieldPathInputProps> = ({ value, onChange, fieldPaths, placeholder, ariaLabel, id }) => {
    const items = useMemo<ListItem[]>(() => fieldPaths.map((p) => ({ label: p, value: p })), [fieldPaths]);
    return (
        <Autocomplete
            id={id}
            items={items}
            value={value}
            onChange={(e) => onChange(e.value)}
            onSelect={(e) => onChange(String(e.value))}
            placeholder={placeholder ?? 'Field'}
            openOnFocus
            minLength={0}
            maxSuggestions={50}
            size="sm"
            ariaLabel={ariaLabel}
        />
    );
};
