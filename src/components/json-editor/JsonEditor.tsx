import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import type { JsonEditorProps, JsonValue } from './json-editor-types';
import NodeSelector from './NodeSelector';
import Toolbar from './Toolbar';
import './JsonEditor.scss';

const JsonEditor: React.FC<JsonEditorProps> = ({
    value,
    onChange,
    allowEditValue = true,
    allowEditKey = true,
    allowRemove = true,
    allowInsert = true,
    allowTypeChange = false,
    allowCopy = true,
    allowSearch = true,
    readOnly = false,
    expandDepth = 1,
    size = 'md',
    maxHeight,
    showDataTypes = false,
    showItemCount = true,
    showToolbar = true,
    sortKeys = false,
    className,
    id,
    ariaLabel,
}) => {
    const [expandKey, setExpandKey] = useState(0);
    const [currentExpandDepth, setCurrentExpandDepth] = useState(expandDepth);
    const [searchText, setSearchText] = useState('');

    const editable = !!onChange && !readOnly;

    const handleChange = useCallback((newValue: JsonValue) => {
        onChange?.(newValue);
    }, [onChange]);

    const handleExpandAll = useCallback(() => {
        setCurrentExpandDepth(100);
        setExpandKey(prev => prev + 1);
    }, []);

    const handleCollapseAll = useCallback(() => {
        setCurrentExpandDepth(0);
        setExpandKey(prev => prev + 1);
    }, []);

    const containerStyle = useMemo(() => {
        if (!maxHeight) return undefined;
        return {
            maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        };
    }, [maxHeight]);

    return (
        <div
            className={cn('eui-json-editor', `eui-je-size-${size}`, className)}
            id={id}
            role="tree"
            aria-label={ariaLabel ?? 'JSON Editor'}
        >
            {showToolbar && (
                <Toolbar
                    value={value}
                    allowSearch={allowSearch}
                    allowCopy={allowCopy && editable}
                    size={size}
                    onExpandAll={handleExpandAll}
                    onCollapseAll={handleCollapseAll}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                />
            )}
            <div className="eui-je-content" style={containerStyle}>
                <NodeSelector
                    key={expandKey}
                    value={value}
                    depth={0}
                    expandDepth={currentExpandDepth}
                    path="$"
                    onChange={(_val, _name) => handleChange(_val)}
                    allowEditValue={editable && allowEditValue}
                    allowEditKey={editable && allowEditKey}
                    allowRemove={editable && allowRemove}
                    allowInsert={editable && allowInsert}
                    allowTypeChange={editable && allowTypeChange}
                    allowCopy={allowCopy}
                    showDataTypes={showDataTypes}
                    showItemCount={showItemCount}
                    sortKeys={sortKeys}
                    size={size}
                    searchText={searchText}
                />
            </div>
        </div>
    );
};

export { JsonEditor };
export type { JsonEditorProps, JsonValue, JsonEditorSize, JsonEditorTheme } from './json-editor-types';
