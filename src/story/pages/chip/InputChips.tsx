import React, { useCallback, useState } from 'react';

import { TrashIcon } from '../../../assets/icons';
import { Avatar, Button, Chip, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { initialRecipients, suggestionList } from './chip-story-data';

const code = `{recipients.map((name) => (
    <Chip
        key={name}
        avatar={<Avatar name={name} size={22} />}
        removable
        removeLabel={\`Remove \${name}\`}
        onRemove={() => remove(name)}
    >
        {name}
    </Chip>
))}

<Chip removable removeIcon={<TrashIcon />} removeLabel="Delete draft" variant="outlined">
    Draft
</Chip>`;

const InputChips: React.FC = () => {
    const [recipients, setRecipients] = useState<string[]>(initialRecipients);
    const [draft, setDraft] = useState('');
    const [files, setFiles] = useState<string[]>(['Draft', 'Q3 report.pdf', 'Notes']);

    const remove = useCallback((name: string) => setRecipients((prev) => prev.filter((r) => r !== name)), []);
    const add = useCallback((name: string) => {
        const value = name.trim();
        if (!value) return;
        setRecipients((prev) => (prev.includes(value) ? prev : [...prev, value]));
        setDraft('');
    }, []);

    const suggestions = suggestionList.filter((name) => !recipients.includes(name));

    return (
        <>
            <ComponentDemo title="Input Chips" description="Removable chips for recipients or entries. Focus a chip and press Backspace or Delete to remove it.">
                <div style={stackStyle}>
                    <div
                        style={{
                            ...rowStyle,
                            padding: '0.625rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--eui-border-subtle)',
                            background: 'var(--eui-bg-subtle)',
                            minHeight: 52,
                        }}
                        aria-label="Recipients"
                        role="group"
                    >
                        {recipients.map((name) => (
                            <Chip key={name} avatar={<Avatar name={name} size={22} />} removable removeLabel={`Remove ${name}`} onRemove={() => remove(name)}>
                                {name}
                            </Chip>
                        ))}
                        {recipients.length === 0 && <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.875rem' }}>Add a recipient below</span>}
                    </div>
                    <div style={{ ...rowStyle, flexWrap: 'nowrap', maxWidth: 420 }}>
                        <div style={{ flex: 1 }}>
                            <TextInput
                                value={draft}
                                placeholder="Type a name and press Enter"
                                aria-label="Recipient name"
                                onChange={(event) => setDraft(String(event.value ?? ''))}
                                onKeyDown={(event: React.KeyboardEvent) => {
                                    if (event.key === 'Enter') add(draft);
                                }}
                            />
                        </div>
                        <Button label="Add" variant="primary" onClick={() => add(draft)} />
                    </div>
                    <div style={rowStyle}>
                        <span style={rowLabelStyle}>Custom icon</span>
                        {files.map((file) => (
                            <Chip
                                key={file}
                                variant="outlined"
                                color="danger"
                                removable
                                removeIcon={<TrashIcon aria-hidden="true" />}
                                removeLabel={`Delete ${file}`}
                                onRemove={() => setFiles((prev) => prev.filter((f) => f !== file))}
                            >
                                {file}
                            </Chip>
                        ))}
                        {files.length === 0 && <Button label="Restore" size="sm" layout="plain" onClick={() => setFiles(['Draft', 'Q3 report.pdf', 'Notes'])} />}
                    </div>
                    {suggestions.length > 0 && (
                        <div style={rowStyle}>
                            <span style={rowLabelStyle}>Suggested</span>
                            {suggestions.map((name) => (
                                <Chip key={name} variant="outlined" size="sm" avatar={<Avatar name={name} size={18} />} onClick={() => add(name)}>
                                    {name}
                                </Chip>
                            ))}
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default InputChips;
