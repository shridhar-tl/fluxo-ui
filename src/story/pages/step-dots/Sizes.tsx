import React from 'react';
import { StepDots } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<StepDots size="sm" count={5} activeIndex={2} />
<StepDots size="md" count={5} activeIndex={2} />
<StepDots size="lg" count={5} activeIndex={2} />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Three sizes" description="Default sizes scale all variants. 'sm' fits inline with text, 'lg' is suitable for hero carousels.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%' }}>
                <StepDots size="sm" count={5} activeIndex={2} />
                <StepDots size="md" count={5} activeIndex={2} />
                <StepDots size="lg" count={5} activeIndex={2} />
            </div>
        </ComponentDemo>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Sizes;
