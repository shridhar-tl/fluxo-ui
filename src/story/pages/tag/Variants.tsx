import React from 'react';

import { Tag } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { toneList, variantList } from './tag-story-data';

const code = `<Tag variant="soft" color="primary">Soft</Tag>
<Tag variant="solid" color="primary">Solid</Tag>
<Tag variant="outline" color="primary">Outline</Tag>
<Tag variant="dashed" color="primary">Dashed</Tag>
<Tag variant="dot" color="success">Online</Tag>
<Tag variant="ghost" color="primary">Ghost</Tag>
<Tag variant="gradient" color="primary">Gradient</Tag>
<Tag variant="soft" color="primary" bordered>Bordered soft</Tag>`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Variants × Colors" description="Seven variants work with every semantic color in light and dark mode.">
            <div style={stackStyle}>
                {variantList.map((variant) => (
                    <div key={variant} style={rowStyle}>
                        <span style={rowLabelStyle}>{variant}</span>
                        {toneList.map((tone) => (
                            <Tag key={tone} variant={variant} color={tone}>
                                {tone}
                            </Tag>
                        ))}
                    </div>
                ))}
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>bordered</span>
                    {toneList.map((tone) => (
                        <Tag key={tone} color={tone} bordered>
                            {tone}
                        </Tag>
                    ))}
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
