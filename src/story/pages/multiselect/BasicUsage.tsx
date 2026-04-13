import React, { useState } from 'react';
import { Multiselect as MultiselectRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { frameworkOptions } from './multiselect-story-data';

const Multiselect = withFieldLabel(MultiselectRaw);

const code = `import { Multiselect } from 'ether-ui';

function MyComponent() {
  const [values, setValues] = useState(['react', 'typescript']);

  const options = [
    { label: 'React', value: 'react' },
    { label: 'Vue.js', value: 'vue' },
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    // ... more options
  ];

  return (
    <Multiselect
      label="Technologies"
      placeholder="Select technologies..."
      options={options}
      value={values}
      onChange={setValues}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const [basicValues, setBasicValues] = useState<string[]>(['react', 'typescript']);

    return (
        <>
            <ComponentDemo title="Basic Multiselect">
                <div className="w-full max-w-sm">
                    <Multiselect
                        label="Technologies"
                        placeholder="Select technologies..."
                        options={frameworkOptions}
                        value={basicValues}
                        onChange={(e) => setBasicValues(e.value)}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
