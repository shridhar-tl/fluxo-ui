import React, { useState } from 'react';
import { Button, Slider, Splitter, SplitterPanel, TextInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const [collapsed, setCollapsed] = useState(false);

<Splitter
  style={{ height: '100%' }}
  responsive={520}
  onCollapseChange={setCollapsed}
>
  <SplitterPanel defaultSize="40%" minSize="160px">
    <div className="p-4">Filters</div>
  </SplitterPanel>
  <SplitterPanel>
    <div className="p-4">Results</div>
  </SplitterPanel>
</Splitter>`;

const RESPONSIVE_THRESHOLD = 520;

const Responsive: React.FC = () => {
    const [containerWidth, setContainerWidth] = useState(760);
    const [collapsed, setCollapsed] = useState(false);
    const [count, setCount] = useState(0);
    const [note, setNote] = useState('');

    return (
        <>
            <ComponentDemo title="Responsive collapse — horizontal turns into a vertical stack">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        <label htmlFor="splitter-responsive-width" style={{ color: 'var(--eui-text)', fontWeight: 600, fontSize: 14 }}>
                            Drag to change the splitter's container width
                        </label>
                        <Slider
                            value={containerWidth}
                            min={300}
                            max={800}
                            step={10}
                            ariaLabel="Splitter container width"
                            valueFormat={(v) => `${v}px`}
                            showValue
                            onChange={(v) => setContainerWidth(Array.isArray(v) ? v[0] : v)}
                        />
                        <p style={{ color: 'var(--eui-text-muted)', fontSize: 13, margin: 0 }}>
                            Container: <strong>{containerWidth}px</strong> · Threshold: <strong>{RESPONSIVE_THRESHOLD}px</strong> · Layout:{' '}
                            <strong style={{ color: collapsed ? 'var(--eui-primary)' : 'var(--eui-text)' }}>
                                {collapsed ? 'vertical (collapsed)' : 'horizontal'}
                            </strong>
                        </p>
                    </div>

                    <div
                        style={{
                            width: containerWidth,
                            maxWidth: '100%',
                            height: 260,
                            border: '1px solid var(--eui-border)',
                            borderRadius: 8,
                            overflow: 'hidden',
                            transition: 'width 0.2s ease',
                        }}
                    >
                        <Splitter style={{ height: '100%' }} responsive={RESPONSIVE_THRESHOLD} onCollapseChange={setCollapsed}>
                            <SplitterPanel defaultSize="40%" minSize="160px">
                                <div style={{ height: '100%', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <p style={{ fontWeight: 600, color: 'var(--eui-text)', margin: 0 }}>Filters</p>
                                    <p style={{ fontSize: 13, color: 'var(--eui-text-muted)', margin: 0 }}>
                                        Click to change state, then narrow the width past {RESPONSIVE_THRESHOLD}px. The count survives the
                                        collapse — panels are never unmounted.
                                    </p>
                                    <Button size="sm" onClick={() => setCount((c) => c + 1)}>
                                        Clicked {count} {count === 1 ? 'time' : 'times'}
                                    </Button>
                                </div>
                            </SplitterPanel>
                            <SplitterPanel>
                                <div style={{ height: '100%', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <p style={{ fontWeight: 600, color: 'var(--eui-text)', margin: 0 }}>Results</p>
                                    <label
                                        htmlFor="splitter-responsive-note"
                                        style={{ fontSize: 13, color: 'var(--eui-text-muted)' }}
                                    >
                                        Type something
                                    </label>
                                    <TextInput
                                        id="splitter-responsive-note"
                                        value={note}
                                        placeholder="Your text stays put when it stacks"
                                        onChange={(e) => setNote(e.value)}
                                    />
                                </div>
                            </SplitterPanel>
                        </Splitter>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Responsive;
