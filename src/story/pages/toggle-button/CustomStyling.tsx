import React from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ToggleButton
  checked={true}
  onLabel="Active"
  offLabel="Inactive"
  variant="success"
  className="font-bold"
/>

<ToggleButton
  checked={false}
  onLabel="Yes"
  offLabel="No"
  variant="primary"
  size="lg"
/>`;

const CustomStyling: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Customized Toggle Buttons">
                <div className="flex flex-wrap gap-4">
                    <ToggleButton checked={true} onLabel="Active" offLabel="Inactive" variant="success" className="font-bold" />
                    <ToggleButton checked={false} onLabel="Yes" offLabel="No" variant="primary" size="lg" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CustomStyling;
