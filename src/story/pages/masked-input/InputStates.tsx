import cn from 'classnames';
import React from 'react';
import { MaskedInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<MaskedInput mask="(999) 999-9999" value={v} onChange={(e) => setV(e.value)} />
<MaskedInput mask="(999) 999-9999" value={v} onChange={(e) => setV(e.value)} disabled />
<MaskedInput mask="(999) 999-9999" value={v} onChange={(e) => setV(e.value)} readonly />
<MaskedInput mask="(999) 999-9999" value={v} onChange={(e) => setV(e.value)} required />`;

const InputStates: React.FC = () => {
    const { isDark } = useStoryTheme();

    const labelClass = cn('block text-xs font-medium mb-1', {
        'text-gray-400': isDark,
        'text-gray-600': !isDark,
    });

    return (
        <>
            <ComponentDemo title="Disabled and Read-only">
                <div className="w-full max-w-sm space-y-4">
                    <div className="space-y-1">
                        <label className={labelClass}>Normal</label>
                        <MaskedInput mask="(999) 999-9999" value="" onChange={() => {}} />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>Disabled</label>
                        <MaskedInput mask="(999) 999-9999" value="5550001111" onChange={() => {}} disabled />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>Read-only</label>
                        <MaskedInput mask="(999) 999-9999" value="5550001111" onChange={() => {}} readonly />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>Required (empty)</label>
                        <MaskedInput mask="(999) 999-9999" value="" onChange={() => {}} required />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default InputStates;
