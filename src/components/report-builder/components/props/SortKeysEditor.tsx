import React from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Dropdown } from '../../../Dropdown';
import type { ListItem } from '../../../../types';
import { ExpressionEditor } from '../../expression/ExpressionEditor';
import type { ExpressionTypeContext } from '../../expression/expression-types';
import type { SortDirection, SortKey } from '../../report-definition-types';

interface SortKeysEditorProps {
    keys: SortKey[];
    onChange: (keys: SortKey[]) => void;
    typeContext?: ExpressionTypeContext;
    placeholder?: string;
    addLabel?: string;
}

const directionOptions: ListItem[] = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
];

function move<T>(list: T[], from: number, to: number): T[] {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

export const SortKeysEditor: React.FC<SortKeysEditorProps> = ({ keys, onChange, typeContext, placeholder, addLabel = 'Add sort key' }) => {
    const update = (i: number, patch: Partial<SortKey>) => onChange(keys.map((k, idx) => (idx === i ? { ...k, ...patch } : k)));

    return (
        <div className="eui-rb-list-editor">
            {keys.map((key, i) => (
                <div key={i} className="eui-rb-list-editor-card">
                    <div className="eui-rb-list-editor-row">
                        <span className="eui-rb-list-editor-index">{i === 0 ? 'Sort by' : 'Then by'}</span>
                        <div className="eui-rb-list-editor-grow">
                            <Dropdown
                                options={directionOptions}
                                value={key.direction}
                                onChange={(e) => update(i, { direction: e.value as SortDirection })}
                                size="sm"
                                ariaLabel={`Direction of sort key ${i + 1}`}
                            />
                        </div>
                        <Button layout="plain" size="xs" onClick={() => onChange(move(keys, i, i - 1))} disabled={i === 0} ariaLabel={`Move sort key ${i + 1} up`} leftIcon={<ChevronUpIcon aria-hidden="true" />} />
                        <Button layout="plain" size="xs" onClick={() => onChange(move(keys, i, i + 1))} disabled={i === keys.length - 1} ariaLabel={`Move sort key ${i + 1} down`} leftIcon={<ChevronDownIcon aria-hidden="true" />} />
                        <Button layout="plain" size="xs" onClick={() => onChange(keys.filter((_, idx) => idx !== i))} ariaLabel={`Remove sort key ${i + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
                    </div>
                    <ExpressionEditor
                        value={key.expression}
                        onChange={(v) => update(i, { expression: v })}
                        typeContext={typeContext}
                        placeholder={placeholder ?? 'e.g. Field.created'}
                        aria-label={`Sort key ${i + 1} expression`}
                    />
                </div>
            ))}
            <Button
                layout="plain"
                size="xs"
                onClick={() => onChange([...keys, { expression: '', direction: 'asc' }])}
                leftIcon={<PlusIcon aria-hidden="true" />}
                label={addLabel}
            />
        </div>
    );
};
