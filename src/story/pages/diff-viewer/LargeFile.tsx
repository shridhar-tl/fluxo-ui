import React, { useState } from 'react';
import { Button, DiffViewer, NumericInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { largeNew, largeOld } from './diff-sample';

const code = `<DiffViewer
    oldValue={oldLarge}
    newValue={newLarge}
    variant="split"
    collapseUnchanged
    maxLines={5000}
    maxHeight={500}
/>`;

const LargeFile: React.FC = () => {
    const [show, setShow] = useState(false);
    const [maxLines, setMaxLines] = useState<number>(2000);

    return (
        <>
            <ComponentDemo title="Large File Performance" description="Virtualized rendering. 2000+ lines diff smoothly. Use maxLines to cap comparison.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '10px 14px', background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', borderRadius: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--eui-text)' }}>maxLines:</span>
                        <div style={{ width: 140 }}>
                            <NumericInput value={maxLines} onChange={(e) => setMaxLines(Number(e.value) || 0)} />
                        </div>
                        <Button
                            label={show ? 'Hide diff' : 'Render 2000-line diff'}
                            size="sm"
                            variant="primary"
                            onClick={() => setShow((s) => !s)}
                        />
                    </div>
                    {show && (
                        <DiffViewer
                            oldValue={largeOld}
                            newValue={largeNew}
                            variant="split"
                            collapseUnchanged
                            maxLines={maxLines}
                            maxHeight={480}
                        />
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default LargeFile;
