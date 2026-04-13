import React from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Button onClick={async () => {
  await fetch('/api/data');
}}>
  Save Data
</Button>`;

const AsyncAction: React.FC = () => (
    <>
        <ComponentDemo title="Automatic Loading State for Async Actions">
            <div className="flex flex-wrap gap-4">
                <Button onClick={async () => {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    alert('Action completed!');
                }}>
                    Async Action (Auto Loading)
                </Button>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default AsyncAction;
