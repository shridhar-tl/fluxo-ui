import React from 'react';
import type { ReportComponent, TableComponentProps } from '../../report-definition-types';

interface Props { component: ReportComponent; }

const skeletonBar = (width: string): React.CSSProperties => ({
    height: 10,
    width,
    borderRadius: 4,
    background: 'var(--eui-border-subtle)',
});

export const TableDesign: React.FC<Props> = ({ component }) => {
    const p = component.props as unknown as TableComponentProps;
    const columns = p.columns ?? [];

    if (columns.length === 0) {
        return (
            <div style={{
                padding: '20px 16px',
                background: 'var(--eui-bg-subtle)',
                border: '1px dashed var(--eui-border-subtle)',
                borderRadius: 6,
                color: 'var(--eui-text-muted)',
                fontSize: 12,
                fontStyle: 'italic',
                textAlign: 'center',
            }}>
                Configure table in Properties
            </div>
        );
    }

    const skeletonWidths = ['60%', '45%', '70%', '50%', '55%', '40%'];

    return (
        <div style={{
            border: '1px solid var(--eui-border-subtle)',
            borderRadius: 6,
            overflow: 'hidden',
            fontSize: 12,
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
                background: 'var(--eui-bg-subtle)',
                borderBottom: '1px solid var(--eui-border-subtle)',
            }}>
                {columns.map((col) => (
                    <div
                        key={col.id}
                        style={{
                            padding: '8px 10px',
                            fontWeight: 600,
                            color: 'var(--eui-text)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: col.align ?? 'left',
                        }}
                    >
                        {col.label || col.field || '(untitled)'}
                    </div>
                ))}
            </div>

            {[0, 1, 2].map((rowIdx) => (
                <div
                    key={rowIdx}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: columns.map((c) => c.width || '1fr').join(' '),
                        borderBottom: rowIdx < 2 ? '1px solid var(--eui-border-subtle)' : undefined,
                    }}
                >
                    {columns.map((col, colIdx) => (
                        <div
                            key={col.id}
                            style={{
                                padding: '8px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <div style={skeletonBar(skeletonWidths[(rowIdx * columns.length + colIdx) % skeletonWidths.length])} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
