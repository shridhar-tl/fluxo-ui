import React from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Button href="https://example.com" variant="primary">
  External Link
</Button>
<Button href="https://example.com" newTab variant="secondary">
  Open in New Tab
</Button>`;

const AsLink: React.FC = () => (
    <>
        <ComponentDemo title="Button as Link">
            <div className="flex flex-wrap gap-4">
                <Button href="https://example.com" variant="primary">External Link</Button>
                <Button href="https://example.com" newTab variant="secondary">Open in New Tab</Button>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default AsLink;
