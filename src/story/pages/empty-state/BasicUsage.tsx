import React from 'react';
import { EmptyState } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { EmptyState } from 'fluxo-ui';

<EmptyState
  title="No items yet"
  description="Get started by creating your first item."
  action={{ label: 'Create item', onClick: () => {} }}
  secondaryAction={{ label: 'Learn more', href: '#' }}
/>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Default Empty State" description="Title + description + primary and secondary actions.">
            <EmptyState
                title="No items yet"
                description="Get started by creating your first item."
                action={{ label: 'Create item', onClick: () => alert('Create clicked') }}
                secondaryAction={{ label: 'Learn more', onClick: () => alert('Learn clicked') }}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
