import React, { useState } from 'react';
import { ColorPicker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ColorPicker defaultValue="#3b82f6" format="hex" />
<ColorPicker defaultValue="#22c55e" format="rgb" />
<ColorPicker defaultValue="#f59e0b" format="rgba" />`;

const Formats: React.FC = () => {
    const [hex, setHex] = useState('#3b82f6');
    const [alpha, setAlpha] = useState(0.75);

    return (
        <>
            <ComponentDemo title="Output Formats" description="Display the current value in hex, rgb, or rgba format.">
                <div className="space-y-6">
                    <div>
                        <div className="text-sm mb-2 opacity-70">hex</div>
                        <ColorPicker defaultValue="#3b82f6" format="hex" />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">rgb</div>
                        <ColorPicker defaultValue="#22c55e" format="rgb" />
                    </div>
                    <div>
                        <div className="text-sm mb-2 opacity-70">rgba (controlled: {hex} @ {alpha.toFixed(2)})</div>
                        <ColorPicker
                            value={hex}
                            alpha={alpha}
                            format="rgba"
                            onChange={(c, a) => {
                                setHex(c);
                                setAlpha(a);
                            }}
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Formats;
