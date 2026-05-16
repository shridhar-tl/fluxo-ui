import React from 'react';
import { TouchRipple } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { TouchRipple } from 'fluxo-ui';

<TouchRipple as="button" className="my-card" onClick={onClick} role="button" tabIndex={0}>
    Tap me
</TouchRipple>`;

const tileStyle: React.CSSProperties = {
    appearance: 'none',
    border: '1px solid var(--eui-border)',
    background: 'var(--eui-bg)',
    color: 'var(--eui-text)',
    padding: '16px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    cursor: 'pointer',
    minWidth: 160,
    textAlign: 'center',
};

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Tap to ripple" description="A Material-style ink ripple emits from the tap location and fades out.">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <TouchRipple as="button" style={tileStyle} ariaLabel="Default ripple">Tap me</TouchRipple>
                <TouchRipple as="button" style={tileStyle} center ariaLabel="Centered ripple">Centered ripple</TouchRipple>
            </div>
        </ComponentDemo>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default BasicUsage;
