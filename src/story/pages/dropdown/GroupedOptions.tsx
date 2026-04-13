import React, { useState } from 'react';
import { Dropdown as DropdownRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { groupedOptions } from './dropdown-story-data';

const Dropdown = withFieldLabel(DropdownRaw);

const code = `const groupedOptions = [
  {
    label: 'Frontend',
    items: [
      { label: 'React', value: 'react' },
      { label: 'Vue.js', value: 'vue' },
      { label: 'Angular', value: 'angular' },
    ],
  },
  {
    label: 'Backend',
    items: [
      { label: 'Node.js', value: 'nodejs' },
      { label: 'Django', value: 'django' },
    ],
  },
];

<Dropdown
  label="Technology"
  placeholder="Select a technology..."
  options={groupedOptions}
  value={value}
  onChange={setValue}
  searchable
/>`;

const GroupedOptions: React.FC = () => {
    const [groupedValue, setGroupedValue] = useState('');

    return (
        <>
            <ComponentDemo title="Dropdown with Grouped Items">
                <div className="w-full max-w-sm">
                    <Dropdown
                        label="Technology"
                        placeholder="Select a technology..."
                        options={groupedOptions}
                        value={groupedValue}
                        onChange={(e) => setGroupedValue(e.value)}
                        searchable
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
