import React from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Button fullWidth>Full Width Button</Button>`;

const FullWidth: React.FC = () => (
    <>
        <ComponentDemo title="Full Width Button" centered={false}>
            <Button fullWidth>Full Width Button</Button>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default FullWidth;
