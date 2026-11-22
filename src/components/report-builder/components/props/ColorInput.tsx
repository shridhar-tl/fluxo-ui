import React from 'react';
import { TextInput } from '../../../TextInput';

interface ColorInputProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    'aria-label'?: string;
    placeholder?: string;
}

export const ColorInput: React.FC<ColorInputProps> = ({ value, onChange, 'aria-label': ariaLabel, placeholder = 'inherit' }) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
            type="color"
            value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 32, height: 28, border: '1px solid var(--eui-border-subtle)', borderRadius: 3, cursor: 'pointer', padding: 1, background: 'var(--eui-bg)' }}
            aria-label={ariaLabel ?? 'Color picker'}
        />
        <TextInput
            value={value ?? ''}
            onChange={(e) => onChange(e.value || undefined)}
            placeholder={placeholder}
            size="sm"
            style={{ flex: 1 }}
            aria-label={`${ariaLabel ?? 'Color'} hex`}
        />
    </div>
);
