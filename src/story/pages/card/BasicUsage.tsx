import React from 'react';
import { Button, Card } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Card, Button } from 'fluxo-ui';

<Card
    title="Project Atlas"
    subtitle="Updated 2 hours ago"
    actions={<Button label="Open" size="xs" variant="primary" />}
    footer={<Button label="View details" size="sm" layout="plain" />}
>
    Redesign of the main dashboard with improved analytics and deeper drill-downs.
</Card>`;

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span style={{ color: 'var(--eui-text)' }}>{children}</span>
);

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Basic Card" description="Card with title, subtitle, actions, and footer.">
            <div style={{ width: '100%', maxWidth: 420 }}>
                <Card
                    title="Project Atlas"
                    subtitle="Updated 2 hours ago"
                    actions={<Button label="Open" size="xs" variant="primary" />}
                    footer={<Button label="View details" size="sm" layout="plain" />}
                >
                    <Body>Redesign of the main dashboard with improved analytics and deeper drill-downs.</Body>
                </Card>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
