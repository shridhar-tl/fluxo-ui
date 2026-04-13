import React, { useState } from 'react';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Button>Normal</Button>
<Button disabled>Disabled</Button>
<Button isLoading={loading} onClick={handleAsyncAction}>
  {loading ? 'Loading...' : 'Async Action'}
</Button>`;

const States: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleAsyncAction = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <>
            <ComponentDemo title="Button States">
                <div className="flex flex-wrap gap-4">
                    <Button>Normal</Button>
                    <Button disabled>Disabled</Button>
                    <Button isLoading={loading} onClick={handleAsyncAction}>
                        {loading ? 'Loading...' : 'Async Action'}
                    </Button>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default States;
