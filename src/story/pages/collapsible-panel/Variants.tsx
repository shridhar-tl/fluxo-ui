import React from 'react';
import { CollapsiblePanel, CollapsiblePanelVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CollapsiblePanel variant="default" title="Default" defaultOpen>...</CollapsiblePanel>
<CollapsiblePanel variant="bordered" title="Bordered">...</CollapsiblePanel>
<CollapsiblePanel variant="elevated" title="Elevated">...</CollapsiblePanel>
<CollapsiblePanel variant="ghost" title="Ghost">...</CollapsiblePanel>
<CollapsiblePanel variant="separated" title="Separated">...</CollapsiblePanel>`;

const variants: { name: CollapsiblePanelVariant; description: string }[] = [
    { name: 'default', description: 'Subtle border with clean background. Best for general use.' },
    { name: 'bordered', description: 'Prominent border that highlights on open with the primary accent color.' },
    { name: 'elevated', description: 'Shadow-based depth. Gains more elevation when expanded.' },
    { name: 'ghost', description: 'No background or border. Blends into surrounding content seamlessly.' },
    { name: 'separated', description: 'Distinct header background with a divider line when open.' },
];

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Variants" centered={false}>
            <div className="space-y-3 w-full">
                {variants.map((v, i) => (
                    <CollapsiblePanel
                        key={v.name}
                        variant={v.name}
                        title={`${v.name.charAt(0).toUpperCase()}${v.name.slice(1)} Variant`}
                        subtitle={v.description}
                        defaultOpen={i === 0}
                    >
                        <p className="text-sm leading-relaxed">
                            This is the <strong>{v.name}</strong> variant. {v.description}
                        </p>
                    </CollapsiblePanel>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default Variants;
