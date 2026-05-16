import React from 'react';
import { Resizable } from '../../../components/resizable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Resizable axis="horizontal" defaultWidth={280} defaultHeight={140}>...</Resizable>
<Resizable axis="vertical" defaultWidth={240} defaultHeight={160}>...</Resizable>
<Resizable handles="corners" defaultWidth={240} defaultHeight={160}>...</Resizable>`;

const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--eui-text-muted)',
    fontSize: 13,
};

const AxisAndHandles: React.FC = () => (
    <ComponentDemo
        title="Axis & Handle Sets"
        description="Restrict resize to one axis or render only a subset of handles."
    >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                <Resizable axis="horizontal" defaultWidth={280} defaultHeight={140} ariaLabel="Horizontal only">
                    <div style={cardStyle}>axis: horizontal</div>
                </Resizable>
                <Resizable axis="vertical" defaultWidth={240} defaultHeight={160} ariaLabel="Vertical only">
                    <div style={cardStyle}>axis: vertical</div>
                </Resizable>
                <Resizable handles="corners" defaultWidth={240} defaultHeight={160} ariaLabel="Corners only">
                    <div style={cardStyle}>handles: corners</div>
                </Resizable>
                <Resizable handles="edges" defaultWidth={240} defaultHeight={160} ariaLabel="Edges only">
                    <div style={cardStyle}>handles: edges</div>
                </Resizable>
            </div>
            <CodeBlock code={code} />
        </div>
    </ComponentDemo>
);

export default AxisAndHandles;
