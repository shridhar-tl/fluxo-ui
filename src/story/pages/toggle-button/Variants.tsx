import React from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ToggleButton checked={true} variant="primary" onLabel="Primary" />
<ToggleButton checked={true} variant="success" onLabel="Success" />
<ToggleButton checked={true} variant="warning" onLabel="Warning" />
<ToggleButton checked={true} variant="danger" onLabel="Danger" />
<ToggleButton checked={true} variant="info" onLabel="Info" />
<ToggleButton checked={true} variant="secondary" onLabel="Secondary" />`;

const Variants: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Toggle Button Variants">
                <div className="grid grid-cols-2 gap-4">
                    <ToggleButton checked={true} variant="primary" onLabel="Primary" />
                    <ToggleButton checked={true} variant="success" onLabel="Success" />
                    <ToggleButton checked={true} variant="warning" onLabel="Warning" />
                    <ToggleButton checked={true} variant="danger" onLabel="Danger" />
                    <ToggleButton checked={true} variant="info" onLabel="Info" />
                    <ToggleButton checked={true} variant="secondary" onLabel="Secondary" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default Variants;
