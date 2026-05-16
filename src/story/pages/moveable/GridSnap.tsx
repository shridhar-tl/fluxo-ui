import React from 'react';
import { Moveable } from '../../../components/moveable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Moveable
  defaultPosition={{ x: 0, y: 0 }}
  bounds="parent"
  grid={[40, 40]}
  snapToGrid
>
  <div>Snaps to 40px grid</div>
</Moveable>`;

const GridSnap: React.FC = () => (
    <ComponentDemo
        title="Grid Snap & Bounds"
        description="Drag snaps to a 40-pixel grid while staying inside the parent."
    >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
                style={{
                    position: 'relative',
                    height: 320,
                    background:
                        'repeating-linear-gradient(0deg, transparent 0, transparent 39px, var(--eui-border-subtle) 39px, var(--eui-border-subtle) 40px), repeating-linear-gradient(90deg, transparent 0, transparent 39px, var(--eui-border-subtle) 39px, var(--eui-border-subtle) 40px)',
                    backgroundColor: 'var(--eui-bg-subtle)',
                    border: '1px solid var(--eui-border)',
                    borderRadius: 8,
                    overflow: 'hidden',
                }}
            >
                <Moveable
                    defaultPosition={{ x: 40, y: 40 }}
                    bounds="parent"
                    grid={[40, 40]}
                    snapToGrid
                    ariaLabel="Snaps to 40px grid"
                >
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            background: 'var(--eui-primary)',
                            color: 'var(--eui-text-on-primary)',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        Snap
                    </div>
                </Moveable>
            </div>
            <CodeBlock code={code} />
        </div>
    </ComponentDemo>
);

export default GridSnap;
