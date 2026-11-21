import React from 'react';
import { PlusIcon, TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { FieldPathInput } from './FieldPathInput';

interface FieldPathListProps {
    values: string[];
    onChange: (values: string[]) => void;
    fieldPaths: string[];
    addLabel: string;
    itemLabel: string;
    emptyText?: string;
}

export const FieldPathList: React.FC<FieldPathListProps> = ({ values, onChange, fieldPaths, addLabel, itemLabel, emptyText }) => (
    <div className="eui-rb-list-editor">
        {values.length === 0 && emptyText && <div className="eui-rb-list-editor-empty">{emptyText}</div>}
        {values.map((value, i) => (
            <div key={i} className="eui-rb-list-editor-row">
                <div className="eui-rb-list-editor-grow">
                    <FieldPathInput
                        value={value}
                        onChange={(v) => onChange(values.map((x, idx) => (idx === i ? v : x)))}
                        fieldPaths={fieldPaths}
                        ariaLabel={`${itemLabel} ${i + 1}`}
                    />
                </div>
                <Button
                    layout="plain"
                    size="xs"
                    onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                    ariaLabel={`Remove ${itemLabel} ${i + 1}`}
                    leftIcon={<TrashIcon aria-hidden="true" />}
                />
            </div>
        ))}
        <Button layout="plain" size="xs" onClick={() => onChange([...values, ''])} leftIcon={<PlusIcon aria-hidden="true" />} label={addLabel} />
    </div>
);
