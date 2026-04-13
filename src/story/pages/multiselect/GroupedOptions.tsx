import React, { useState } from 'react';
import { Multiselect as MultiselectRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { groupedOptions } from './multiselect-story-data';

const Multiselect = withFieldLabel(MultiselectRaw);

const code = `const groupedOptions = [
  {
    label: 'Frontend',
    items: [
      { label: 'React', value: 'react' },
      { label: 'Vue.js', value: 'vue' },
      { label: 'Angular', value: 'angular' },
      { label: 'Svelte', value: 'svelte' },
    ],
  },
  {
    label: 'Backend',
    items: [
      { label: 'Node.js', value: 'nodejs' },
      { label: 'Django', value: 'django' },
      { label: 'Spring Boot', value: 'spring' },
      { label: 'Laravel', value: 'laravel' },
    ],
  },
  {
    label: 'Mobile',
    items: [
      { label: 'React Native', value: 'react-native' },
      { label: 'Flutter', value: 'flutter' },
      { label: 'Swift', value: 'swift', disabled: true },
    ],
  },
];

<Multiselect
  label="Technologies"
  placeholder="Select technologies..."
  options={groupedOptions}
  value={values}
  onChange={setValues}
  showSelectAll={false}
/>`;

const GroupedOptions: React.FC = () => {
    const [groupedValues, setGroupedValues] = useState<string[]>(['react', 'nodejs']);

    return (
        <>
            <ComponentDemo title="Multiselect with Grouped Items">
                <div className="w-full max-w-sm">
                    <Multiselect
                        label="Technologies"
                        placeholder="Select technologies..."
                        options={groupedOptions}
                        value={groupedValues}
                        onChange={(e) => setGroupedValues(e.value)}
                        showSelectAll={false}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default GroupedOptions;
