import React, { useState } from 'react';

import { DatePicker, FieldLabel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { presetList } from './date-picker-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const code = `<DatePicker
    presets={[
        { label: 'Today', value: () => new Date() },
        { label: 'Tomorrow', value: () => addDays(new Date(), 1) },
        { label: 'Next Monday', value: () => nextMonday(new Date()) },
    ]}
    showTodayButton
    clearable
/>

<DatePicker closeOnSelect={false} showTodayButton todayLabel="Jump to today" />`;

const PresetsFooter: React.FC = () => {
    const [due, setDue] = useState<Date | null>(null);
    const [reminder, setReminder] = useState<Date | null>(null);

    return (
        <>
            <ComponentDemo title="Presets & Footer Actions" description="Quick picks appear beside the calendar and collapse above it on small screens.">
                <div style={gridStyle}>
                    <FieldLabel label="Due date" htmlFor="dp-presets">
                        <DatePicker id="dp-presets" value={due} onChange={setDue} presets={presetList} showTodayButton clearable fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Stays open after selecting" htmlFor="dp-keep-open">
                        <DatePicker
                            id="dp-keep-open"
                            value={reminder}
                            onChange={setReminder}
                            closeOnSelect={false}
                            showTodayButton
                            todayLabel="Jump to today"
                            clearable
                            clearLabel="Reset"
                            fullWidth
                        />
                    </FieldLabel>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default PresetsFooter;
