import cn from 'classnames';
import React from 'react';
import { MaskedInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<MaskedInput
  mask="(999) 999-9999"
  includeLiterals={false}
  value={phone}
  onChange={(e) => setPhone(e.value)}
  onRawChange={(raw, masked) => console.log(raw, masked)}
/>`;

const IncludeLiterals: React.FC = () => {
    const { isDark } = useStoryTheme();

    const labelClass = cn('block text-xs font-medium mb-1', {
        'text-gray-400': isDark,
        'text-gray-600': !isDark,
    });

    return (
        <>
            <ComponentDemo title="includeLiterals comparison">
                <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={labelClass}>
                            includeLiterals=<strong>true</strong> (default)
                        </label>
                        <MaskedInput mask="(999) 999-9999" value="" onChange={() => {}} includeLiterals={true} />
                        <p className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                            onChange emits e.g. <code className="font-mono">(123) 456-7890</code>
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>
                            includeLiterals=<strong>false</strong>
                        </label>
                        <MaskedInput mask="(999) 999-9999" value="" onChange={() => {}} includeLiterals={false} />
                        <p className={cn('text-xs', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                            onChange emits e.g. <code className="font-mono">1234567890</code>
                        </p>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default IncludeLiterals;
