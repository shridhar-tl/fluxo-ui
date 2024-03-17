import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ItemValueDisplayProps, JsonValueType } from './json-editor-types';
import { convertValueToType, parseInputValue } from './json-editor-utils';
import './JsonEditor.scss';

const typeOptions: JsonValueType[] = ['string', 'number', 'boolean', 'null', 'object', 'array'];

const ItemValueDisplay: React.FC<ItemValueDisplayProps> = ({
    value,
    displayValue,
    type,
    allowEdit,
    allowTypeChange,
    onChange,
    size,
}) => {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typeChangeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!showTypeMenu) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (typeChangeRef.current && !typeChangeRef.current.contains(e.target as Node)) {
                setShowTypeMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTypeMenu]);

    const beginEdit = useCallback(() => {
        if (!allowEdit) return;
        setEditing(true);
        setEditText(value);
        setTimeout(() => {
            textareaRef.current?.select();
            autoResize();
        }, 0);
    }, [allowEdit, value]);

    const autoResize = useCallback(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
        }
    }, []);

    const endEdit = useCallback(() => {
        const parsed = parseInputValue(editText, type);
        onChange(parsed);
        setEditing(false);
    }, [editText, type, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.altKey || e.ctrlKey)) {
            e.preventDefault();
            endEdit();
        } else if (e.key === 'Escape') {
            setEditing(false);
        }
    }, [endEdit]);

    const handleTypeChange = useCallback((newType: JsonValueType) => {
        setShowTypeMenu(false);
        if (newType === type) return;
        const converted = convertValueToType(parseInputValue(value, type), newType);
        onChange(converted);
    }, [onChange, value, type]);

    if (editing) {
        return (
            <span className="eui-je-value-input">
                <textarea
                    ref={textareaRef}
                    className={cn('eui-je-value-editor', `eui-je-size-${size}`)}
                    value={editText}
                    onChange={e => {
                        setEditText(e.target.value);
                        autoResize();
                    }}
                    onBlur={endEdit}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    rows={1}
                    aria-label="Edit value"
                />
            </span>
        );
    }

    return (
        <span className="eui-je-value-wrapper">
            <span
                className={cn('eui-je-item-value', `eui-je-type-${type}`)}
                onDoubleClick={beginEdit}
                role={allowEdit ? 'button' : undefined}
                tabIndex={allowEdit ? 0 : undefined}
                title={allowEdit ? 'Double-click to edit' : undefined}
            >
                {displayValue ?? value}
            </span>
            {allowTypeChange && (
                <span className="eui-je-type-change" ref={typeChangeRef}>
                    <span
                        className="eui-je-type-badge"
                        onClick={() => setShowTypeMenu(!showTypeMenu)}
                        role="button"
                        tabIndex={0}
                        title="Change type"
                        aria-label={`Type: ${type}. Click to change`}
                        onKeyDown={e => e.key === 'Enter' && setShowTypeMenu(!showTypeMenu)}
                    >
                        {type}
                    </span>
                    {showTypeMenu && (
                        <div className="eui-je-type-menu" role="listbox" aria-label="Select type">
                            {typeOptions.map(t => (
                                <div
                                    key={t}
                                    className={cn('eui-je-type-option', { active: t === type })}
                                    onClick={() => handleTypeChange(t)}
                                    role="option"
                                    aria-selected={t === type}
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && handleTypeChange(t)}
                                >
                                    {t}
                                </div>
                            ))}
                        </div>
                    )}
                </span>
            )}
        </span>
    );
};

export default ItemValueDisplay;
