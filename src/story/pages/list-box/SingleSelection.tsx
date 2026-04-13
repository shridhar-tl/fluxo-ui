import cn from 'classnames';
import React, { useState } from 'react';
import { ListBox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { frameworkOptions } from './list-box-story-data';

const SingleSelection: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [single, setSingle] = useState<string>();

    return (
        <>
            <ComponentDemo title="Basic single select" description="Click an item to select it.">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-full max-w-72">
                        <ListBox options={frameworkOptions} value={single} onChange={(v) => setSingle(v as string)} />
                    </div>
                    {single && (
                        <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                            Selected: <span className={cn('font-medium', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>{single}</span>
                        </p>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`const [value, setValue] = useState<string>();

<ListBox
  options={frameworkOptions}
  value={value}
  onChange={(v) => setValue(v as string)}
/>`}
                />
            </div>
        </>
    );
};

export default SingleSelection;
