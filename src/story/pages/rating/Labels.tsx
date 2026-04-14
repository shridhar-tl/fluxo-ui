import React from 'react';
import { Rating } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const tooltips = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

const code = `<Rating
  tooltips={['Terrible', 'Bad', 'Okay', 'Good', 'Excellent']}
  labels={['Terrible', 'Bad', 'Okay', 'Good', 'Excellent']}
  defaultValue={4}
/>`;

const Labels: React.FC = () => (
    <>
        <ComponentDemo
            title="Tooltips & Labels"
            description="Show a dynamic label based on the current hover or selection, plus per-star tooltips."
        >
            <div className="space-y-6">
                <div>
                    <div className="text-sm mb-2 opacity-70">With tooltips (hover a star)</div>
                    <Rating tooltips={tooltips} defaultValue={3} />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">With dynamic label</div>
                    <Rating tooltips={tooltips} labels={tooltips} defaultValue={4} />
                </div>
                <div>
                    <div className="text-sm mb-2 opacity-70">Custom count (10 stars)</div>
                    <Rating count={10} defaultValue={7} showValue />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Labels;
