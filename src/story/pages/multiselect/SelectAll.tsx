import React, { useState } from 'react';
import { Multiselect as MultiselectRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { skillOptions } from './multiselect-story-data';

const Multiselect = withFieldLabel(MultiselectRaw);

const code = `<Multiselect
  label="Skills"
  placeholder="Select your skills..."
  options={skillOptions}
  value={values}
  onChange={setValues}
  showSelectAll
/>`;

const SelectAll: React.FC = () => {
    const [selectAllValues, setSelectAllValues] = useState<string[]>([]);

    return (
        <>
            <ComponentDemo title="Multiselect with Select All">
                <div className="w-full max-w-sm">
                    <Multiselect
                        label="Skills"
                        placeholder="Select your skills..."
                        options={skillOptions}
                        value={selectAllValues}
                        onChange={(e) => setSelectAllValues(e.value)}
                        showSelectAll
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default SelectAll;
