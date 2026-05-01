import React, { useState } from 'react';
import { NumericInput as NumericInputRaw } from '../../../components';
import { withFieldLabel } from '../../../utils/field-label';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const NumericInput = withFieldLabel(NumericInputRaw);

const code = `const [value, setValue] = useState<number | undefined>(42);

<NumericInput
  label="Optional age"
  value={value}
  onChange={(e) => setValue(e.value)}
  placeholder="Leave empty if unknown"
/>

// e.value is number when filled, undefined when cleared`;

const ClearableValue: React.FC = () => {
    const [value, setValue] = useState<number | undefined>(42);

    return (
        <>
            <ComponentDemo
                title="Empty / Cleared State"
                description="onChange now fires with value: undefined when the field is cleared, so controlled parents can react to an empty input."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
                    <NumericInput
                        label="Optional age"
                        value={value}
                        onChange={(e) => setValue(e.value)}
                        placeholder="Leave empty if unknown"
                    />
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            color: 'var(--eui-text)',
                        }}
                    >
                        Parent state:{' '}
                        <strong>{value === undefined ? <em style={{ color: 'var(--eui-text-muted)' }}>undefined</em> : value}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ClearableValue;
