import React, { useState } from 'react';
import { DeferredView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const HeavyComponent: React.FC<{ label: string }> = ({ label }) => {
    return (
        <div className="p-6 rounded-lg border border-emerald-400/30 bg-emerald-500/10">
            <div className="text-lg font-semibold text-emerald-400 mb-2">{label} - Loaded!</div>
            <p className="text-sm opacity-70">This component was deferred until it became visible in the viewport.</p>
        </div>
    );
};

const BasicUsageDemo: React.FC = () => {
    const [mountLog, setMountLog] = useState<string[]>([]);

    const logMount = (name: string) => {
        setMountLog((prev) => [...prev, `${name} mounted at ${new Date().toLocaleTimeString()}`]);
    };

    return (
        <>
            <ComponentDemo
                title="Scroll to reveal"
                description="Scroll down within this container to see components mount only when they enter the viewport. Each card logs when it was mounted."
            >
                <div className="w-full space-y-4">
                    {mountLog.length > 0 && (
                        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700 text-xs font-mono max-h-32 overflow-y-auto">
                            {mountLog.map((log, i) => (
                                <div key={i} className="text-gray-300 py-0.5">
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="h-64 overflow-y-auto rounded-lg border border-gray-700 p-4 space-y-96">
                        <div className="text-center text-sm opacity-50 py-4">Scroll down to load deferred components...</div>
                        <DeferredView>
                            <MountTracker name="Component A" onMount={logMount} />
                        </DeferredView>
                        <DeferredView>
                            <MountTracker name="Component B" onMount={logMount} />
                        </DeferredView>
                        <DeferredView>
                            <MountTracker name="Component C" onMount={logMount} />
                        </DeferredView>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { DeferredView } from 'fluxo-ui';

<DeferredView>
  <ExpensiveComponent />
</DeferredView>

<DeferredView>
  <AnotherExpensiveComponent />
</DeferredView>`}
                />
            </div>
        </>
    );
};

const MountTracker: React.FC<{ name: string; onMount: (name: string) => void }> = ({ name, onMount }) => {
    const hasLogged = React.useRef(false);
    React.useEffect(() => {
        if (!hasLogged.current) {
            hasLogged.current = true;
            onMount(name);
        }
    }, [name, onMount]);

    return <HeavyComponent label={name} />;
};

export default BasicUsageDemo;
