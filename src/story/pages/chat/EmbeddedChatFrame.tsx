import React from 'react';

interface EmbeddedChatFrameProps {
    height?: number | string;
    children: React.ReactNode;
    background?: string;
}

const EmbeddedChatFrame: React.FC<EmbeddedChatFrameProps> = ({ height = 560, children, background }) => (
    <div
        style={{
            position: 'relative',
            width: '100%',
            height: typeof height === 'number' ? `${height}px` : height,
            border: '1px solid var(--eui-border-subtle)',
            borderRadius: 8,
            overflow: 'hidden',
            background: background ?? 'var(--eui-bg-subtle)',
            backgroundImage:
                'linear-gradient(135deg, color-mix(in srgb, var(--eui-bg-subtle) 92%, transparent) 0%, color-mix(in srgb, var(--eui-bg) 100%, transparent) 100%)',
        }}
    >
        {children}
    </div>
);

export default EmbeddedChatFrame;
