import React, { useState } from 'react';
import { Multiselect as MultiselectRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { colorOptions } from './multiselect-story-data';

const Multiselect = withFieldLabel(MultiselectRaw);

const code = `<Multiselect
  label="Favorite Colors (Max 3)"
  placeholder="Choose up to 3 colors..."
  options={colorOptions}
  value={values}
  onChange={setValues}
  maxSelections={3}
/>`;

const SelectionLimit: React.FC = () => {
    const [limitedValues, setLimitedValues] = useState<string[]>(['red', 'blue']);

    return (
        <>
            <ComponentDemo title="Maximum 3 Selections">
                <div className="w-full max-w-sm">
                    <Multiselect
                        label="Favorite Colors (Max 3)"
                        placeholder="Choose up to 3 colors..."
                        options={colorOptions}
                        value={limitedValues}
                        onChange={(e) => setLimitedValues(e.value)}
                        maxSelections={3}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default SelectionLimit;
