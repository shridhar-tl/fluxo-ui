import React, { useState } from 'react';
import { Checkbox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const [values, setValues] = useState({
  option1: true,
  option2: false,
  option3: true
});

const handleChange = (key) => (e) => {
  setValues(prev => ({
    ...prev,
    [key]: e.value
  }));
};

<Checkbox
  checked={values.option1}
  onChange={handleChange('option1')}
  label="Option 1"
/>
<Checkbox
  checked={values.option2}
  onChange={handleChange('option2')}
  label="Option 2"
/>
<Checkbox
  checked={values.option3}
  onChange={handleChange('option3')}
  label="Option 3"
/>`;

const CheckboxGroup: React.FC = () => {
    const [groupValues, setGroupValues] = useState({
        option1: true,
        option2: false,
        option3: true,
    });

    const handleGroupChange = (key: string) => (e: any) => {
        setGroupValues((prev) => ({
            ...prev,
            [key]: e.value,
        }));
    };

    return (
        <>
            <ComponentDemo title="Multiple Checkboxes">
                <div className="space-y-3">
                    <Checkbox checked={groupValues.option1} onChange={handleGroupChange('option1')} label="Option 1" />
                    <Checkbox checked={groupValues.option2} onChange={handleGroupChange('option2')} label="Option 2" />
                    <Checkbox checked={groupValues.option3} onChange={handleGroupChange('option3')} label="Option 3" />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CheckboxGroup;
