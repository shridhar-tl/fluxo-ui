import React from 'react';
import type { ReportComponent, HeaderComponentProps } from '../../report-definition-types';

interface Props { component: ReportComponent; }

export const HeaderDesign: React.FC<Props> = ({ component }) => {
    const p = component.props as unknown as HeaderComponentProps;
    const level = p.level ?? 'h2';
    const content = p.content || 'Heading';

    const fontSizes: Record<string, number> = { h1: 28, h2: 22, h3: 18, h4: 16, h5: 14, h6: 12 };
    const fontSize = fontSizes[level] ?? 18;

    return (
        <div
            className="eui-rb-header-design"
            style={{
                fontSize,
                fontWeight: 700,
                color: 'var(--eui-text)',
                padding: '4px 0',
                lineHeight: 1.3,
                ...buildStyleProps(component),
            }}
        >
            <span style={{ opacity: content ? 1 : 0.4 }}>
                {content || `${level.toUpperCase()} — empty`}
            </span>
            <span className="eui-rb-design-expr-badge" aria-hidden="true">{level}</span>
        </div>
    );
};

function buildStyleProps(comp: ReportComponent): React.CSSProperties {
    const s = comp.styles;
    const css: React.CSSProperties = {};
    if (s.textColor) css.color = s.textColor as string;
    if (s.fontFamily) css.fontFamily = s.fontFamily as string;
    if (s.fontSize) css.fontSize = s.fontSize as number;
    if (s.fontWeight) css.fontWeight = s.fontWeight as string;
    if (s.fontStyle) css.fontStyle = s.fontStyle as string;
    if (s.textAlign) css.textAlign = s.textAlign as React.CSSProperties['textAlign'];
    return css;
}
