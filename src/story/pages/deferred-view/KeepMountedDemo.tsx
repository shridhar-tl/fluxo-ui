import React, { useEffect, useState } from 'react';
import { DeferredView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const CounterComponent: React.FC<{ label: string }> = ({ label }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const timerRef = setInterval(() => {
            setCount((c) => c + 1);
        }, 1000);
        return () => clearInterval(timerRef);
    }, []);

    return (
        <div className="p-4 rounded-lg border border-amber-400/30 bg-amber-500/10">
            <div className="font-semibold text-amber-400">{label}</div>
            <div className="text-2xl font-mono mt-1">{count}s</div>
        </div>
    );
};

const KeepMountedDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="keepMounted vs unmount on leave"
                description="With keepMounted (default), once a component mounts it stays mounted even when scrolled out of view. Set keepMounted={false} to unmount when leaving the viewport — the counter resets each time."
            >
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm font-medium mb-2 opacity-70">keepMounted=true (default)</div>
                        <div className="h-48 overflow-y-auto rounded-lg border border-gray-700 p-4 space-y-96">
                            <div className="text-xs opacity-50 text-center">Scroll down, then back up — counter keeps running</div>
                            <DeferredView keepMounted>
                                <CounterComponent label="Persistent Counter" />
                            </DeferredView>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-medium mb-2 opacity-70">keepMounted=false</div>
                        <div className="h-48 overflow-y-auto rounded-lg border border-gray-700 p-4 space-y-96">
                            <div className="text-xs opacity-50 text-center">Scroll down, then back up — counter resets</div>
                            <DeferredView keepMounted={false}>
                                <CounterComponent label="Resetting Counter" />
                            </DeferredView>
                        </div>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`// Default: stays mounted once visible
<DeferredView keepMounted>
  <StatefulComponent />
</DeferredView>

// Unmounts when scrolled out of view
<DeferredView keepMounted={false}>
  <StatefulComponent />
</DeferredView>`}
                />
            </div>
        </>
    );
};

export default KeepMountedDemo;
