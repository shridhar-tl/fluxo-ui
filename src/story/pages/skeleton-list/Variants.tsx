import React from 'react';
import { SkeletonList } from '../../../components';
import type { SkeletonListVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<SkeletonList variant="thumbnail" rows={4} />
<SkeletonList variant="card-stack" rows={3} />
<SkeletonList variant="chat" rows={6} />
<SkeletonList variant="media" rows={3} />`;

const variants: { variant: SkeletonListVariant; title: string; description: string; rows?: number }[] = [
    { variant: 'simple', title: 'Simple', description: 'Single text line per row.' },
    { variant: 'avatar-text', title: 'Avatar + text', description: 'Avatar with one line of text.' },
    { variant: 'avatar-two-line', title: 'Avatar two-line (default)', description: 'Avatar + title + subtitle + trailing meta.' },
    { variant: 'thumbnail', title: 'Thumbnail', description: 'Square thumbnail + two-line description.' },
    { variant: 'two-line-action', title: 'Two-line with action', description: 'Two-line description with a trailing pill-shaped action.' },
    { variant: 'card-stack', title: 'Card stack', description: 'Each item rendered as a media card with body text.', rows: 2 },
    { variant: 'comment', title: 'Comment', description: 'Compact avatar + author + multi-line body.', rows: 3 },
    { variant: 'chat', title: 'Chat bubbles', description: 'Alternating left/right bubble placeholders.', rows: 5 },
    { variant: 'media', title: 'Media tile', description: '16:9 image placeholder with two text lines.', rows: 2 },
];

const Variants: React.FC = () => (
    <>
        {variants.map((v, i) => (
            <ComponentDemo key={v.variant} title={v.title} description={v.description} className={i === 0 ? '' : 'mt-4'}>
                <div style={{ width: '100%', maxWidth: 480, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden', background: 'var(--eui-bg)' }}>
                    <SkeletonList variant={v.variant} rows={v.rows ?? 4} />
                </div>
            </ComponentDemo>
        ))}
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Variants;
