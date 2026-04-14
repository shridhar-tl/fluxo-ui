import React from 'react';
import { Rating, RatingVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const variants: RatingVariant[] = ['default', 'primary', 'success', 'warning', 'danger', 'info'];

const code = `<Rating variant="warning" defaultValue={4} />
<Rating variant="primary" defaultValue={4} />
<Rating variant="success" defaultValue={4} />
<Rating variant="danger" defaultValue={4} />
<Rating variant="info" defaultValue={4} />`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Color Variants" description="Six semantic color variants using theme CSS variables.">
            <div className="space-y-3">
                {variants.map((v) => (
                    <div key={v} className="flex items-center gap-4">
                        <span className="text-xs opacity-60 w-16">{v}</span>
                        <Rating variant={v} defaultValue={4} />
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
