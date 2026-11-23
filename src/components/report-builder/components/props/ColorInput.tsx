import React from 'react';
import { TimesIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { ColorPicker } from '../../../color-picker';
import { isHexColor } from './color-value';

interface ColorInputProps {
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    'aria-label'?: string;
    placeholder?: string;
}

export const ColorInput: React.FC<ColorInputProps> = ({ value, onChange, 'aria-label': ariaLabel, placeholder = 'inherit' }) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <ColorPicker
            variant="input"
            editable
            size="sm"
            showAlpha={false}
            value={isHexColor(value) ? value : '#000000'}
            onChange={(color) => onChange(color)}
            placeholder={placeholder}
            ariaLabel={ariaLabel ?? 'Color'}
        />
        {value && (
            <Button layout="plain" size="xs" onClick={() => onChange(undefined)} ariaLabel={`Clear ${ariaLabel ?? 'color'}`} leftIcon={<TimesIcon aria-hidden="true" />} />
        )}
    </div>
);
