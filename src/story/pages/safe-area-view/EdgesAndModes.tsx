import React from 'react';
import { SafeAreaView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<SafeAreaView edges="top" mode="padding">Header area</SafeAreaView>
<SafeAreaView edges={['bottom', 'horizontal']} mode="margin">…</SafeAreaView>
<SafeAreaView edges="all" as="main" fillBackground>…</SafeAreaView>`;

const cellBase: React.CSSProperties = {
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 8,
    padding: 12,
    color: 'var(--eui-text)',
    background: 'var(--eui-bg)',
};

const EdgesAndModes: React.FC = () => (
    <>
        <ComponentDemo title="Targeted edges" description="Pass any combination of 'top' | 'right' | 'bottom' | 'left' | 'horizontal' | 'vertical' | 'all'. The wrapper applies env(safe-area-inset-*) only to the chosen edges.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 420 }}>
                <SafeAreaView edges="top" style={{ ...cellBase, ['--eui-safe-top' as never]: '24px' }}>
                    edges=&quot;top&quot;
                </SafeAreaView>
                <SafeAreaView edges={['bottom', 'horizontal']} style={{ ...cellBase, ['--eui-safe-bottom' as never]: '20px', ['--eui-safe-left' as never]: '16px', ['--eui-safe-right' as never]: '16px' }}>
                    edges={`{['bottom', 'horizontal']}`}
                </SafeAreaView>
                <SafeAreaView edges="all" style={{ ...cellBase, ['--eui-safe-top' as never]: '14px', ['--eui-safe-right' as never]: '14px', ['--eui-safe-bottom' as never]: '14px', ['--eui-safe-left' as never]: '14px' }}>
                    edges=&quot;all&quot;
                </SafeAreaView>
            </div>
        </ComponentDemo>

        <ComponentDemo title="Padding vs margin" description="Use mode='margin' when you want the wrapper itself to sit inside the safe area without nudging its inner padding." className="mt-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 420 }}>
                <SafeAreaView edges="vertical" mode="padding" style={{ ...cellBase, ['--eui-safe-top' as never]: '14px', ['--eui-safe-bottom' as never]: '14px' }}>
                    mode=&quot;padding&quot; — content sits inside the safe area.
                </SafeAreaView>
                <SafeAreaView edges="vertical" mode="margin" style={{ ...cellBase, ['--eui-safe-top' as never]: '14px', ['--eui-safe-bottom' as never]: '14px' }}>
                    mode=&quot;margin&quot; — the wrapper itself is pushed inward.
                </SafeAreaView>
            </div>
        </ComponentDemo>

        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default EdgesAndModes;
