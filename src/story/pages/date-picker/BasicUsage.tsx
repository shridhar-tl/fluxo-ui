import React, { useState } from 'react';

import { DatePicker, FieldLabel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle } from '../../demo-styles';

const code = `import { DatePicker } from 'fluxo-ui';

const [date, setDate] = useState<Date | null>(null);

<DatePicker value={date} onChange={setDate} placeholder="Select a date" clearable />`;

const BasicUsage: React.FC = () => {
    const [date, setDate] = useState<Date | null>(null);

    return (
        <>
            <ComponentDemo
                title="Single Date"
                description="Open with a click, Alt+Arrow Down, or type a date directly. Navigate the calendar with arrows, Page Up/Down and Home/End."
            >
                <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <FieldLabel label="Start date" htmlFor="dp-basic">
                        <DatePicker id="dp-basic" value={date} onChange={setDate} placeholder="Select a date" clearable fullWidth />
                    </FieldLabel>
                    <div style={readoutStyle} aria-live="polite">
                        {date ? `Selected ${date.toDateString()}` : 'No date selected'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
