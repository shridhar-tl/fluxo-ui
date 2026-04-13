import React from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Button } from 'fluxo-ui';

<Button onClick={() => console.log('Clicked!')}>Click me</Button>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Default Button">
            <Button onClick={() => alert('Clicked!')}>Click me</Button>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock title="Basic Example" code={code} />
        </div>
    </>
);

export default BasicUsage;
