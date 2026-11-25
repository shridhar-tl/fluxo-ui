import React, { useCallback, useState } from 'react';

import { TrashIcon } from '../../../assets/icons';
import { Button, InputSwitch, Tag, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { frameworkTags } from './tag-story-data';

const initialTags = frameworkTags.slice(0, 6);

const code = `const [tags, setTags] = useState(['React', 'TypeScript', 'Vite']);

{tags.map((tag) => (
    <Tag
        key={tag}
        color="primary"
        closable
        closeLabel={\`Remove \${tag}\`}
        onClose={() => setTags((prev) => prev.filter((t) => t !== tag))}
    >
        {tag}
    </Tag>
))}

<Tag closable visible={showBeta} onClose={() => setShowBeta(false)} closeIcon={<TrashIcon />} color="warning">
    Beta
</Tag>

<Tag closable variant="outline">Closes itself</Tag>`;

const Closable: React.FC = () => {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [draft, setDraft] = useState('');
    const [lastRemoved, setLastRemoved] = useState<string | null>(null);
    const [showBeta, setShowBeta] = useState(true);
    const [uncontrolledKey, setUncontrolledKey] = useState(0);

    const remove = useCallback((tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag));
        setLastRemoved(tag);
    }, []);

    const add = useCallback(() => {
        const value = draft.trim();
        if (!value) return;
        setTags((prev) => (prev.includes(value) ? prev : [...prev, value]));
        setDraft('');
    }, [draft]);

    return (
        <>
            <ComponentDemo
                title="Closable Tags"
                description="Click the close button, or focus a tag and press Backspace or Delete to remove it."
            >
                <div style={stackStyle}>
                    <div style={rowStyle} aria-live="polite">
                        {tags.map((tag) => (
                            <Tag key={tag} color="primary" closable closeLabel={`Remove ${tag}`} onClose={() => remove(tag)}>
                                {tag}
                            </Tag>
                        ))}
                        {tags.length === 0 && <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.875rem' }}>No tags left</span>}
                    </div>
                    <div style={{ ...rowStyle, flexWrap: 'nowrap', maxWidth: 420 }}>
                        <div style={{ flex: 1 }}>
                            <TextInput
                                value={draft}
                                placeholder="Add a tag"
                                aria-label="New tag"
                                onChange={(event) => setDraft(String(event.value ?? ''))}
                                onKeyDown={(event: React.KeyboardEvent) => {
                                    if (event.key === 'Enter') add();
                                }}
                            />
                        </div>
                        <Button label="Add" variant="primary" onClick={add} />
                        <Button label="Reset" layout="outlined" onClick={() => setTags(initialTags)} />
                    </div>
                    <div style={stackStyle}>
                        <span style={rowLabelStyle}>Controlled & custom icon</span>
                        <div style={rowStyle}>
                            <Tag
                                closable
                                visible={showBeta}
                                onClose={() => setShowBeta(false)}
                                closeIcon={<TrashIcon aria-hidden="true" />}
                                closeLabel="Delete Beta label"
                                color="warning"
                            >
                                Beta
                            </Tag>
                            <Tag key={uncontrolledKey} closable variant="outline">
                                Closes itself
                            </Tag>
                            <InputSwitch label="Show Beta" checked={showBeta} onChange={(event) => setShowBeta(Boolean(event.value))} />
                            <Button label="Restore" size="sm" layout="outlined" onClick={() => setUncontrolledKey((k) => k + 1)} />
                        </div>
                    </div>
                    <div style={readoutStyle}>{lastRemoved ? `Removed "${lastRemoved}"` : 'Remove a tag to see the event here.'}</div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Closable;
