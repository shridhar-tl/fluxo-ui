import React from 'react';
import { Multiselect as MultiselectRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { colorOptions } from './multiselect-story-data';

const Multiselect = withFieldLabel(MultiselectRaw);

const code = `<Multiselect
  label="Options"
  placeholder="Select options..."
  options={options}
  searchable={false}
/>`;

const WithoutSearch: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Non-searchable Multiselect">
                <div className="w-full max-w-sm">
                    <Multiselect label="Options" placeholder="Select options..." options={colorOptions} searchable={false} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default WithoutSearch;
