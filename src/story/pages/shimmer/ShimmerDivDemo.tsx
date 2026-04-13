import React from 'react';
import { ShimmerDiv } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const ShimmerDivDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Flexible shimmer block" description="The base building block for custom skeleton layouts.">
                <div className="space-y-3 w-full max-w-sm">
                    <ShimmerDiv style={{ height: 20, width: '60%', borderRadius: 4 }} />
                    <ShimmerDiv style={{ height: 14, width: '90%', borderRadius: 4 }} />
                    <ShimmerDiv style={{ height: 14, width: '75%', borderRadius: 4 }} />
                    <ShimmerDiv style={{ height: 14, width: '80%', borderRadius: 4 }} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { ShimmerDiv } from 'fluxo-ui';

<ShimmerDiv height={20} width="60%" borderRadius={4} />
<ShimmerDiv height={14} width="90%" borderRadius={4} />
<ShimmerDiv height={14} width="75%" borderRadius={4} />`}
                />
            </div>
        </>
    );
};

export default ShimmerDivDemo;
