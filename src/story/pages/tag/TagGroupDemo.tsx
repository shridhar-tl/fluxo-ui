import React from 'react';

import { Card, Tag, TagGroup } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle, stackStyle } from '../../demo-styles';
import { frameworkTags } from './tag-story-data';

const code = `<TagGroup max={4} expandable color="primary" ariaLabel="Tech stack">
    {stack.map((name) => <Tag key={name}>{name}</Tag>)}
</TagGroup>

<TagGroup
    max={3}
    expandable
    collapseLabel="Hide"
    renderOverflow={(hidden, expanded) => (expanded ? 'Hide' : \`\${hidden} more\`)}
>
    {stack.map((name) => <Tag key={name}>{name}</Tag>)}
</TagGroup>

<TagGroup wrap={false} size="sm" variant="outline" shape="pill">
    {stack.map((name) => <Tag key={name}>{name}</Tag>)}
</TagGroup>`;

const TagGroupDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Tag Groups & Overflow"
            description="Group tags to share defaults and collapse extras into a +N tag that can expand in place."
        >
            <div style={stackStyle}>
                <div style={stackStyle}>
                    <span style={rowLabelStyle}>Expandable</span>
                    <TagGroup max={4} expandable color="primary" ariaLabel="Tech stack">
                        {frameworkTags.map((name) => (
                            <Tag key={name}>{name}</Tag>
                        ))}
                    </TagGroup>
                </div>
                <div style={stackStyle}>
                    <span style={rowLabelStyle}>Custom overflow label</span>
                    <TagGroup
                        max={3}
                        expandable
                        variant="soft"
                        color="info"
                        collapseLabel="Hide"
                        renderOverflow={(hidden, expanded) => (expanded ? 'Hide' : `${hidden} more`)}
                        ariaLabel="Topics"
                    >
                        {frameworkTags.map((name) => (
                            <Tag key={name}>{name}</Tag>
                        ))}
                    </TagGroup>
                </div>
                <div style={stackStyle}>
                    <span style={rowLabelStyle}>Single line, no wrap</span>
                    <div style={{ maxWidth: 360, width: '100%', overflowX: 'auto' }}>
                        <TagGroup wrap={false} size="sm" variant="outline" shape="pill" ariaLabel="Scrollable labels">
                            {frameworkTags.map((name) => (
                                <Tag key={name}>{name}</Tag>
                            ))}
                        </TagGroup>
                    </div>
                </div>
                <div style={stackStyle}>
                    <span style={rowLabelStyle}>Shared defaults</span>
                    <TagGroup size="sm" variant="outline" shape="pill" gap="xs" ariaLabel="Labels">
                        {frameworkTags.slice(0, 6).map((name) => (
                            <Tag key={name}>{name}</Tag>
                        ))}
                    </TagGroup>
                </div>
                <div style={{ maxWidth: 360, width: '100%' }}>
                    <Card title="Senior Frontend Engineer" subtitle="Remote · Full-time">
                        <TagGroup max={3} size="sm" ariaLabel="Required skills">
                            {frameworkTags.map((name) => (
                                <Tag key={name}>{name}</Tag>
                            ))}
                        </TagGroup>
                    </Card>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default TagGroupDemo;
