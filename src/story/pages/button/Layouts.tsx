import React from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Button layout="default" variant="primary">Default</Button>
<Button layout="outlined" variant="primary">Outlined</Button>
<Button layout="sharp" variant="primary">Sharp</Button>
<Button layout="rounded" variant="primary">Rounded</Button>
<Button layout="plain" variant="primary">Plain</Button>`;

const Layouts: React.FC = () => (
    <>
        <ComponentDemo title="All Button Layouts">
            <div className="flex flex-wrap gap-4">
                <Button layout="default" variant="primary">Default</Button>
                <Button layout="outlined" variant="primary">Outlined</Button>
                <Button layout="sharp" variant="primary">Sharp</Button>
                <Button layout="rounded" variant="primary">Rounded</Button>
                <Button layout="plain" variant="primary">Plain</Button>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default Layouts;
