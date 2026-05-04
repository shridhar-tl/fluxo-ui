import React from 'react';
import { ChatLauncher, type ChatLauncherVariant } from '../../../components/chat';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const variants: { value: ChatLauncherVariant; label: string; description: string }[] = [
    { value: 'spark', label: 'Spark', description: 'Default — pill with arc + text' },
    { value: 'icon', label: 'Icon', description: 'Compact icon-only button' },
    { value: 'morph', label: 'Morph', description: 'Glowing animated blob' },
    { value: 'beacon', label: 'Beacon', description: 'Live indicator with text + status wave' },
    { value: 'pulsar', label: 'Pulsar', description: 'Concentric pulsing rings' },
    { value: 'expand', label: 'Expand', description: 'Capsule with text + icon button' },
];

const code = `<ChatLauncher
    variant="spark"
    text="Live Chat"
    showTooltip
    tooltipText="We are online!"
    onClick={() => setOpen(true)}
/>`;

const LauncherCard: React.FC<{ variant: ChatLauncherVariant; label: string; description: string }> = ({
    variant,
    label,
    description,
}) => {
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (variant !== 'expand') return;
        const t = window.setTimeout(() => {
            wrapperRef.current
                ?.querySelectorAll('.eui-chat-expand-collapsed')
                .forEach((el) => el.classList.remove('eui-chat-expand-collapsed'));
        }, 50);
        return () => window.clearTimeout(t);
    }, [variant]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 10,
                background: 'var(--eui-bg)',
                padding: '32px 20px 16px',
                minHeight: 240,
                overflow: 'visible',
            }}
        >
            <div
                ref={wrapperRef}
                style={{
                    flexGrow: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    minHeight: 100,
                }}
            >
                <ChatLauncher
                    variant={variant}
                    text="Live Chat"
                    autoAnimate={false}
                    onClick={() => alert(`Clicked ${label} launcher`)}
                    style={{
                        position: 'relative',
                        top: 'auto',
                        bottom: 'auto',
                        right: 'auto',
                        left: 'auto',
                    }}
                />
            </div>
            <div style={{ width: '100%', textAlign: 'center', borderTop: '1px solid var(--eui-border-subtle)', paddingTop: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--eui-text)' }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--eui-text-muted)', marginTop: 2 }}>{description}</div>
            </div>
        </div>
    );
};

const LauncherVariantsDemo: React.FC = () => (
    <>
        <ComponentDemo
            title="Launcher Variants"
            description="Click any launcher to see it animate. Pick the personality that fits your product."
            centered={false}
        >
            <div
                style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 16,
                }}
            >
                {variants.map((v) => (
                    <LauncherCard key={v.value} variant={v.value} label={v.label} description={v.description} />
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default LauncherVariantsDemo;
