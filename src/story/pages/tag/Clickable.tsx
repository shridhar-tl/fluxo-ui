import React, { useState } from 'react';

import { ExternalLinkIcon } from '../../../assets/icons';
import { Tag } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';

const topics = ['All', 'Design', 'Engineering', 'Product', 'Research'];

const code = `<Tag
    color="primary"
    variant={active === topic ? 'solid' : 'outline'}
    selected={active === topic}
    onClick={() => setActive(topic)}
>
    {topic}
</Tag>

<Tag href="https://github.com" target="_blank" icon={ExternalLinkIcon} iconPosition="end">
    GitHub
</Tag>

<Tag disabled>Disabled</Tag>`;

const Clickable: React.FC = () => {
    const [active, setActive] = useState('All');

    return (
        <>
            <ComponentDemo title="Clickable, Links & Selection" description="Tags render as buttons when given onClick and as links when given href.">
                <div style={stackStyle}>
                    <div style={rowStyle}>
                        <span style={rowLabelStyle}>Filter</span>
                        {topics.map((topic) => (
                            <Tag
                                key={topic}
                                color="primary"
                                shape="pill"
                                variant={active === topic ? 'solid' : 'outline'}
                                selected={active === topic}
                                onClick={() => setActive(topic)}
                            >
                                {topic}
                            </Tag>
                        ))}
                    </div>
                    <div style={rowStyle}>
                        <span style={rowLabelStyle}>Links</span>
                        <Tag href="https://github.com" target="_blank" icon={ExternalLinkIcon} iconPosition="end">
                            GitHub
                        </Tag>
                        <Tag href="https://react.dev" target="_blank" rel="noopener noreferrer" color="info" icon={ExternalLinkIcon} iconPosition="end">
                            React docs
                        </Tag>
                    </div>
                    <div style={rowStyle}>
                        <span style={rowLabelStyle}>Disabled</span>
                        <Tag disabled onClick={() => setActive('All')}>
                            Disabled
                        </Tag>
                        <Tag disabled color="danger" closable>
                            Locked
                        </Tag>
                    </div>
                    <div style={readoutStyle}>
                        Showing posts in <strong style={{ color: 'var(--eui-text)' }}>{active}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Clickable;
