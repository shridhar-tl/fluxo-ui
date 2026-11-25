import React, { useState } from 'react';

import { Badge, Button, Card } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { inboxFolders } from './badge-story-data';

const headingRowStyle: React.CSSProperties = {
    color: 'var(--eui-text)',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: 0,
};

const folderRowStyle: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
};

const code = `<Button layout="plain" fullWidth onClick={() => setActive('Inbox')}>
    <span>Inbox</span>
    <Badge count={24} color="primary" variant="soft" />
</Button>

<h4>Release notes <Badge content="New" color="success" size="sm" /></h4>`;

const Standalone: React.FC = () => {
    const [active, setActive] = useState('Inbox');

    return (
        <>
            <ComponentDemo title="Standalone & Inline" description="Without children a badge renders inline, ideal for menus, lists and headings.">
                <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 260, maxWidth: '100%' }}>
                        <Card title="Mail" padding="sm">
                            <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {inboxFolders.map((folder) => (
                                    <div role="listitem" key={folder.label}>
                                        <Button
                                            layout="plain"
                                            variant={active === folder.label ? 'primary' : 'default'}
                                            fullWidth
                                            aria-current={active === folder.label ? 'true' : undefined}
                                            onClick={() => setActive(folder.label)}
                                        >
                                            <span style={folderRowStyle}>
                                                <span>{folder.label}</span>
                                                <Badge count={folder.count} max={999} color={folder.color} variant="soft" />
                                            </span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1, minWidth: 220 }}>
                        <h4 style={headingRowStyle}>
                            Release notes <Badge content="New" color="success" size="sm" />
                        </h4>
                        <h4 style={headingRowStyle}>
                            Billing <Badge content="Action needed" color="warning" variant="soft" size="sm" />
                        </h4>
                        <h4 style={headingRowStyle}>
                            API v3 <Badge content="Deprecated" color="secondary" variant="outline" size="sm" />
                        </h4>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Standalone;
