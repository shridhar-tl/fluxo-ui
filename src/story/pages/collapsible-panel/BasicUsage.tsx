import React from 'react';
import { CollapsiblePanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { CollapsiblePanel } from 'fluxo-ui';

<CollapsiblePanel title="Getting Started" defaultOpen>
  <p>Welcome to the CollapsiblePanel component! Click the header to toggle.</p>
</CollapsiblePanel>

<CollapsiblePanel title="Advanced Features" subtitle="Explore more options">
  <p>This panel has a subtitle and starts collapsed.</p>
</CollapsiblePanel>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Basic Usage" centered={false}>
            <div className="space-y-3 w-full">
                <CollapsiblePanel title="Getting Started" defaultOpen>
                    <p className="text-sm leading-relaxed">
                        Welcome to the CollapsiblePanel component. Click the header to expand or collapse the content area with a smooth
                        height animation. This panel starts open by default.
                    </p>
                </CollapsiblePanel>
                <CollapsiblePanel title="Advanced Features" subtitle="Explore the full set of options available">
                    <p className="text-sm leading-relaxed">
                        Panels support subtitles, icons, custom header actions, multiple variants, sizes, and full keyboard accessibility.
                        They can be used standalone or grouped in an accordion.
                    </p>
                </CollapsiblePanel>
                <CollapsiblePanel title="Performance & Lazy Rendering">
                    <p className="text-sm leading-relaxed">
                        Use the <code className="font-mono text-xs">lazy</code> prop to defer rendering of content until the panel is first
                        opened, or <code className="font-mono text-xs">destroyOnCollapse</code> to unmount content when collapsed.
                    </p>
                </CollapsiblePanel>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default BasicUsage;
