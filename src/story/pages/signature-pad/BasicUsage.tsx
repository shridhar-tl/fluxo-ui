import React, { useRef, useState } from 'react';
import { Button, SignaturePad } from '../../../components';
import type { SignaturePadHandle } from '../../../components/signature-pad';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { SignaturePad } from 'fluxo-ui';
import type { SignaturePadHandle } from 'fluxo-ui';

const ref = useRef<SignaturePadHandle>(null);

<SignaturePad ref={ref} onChange={(empty) => setEmpty(empty)} />
<Button label="Export PNG" onClick={() => console.log(ref.current?.toDataURL())} />`;

const BasicUsage: React.FC = () => {
    const ref = useRef<SignaturePadHandle>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleExport = () => {
        if (ref.current && !ref.current.isEmpty()) {
            setPreview(ref.current.toDataURL('image/png'));
        }
    };

    return (
        <>
            <ComponentDemo title="Basic Signature" description="Sign with mouse, touch, or stylus. Use the ref to export.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                    <SignaturePad ref={ref} onEnd={() => undefined} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Button label="Export PNG" variant="primary" size="sm" onClick={handleExport} />
                        <Button label="Clear" size="sm" layout="outlined" onClick={() => { ref.current?.clear(); setPreview(null); }} />
                    </div>
                    {preview && (
                        <div style={{ padding: '10px 14px', background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', borderRadius: 6 }}>
                            <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', marginBottom: 6 }}>Exported PNG:</div>
                            <img src={preview} alt="Signature" style={{ maxHeight: 80, background: '#fff', borderRadius: 4 }} />
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
