import React, { useState } from 'react';
import { PasswordRequirements } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<PasswordRequirements
  value={pw}
  policy={{ minLength: 8 }}
  customRules={[
    { id: 'noEmail', label: "Doesn't contain '@'", test: (v) => !v.includes('@') },
    { id: 'startsLetter', label: 'Starts with a letter', test: (v) => /^[A-Za-z]/.test(v) },
    { id: 'noYear', label: "Doesn't contain '2024' or '2025'", test: (v) => !/(2024|2025)/.test(v) },
  ]}
  labels={{ minLength: 'Be at least 8 characters' }}
/>`;

const CustomRules: React.FC = () => {
    const [pw, setPw] = useState('');
    return (
        <>
            <ComponentDemo
                title="Custom Rules & Label Overrides"
                description="Add any rule the policy doesn't cover, and override built-in labels with the labels prop."
            >
                <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                        type="text"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="Try typing your name or 'admin@2024'"
                        style={{
                            padding: '6px 10px',
                            borderRadius: 4,
                            border: '1px solid var(--eui-border)',
                            background: 'var(--eui-bg)',
                            color: 'var(--eui-text)',
                            fontSize: 14,
                            fontFamily: 'inherit',
                        }}
                    />
                    <PasswordRequirements
                        value={pw}
                        policy={{ minLength: 8, minDigits: 1 }}
                        customRules={[
                            { id: 'noEmail', label: "Doesn't contain '@'", test: (v) => v.length === 0 ? false : !v.includes('@') },
                            { id: 'startsLetter', label: 'Starts with a letter', test: (v) => /^[A-Za-z]/.test(v) },
                            { id: 'noYear', label: "Doesn't contain '2024' or '2025'", test: (v) => v.length === 0 ? false : !/(2024|2025)/.test(v) },
                        ]}
                        labels={{ minLength: 'Be at least 8 characters', minDigits: 'Include a digit' }}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CustomRules;
