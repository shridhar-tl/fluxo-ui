import React from 'react';

import { Avatar, Chip } from '../../../components';
import type { ChipShape, ChipSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { chipVariants, toneList } from './chip-story-data';

const sizes: ChipSize[] = ['sm', 'md', 'lg'];
const shapes: ChipShape[] = ['pill', 'rounded'];

const code = `<Chip variant="filled" color="primary">Filled</Chip>
<Chip variant="soft" color="success">Soft</Chip>
<Chip variant="outlined" color="danger">Outlined</Chip>
<Chip variant="elevated">Elevated</Chip>
<Chip size="lg" shape="rounded" avatar={<Avatar name="Ava Chen" size={24} />}>Ava Chen</Chip>`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Variants, Colors, Sizes & Shapes" description="Four variants in every tone, three sizes and two shapes.">
            <div style={stackStyle}>
                {chipVariants.map((variant) => (
                    <div key={variant} style={rowStyle}>
                        <span style={rowLabelStyle}>{variant}</span>
                        {toneList.map((tone) => (
                            <Chip key={tone} variant={variant} color={tone}>
                                {tone}
                            </Chip>
                        ))}
                    </div>
                ))}
                {shapes.map((shape) => (
                    <div key={shape} style={rowStyle}>
                        <span style={rowLabelStyle}>{shape}</span>
                        {sizes.map((size) => (
                            <Chip key={size} size={size} shape={shape} variant="outlined" avatar={<Avatar name="Ava Chen" size={size === 'lg' ? 26 : size === 'md' ? 22 : 18} />}>
                                Size {size}
                            </Chip>
                        ))}
                    </div>
                ))}
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>Custom</span>
                    <Chip color="#7c3aed" variant="filled">
                        Violet
                    </Chip>
                    <Chip color="#0891b2" variant="soft">
                        Teal
                    </Chip>
                    <Chip color="#facc15" variant="filled">
                        Lemon
                    </Chip>
                    <Chip color="#fde68a" textColor="#78350f" variant="filled">
                        Custom text
                    </Chip>
                    <Chip maxWidth={150} title="Chips truncate long labels with an ellipsis">
                        Chips truncate long labels with an ellipsis
                    </Chip>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
