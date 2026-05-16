import React, { useState } from 'react';
import { Button, StepDots } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { StepDots } from 'fluxo-ui';

<StepDots count={4} activeIndex={index} />`;

const BasicUsage: React.FC = () => {
    const [idx, setIdx] = useState(1);
    return (
        <>
            <ComponentDemo title="Simple progress dots" description="Tiny indicator showing position in an onboarding or carousel. Tap the buttons to step through.">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <StepDots count={4} activeIndex={idx} />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button label="Prev" variant="secondary" disabled={idx === 0} onClick={() => setIdx((n) => Math.max(0, n - 1))} />
                        <Button label="Next" disabled={idx === 3} onClick={() => setIdx((n) => Math.min(3, n + 1))} />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default BasicUsage;
