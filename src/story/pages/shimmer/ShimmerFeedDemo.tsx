import React from 'react';
import { ShimmerFeed } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const ShimmerFeedDemo: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Feed / list skeleton" description="Pre-built skeleton for card feeds and list views with avatar and content lines.">
                <div className="w-full max-w-md">
                    <ShimmerFeed count={4} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`import { ShimmerFeed } from 'ether-ui';

{isLoading && <ShimmerFeed />}
{!isLoading && <FeedList items={items} />}`}
                />
            </div>
        </>
    );
};

export default ShimmerFeedDemo;
