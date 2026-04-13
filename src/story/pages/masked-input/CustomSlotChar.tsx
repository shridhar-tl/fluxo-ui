import cn from 'classnames';
import React from 'react';
import { MaskedInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<MaskedInput mask="(999) 999-9999" slotChar="#" value={v} onChange={(e) => setV(e.value)} />
<MaskedInput mask="99/99/9999"     slotChar="·" value={v} onChange={(e) => setV(e.value)} />`;

const CustomSlotChar: React.FC = () => {
    const { isDark } = useStoryTheme();

    const labelClass = cn('block text-xs font-medium mb-1', {
        'text-gray-400': isDark,
        'text-gray-600': !isDark,
    });

    return (
        <>
            <ComponentDemo title="Custom slotChar">
                <div className="w-full max-w-sm space-y-4">
                    <div className="space-y-1">
                        <label className={labelClass}>slotChar="#"</label>
                        <MaskedInput mask="(999) 999-9999" value="" onChange={() => {}} slotChar="#" />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>slotChar="·"</label>
                        <MaskedInput mask="99/99/9999" value="" onChange={() => {}} slotChar="·" />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CustomSlotChar;
