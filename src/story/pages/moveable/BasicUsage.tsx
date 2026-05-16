import React, { useState } from 'react';
import { Moveable } from '../../../components/moveable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Moveable } from 'fluxo-ui';

<Moveable defaultPosition={{ x: 0, y: 0 }} bounds="parent">
  <div className="p-4 bg-bg-subtle border rounded">Drag me</div>
</Moveable>`;

const BasicUsage: React.FC = () => {
    const [pos, setPos] = useState({ x: 0, y: 0 });

    return (
        <ComponentDemo
            title="Basic Drag"
            description="Click and drag anywhere on the wrapped element. Tab to focus, then use arrow keys to move."
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                    style={{
                        position: 'relative',
                        height: 320,
                        background: 'var(--eui-bg-subtle)',
                        border: '1px dashed var(--eui-border)',
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}
                >
                    <Moveable defaultPosition={{ x: 40, y: 40 }} bounds="parent" onPositionChange={setPos} ariaLabel="Draggable card">
                        <div
                            style={{
                                padding: '14px 18px',
                                background: 'var(--eui-bg)',
                                border: '1px solid var(--eui-border)',
                                borderRadius: 8,
                                boxShadow: 'var(--eui-shadow)',
                                color: 'var(--eui-text)',
                                fontSize: 14,
                                fontWeight: 500,
                                minWidth: 140,
                                textAlign: 'center',
                            }}
                        >
                            Drag me anywhere
                        </div>
                    </Moveable>
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
                    Position: <strong style={{ color: 'var(--eui-text)' }}>x = {Math.round(pos.x)}, y = {Math.round(pos.y)}</strong>
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default BasicUsage;
