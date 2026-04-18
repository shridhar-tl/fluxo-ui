import React, { useState } from 'react';
import { CountdownTimer } from '../../../components/CountdownTimer';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { CountdownTimer } from 'fluxo-ui';

<CountdownTimer
  duration={30}
  variant="circular"
  size="md"
  onComplete={() => console.log('Done!')}
/>`;

const BasicUsage: React.FC = () => {
    const [log, setLog] = useState('—');

    return (
        <>
            <ComponentDemo
                title="Basic Circular Timer"
                description="A 30-second circular countdown. Progress ring shrinks as time runs out. Pause and reset via the controls below."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <CountdownTimer
                        duration={30}
                        variant="circular"
                        size="md"
                        onComplete={() => setLog('Timer completed!')}
                        onTick={(rem) => setLog(`${rem}s remaining`)}
                        onPause={(rem) => setLog(`Paused at ${rem}s`)}
                        onReset={() => setLog('Reset')}
                    />
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
                        Event: <strong style={{ color: 'var(--eui-text)' }}>{log}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
