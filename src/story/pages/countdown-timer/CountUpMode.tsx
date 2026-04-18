import React, { useState } from 'react';
import { CountdownTimer } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// Count up from 0 → duration (elapsed timer)
<CountdownTimer
  duration={60}
  variant="circular"
  countUp={true}
  onComplete={() => alert('60 seconds elapsed!')}
/>`;

const CountUpMode: React.FC = () => {
    const [completed, setCompleted] = useState(false);

    return (
        <>
            <ComponentDemo
                title="Count-Up Mode"
                description="Instead of counting down, elapsed time fills up the progress from 0 to the target duration."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <CountdownTimer
                        duration={60}
                        variant="circular"
                        size="md"
                        countUp
                        onComplete={() => setCompleted(true)}
                    />
                    {completed && (
                        <div
                            style={{
                                padding: '10px 16px',
                                background: 'var(--eui-bg-subtle)',
                                border: '1px solid var(--eui-border-subtle)',
                                borderRadius: 6,
                                fontSize: 13,
                                color: 'var(--eui-text-muted)',
                            }}
                        >
                            Target elapsed! <strong style={{ color: 'var(--eui-text)' }}>60s reached.</strong>
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

export default CountUpMode;
