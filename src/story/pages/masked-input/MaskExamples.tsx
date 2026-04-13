import cn from 'classnames';
import React, { useState } from 'react';
import { MaskedInput } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const phoneCode = `import { MaskedInput } from 'ether-ui';

const [phone, setPhone] = useState('');

<MaskedInput
  mask="(999) 999-9999"
  value={phone}
  onChange={(e) => setPhone(e.value)}
/>`;

const dateCode = `<MaskedInput
  mask="99/99/9999"
  value={date}
  onChange={(e) => setDate(e.value)}
/>`;

const timeCode = `<MaskedInput
  mask="99:99"
  value={time}
  onChange={(e) => setTime(e.value)}
/>`;

const ssnCode = `<MaskedInput
  mask="999-99-9999"
  value={ssn}
  onChange={(e) => setSsn(e.value)}
/>`;

const ccCode = `<MaskedInput
  mask="9999 9999 9999 9999"
  value={cc}
  onChange={(e) => setCc(e.value)}
/>`;

const ipCode = `<MaskedInput
  mask="999.999.999.999"
  value={ip}
  onChange={(e) => setIp(e.value)}
/>`;

const plateCode = `<MaskedInput
  mask="aaa-9999"
  value={plate}
  onChange={(e) => setPlate(e.value)}
/>`;

interface MaskDemoProps {
    id: string;
    title: string;
    mask: string;
    label: string;
    code: string;
    maxWidth?: string;
    description?: string;
}

const MaskDemo: React.FC<MaskDemoProps> = ({ title, mask, label, code: codeStr, maxWidth = 'max-w-xs', description }) => {
    const { isDark } = useStoryTheme();
    const [value, setValue] = useState('');
    const [raw, setRaw] = useState('');

    const labelClass = cn('block text-xs font-medium mb-1', {
        'text-gray-400': isDark,
        'text-gray-600': !isDark,
    });

    const valueDisplay = cn('mt-2 text-xs font-mono px-2 py-1 rounded', {
        'bg-white/6 text-gray-400': isDark,
        'bg-gray-100 text-gray-500': !isDark,
    });

    return (
        <>
            {description && (
                <p className={cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Mask <code className="font-mono">{mask}</code> — {description}
                </p>
            )}
            <ComponentDemo title={title}>
                <div className={`w-full ${maxWidth} space-y-2`}>
                    <label className={labelClass}>{label}</label>
                    <MaskedInput
                        mask={mask}
                        value={value}
                        onChange={(e) => setValue(e.value)}
                        onRawChange={(r) => setRaw(r)}
                    />
                    <div className={valueDisplay}>
                        value: &quot;{value}&quot; &nbsp;|&nbsp; raw: &quot;{raw}&quot;
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={codeStr} />
            </div>
        </>
    );
};

export const PhoneNumber: React.FC = () => (
    <MaskDemo
        id="phone"
        title="US Phone Number"
        mask="(999) 999-9999"
        label="Phone Number"
        code={phoneCode}
        description="digits only with formatted separators."
    />
);

export const DateInput: React.FC = () => (
    <MaskDemo
        id="date"
        title="Date (MM/DD/YYYY)"
        mask="99/99/9999"
        label="Date of Birth"
        code={dateCode}
        description="calendar date with slash separators."
    />
);

export const TimeInput: React.FC = () => (
    <MaskDemo
        id="time"
        title="Time (HH:MM)"
        mask="99:99"
        label="Meeting Time"
        code={timeCode}
        description="24-hour or 12-hour time input."
    />
);

export const SsnInput: React.FC = () => (
    <MaskDemo
        id="ssn"
        title="SSN"
        mask="999-99-9999"
        label="Social Security Number"
        code={ssnCode}
        description="SSN with dash separators."
    />
);

export const CreditCard: React.FC = () => (
    <MaskDemo
        id="credit-card"
        title="Credit Card Number"
        mask="9999 9999 9999 9999"
        label="Card Number"
        code={ccCode}
        maxWidth="max-w-sm"
        description="four groups of four digits separated by spaces."
    />
);

export const Ipv4Address: React.FC = () => (
    <MaskDemo
        id="ipv4"
        title="IPv4 Address"
        mask="999.999.999.999"
        label="IP Address"
        code={ipCode}
        description="four octet groups with dot separators."
    />
);

export const LicensePlate: React.FC = () => (
    <MaskDemo
        id="license-plate"
        title="Vehicle License Plate"
        mask="aaa-9999"
        label="License Plate"
        code={plateCode}
        description="three letters, a dash, then four digits."
    />
);
