import React from 'react';
import { CollapsiblePanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CollapsiblePanel iconPosition="end" title="Icon End (default)">...</CollapsiblePanel>
<CollapsiblePanel iconPosition="start" title="Icon Start">...</CollapsiblePanel>`;

const IconPositions: React.FC = () => (
    <>
        <ComponentDemo title="Icon Positions" centered={false}>
            <div className="space-y-3 w-full">
                <CollapsiblePanel iconPosition="end" title="Icon at End" subtitle="Default position — chevron on the right" defaultOpen>
                    <p className="text-sm leading-relaxed">
                        The toggle indicator sits at the trailing edge of the header. This is the default behavior.
                    </p>
                </CollapsiblePanel>
                <CollapsiblePanel iconPosition="start" title="Icon at Start" subtitle="Chevron on the left, before the title">
                    <p className="text-sm leading-relaxed">
                        Placing the indicator at the start gives a tree-view or sidebar-style appearance.
                    </p>
                </CollapsiblePanel>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default IconPositions;
