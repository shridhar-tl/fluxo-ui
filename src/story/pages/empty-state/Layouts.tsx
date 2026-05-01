import React from 'react';
import { EmptyState } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<EmptyState layout="vertical" title="No items" />
<EmptyState layout="horizontal" title="No items" />`;

const Layouts: React.FC = () => (
    <>
        <ComponentDemo
            title="Vertical & Horizontal"
            description="Vertical centers content; horizontal places the visual on the left and the text/actions on the right (collapses to vertical on narrow viewports)."
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 8 }}>
                    <EmptyState
                        layout="vertical"
                        size="md"
                        title="No documents yet"
                        description="Upload a file or create a new document to get started."
                        action={{ label: 'Upload', onClick: () => {} }}
                    />
                </div>
                <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 8 }}>
                    <EmptyState
                        layout="horizontal"
                        size="md"
                        title="Inbox zero"
                        description="You're all caught up! Check back later for new messages."
                        variant="success"
                        action={{ label: 'Refresh', onClick: () => {} }}
                        secondaryAction={{ label: 'Help', onClick: () => {} }}
                    />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Layouts;
