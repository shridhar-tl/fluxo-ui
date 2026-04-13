import cn from 'classnames';
import React, { useState } from 'react';
import { getFieldValue, getPercentageChange, isNil, removeNilValues, setFieldValue } from '../../../utils/common-fns';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { getFieldValue, setFieldValue, debounce, isNil, getPercentageChange } from 'ether-ui/utils';

// Deep property access
getFieldValue(obj, 'user.address.city'); // "NYC"

// Immutable deep set
const next = setFieldValue(obj, 'user.name', 'Jane');

// Percentage change
getPercentageChange(120, 100); // 20

// Nil check
isNil(null); // true
isNil(0);    // false

// Async debounce
const search = debounce(async (q) => fetch(url + q), 300);`;

const UtilFunctionsDemo: React.FC = () => {
    const { isDark } = useStoryTheme();

    const sampleObj = { user: { name: 'Alice', address: { city: 'NYC', zip: '10001' } } };

    const [fieldPath, setFieldPath] = useState('user.address.city');
    const fieldResult = getFieldValue(sampleObj, fieldPath);

    const [setPath, setSetPath] = useState('user.name');
    const [setVal, setSetVal] = useState('Bob');
    const setResult = setFieldValue(sampleObj, setPath, setVal);

    const nilTests = [
        { val: 'null', result: isNil(null) },
        { val: 'undefined', result: isNil(undefined) },
        { val: '0', result: isNil(0) },
        { val: "''", result: isNil('') },
        { val: 'false', result: isNil(false) },
    ];

    const pctResult = getPercentageChange(120, 100);

    const cleaned = removeNilValues({ a: 1, b: null, c: undefined, d: 'hello', e: 0 });

    return (
        <>
            <ComponentDemo title="Utility Functions" description="Common utility functions for data manipulation, validation, and more.">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--eui-text)' }}>getFieldValue</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                            <code className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--eui-bg-subtle)', color: 'var(--eui-text-muted)' }}>
                                Object: {JSON.stringify(sampleObj)}
                            </code>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                value={fieldPath}
                                onChange={(e) => setFieldPath(e.target.value)}
                                className={cn('px-2 py-1 rounded border text-xs font-mono', {
                                    'bg-white/5 border-white/15 text-gray-200': isDark,
                                    'bg-white border-gray-300': !isDark,
                                })}
                                placeholder="path"
                            />
                            <span className="text-sm">=</span>
                            <span className="text-sm font-mono" style={{ color: 'var(--eui-primary)' }}>
                                {JSON.stringify(fieldResult)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--eui-text)' }}>setFieldValue (immutable)</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                            <input
                                value={setPath}
                                onChange={(e) => setSetPath(e.target.value)}
                                className={cn('px-2 py-1 rounded border text-xs font-mono w-40', {
                                    'bg-white/5 border-white/15 text-gray-200': isDark,
                                    'bg-white border-gray-300': !isDark,
                                })}
                                placeholder="path"
                            />
                            <input
                                value={setVal}
                                onChange={(e) => setSetVal(e.target.value)}
                                className={cn('px-2 py-1 rounded border text-xs font-mono w-24', {
                                    'bg-white/5 border-white/15 text-gray-200': isDark,
                                    'bg-white border-gray-300': !isDark,
                                })}
                                placeholder="value"
                            />
                        </div>
                        <code className="block text-xs mt-2 font-mono" style={{ color: 'var(--eui-primary)' }}>
                            {JSON.stringify(setResult)}
                        </code>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--eui-text)' }}>isNil</h4>
                        <div className="flex flex-wrap gap-3">
                            {nilTests.map((t) => (
                                <div key={t.val} className={cn('px-3 py-1.5 rounded text-xs', {
                                    'bg-white/5': isDark,
                                    'bg-gray-50': !isDark,
                                })}>
                                    <span className="font-mono" style={{ color: 'var(--eui-text-muted)' }}>isNil({t.val})</span>
                                    <span className="ml-2 font-bold" style={{ color: t.result ? '#22c55e' : '#ef4444' }}>
                                        {String(t.result)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--eui-text)' }}>getPercentageChange</h4>
                        <p className="text-sm font-mono" style={{ color: 'var(--eui-text-muted)' }}>
                            getPercentageChange(120, 100) = <span style={{ color: 'var(--eui-primary)' }}>{pctResult}%</span>
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--eui-text)' }}>removeNilValues</h4>
                        <p className="text-xs font-mono" style={{ color: 'var(--eui-text-muted)' }}>
                            Input: {'{ a: 1, b: null, c: undefined, d: "hello", e: 0 }'}
                        </p>
                        <p className="text-xs font-mono mt-1" style={{ color: 'var(--eui-primary)' }}>
                            Output: {JSON.stringify(cleaned)}
                        </p>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default UtilFunctionsDemo;
