import React from 'react';
import { ShimmerDiv } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const ProfileCard: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Custom card layout" description="Combine ShimmerDiv blocks to create any skeleton layout.">
                <div className="flex gap-4 w-full max-w-md">
                    <ShimmerDiv style={{ width: 56, height: 56, borderRadius: '50%' }} />
                    <div className="flex-1 space-y-3 pt-1">
                        <ShimmerDiv style={{ height: 16, width: '50%', borderRadius: 4 }} />
                        <ShimmerDiv style={{ height: 12, width: '80%', borderRadius: 4 }} />
                        <ShimmerDiv style={{ height: 12, width: '65%', borderRadius: 4 }} />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<div className="flex gap-4">
  <ShimmerDiv width={56} height={56} borderRadius="50%" />
  <div className="flex-1 space-y-2">
    <ShimmerDiv height={16} width="50%" borderRadius={4} />
    <ShimmerDiv height={12} width="80%" borderRadius={4} />
  </div>
</div>`}
                />
            </div>
        </>
    );
};

export default ProfileCard;
