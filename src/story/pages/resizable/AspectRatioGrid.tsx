import React from 'react';
import { Resizable } from '../../../components/resizable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Resizable aspectRatio={16 / 9} defaultWidth={320} defaultHeight={180}>...</Resizable>
<Resizable grid={[20, 20]} defaultWidth={320} defaultHeight={200}>...</Resizable>`;

const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, var(--eui-primary-subtle), var(--eui-bg-subtle))',
    border: '1px solid var(--eui-border)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--eui-text)',
    fontSize: 13,
    fontWeight: 500,
};

const AspectRatioGrid: React.FC = () => (
    <ComponentDemo
        title="Aspect Ratio & Grid Snap"
        description="Lock to an aspect ratio while resizing, or snap to a pixel grid."
    >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                <Resizable aspectRatio={16 / 9} defaultWidth={320} defaultHeight={180} ariaLabel="16:9 ratio">
                    <div style={cardStyle}>16:9 aspect</div>
                </Resizable>
                <Resizable aspectRatio={1} defaultWidth={200} defaultHeight={200} ariaLabel="Square ratio">
                    <div style={cardStyle}>1:1 square</div>
                </Resizable>
                <Resizable grid={[20, 20]} defaultWidth={320} defaultHeight={200} ariaLabel="Snaps to grid">
                    <div style={cardStyle}>grid: 20×20</div>
                </Resizable>
            </div>
            <CodeBlock code={code} />
        </div>
    </ComponentDemo>
);

export default AspectRatioGrid;
