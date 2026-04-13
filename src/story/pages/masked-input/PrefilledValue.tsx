import cn from 'classnames';
import React from 'react';
import { MaskedInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<MaskedInput mask="(999) 999-9999" value="5551234567" onChange={(e) => setPhone(e.value)} />
<MaskedInput mask="99/99/9999"     value="01/15/1990"     onChange={(e) => setDate(e.value)} />
<MaskedInput mask="9999 9999 9999 9999" value="4111111111111111" onChange={(e) => setCc(e.value)} />`;

const PrefilledValue: React.FC = () => {
    const { isDark } = useStoryTheme();

    const labelClass = cn('block text-xs font-medium mb-1', {
        'text-gray-400': isDark,
        'text-gray-600': !isDark,
    });

    return (
        <>
            <ComponentDemo title="Pre-filled inputs">
                <div className="w-full max-w-sm space-y-4">
                    <div className="space-y-1">
                        <label className={labelClass}>Phone (pre-filled raw "5551234567")</label>
                        <MaskedInput mask="(999) 999-9999" value="5551234567" onChange={() => {}} />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>Date (pre-filled "01/15/1990")</label>
                        <MaskedInput mask="99/99/9999" value="01/15/1990" onChange={() => {}} />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>Credit Card (pre-filled "4111111111111111")</label>
                        <MaskedInput mask="9999 9999 9999 9999" value="4111111111111111" onChange={() => {}} />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default PrefilledValue;
