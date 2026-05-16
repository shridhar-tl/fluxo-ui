import React, { useState } from 'react';
import { Button, Drawer, Picker } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Button label="Pick a country" onClick={() => setOpen(true)} />
<Drawer
    open={open}
    onClose={() => setOpen(false)}
    position="bottom"
    variant="sheet"
    snapPoints={['45%']}
    title="Pick a country"
    footer={<Button label="Done" onClick={() => setOpen(false)} />}
>
    <Picker columns={[{ options: countries }]} value={value} onChange={setValue} />
</Drawer>`;

const countries = ['India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Iceland'].map((s) => ({ value: s.toLowerCase(), label: s }));

const noteBox: React.CSSProperties = {
    padding: '10px 14px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 6,
    fontSize: 12,
    color: 'var(--eui-text-muted)',
};

const InSheet: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string[]>(['india']);

    return (
        <>
            <ComponentDemo title="Picker inside a bottom sheet" description="Pair the Picker with a Drawer in sheet mode for a familiar mobile selection pattern.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <Button label={`Country: ${countries.find((c) => c.value === value[0])?.label}`} onClick={() => setOpen(true)} />
                    </div>
                    <div style={noteBox}>Picker value: <strong style={{ color: 'var(--eui-text)' }}>{value[0]}</strong></div>
                </div>
                <Drawer
                    open={open}
                    onClose={() => setOpen(false)}
                    position="bottom"
                    variant="sheet"
                    snapPoints={['45%']}
                    title="Pick a country"
                    footer={<Button label="Done" onClick={() => setOpen(false)} />}
                >
                    <Picker columns={[{ options: countries }]} value={value} onChange={setValue} />
                </Drawer>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default InSheet;
