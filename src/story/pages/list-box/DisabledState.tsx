import React from 'react';
import { ListBox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { frameworkOptions } from './list-box-story-data';

const DisabledState: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Fully disabled" description="The entire list is non-interactive when disabled is true.">
                <div className="w-full max-w-72">
                    <ListBox options={frameworkOptions} value="react" disabled />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={`<ListBox options={options} value={value} disabled />`} />
            </div>
        </>
    );
};

export default DisabledState;
