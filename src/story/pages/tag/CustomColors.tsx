import React from 'react';

import { Tag } from '../../../components';
import type { TagVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { customColorTags, gradients } from './tag-story-data';

const customVariants: TagVariant[] = ['solid', 'soft', 'outline', 'dot'];

const code = `<Tag color="#7c3aed" variant="solid">Design</Tag>
<Tag color="#facc15" variant="solid">Lemon</Tag>
<Tag color="#db2777" textColor="#ffffff">Fixed text color</Tag>
<Tag variant="gradient" gradient={{ from: '#f97316', to: '#db2777' }}>Sunset</Tag>`;

const CustomColors: React.FC = () => (
    <>
        <ComponentDemo
            title="Custom Colors & Gradients"
            description="Pass any CSS color. Solid tags pick a readable text color automatically, even on bright colors like yellow."
        >
            <div style={stackStyle}>
                {customVariants.map((variant) => (
                    <div key={variant} style={rowStyle}>
                        <span style={rowLabelStyle}>{variant}</span>
                        {customColorTags.map((tag) => (
                            <Tag key={tag.label} color={tag.color} variant={variant}>
                                {tag.label}
                            </Tag>
                        ))}
                    </div>
                ))}
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>Gradient</span>
                    {gradients.map((g) => (
                        <Tag key={g.label} variant="gradient" shape="pill" gradient={{ from: g.from, to: g.to }}>
                            {g.label}
                        </Tag>
                    ))}
                    <Tag variant="gradient" color="success" shape="pill">
                        Tone gradient
                    </Tag>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default CustomColors;
