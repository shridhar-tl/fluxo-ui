import React, { useState } from 'react';
import { Button, Drawer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Drawer } from 'fluxo-ui';

const [open, setOpen] = useState(false);

<Drawer
    open={open}
    onClose={() => setOpen(false)}
    position="bottom"
    variant="sheet"
    snapPoints={[0.3, 0.6, 0.9]}
    initialSnap={1}
    title="Select an option"
>
    {/* sheet body */}
</Drawer>`;

const BottomSheet: React.FC = () => {
    const [openSnap, setOpenSnap] = useState(false);
    const [openDismiss, setOpenDismiss] = useState(false);
    const [openCustom, setOpenCustom] = useState(false);
    const [snapIdx, setSnapIdx] = useState(1);

    return (
        <>
            <ComponentDemo
                title="Snap points"
                description="A bottom sheet with three snap points (30%, 60%, 90% of viewport). Drag the handle up or down — the sheet settles on the nearest snap."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <Button label="Open snap sheet" onClick={() => setOpenSnap(true)} />
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
                        Last settled snap index: <strong style={{ color: 'var(--eui-text)' }}>{snapIdx}</strong>
                    </div>
                </div>
                <Drawer
                    open={openSnap}
                    onClose={() => setOpenSnap(false)}
                    position="bottom"
                    variant="sheet"
                    snapPoints={[0.3, 0.6, 0.9]}
                    initialSnap={1}
                    onSnapChange={setSnapIdx}
                    title="Pick a destination"
                >
                    <p style={{ marginTop: 0, color: 'var(--eui-text-muted)' }}>
                        Drag the handle at the top to resize the sheet. Drag below the smallest snap (or fast-swipe down) to dismiss.
                    </p>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '10px 12px',
                                borderBottom: '1px solid var(--eui-border-subtle)',
                                color: 'var(--eui-text)',
                            }}
                        >
                            Option {i + 1}
                        </div>
                    ))}
                </Drawer>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>

            <ComponentDemo
                title="Drag-to-dismiss"
                description="Sheet without snap points — drag down past 40% of its height or fast-swipe down to dismiss."
                className="mt-4"
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <Button label="Open simple sheet" variant="secondary" onClick={() => setOpenDismiss(true)} />
                    </div>
                </div>
                <Drawer
                    open={openDismiss}
                    onClose={() => setOpenDismiss(false)}
                    position="bottom"
                    variant="sheet"
                    size="55vh"
                    title="Quick info"
                >
                    <p style={{ color: 'var(--eui-text)' }}>This sheet has a fixed height. Try dragging the handle down to dismiss.</p>
                </Drawer>
            </ComponentDemo>

            <ComponentDemo
                title="Top sheet"
                description="Sheets aren't limited to the bottom — the same drag/snap behavior works with position='top'."
                className="mt-4"
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <Button label="Open top sheet" variant="secondary" onClick={() => setOpenCustom(true)} />
                    </div>
                </div>
                <Drawer
                    open={openCustom}
                    onClose={() => setOpenCustom(false)}
                    position="top"
                    variant="sheet"
                    snapPoints={['25vh', '50vh']}
                    initialSnap={0}
                    title="Notifications"
                >
                    <ul style={{ paddingLeft: 18, color: 'var(--eui-text)' }}>
                        <li>Pull-down to expand</li>
                        <li>Quick toggles</li>
                        <li>Recent activity</li>
                    </ul>
                </Drawer>
            </ComponentDemo>
        </>
    );
};

export default BottomSheet;
