import React, { useState } from 'react';
import { Dropdown as DropdownRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { frameworkOptions } from './dropdown-story-data';

const Dropdown = withFieldLabel(DropdownRaw);

const code = `const frameworkOptions = [
  { label: 'React', value: 'react' },
  { label: 'Vue.js', value: 'vue' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  // ... more options
];

<Dropdown
  label="Frontend Framework"
  placeholder="Search frameworks..."
  options={frameworkOptions}
  value={value}
  onChange={setValue}
  searchable
/>`;

const SearchableDropdown: React.FC = () => {
    const [searchableValue, setSearchableValue] = useState('react');

    return (
        <>
            <ComponentDemo title="Dropdown with Search">
                <div className="w-full max-w-sm">
                    <Dropdown
                        label="Frontend Framework"
                        placeholder="Search frameworks..."
                        options={frameworkOptions}
                        value={searchableValue}
                        onChange={(e) => setSearchableValue(e.value)}
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

export default SearchableDropdown;
