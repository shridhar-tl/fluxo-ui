import React from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ToggleButton checked={true} size="xs" onLabel="XS" />
<ToggleButton checked={true} size="sm" onLabel="Small" />
<ToggleButton checked={true} size="md" onLabel="Medium" />
<ToggleButton checked={true} size="lg" onLabel="Large" />
<ToggleButton checked={true} size="xl" onLabel="XL" />`;

const Sizes: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Toggle Button Sizes">
                <div className="flex flex-wrap items-center gap-4">
                    <ToggleButton checked={true} size="xs" onLabel="XS" />
                    <ToggleButton checked={true} size="sm" onLabel="Small" />
                    <ToggleButton checked={true} size="md" onLabel="Medium" />
                    <ToggleButton checked={true} size="lg" onLabel="Large" />
                    <ToggleButton checked={true} size="xl" onLabel="XL" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Sizes;
