import React from 'react';
import { Rating, RatingShape } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const shapes: { shape: RatingShape; label: string; variant: 'warning' | 'danger' | 'primary' | 'success' | 'info' }[] = [
    { shape: 'star', label: 'Stars', variant: 'warning' },
    { shape: 'heart', label: 'Hearts', variant: 'danger' },
    { shape: 'thumb', label: 'Thumbs', variant: 'primary' },
    { shape: 'circle', label: 'Circles', variant: 'info' },
    { shape: 'square', label: 'Squares', variant: 'success' },
];

const code = `<Rating shape="star" defaultValue={3} />
<Rating shape="heart" variant="danger" defaultValue={3} />
<Rating shape="thumb" variant="primary" defaultValue={3} />
<Rating shape="circle" variant="info" defaultValue={3} />
<Rating shape="square" variant="success" defaultValue={3} />`;

const Shapes: React.FC = () => (
    <>
        <ComponentDemo title="Shapes" description="Five built-in shapes: star, heart, thumb, circle, and square.">
            <div className="space-y-4">
                {shapes.map(({ shape, label, variant }) => (
                    <div key={shape} className="flex items-center gap-4">
                        <span className="text-xs opacity-60 w-16">{label}</span>
                        <Rating shape={shape} variant={variant} defaultValue={3} />
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Shapes;
