import React from 'react';
import type { EditorNodeProps, JsonValue } from './json-editor-types';
import ArrayEditor from './ArrayEditor';
import ObjectEditor from './ObjectEditor';
import SimpleEditor from './SimpleEditor';

function getEditorComponent(value: JsonValue): React.FC<EditorNodeProps> {
    if (value === null || value === undefined) return SimpleEditor;
    if (Array.isArray(value)) return ArrayEditor;
    if (typeof value === 'object') return ObjectEditor;
    return SimpleEditor;
}

const NodeSelector: React.FC<EditorNodeProps> = (props) => {
    const Component = getEditorComponent(props.value);
    return <Component {...props} />;
};

export default NodeSelector;
export { getEditorComponent };
