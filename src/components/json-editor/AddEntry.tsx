import cn from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import type { JsonEditorSize, JsonValue } from './json-editor-types';
import { parseInputValue } from './json-editor-utils';
import './JsonEditor.scss';

interface AddEntryProps {
    type: 'object' | 'array';
    onAdd: (key: string, value: JsonValue) => void;
    existingKeys?: string[];
    size: JsonEditorSize;
}

const AddEntry: React.FC<AddEntryProps> = ({ type, onAdd, existingKeys, size }) => {
    const [active, setActive] = useState(false);
    const [keyText, setKeyText] = useState('');
    const [valueText, setValueText] = useState('');
    const keyRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        setActive(false);
        setKeyText('');
        setValueText('');
    }, []);

    const handleActivate = useCallback(() => {
        setActive(true);
        setTimeout(() => {
            if (type === 'object') {
                keyRef.current?.focus();
            } else {
                valueRef.current?.focus();
            }
        }, 0);
    }, [type]);

    const handleSubmit = useCallback(() => {
        if (type === 'object') {
            const key = keyText.trim();
            if (!key) return;
            if (existingKeys?.includes(key)) return;
            const val = valueText ? parseInputValue(valueText) : null;
            onAdd(key, val);
        } else {
            const val = valueText ? parseInputValue(valueText) : null;
            onAdd('', val);
        }
        reset();
    }, [type, keyText, valueText, existingKeys, onAdd, reset]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            reset();
        }
    }, [handleSubmit, reset]);

    const handleKeyInputKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            valueRef.current?.focus();
        } else if (e.key === 'Escape') {
            reset();
        }
    }, [reset]);

    if (!active) {
        return (
            <div className="eui-je-add-entry">
                <span
                    className={cn('eui-je-add-prompt', `eui-je-size-${size}`)}
                    onClick={handleActivate}
                    role="button"
                    tabIndex={0}
                    title={type === 'object' ? 'Click to add new property' : 'Click to add new item'}
                    aria-label={type === 'object' ? 'Add new property' : 'Add new item'}
                    onKeyDown={e => e.key === 'Enter' && handleActivate()}
                >
                    <span className="eui-je-icon eui-je-add-icon" />
                    {type === 'object' ? 'add property' : 'add item'}
                </span>
            </div>
        );
    }

    return (
        <div className={cn('eui-je-add-entry eui-je-add-active', `eui-je-size-${size}`)}>
            {type === 'object' && (
                <>
                    <input
                        ref={keyRef}
                        type="text"
                        className="eui-je-add-key-input"
                        placeholder="key"
                        value={keyText}
                        onChange={e => setKeyText(e.target.value)}
                        onKeyDown={handleKeyInputKeyDown}
                        aria-label="New property key"
                    />
                    <span className="eui-je-colon">:</span>
                </>
            )}
            <input
                ref={valueRef}
                type="text"
                className="eui-je-add-value-input"
                placeholder="value"
                value={valueText}
                onChange={e => setValueText(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="New property value"
            />
            <span className="eui-je-add-actions">
                <span
                    className="eui-je-add-confirm"
                    onClick={handleSubmit}
                    role="button"
                    tabIndex={0}
                    title="Confirm"
                    aria-label="Confirm add"
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                >
                    &#10003;
                </span>
                <span
                    className="eui-je-add-cancel"
                    onClick={reset}
                    role="button"
                    tabIndex={0}
                    title="Cancel"
                    aria-label="Cancel add"
                    onKeyDown={e => e.key === 'Enter' && reset()}
                >
                    &#10005;
                </span>
            </span>
        </div>
    );
};

export default AddEntry;
