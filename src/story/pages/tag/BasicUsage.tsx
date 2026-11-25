import React from 'react';

import { Tag } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowStyle } from '../../demo-styles';

const code = `import { Tag } from 'fluxo-ui';

<Tag>Draft</Tag>
<Tag color="primary">In review</Tag>
<Tag color="success">Published</Tag>
<Tag color="warning">Expiring</Tag>
<Tag color="danger">Blocked</Tag>
<Tag color="info">Beta</Tag>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Status Tags" description="Use the color prop to give a tag a semantic meaning.">
            <div style={rowStyle}>
                <Tag>Draft</Tag>
                <Tag color="primary">In review</Tag>
                <Tag color="success">Published</Tag>
                <Tag color="warning">Expiring</Tag>
                <Tag color="danger">Blocked</Tag>
                <Tag color="info">Beta</Tag>
                <Tag color="secondary">Archived</Tag>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
