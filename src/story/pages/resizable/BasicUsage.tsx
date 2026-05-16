import React, { useState } from 'react';
import { Resizable } from '../../../components/resizable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Resizable } from 'fluxo-ui';

<Resizable defaultWidth={320} defaultHeight={200} minWidth={120} minHeight={80}>
  <div className="p-4">
    Resize me using any of the 8 handles.
  </div>
</Resizable>`;

const BasicUsage: React.FC = () => {
    const [size, setSize] = useState({ width: 320, height: 200 });

    return (
        <ComponentDemo
            title="Basic Resize"
            description="Grab any of the 8 handles (4 corners, 4 edges) to resize. Keyboard arrows work too — focus a handle with Tab."
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                    <Resizable
                        defaultWidth={320}
                        defaultHeight={200}
                        minWidth={120}
                        minHeight={80}
                        ariaLabel="Demo card"
                        onSizeChange={setSize}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'var(--eui-bg-subtle)',
                                border: '1px solid var(--eui-border)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--eui-text)',
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        >
                            Drag any edge or corner
                        </div>
                    </Resizable>
                </div>
                <div
                    style={{
                        padding: '10px 14px',
                        background: 'var(--eui-bg-subtle)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--eui-text-muted)',
                    }}
                >
                    Current size: <strong style={{ color: 'var(--eui-text)' }}>{Math.round(size.width)} × {Math.round(size.height)} px</strong>
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default BasicUsage;
