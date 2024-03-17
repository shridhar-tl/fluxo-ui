import type React from 'react';

export type JsonValue = string | number | boolean | null | undefined | JsonObject | JsonArray;

export interface JsonObject {
    [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'object' | 'array' | 'date';

export type JsonEditorTheme = 'default' | 'monokai' | 'github';

export type JsonEditorSize = 'sm' | 'md' | 'lg';

export interface JsonEditorProps {
    value: JsonValue;
    onChange?: (value: JsonValue) => void;
    allowEditValue?: boolean;
    allowEditKey?: boolean;
    allowRemove?: boolean;
    allowInsert?: boolean;
    allowTypeChange?: boolean;
    allowCopy?: boolean;
    allowSearch?: boolean;
    readOnly?: boolean;
    expandDepth?: number;
    size?: JsonEditorSize;
    maxHeight?: string | number;
    showDataTypes?: boolean;
    showItemCount?: boolean;
    showToolbar?: boolean;
    sortKeys?: boolean;
    className?: string;
    id?: string;
    ariaLabel?: string;
}

export interface EditorNodeProps {
    name?: string | number;
    value: JsonValue;
    displayName?: React.ReactNode;
    depth: number;
    expandDepth: number;
    path: string;
    onChange: (value: JsonValue, name: string | number) => void;
    onNameChange?: (newName: string, oldName: string) => void;
    onRemove?: (name: string | number) => void;
    onInsert?: (index: number) => void;
    allowEditValue: boolean;
    allowEditKey: boolean;
    allowRemove: boolean;
    allowInsert: boolean;
    allowTypeChange: boolean;
    allowCopy: boolean;
    showDataTypes: boolean;
    showItemCount: boolean;
    sortKeys: boolean;
    size: JsonEditorSize;
    searchText: string;
}

export interface ItemNameDisplayProps {
    name?: string | number;
    display?: React.ReactNode;
    expanded?: boolean;
    allowEdit: boolean;
    onChange?: (newName: string, oldName: string) => void;
    onToggle?: () => void;
    onRemove?: () => void;
    onInsert?: () => void;
    onCopy?: () => void;
    allowRemove: boolean;
    allowInsert: boolean;
    allowCopy: boolean;
    size: JsonEditorSize;
}

export interface ItemValueDisplayProps {
    value: string;
    displayValue?: React.ReactNode;
    type: JsonValueType;
    allowEdit: boolean;
    allowTypeChange: boolean;
    onChange: (value: JsonValue) => void;
    size: JsonEditorSize;
}

export interface SearchMatch {
    path: string;
    key?: string;
    value?: string;
}
