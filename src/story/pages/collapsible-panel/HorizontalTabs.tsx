import React from 'react';
import type { CollapsibleTabItem } from '../../../components';
import { CollapsibleTabs } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { CollapsibleTabs } from 'fluxo-ui';

const tabs = [
  { id: 'editor', label: 'Editor', isOpen: true, render: () => <div>Editor</div> },
  { id: 'preview', label: 'Preview', isOpen: true, render: () => <div>Preview</div> },
  { id: 'console', label: 'Console', isOpen: false, render: () => <div>Console</div> },
];

<CollapsibleTabs tabs={tabs} height={400} />`;

const tabs: CollapsibleTabItem[] = [
    {
        id: 'editor',
        label: 'Editor',
        isOpen: true,
        render: () => (
            <div className="p-4 h-full">
                <h3 className="font-semibold mb-2">Code Editor</h3>
                <div className="font-mono text-xs leading-relaxed opacity-70">
                    <div>{'function greet(name: string) {'}</div>
                    <div>{'  return `Hello, ${name}!`;'}</div>
                    <div>{'}'}</div>
                    <div className="mt-2">{'const message = greet("World");'}</div>
                    <div>{'console.log(message);'}</div>
                </div>
            </div>
        ),
    },
    {
        id: 'preview',
        label: 'Preview',
        isOpen: true,
        render: () => (
            <div className="p-4 h-full">
                <h3 className="font-semibold mb-2">Live Preview</h3>
                <div className="text-sm opacity-70">
                    <p>Hello, World!</p>
                </div>
            </div>
        ),
    },
    {
        id: 'console',
        label: 'Console',
        isOpen: false,
        render: () => (
            <div className="p-4 h-full">
                <h3 className="font-semibold mb-2">Console Output</h3>
                <div className="font-mono text-xs opacity-60">
                    <div>[INFO] Compiled successfully</div>
                    <div>[LOG] Hello, World!</div>
                </div>
            </div>
        ),
    },
];

const HorizontalTabs: React.FC = () => (
    <>
        <ComponentDemo title="Horizontal Collapsible Tabs" centered={false}>
            <div className="w-full" style={{ height: 300 }}>
                <CollapsibleTabs tabs={tabs} height={300} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default HorizontalTabs;
