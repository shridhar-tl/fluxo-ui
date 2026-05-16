import React, { useState } from 'react';
import { Picker } from '../../../components';
import type { PickerVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Picker variant="flat" columns={[...]} value={value} onChange={setValue} />`;

const fruits = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry', 'Fig'].map((s) => ({ value: s.toLowerCase(), label: s }));

const VariantPanel: React.FC<{ variant: PickerVariant; title: string; description: string }> = ({ variant, title, description }) => {
    const [value, setValue] = useState<string[]>(['cherry']);
    return (
        <ComponentDemo title={title} description={description}>
            <div style={{ width: '100%', maxWidth: 220 }}>
                <div style={{ border: '1px solid var(--eui-border-subtle)', borderRadius: 8 }}>
                    <Picker variant={variant} columns={[{ options: fruits }]} value={value} onChange={setValue} />
                </div>
            </div>
        </ComponentDemo>
    );
};

const Variants: React.FC = () => (
    <>
        <VariantPanel variant="wheel" title="Wheel (default)" description="iOS-style with fading and shrinking outer rows." />
        <div className="mt-4">
            <VariantPanel variant="flat" title="Flat" description="Simple highlighted active row, no fade." />
        </div>
        <div className="mt-4">
            <VariantPanel variant="compact" title="Compact" description="Smaller text — useful when space is tight or when used inline." />
        </div>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Variants;
