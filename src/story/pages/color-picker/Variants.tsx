import React from 'react';
import { ColorPicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ColorPicker variant="button" defaultValue="#3b82f6" />
<ColorPicker variant="input" defaultValue="#22c55e" />
<ColorPicker variant="swatch" defaultValue="#f59e0b" />`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Trigger Variants" description="Three trigger styles: button (icon + text), input (monospace code), and swatch (color-only).">
            <div className="space-y-6">
                <div>
                    <div className="text-sm mb-2 opacity-70">button (default)</div>
                    <ColorPicker variant="button" defaultValue="#3b82f6" />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">input</div>
                    <ColorPicker variant="input" defaultValue="#22c55e" />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">swatch</div>
                    <div className="flex gap-2">
                        <ColorPicker variant="swatch" defaultValue="#f59e0b" />
                        <ColorPicker variant="swatch" defaultValue="#ef4444" />
                        <ColorPicker variant="swatch" defaultValue="#8b5cf6" />
                        <ColorPicker variant="swatch" defaultValue="#10b981" />
                    </div>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
