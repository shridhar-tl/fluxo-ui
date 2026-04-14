import React from 'react';
import { ColorPicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ColorPicker size="sm" defaultValue="#3b82f6" />
<ColorPicker size="md" defaultValue="#3b82f6" />
<ColorPicker size="lg" defaultValue="#3b82f6" />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" description="Three trigger sizes.">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="text-xs opacity-60 w-8">sm</span>
                    <ColorPicker size="sm" defaultValue="#3b82f6" />
                    <ColorPicker size="sm" variant="swatch" defaultValue="#22c55e" />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs opacity-60 w-8">md</span>
                    <ColorPicker size="md" defaultValue="#3b82f6" />
                    <ColorPicker size="md" variant="swatch" defaultValue="#22c55e" />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs opacity-60 w-8">lg</span>
                    <ColorPicker size="lg" defaultValue="#3b82f6" />
                    <ColorPicker size="lg" variant="swatch" defaultValue="#22c55e" />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
