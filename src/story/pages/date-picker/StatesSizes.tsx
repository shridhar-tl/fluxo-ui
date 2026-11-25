import React from 'react';

import { CalendarLineIcon } from '../../../assets/icons';
import { DatePicker, FieldLabel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowLabelStyle } from '../../demo-styles';
import { today } from './date-picker-story-data';

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const code = `<DatePicker size="sm" />
<DatePicker size="lg" />
<DatePicker status="error" />
<DatePicker disabled />
<DatePicker readOnly />
<DatePicker icon={CalendarLineIcon} iconPosition="end" />
<DatePicker icon={false} />`;

const StatesSizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes, States & Icons" description="Three sizes, validation states, disabled and read-only modes, and icon placement.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <span style={rowLabelStyle}>Sizes</span>
                <div style={gridStyle}>
                    <DatePicker size="sm" defaultValue={today} ariaLabel="Small date picker" fullWidth />
                    <DatePicker size="md" defaultValue={today} ariaLabel="Medium date picker" fullWidth />
                    <DatePicker size="lg" defaultValue={today} ariaLabel="Large date picker" fullWidth />
                </div>
                <span style={rowLabelStyle}>States</span>
                <div style={gridStyle}>
                    <FieldLabel label="Error" htmlFor="dp-error" error="Choose a date in the future">
                        <DatePicker id="dp-error" status="error" defaultValue={today} fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Warning" htmlFor="dp-warning">
                        <DatePicker id="dp-warning" status="warning" defaultValue={today} fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Success" htmlFor="dp-success">
                        <DatePicker id="dp-success" status="success" defaultValue={today} fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Disabled" htmlFor="dp-disabled">
                        <DatePicker id="dp-disabled" disabled defaultValue={today} fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Read only" htmlFor="dp-readonly">
                        <DatePicker id="dp-readonly" readOnly defaultValue={today} fullWidth />
                    </FieldLabel>
                    <FieldLabel label="Picker only, no typing" htmlFor="dp-noedit">
                        <DatePicker id="dp-noedit" editable={false} placeholder="Click to choose" fullWidth />
                    </FieldLabel>
                </div>
                <span style={rowLabelStyle}>Icons</span>
                <div style={gridStyle}>
                    <DatePicker icon={CalendarLineIcon} iconPosition="end" ariaLabel="Icon at end" placeholder="Icon at end" fullWidth />
                    <DatePicker icon={false} ariaLabel="Without icon" placeholder="Without icon" fullWidth />
                    <DatePicker placement="top-start" ariaLabel="Opens above" placeholder="Opens above" fullWidth />
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default StatesSizes;
