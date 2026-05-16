import React from 'react';
import { StepDots } from '../../../components';
import type { StepDotsVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const variants: { variant: StepDotsVariant; title: string; description: string }[] = [
    { variant: 'dot', title: 'Dot (default)', description: 'Active dot stretches into a pill.' },
    { variant: 'bar', title: 'Bar', description: 'Horizontal bars — works well with edge-to-edge carousels.' },
    { variant: 'pill', title: 'Pill', description: 'All completed/active dots fill — minimal animation.' },
    { variant: 'numbered', title: 'Numbered', description: 'Each step shows its number — for guided wizards.' },
];

const code = `<StepDots variant="bar" count={5} activeIndex={2} />`;

const Variants: React.FC = () => (
    <>
        {variants.map(({ variant, title, description }) => (
            <ComponentDemo key={variant} title={title} description={description} className={variant === 'dot' ? '' : 'mt-4'}>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <StepDots variant={variant} count={5} activeIndex={2} />
                </div>
            </ComponentDemo>
        ))}
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Variants;
