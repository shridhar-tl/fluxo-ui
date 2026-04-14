import React from 'react';
import { Rating, RatingSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sizes: RatingSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

const code = `<Rating defaultValue={3} size="xs" />
<Rating defaultValue={3} size="sm" />
<Rating defaultValue={3} size="md" />
<Rating defaultValue={3} size="lg" />
<Rating defaultValue={3} size="xl" />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes" description="Five sizes from xs to xl with proportional icon scaling.">
            <div className="space-y-4">
                {sizes.map((s) => (
                    <div key={s} className="flex items-center gap-4">
                        <span className="text-xs opacity-60 w-8">{s}</span>
                        <Rating defaultValue={3} size={s} />
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
