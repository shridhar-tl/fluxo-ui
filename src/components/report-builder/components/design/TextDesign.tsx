import React from 'react';
import type { ReportComponent, TextComponentProps } from '../../report-definition-types';

interface Props { component: ReportComponent; }

export const TextDesign: React.FC<Props> = ({ component }) => {
    const p = component.props as unknown as TextComponentProps;
    const content = p.content || '';
    const s = component.styles;

    return (
        <div
            className="eui-rb-text-design"
            style={{
                fontSize: (s.fontSize as number | undefined) ?? 13,
                color: (s.textColor as string | undefined) ?? 'var(--eui-text)',
                fontFamily: s.fontFamily as string | undefined,
                fontWeight: s.fontWeight as string | undefined,
                fontStyle: s.fontStyle as string | undefined,
                textAlign: s.textAlign as React.CSSProperties['textAlign'],
                lineHeight: 1.6,
                padding: '2px 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}
        >
            {content || <span style={{ color: 'var(--eui-text-muted)', fontStyle: 'italic' }}>Empty text block</span>}
        </div>
    );
};
