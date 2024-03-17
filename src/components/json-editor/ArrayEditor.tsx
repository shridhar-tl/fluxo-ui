import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import type { EditorNodeProps, JsonValue } from './json-editor-types';
import { copyToClipboard, countItems, doesNodeMatch } from './json-editor-utils';
import ItemNameDisplay from './ItemNameDisplay';
import NodeSelector from './NodeSelector';
import AddEntry from './AddEntry';
import './JsonEditor.scss';

const ArrayEditor: React.FC<EditorNodeProps> = ({
    name,
    value,
    displayName,
    depth,
    expandDepth,
    path,
    onChange,
    onNameChange,
    onRemove,
    onInsert,
    allowEditValue,
    allowEditKey,
    allowRemove,
    allowInsert,
    allowTypeChange,
    allowCopy,
    showDataTypes,
    showItemCount,
    sortKeys,
    size,
    searchText,
}) => {
    const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
    const arrValue = (value ?? []) as JsonValue[];
    const itemCount = countItems(value);

    const isSearching = searchText.length > 0;
    const autoExpand = isSearching || depth < expandDepth;
    const expanded = manualExpanded ?? autoExpand;

    const toggleExpand = useCallback(() => setManualExpanded(prev => !(prev ?? autoExpand)), [autoExpand]);

    const itemChanged = useCallback((val: JsonValue, index: string | number) => {
        const updated = [...arrValue];
        updated[index as number] = val;
        if (name !== undefined) {
            onChange(updated, name);
        } else {
            onChange(updated, '');
        }
    }, [arrValue, onChange, name]);

    const removeItem = useCallback((index: string | number) => {
        const updated = [...arrValue];
        updated.splice(index as number, 1);
        if (name !== undefined) {
            onChange(updated, name);
        } else {
            onChange(updated, '');
        }
    }, [arrValue, onChange, name]);

    const insertItem = useCallback((index: number) => {
        const updated = [...arrValue];
        updated.splice(index, 0, null);
        if (name !== undefined) {
            onChange(updated, name);
        } else {
            onChange(updated, '');
        }
    }, [arrValue, onChange, name]);

    const addNewItem = useCallback((_key: string, val: JsonValue) => {
        const updated = [...arrValue, val];
        if (name !== undefined) {
            onChange(updated, name);
        } else {
            onChange(updated, '');
        }
    }, [arrValue, onChange, name]);

    const handleSelfRemove = useCallback(() => {
        if (name !== undefined) onRemove?.(name);
    }, [onRemove, name]);

    const handleInsertBefore = useCallback(() => {
        if (typeof name === 'number') onInsert?.(name);
    }, [onInsert, name]);

    const handleCopy = useCallback(() => {
        copyToClipboard(value);
    }, [value]);

    const handleSelfNameChange = useCallback((newName: string, oldName: string) => {
        onNameChange?.(newName, oldName);
    }, [onNameChange]);

    const filteredItems = useMemo(() => {
        if (!isSearching) return arrValue.map((item, i) => ({ item, index: i }));
        return arrValue
            .map((item, i) => ({ item, index: i }))
            .filter(({ item, index }) => doesNodeMatch(index, item, searchText));
    }, [arrValue, isSearching, searchText]);

    const isRoot = name === undefined;

    return (
        <div className={cn('eui-je-node eui-je-node-array', { 'eui-je-root': isRoot })}>
            <span className="eui-je-node-row">
                <ItemNameDisplay
                    name={name}
                    display={displayName}
                    expanded={expanded}
                    allowEdit={allowEditKey && !isRoot}
                    onChange={handleSelfNameChange}
                    onToggle={toggleExpand}
                    onRemove={allowRemove && !isRoot ? handleSelfRemove : undefined}
                    onInsert={allowInsert && typeof name === 'number' ? handleInsertBefore : undefined}
                    onCopy={allowCopy ? handleCopy : undefined}
                    allowRemove={allowRemove}
                    allowInsert={allowInsert}
                    allowCopy={allowCopy}
                    size={size}
                />
                <span
                    className="eui-je-item-value eui-je-type-array"
                    onClick={toggleExpand}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && toggleExpand()}
                >
                    {showDataTypes && <span className="eui-je-type-label">Array</span>}
                    <span className="eui-je-bracket">[
                        {!expanded && <span className="eui-je-ellipsis">&hellip;</span>}
                        {showItemCount && <span className="eui-je-count">{itemCount}</span>}
                    </span>
                    {!expanded && <span className="eui-je-bracket">]</span>}
                </span>
            </span>
            {expanded && (
                <div className="eui-je-children">
                    {filteredItems.map(({ item, index }) => (
                        <NodeSelector
                            key={`${path}[${index}]`}
                            name={index}
                            value={item}
                            depth={depth + 1}
                            expandDepth={expandDepth}
                            path={`${path}[${index}]`}
                            onChange={itemChanged}
                            onRemove={removeItem}
                            onInsert={insertItem}
                            allowEditValue={allowEditValue}
                            allowEditKey={false}
                            allowRemove={allowRemove}
                            allowInsert={allowInsert}
                            allowTypeChange={allowTypeChange}
                            allowCopy={allowCopy}
                            showDataTypes={showDataTypes}
                            showItemCount={showItemCount}
                            sortKeys={sortKeys}
                            size={size}
                            searchText={searchText}
                        />
                    ))}
                    {allowInsert && !isSearching && (
                        <AddEntry
                            type="array"
                            onAdd={addNewItem}
                            size={size}
                        />
                    )}
                    <span className="eui-je-closing-bracket">]</span>
                </div>
            )}
        </div>
    );
};

export default ArrayEditor;
