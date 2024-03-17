import cn from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
import type { JsonEditorSize, JsonValue } from './json-editor-types';
import { copyToClipboard } from './json-editor-utils';
import './JsonEditor.scss';

interface ToolbarProps {
    value: JsonValue;
    allowSearch: boolean;
    allowCopy: boolean;
    size: JsonEditorSize;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    searchText: string;
    onSearchChange: (text: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    value,
    allowSearch,
    allowCopy,
    size,
    onExpandAll,
    onCollapseAll,
    searchText,
    onSearchChange,
}) => {
    const [showSearch, setShowSearch] = useState(false);
    const [copied, setCopied] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const toggleSearch = useCallback(() => {
        setShowSearch(prev => {
            if (!prev) {
                setTimeout(() => searchRef.current?.focus(), 0);
            } else {
                onSearchChange('');
            }
            return !prev;
        });
    }, [onSearchChange]);

    const handleCopy = useCallback(() => {
        copyToClipboard(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [value]);

    return (
        <div className={cn('eui-je-toolbar', `eui-je-size-${size}`)}>
            {allowSearch && showSearch && (
                <input
                    ref={searchRef}
                    type="text"
                    className="eui-je-search-input"
                    placeholder="Search keys & values..."
                    value={searchText}
                    onChange={e => onSearchChange(e.target.value)}
                    aria-label="Search JSON"
                />
            )}
            <div className="eui-je-toolbar-actions">
                {allowSearch && (
                    <button
                        className={cn('eui-je-toolbar-btn', { active: showSearch })}
                        onClick={toggleSearch}
                        title="Search"
                        aria-label="Toggle search"
                        type="button"
                    >
                        &#128269;
                    </button>
                )}
                <button
                    className="eui-je-toolbar-btn"
                    onClick={onExpandAll}
                    title="Expand all"
                    aria-label="Expand all nodes"
                    type="button"
                >
                    &#9660;
                </button>
                <button
                    className="eui-je-toolbar-btn"
                    onClick={onCollapseAll}
                    title="Collapse all"
                    aria-label="Collapse all nodes"
                    type="button"
                >
                    &#9654;
                </button>
                {allowCopy && (
                    <button
                        className={cn('eui-je-toolbar-btn', { copied })}
                        onClick={handleCopy}
                        title={copied ? 'Copied!' : 'Copy all'}
                        aria-label="Copy entire JSON"
                        type="button"
                    >
                        {copied ? '\u2713' : '\u{1F4CB}'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toolbar;
