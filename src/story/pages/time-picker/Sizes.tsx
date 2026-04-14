import React from 'react';
import { TimePicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<TimePicker size="sm" defaultValue="09:30" />
<TimePicker size="md" defaultValue="09:30" />
<TimePicker size="lg" defaultValue="09:30" />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" description="Three trigger sizes for different form densities.">
            <div className="space-y-4">
                {(['sm', 'md', 'lg'] as const).map((s) => (
                    <div key={s} className="flex items-center gap-4">
                        <span className="text-xs opacity-60 w-8">{s}</span>
                        <TimePicker size={s} defaultValue="09:30" />
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
