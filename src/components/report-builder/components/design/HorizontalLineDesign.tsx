import React from 'react';
import type { ReportComponent, HorizontalLineComponentProps } from '../../report-definition-types';

interface Props { component: ReportComponent; }

export const HorizontalLineDesign: React.FC<Props> = ({ component }) => {
    const p = component.props as unknown as HorizontalLineComponentProps;
    const thickness = p.thickness ?? 1;
    const color = p.color ?? 'var(--eui-border-subtle)';
    const marginTop = p.marginTop ?? 8;
    const marginBottom = p.marginBottom ?? 8;

    return (
        <div style={{ marginTop, marginBottom }}>
            <hr style={{
                border: 'none',
                borderTop: `${thickness}px solid ${color}`,
                margin: 0,
            }} />
        </div>
    );
};
