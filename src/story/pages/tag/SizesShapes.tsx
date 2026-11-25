import React from 'react';

import { Tag } from '../../../components';
import type { TagShape, TagSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';

const sizes: TagSize[] = ['xs', 'sm', 'md', 'lg'];
const shapes: TagShape[] = ['rounded', 'pill', 'square'];

const code = `<Tag size="xs">Extra small</Tag>
<Tag size="lg" shape="pill" color="primary">Large pill</Tag>
<Tag shape="square" variant="solid" color="danger">Square</Tag>
<Tag uppercase variant="solid" color="info" size="sm">New</Tag>
<Tag elevated variant="outline">Elevated</Tag>
<Tag maxWidth={140}>A very long label that truncates gracefully</Tag>`;

const SizesShapes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes, Shapes & Styling" description="Four sizes, three shapes, uppercase labels, elevation and truncation.">
            <div style={stackStyle}>
                {shapes.map((shape) => (
                    <div key={shape} style={rowStyle}>
                        <span style={rowLabelStyle}>{shape}</span>
                        {sizes.map((size) => (
                            <Tag key={size} size={size} shape={shape} color="primary">
                                Size {size}
                            </Tag>
                        ))}
                    </div>
                ))}
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>Styling</span>
                    <Tag uppercase variant="solid" color="info" size="sm">
                        New
                    </Tag>
                    <Tag uppercase color="warning" size="xs">
                        Limited
                    </Tag>
                    <Tag elevated variant="outline">
                        Elevated
                    </Tag>
                    <Tag elevated variant="solid" color="success" shape="pill">
                        Elevated solid
                    </Tag>
                    <Tag maxWidth={140} title="A very long label that truncates gracefully">
                        A very long label that truncates gracefully
                    </Tag>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default SizesShapes;
