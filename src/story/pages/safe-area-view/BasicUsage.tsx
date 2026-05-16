import React from 'react';
import { SafeAreaView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { SafeAreaView } from 'fluxo-ui';

<SafeAreaView edges={['top', 'bottom']} fillBackground>
    {/* page content */}
</SafeAreaView>`;

const phoneFrame: React.CSSProperties = {
    width: 320,
    height: 220,
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 16,
    overflow: 'hidden',
    background: '#000',
    position: 'relative',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
};

const notch: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 80,
    height: 18,
    background: '#000',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 2,
};

const homeBar: React.CSSProperties = {
    position: 'absolute',
    bottom: 6,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 96,
    height: 4,
    background: '#fff',
    borderRadius: 999,
    opacity: 0.6,
    zIndex: 2,
};

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Respecting the notch and home indicator" description="SafeAreaView applies env(safe-area-inset-*) padding so your UI clears iOS notches and home bars. The mock device on the right shows the simulated effect using inline insets.">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>
                <div style={phoneFrame}>
                    <div style={notch} />
                    <SafeAreaView
                        edges={['top', 'bottom']}
                        fillBackground
                        style={{ height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', ['--eui-safe-top' as never]: '22px', ['--eui-safe-bottom' as never]: '18px' }}
                    >
                        <div style={{ padding: '8px 16px', color: 'var(--eui-text)', fontWeight: 600 }}>App Header</div>
                        <div style={{ padding: '8px 16px', color: 'var(--eui-text-muted)' }}>Body content here</div>
                        <div style={{ padding: '8px 16px', color: 'var(--eui-primary)', fontWeight: 600 }}>Bottom action</div>
                    </SafeAreaView>
                    <div style={homeBar} />
                </div>
                <div style={{ flex: 1, minWidth: 220, color: 'var(--eui-text-muted)', fontSize: 13 }}>
                    The SafeAreaView wrapper applies the iOS safe-area insets as padding (or margin). On a real device, no JS or CSS variable override is needed — env(safe-area-inset-top) / -bottom are picked up automatically.
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default BasicUsage;
