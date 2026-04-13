import React from 'react';
import { DeferredView, ShimmerDiv } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const LoadedCard: React.FC = () => {
    return (
        <div className="p-6 rounded-lg border border-blue-400/30 bg-blue-500/10">
            <div className="text-lg font-semibold text-blue-400 mb-2">Content Loaded</div>
            <p className="text-sm opacity-70">This card replaced the shimmer placeholder when it entered the viewport.</p>
        </div>
    );
};

const shimmerPlaceholder = (
    <div className="space-y-3 p-6 rounded-lg border border-gray-700">
        <ShimmerDiv style={{ height: 20, width: '40%', borderRadius: 4 }} />
        <ShimmerDiv style={{ height: 14, width: '80%', borderRadius: 4 }} />
        <ShimmerDiv style={{ height: 14, width: '60%', borderRadius: 4 }} />
    </div>
);

const PlaceholderDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Custom placeholder"
                description="Use the placeholder prop to show a shimmer skeleton or any custom loading UI while the real content is deferred."
            >
                <div className="h-64 overflow-y-auto rounded-lg border border-gray-700 p-4 space-y-96 w-full">
                    <div className="text-center text-sm opacity-50 py-4">Scroll down to see the shimmer replaced by real content...</div>
                    <DeferredView placeholder={shimmerPlaceholder}>
                        <LoadedCard />
                    </DeferredView>
                    <DeferredView placeholder={shimmerPlaceholder}>
                        <LoadedCard />
                    </DeferredView>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { DeferredView, ShimmerDiv } from 'fluxo-ui';

const placeholder = (
  <div className="space-y-3 p-6">
    <ShimmerDiv style={{ height: 20, width: '40%', borderRadius: 4 }} />
    <ShimmerDiv style={{ height: 14, width: '80%', borderRadius: 4 }} />
  </div>
);

<DeferredView placeholder={placeholder}>
  <ExpensiveComponent />
</DeferredView>`}
                />
            </div>
        </>
    );
};

export default PlaceholderDemo;
