import React from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Button waitFor={5} variant="warning">
  Confirm Action
</Button>`;

const CountdownTimer: React.FC = () => (
    <>
        <ComponentDemo title="Button with Countdown (waitFor)">
            <div className="flex flex-wrap gap-4">
                <Button waitFor={5} variant="warning">Confirm Action</Button>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default CountdownTimer;
