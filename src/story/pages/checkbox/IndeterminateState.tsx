import React from 'react';
import { Checkbox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Checkbox indeterminate label="Select All" />
<div className="ml-6 space-y-2">
  <Checkbox label="Item 1" checked={true} onChange={handleChange} />
  <Checkbox label="Item 2" checked={false} onChange={handleChange} />
  <Checkbox label="Item 3" checked={true} onChange={handleChange} />
</div>`;

const IndeterminateState: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Indeterminate Checkbox">
                <div className="space-y-3">
                    <Checkbox indeterminate label="Select All" />
                    <div className="ml-6 space-y-2">
                        <Checkbox label="Item 1" checked={true} onChange={() => {}} />
                        <Checkbox label="Item 2" checked={false} onChange={() => {}} />
                        <Checkbox label="Item 3" checked={true} onChange={() => {}} />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default IndeterminateState;
