import cn from 'classnames';
import React, { useState } from 'react';
import { ListBox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { roleOptions } from './list-box-story-data';

const MultipleSelection: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [multi, setMulti] = useState<string[]>([]);

    return (
        <>
            <ComponentDemo
                title="Multi-select with select-all"
                description="Select multiple items. Shift-click or use the Select All checkbox."
            >
                <div className="w-full max-w-72">
                    <ListBox
                        options={roleOptions}
                        value={multi}
                        onChange={(v) => setMulti(v as string[])}
                        multiple
                        selectAll
                        clearable
                    />
                </div>
                {multi.length > 0 && (
                    <p className={cn('text-sm mt-3', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                        Selected: <span className={cn('font-medium', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>{multi.join(', ')}</span>
                    </p>
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const [values, setValues] = useState<string[]>([]);

<ListBox
  options={options}
  value={values}
  onChange={(v) => setValues(v as string[])}
  multiple
  selectAll
  clearable
/>`}
                />
            </div>
        </>
    );
};

export default MultipleSelection;
