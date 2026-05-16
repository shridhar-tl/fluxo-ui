import React from 'react';
import { Moveable } from '../../../components/moveable';
import { Resizable } from '../../../components/resizable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// Compose Moveable + Resizable for a floating, sizeable widget
<Moveable defaultPosition={{ x: 24, y: 24 }} bounds="parent" handleSelector=".eui-demo-handle">
  <Resizable defaultWidth={260} defaultHeight={160} minWidth={140} minHeight={100}>
    <div className="card">
      <div className="eui-demo-handle">Drag</div>
      <p>Resizable + movable</p>
    </div>
  </Resizable>
</Moveable>`;

const WithResizable: React.FC = () => (
    <ComponentDemo
        title="Compose with Resizable"
        description="Wrap a Resizable inside a Moveable to get a floating panel that can be both dragged and resized — the same primitives the DashboardLayout uses."
    >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
                style={{
                    position: 'relative',
                    height: 360,
                    background: 'var(--eui-bg-subtle)',
                    border: '1px dashed var(--eui-border)',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}
            >
                <Moveable
                    defaultPosition={{ x: 24, y: 24 }}
                    bounds="parent"
                    handleSelector=".eui-demo-handle"
                    cancelSelector="button"
                    ariaLabel="Floating panel"
                >
                    <Resizable defaultWidth={260} defaultHeight={170} minWidth={160} minHeight={110} showHandles="hover" ariaLabel="Panel body">
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'var(--eui-bg)',
                                border: '1px solid var(--eui-border)',
                                borderRadius: 8,
                                boxShadow: 'var(--eui-shadow)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                color: 'var(--eui-text)',
                            }}
                        >
                            <div
                                className="eui-demo-handle"
                                style={{
                                    padding: '8px 12px',
                                    background: 'var(--eui-bg-subtle)',
                                    borderBottom: '1px solid var(--eui-border-subtle)',
                                    cursor: 'grab',
                                    fontWeight: 600,
                                    fontSize: 12,
                                    color: 'var(--eui-text-muted)',
                                    flexShrink: 0,
                                }}
                            >
                                ⋮⋮ Floating Panel
                            </div>
                            <div style={{ padding: 12, fontSize: 13, flex: 1, overflow: 'auto' }}>
                                Drag the title bar to move. Drag the bottom-right corner to resize.
                            </div>
                        </div>
                    </Resizable>
                </Moveable>
            </div>
            <CodeBlock code={code} />
        </div>
    </ComponentDemo>
);

export default WithResizable;
