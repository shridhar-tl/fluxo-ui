import React, { useState } from 'react';
import { Knob } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Knob } from 'fluxo-ui';

const [value, setValue] = useState(72);

<Knob value={value} label="CPU" unit="%" />
<Knob value={value} interactive onChange={setValue} label="Volume" />`;

const BasicUsage: React.FC = () => {
    const [value, setValue] = useState(72);

    return (
        <>
            <ComponentDemo title="Default Knob" description="Read-only display and an interactive editor.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        <Knob value={68} label="CPU" unit="%" />
                        <Knob value={value} label="Volume" unit="%" interactive onChange={setValue} />
                        <Knob value={42} label="Memory" unit="%" color="warning" />
                    </div>
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                        }}
                    >
                        Drag the middle knob, or use arrow keys when focused. Current value: <strong>{value}</strong>
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
