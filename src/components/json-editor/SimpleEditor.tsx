import React, { useCallback, useMemo } from 'react';
import type { EditorNodeProps, JsonValue } from './json-editor-types';
import { copyToClipboard, getValueType, isUrl } from './json-editor-utils';
import ItemNameDisplay from './ItemNameDisplay';
import ItemValueDisplay from './ItemValueDisplay';
import '../eui-base.scss';
import './JsonEditor.scss';

const SimpleEditor: React.FC<EditorNodeProps> = ({
    name,
    value,
    displayName,
    depth,
    onChange,
    onNameChange,
    onRemove,
    allowEditValue,
    allowEditKey,
    allowRemove,
    allowTypeChange,
    allowCopy,
    showDataTypes,
    size,
}) => {
    const valueChanged = useCallback((newVal: JsonValue) => {
        if (name !== undefined) {
            onChange(newVal, name);
        }
    }, [onChange, name]);

    const nameChanged = useCallback((newName: string, oldName: string) => {
        onNameChange?.(newName, oldName);
    }, [onNameChange]);

    const handleRemove = useCallback(() => {
        if (name !== undefined) onRemove?.(name);
    }, [onRemove, name]);

    const handleCopy = useCallback(() => {
        copyToClipboard(value);
    }, [value]);

    const type = getValueType(value);

    const displayInfo = useMemo(() => {
        let displayVal: React.ReactNode;
        let strVal: string;

        if (value === null) {
            strVal = 'null';
            displayVal = <span className="eui-je-null-text">null</span>;
        } else if (value === undefined) {
            strVal = 'undefined';
            displayVal = <span className="eui-je-undef-text">undefined</span>;
        } else if (typeof value === 'boolean') {
            strVal = String(value);
            displayVal = <span className="eui-je-bool-text">{strVal}</span>;
        } else if (typeof value === 'number') {
            strVal = String(value);
            displayVal = <span className="eui-je-number-text">{strVal}</span>;
        } else if (typeof value === 'string') {
            strVal = value;
            if (isUrl(value)) {
                displayVal = (
                    <>
                        &quot;<span className="eui-je-url-text">{value}</span>&quot;
                        <a
                            href={value.trim()}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="eui-je-url-launch"
                            title="Open URL"
                            aria-label={`Open ${value}`}
                        >
                            &#10138;
                        </a>
                    </>
                );
            } else {
                displayVal = <>&quot;<span className="eui-je-string-text">{value}</span>&quot;</>;
            }
        } else {
            strVal = String(value);
            displayVal = strVal;
        }

        return { displayVal, strVal: strVal! };
    }, [value]);

    const isRootLeaf = name === undefined;

    return (
        <div
            className={`eui-je-node eui-je-node-${type}`}
            role={isRootLeaf ? undefined : 'treeitem'}
            aria-level={isRootLeaf ? undefined : depth + 1}
        >
            <span className="eui-je-node-row">
                <ItemNameDisplay
                    name={name}
                    display={displayName}
                    allowEdit={allowEditKey}
                    onChange={nameChanged}
                    onRemove={allowRemove && name !== undefined ? handleRemove : undefined}
                    size={size}
                />
                <ItemValueDisplay
                    allowEdit={allowEditValue}
                    allowTypeChange={allowTypeChange && showDataTypes}
                    type={type}
                    displayValue={displayInfo.displayVal}
                    value={displayInfo.strVal}
                    onChange={valueChanged}
                    size={size}
                />
                {allowCopy && (
                    <span className="eui-je-icon eui-je-copy-icon" onClick={e => { e.stopPropagation(); handleCopy(); }} role="button" tabIndex={0} title="Copy value" aria-label="Copy value" onKeyDown={e => e.key === 'Enter' && handleCopy()} />
                )}
            </span>
        </div>
    );
};

export default SimpleEditor;
