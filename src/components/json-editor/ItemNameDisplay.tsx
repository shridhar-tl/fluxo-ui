import cn from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import type { ItemNameDisplayProps } from './json-editor-types';
import './JsonEditor.scss';

const ItemNameDisplay: React.FC<ItemNameDisplayProps> = ({
    name,
    display,
    expanded,
    allowEdit,
    onChange,
    onToggle,
    onRemove,
    size,
}) => {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const beginEdit = useCallback(() => {
        if (!allowEdit || name === undefined) return;
        setEditing(true);
        setEditText(String(name));
        setTimeout(() => inputRef.current?.select(), 0);
    }, [allowEdit, name]);

    const endEdit = useCallback(() => {
        if (onChange && name !== undefined) {
            onChange(editText, String(name));
        }
        setEditing(false);
    }, [onChange, editText, name]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            endEdit();
        } else if (e.key === 'Escape') {
            setEditing(false);
        }
    }, [endEdit]);

    if (editing) {
        return (
            <span className="eui-je-name-input">
                <input
                    ref={inputRef}
                    type="text"
                    className={cn('eui-je-name-editor', `eui-je-size-${size}`)}
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={endEdit}
                    onKeyDown={handleKeyDown}
                    aria-label="Edit property name"
                />
                <span className="eui-je-colon">:</span>
            </span>
        );
    }

    const displayContent = display ?? name;

    if (displayContent === undefined || displayContent === null) {
        return onToggle ? (
            <span
                className={cn('eui-je-expander', { open: expanded })}
                onClick={onToggle}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse' : 'Expand'}
                onKeyDown={e => e.key === 'Enter' && onToggle()}
            />
        ) : null;
    }

    return (
        <span className="eui-je-item-name">
            {onToggle && (
                <span
                    className={cn('eui-je-expander', { open: expanded })}
                    onClick={onToggle}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Collapse' : 'Expand'}
                    onKeyDown={e => e.key === 'Enter' && onToggle()}
                />
            )}
            {onRemove && (
                <span
                    className="eui-je-icon eui-je-remove-icon"
                    onClick={e => { e.stopPropagation(); onRemove(); }}
                    role="button"
                    tabIndex={0}
                    title="Remove"
                    aria-label="Remove"
                    onKeyDown={e => e.key === 'Enter' && onRemove()}
                />
            )}
            <span
                className="eui-je-name-text"
                onDoubleClick={beginEdit}
                role={allowEdit ? 'button' : undefined}
                tabIndex={allowEdit ? 0 : undefined}
                title={allowEdit ? 'Double-click to edit' : undefined}
            >
                {displayContent}
            </span>
            <span className="eui-je-colon">:</span>
        </span>
    );
};

export default ItemNameDisplay;
