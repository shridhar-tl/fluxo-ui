import cn from 'classnames';
import React, { useState } from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { multipleOptions } from './select-button-story-data';

const code = `const [value, setValue] = useState<string[]>(['option2', 'option3']);

const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
  { label: 'Option 4', value: 'option4' },
];

<SelectButton
  items={options}
  value={value}
  onChange={(e) => setValue(e.value)}
  multiple
/>`;

const MultipleSelection: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [multipleValue, setMultipleValue] = useState<string[]>(['option2', 'option3']);

    return (
        <>
            <ComponentDemo title="Multiple Selection Mode">
                <SelectButton items={multipleOptions} value={multipleValue} onChange={(e) => setMultipleValue(e.value)} multiple />
                <div className={cn('mt-4 text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    Selected: {multipleValue.join(', ')}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default MultipleSelection;
