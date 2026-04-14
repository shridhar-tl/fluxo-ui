import React, { useState } from 'react';
import { ColorPicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { ColorPicker } from 'fluxo-ui';

const [color, setColor] = useState('#3b82f6');

<ColorPicker value={color} onChange={setColor} />

<ColorPicker defaultValue="#22c55e" />

<ColorPicker defaultValue="#f43f5e" showAlpha={false} />`;

const BasicUsage: React.FC = () => {
    const [color, setColor] = useState('#3b82f6');

    return (
        <>
            <ComponentDemo title="Default Color Picker" description="Click the trigger to open the picker. Supports hex, RGB, and alpha editing.">
                <div className="space-y-6">
                    <div>
                        <div className="text-sm mb-2 opacity-70">Controlled ({color})</div>
                        <ColorPicker value={color} onChange={(c) => setColor(c)} />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Uncontrolled</div>
                        <ColorPicker defaultValue="#22c55e" />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">No alpha channel</div>
                        <ColorPicker defaultValue="#f43f5e" showAlpha={false} />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Editable (type a hex code)</div>
                        <ColorPicker variant="input" editable defaultValue="#8b5cf6" />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">Disabled</div>
                        <ColorPicker defaultValue="#6366f1" disabled />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
