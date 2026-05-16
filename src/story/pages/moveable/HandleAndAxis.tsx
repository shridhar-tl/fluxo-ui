import React from 'react';
import { Moveable } from '../../../components/moveable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Moveable
  handleSelector=".my-handle"
  cancelSelector="button"
  axis="x"
  bounds="parent"
>
  <div className="card">
    <div className="my-handle">::: drag here :::</div>
    <p>Body — not draggable.</p>
    <button>Action — clicks pass through</button>
  </div>
</Moveable>`;

const HandleAndAxis: React.FC = () => (
    <ComponentDemo
        title="Drag Handle & Axis Lock"
        description="Use handleSelector to restrict drag start to a header, cancelSelector to exclude inner buttons/inputs, and axis to lock to one direction."
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
                <Moveable
                    defaultPosition={{ x: 40, y: 40 }}
                    bounds="parent"
                    handleSelector=".eui-demo-handle"
                    cancelSelector="button, input"
                    ariaLabel="Card with handle"
                >
                    <div
                        style={{
                            width: 230,
                            background: 'var(--eui-bg)',
                            border: '1px solid var(--eui-border)',
                            borderRadius: 8,
                            boxShadow: 'var(--eui-shadow)',
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
                                fontSize: 12,
                                fontWeight: 600,
                                color: 'var(--eui-text-muted)',
                            }}
                        >
                            ⋮⋮ Drag here
                        </div>
                        <div style={{ padding: 12, fontSize: 13 }}>
                            <p style={{ margin: '0 0 8px' }}>Body text is NOT a drag handle.</p>
                            <button
                                type="button"
                                style={{
                                    padding: '4px 10px',
                                    background: 'var(--eui-primary)',
                                    color: 'var(--eui-text-on-primary)',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                }}
                                onClick={() => alert('Click ignored by drag')}
                            >
                                Click me
                            </button>
                        </div>
                    </div>
                </Moveable>

                <Moveable
                    defaultPosition={{ x: 320, y: 40 }}
                    bounds="parent"
                    axis="x"
                    ariaLabel="Horizontal only"
                >
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, var(--eui-primary), var(--eui-primary-hover))',
                            color: 'var(--eui-text-on-primary)',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        axis: x only ↔
                    </div>
                </Moveable>

                <Moveable
                    defaultPosition={{ x: 40, y: 200 }}
                    bounds="parent"
                    axis="y"
                    ariaLabel="Vertical only"
                >
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        axis: y only ↕
                    </div>
                </Moveable>
            </div>
            <CodeBlock code={code} />
        </div>
    </ComponentDemo>
);

export default HandleAndAxis;
