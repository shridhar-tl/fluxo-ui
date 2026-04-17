import React from 'react';
import { ImageIcon } from '../../../../assets/icons';
import type { ReportComponent, ImageComponentProps } from '../../report-definition-types';

interface Props { component: ReportComponent; }

export const ImageDesign: React.FC<Props> = ({ component }) => {
    const p = component.props as unknown as ImageComponentProps;
    const hasSrc = Boolean(p.src);

    return (
        <div
            className="eui-rb-image-design"
            style={{
                width: (p.width ?? '100%') as string,
                height: (p.height ?? 'auto') as string,
                background: 'var(--eui-bg-subtle)',
                border: '1px dashed var(--eui-border-subtle)',
                borderRadius: 4,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 80,
            }}
        >
            {hasSrc ? (
                <img
                    src={p.src}
                    alt={p.alt ?? ''}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: (p.objectFit ?? 'contain') as React.CSSProperties['objectFit'],
                    }}
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--eui-text-muted)' }}>
                    <ImageIcon aria-hidden="true" style={{ width: 28, height: 28, opacity: 0.4 }} />
                    <span style={{ fontSize: 11, fontStyle: 'italic' }}>No image source</span>
                </div>
            )}
        </div>
    );
};
