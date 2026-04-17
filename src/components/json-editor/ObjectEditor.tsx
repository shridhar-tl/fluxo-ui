import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import type { EditorNodeProps, JsonObject, JsonValue } from './json-editor-types';
import { copyToClipboard, countItems, doesNodeMatch } from './json-editor-utils';
import ItemNameDisplay from './ItemNameDisplay';
import NodeSelector from './NodeSelector';
import AddEntry from './AddEntry';
import './JsonEditor.scss';

const ObjectEditor: React.FC<EditorNodeProps> = ({
    name,
    value,
    displayName,
    depth,
    expandDepth,
    path,
    onChange,
    onNameChange,
    onRemove,
    allowEditValue,
    allowEditKey,
    allowRemove,
    allowInsert,
    allowTypeChange,
    allowCopy,
    showDataTypes,
    showItemCount,
    sortKeys: shouldSort,
    size,
    searchText,
}) => {
    const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
    const objValue = (value ?? {}) as JsonObject;
    const itemCount = countItems(value);

    const isSearching = searchText.length > 0;
    const autoExpand = isSearching || depth < expandDepth;
    const expanded = manualExpanded ?? autoExpand;

    const toggleExpand = useCallback(() => setManualExpanded(prev => !(prev ?? autoExpand)), [autoExpand]);

    const propChanged = useCallback((val: JsonValue, field: string | number) => {
        const updated = { ...objValue, [field]: val };
        if (name !== undefined) {
            onChange(updated, name);
        } else {
            onChange(updated, '');
        }
    }, [objValue, onChange, name]);

    const keyRenamed = useCallback((newName: string, oldName: string) => {
        const trimmed = newName?.trim();
        if (!trimmed || oldName?.trim() === trimmed) return;
        if (Object.prototype.hasOwnProperty.call(objValue, trimmed)) return;

        const updated: JsonObject = {};
        for (const key of Object.keys(objValue)) {
            if (key === oldName) {
                updated[trimmed] = objValue[oldName];
            } else {
                updated[key] = objValue[key];
            }
        }

        if (name !== undefined) {
            onChange(updated, name);
        } else {
            onChange(updated, '');
        }
    }, [objValue, onChange, name]);

    const removeProp = useCallback((field: string | number) => {
        const updated = { ...objValue };
        delete updated[field as string];
        if (name !== undefined) {
            onChange(updated, name);
        } else {
            onChange(updated, '');
        }
    }, [objValue, onChange, name]);

    const addNewProp = useCallback((newKey: string, newVal: JsonValue) => {
        if (!newKey.trim() || Object.prototype.hasOwnProperty.call(objValue, newKey.trim())) return;
        const updated = { ...objValue, [newKey.trim()]: newVal };
        if (name !== undefined) {
            onChange(updated, name);
        } else {
            onChange(updated, '');
        }
    }, [objValue, onChange, name]);

    const handleSelfRemove = useCallback(() => {
        if (name !== undefined) onRemove?.(name);
    }, [onRemove, name]);

    const handleCopy = useCallback(() => {
        copyToClipboard(value);
    }, [value]);

    const handleSelfNameChange = useCallback((newName: string, oldName: string) => {
        onNameChange?.(newName, oldName);
    }, [onNameChange]);

    const allKeys = useMemo(() => {
        const k = Object.keys(objValue);
        return shouldSort ? k.sort() : k;
    }, [objValue, shouldSort]);

    const filteredKeys = useMemo(() => {
        if (!isSearching) return allKeys;
        return allKeys.filter(k => doesNodeMatch(k, objValue[k], searchText));
    }, [allKeys, isSearching, searchText, objValue]);

    const isRoot = name === undefined;

    return (
        <div className={cn('eui-je-node eui-je-node-object', { 'eui-je-root': isRoot })}>
            <span className="eui-je-node-row">
                <ItemNameDisplay
                    name={name}
                    display={displayName}
                    expanded={expanded}
                    allowEdit={allowEditKey && !isRoot}
                    onChange={handleSelfNameChange}
                    onToggle={toggleExpand}
                    onRemove={allowRemove && !isRoot ? handleSelfRemove : undefined}
                    size={size}
                />
                <span
                    className="eui-je-item-value eui-je-type-object"
                    onClick={toggleExpand}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && toggleExpand()}
                >
                    {showDataTypes && <span className="eui-je-type-label">Object</span>}
                    <span className="eui-je-bracket">{'{'}
                        {!expanded && <span className="eui-je-ellipsis">&hellip;</span>}
                        {showItemCount && <span className="eui-je-count">{itemCount}</span>}
                    </span>
                    {!expanded && <span className="eui-je-bracket">{'}'}</span>}
                </span>
                {allowCopy && (
                    <span className="eui-je-icon eui-je-copy-icon" onClick={e => { e.stopPropagation(); handleCopy(); }} role="button" tabIndex={0} title="Copy value" aria-label="Copy value" onKeyDown={e => e.key === 'Enter' && handleCopy()} />
                )}
            </span>
            {expanded && (
                <div className="eui-je-children">
                    {filteredKeys.map(k => (
                        <NodeSelector
                            key={k}
                            name={k}
                            value={objValue[k]}
                            depth={depth + 1}
                            expandDepth={expandDepth}
                            path={`${path}.${k}`}
                            onChange={propChanged}
                            onNameChange={keyRenamed}
                            onRemove={removeProp}
                            allowEditValue={allowEditValue}
                            allowEditKey={allowEditKey}
                            allowRemove={allowRemove}
                            allowInsert={allowInsert}
                            allowTypeChange={allowTypeChange}
                            allowCopy={allowCopy}
                            showDataTypes={showDataTypes}
                            showItemCount={showItemCount}
                            sortKeys={shouldSort}
                            size={size}
                            searchText={searchText}
                        />
                    ))}
                    {allowInsert && !isSearching && (
                        <AddEntry
                            type="object"
                            onAdd={addNewProp}
                            existingKeys={allKeys}
                            size={size}
                        />
                    )}
                    <span className="eui-je-closing-bracket">{'}'}</span>
                </div>
            )}
        </div>
    );
};

export default ObjectEditor;
