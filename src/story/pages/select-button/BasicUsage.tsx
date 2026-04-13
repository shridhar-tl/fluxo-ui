import cn from 'classnames';
import React, { useState } from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicOptions } from './select-button-story-data';

const code = `import { SelectButton } from 'ether-ui';

function MyComponent() {
  const [value, setValue] = useState('option2');

  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];

  return (
    <SelectButton
      items={options}
      value={value}
      onChange={(e) => setValue(e.value)}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [singleValue, setSingleValue] = useState('option2');

    return (
        <>
            <ComponentDemo title="Single Selection">
                <SelectButton items={basicOptions} value={singleValue} onChange={(e) => setSingleValue(e.value)} />
                <div className={cn('mt-4 text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Selected: {singleValue}</div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
