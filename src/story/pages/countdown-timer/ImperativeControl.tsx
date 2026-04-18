import React, { useRef } from 'react';
import { CountdownTimer } from '../../../components';
import type { CountdownTimerHandle } from '../../../components';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { useRef } from 'react';
import { CountdownTimer } from 'fluxo-ui';
import type { CountdownTimerHandle } from 'fluxo-ui';

const timerRef = useRef<CountdownTimerHandle>(null);

<CountdownTimer ref={timerRef} duration={30} autoStart={false} showControls={false} />

<button onClick={() => timerRef.current?.start()}>Start</button>
<button onClick={() => timerRef.current?.pause()}>Pause</button>
<button onClick={() => timerRef.current?.resume()}>Resume</button>
<button onClick={() => timerRef.current?.reset()}>Reset</button>`;

const ImperativeControl: React.FC = () => {
    const timerRef = useRef<CountdownTimerHandle>(null);

    return (
        <>
            <ComponentDemo
                title="Imperative Control via Ref"
                description="Expose timer controls to parent components using a forwarded ref. Hide the built-in controls and drive the timer externally."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <CountdownTimer
                        ref={timerRef}
                        duration={30}
                        variant="circular"
                        size="md"
                        autoStart={false}
                        showControls={false}
                    />
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            justifyContent: 'center',
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                        }}
                    >
                        <Button label="Start" size="sm" onClick={() => timerRef.current?.start()} />
                        <Button label="Pause" size="sm" variant="secondary" onClick={() => timerRef.current?.pause()} />
                        <Button label="Resume" size="sm" variant="secondary" onClick={() => timerRef.current?.resume()} />
                        <Button label="Reset" size="sm" variant="secondary" onClick={() => timerRef.current?.reset()} />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ImperativeControl;
