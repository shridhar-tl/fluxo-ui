import cn from 'classnames';
import React, { useState } from 'react';
import { ListBox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { groupedOptions } from './list-box-story-data';

const GroupedList: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [grouped, setGrouped] = useState<string[]>([]);

    return (
        <>
            <ComponentDemo title="Group by category" description="Items grouped by their category with sticky group headers.">
                <div className="w-full max-w-72">
                    <ListBox
                        options={groupedOptions}
                        value={grouped}
                        onChange={(v) => setGrouped(v as string[])}
                        multiple
                        grouped
                        groupBy={(opt) => opt.metadata?.category ?? 'Other'}
                        maxHeight={280}
                    />
                </div>
                {grouped.length > 0 && (
                    <p className={cn('text-sm mt-3', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                        Selected: <span className={cn('font-medium', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>{grouped.join(', ')}</span>
                    </p>
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<ListBox
  options={options}
  value={values}
  onChange={(v) => setValues(v as string[])}
  multiple
  grouped
  groupBy={(opt) => opt.metadata?.category ?? 'Other'}
  maxHeight={280}
/>`}
                />
            </div>
        </>
    );
};

export default GroupedList;
