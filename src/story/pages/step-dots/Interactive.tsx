import React, { useState } from 'react';
import { StepDots } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<StepDots count={5} activeIndex={i} onChange={setI} interactive />`;

const Interactive: React.FC = () => {
    const [idx, setIdx] = useState(0);
    return (
        <>
            <ComponentDemo title="Interactive" description="Add interactive to make dots focusable and clickable. Arrow keys navigate the active dot.">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                    <StepDots count={5} activeIndex={idx} onChange={setIdx} interactive />
                    <div style={{ fontSize: 13, color: 'var(--eui-text-muted)' }}>Current: step {idx + 1} of 5</div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default Interactive;
