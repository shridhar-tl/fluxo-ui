import React, { useState } from 'react';
import { DeferredView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const RootMarginDemo: React.FC = () => {
    const [loaded, setLoaded] = useState<string[]>([]);

    const trackLoad = (id: string) => {
        setLoaded((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    return (
        <>
            <ComponentDemo
                title="Root margin for preloading"
                description='Use rootMargin to start loading content before it enters the viewport. With rootMargin="200px", components begin mounting 200px before they scroll into view.'
            >
                <div className="w-full space-y-4">
                    <div className="text-sm opacity-70">
                        Loaded: {loaded.length === 0 ? 'None yet' : loaded.join(', ')}
                    </div>
                    <div className="h-64 overflow-y-auto rounded-lg border border-gray-700 p-4 space-y-96">
                        <div className="text-center text-sm opacity-50 py-4">Components below load 200px before they enter the visible area</div>
                        {['Card A', 'Card B', 'Card C'].map((name) => (
                            <DeferredView key={name} rootMargin="200px">
                                <PreloadTracker name={name} onLoad={trackLoad} />
                            </DeferredView>
                        ))}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`// Preload 200px before entering viewport
<DeferredView rootMargin="200px">
  <HeavyComponent />
</DeferredView>

// Preload 50% of viewport height ahead
<DeferredView rootMargin="50%">
  <HeavyComponent />
</DeferredView>`}
                />
            </div>
        </>
    );
};

const PreloadTracker: React.FC<{ name: string; onLoad: (name: string) => void }> = ({ name, onLoad }) => {
    const hasLogged = React.useRef(false);
    React.useEffect(() => {
        if (!hasLogged.current) {
            hasLogged.current = true;
            onLoad(name);
        }
    }, [name, onLoad]);

    return (
        <div className="p-4 rounded-lg border border-purple-400/30 bg-purple-500/10">
            <div className="font-semibold text-purple-400">{name} — Preloaded</div>
            <p className="text-sm opacity-70 mt-1">This loaded before it was visible thanks to rootMargin.</p>
        </div>
    );
};

export default RootMarginDemo;
