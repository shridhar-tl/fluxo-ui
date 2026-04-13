import React from 'react';
import { CollapsiblePanel, CollapsiblePanelSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CollapsiblePanel size="sm" title="Small Panel">...</CollapsiblePanel>
<CollapsiblePanel size="md" title="Medium Panel">...</CollapsiblePanel>
<CollapsiblePanel size="lg" title="Large Panel">...</CollapsiblePanel>`;

const sizes: { size: CollapsiblePanelSize; label: string }[] = [
    { size: 'sm', label: 'Small' },
    { size: 'md', label: 'Medium (default)' },
    { size: 'lg', label: 'Large' },
];

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" centered={false}>
            <div className="space-y-3 w-full">
                {sizes.map((s) => (
                    <CollapsiblePanel
                        key={s.size}
                        size={s.size}
                        title={`${s.label} Panel`}
                        subtitle={`size="${s.size}"`}
                        defaultOpen
                    >
                        <p className="text-sm leading-relaxed">
                            Content rendered at the <strong>{s.size}</strong> size. Header padding,
                            font size, and indicator icon all scale proportionally.
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

export default Sizes;
