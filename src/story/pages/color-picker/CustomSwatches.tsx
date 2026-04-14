import React from 'react';
import { ColorPicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const brandPalette = ['#0f172a', '#1e293b', '#334155', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#f97316', '#fb923c', '#fde68a'];

const code = `<ColorPicker
  defaultValue="#3b82f6"
  swatches={['#0f172a', '#1e293b', '#3b82f6', '#60a5fa', '#fb923c']}
/>

<ColorPicker defaultValue="#3b82f6" showSwatches={false} />

<ColorPicker defaultValue="#3b82f6" showInputs={false} showSwatches={false} />`;

const CustomSwatches: React.FC = () => (
    <>
        <ComponentDemo
            title="Custom Swatches & Panel Toggles"
            description="Pass your own palette via the swatches prop, or hide input fields and swatches for a minimal picker."
        >
            <div className="space-y-6">
                <div>
                    <div className="text-sm mb-2 opacity-70">Brand palette</div>
                    <ColorPicker defaultValue="#3b82f6" swatches={brandPalette} />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">No swatches</div>
                    <ColorPicker defaultValue="#22c55e" showSwatches={false} />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">Minimal (canvas only)</div>
                    <ColorPicker defaultValue="#f43f5e" showInputs={false} showSwatches={false} showAlpha={false} />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default CustomSwatches;
