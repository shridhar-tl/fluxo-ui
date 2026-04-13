import React from 'react';
import { CollapsiblePanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CollapsiblePanel title="Locked Section" disabled>
  <p>This content is not accessible.</p>
</CollapsiblePanel>

<CollapsiblePanel title="Locked But Open" disabled defaultOpen>
  <p>Content is visible but cannot be collapsed.</p>
</CollapsiblePanel>`;

const DisabledState: React.FC = () => (
    <>
        <ComponentDemo title="Disabled State" centered={false}>
            <div className="space-y-3 w-full">
                <CollapsiblePanel title="Locked Section" subtitle="Cannot be toggled" disabled variant="bordered">
                    <p className="text-sm leading-relaxed">
                        This content is not accessible because the panel is disabled and collapsed.
                    </p>
                </CollapsiblePanel>
                <CollapsiblePanel title="Locked But Open" subtitle="Visible but cannot be collapsed" disabled defaultOpen variant="bordered">
                    <p className="text-sm leading-relaxed">
                        This panel starts open and is disabled — the user can see the content but cannot collapse it.
                        The header cursor changes to <code className="font-mono text-xs">not-allowed</code> and the hover effect is suppressed.
                    </p>
                </CollapsiblePanel>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default DisabledState;
