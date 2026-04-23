import React, { useEffect, useMemo, useState } from 'react';
import { evaluateExpression } from '../expression/expression-parser';
import type { ExpressionContext } from '../expression/expression-types';
import type {
    ReportComponent,
    ComponentStyleProps,
    HeaderComponentProps,
    TextComponentProps,
    ImageComponentProps,
    HorizontalLineComponentProps,
    TabComponentProps,
    CanvasComponentProps,
    CanvasItemLayout,
} from '../report-definition-types';
import { ComponentErrorBoundary } from './ComponentErrorBoundary';
import { useViewerContext, buildExpressionDatasources, ViewerContext } from './ViewerExpressionContext';
import { TableRenderer } from './TableRenderer';
import { SubReportRenderer } from './SubReportRenderer';
import { ChartRenderer } from './ChartRenderer';
import { RepeaterRenderer } from './RepeaterRenderer';
import { useEvaluatedString, sanitizeUrl } from './useExpressionValue';

function toReactCSSProps(styles: ComponentStyleProps): React.CSSProperties {
    const css: React.CSSProperties = {};
    if (styles.textColor) css.color = styles.textColor;
    if (styles.backgroundColor) css.backgroundColor = styles.backgroundColor;
    if (styles.fontSize) css.fontSize = styles.fontSize;
    if (styles.fontFamily) css.fontFamily = styles.fontFamily;
    if (styles.fontWeight) css.fontWeight = styles.fontWeight;
    if (styles.fontStyle) css.fontStyle = styles.fontStyle;
    if (styles.textAlign) css.textAlign = styles.textAlign;
    if (styles.borderColor) css.borderColor = styles.borderColor;
    if (styles.borderWidth) css.borderWidth = styles.borderWidth;
    if (styles.borderStyle) css.borderStyle = styles.borderStyle;
    if (styles.borderRadius) css.borderRadius = styles.borderRadius;
    if (styles.paddingTop != null) css.paddingTop = styles.paddingTop;
    if (styles.paddingRight != null) css.paddingRight = styles.paddingRight;
    if (styles.paddingBottom != null) css.paddingBottom = styles.paddingBottom;
    if (styles.paddingLeft != null) css.paddingLeft = styles.paddingLeft;
    if (styles.marginTop != null) css.marginTop = styles.marginTop;
    if (styles.marginRight != null) css.marginRight = styles.marginRight;
    if (styles.marginBottom != null) css.marginBottom = styles.marginBottom;
    if (styles.marginLeft != null) css.marginLeft = styles.marginLeft;
    if (styles.width) css.width = styles.width;
    if (styles.height) css.height = styles.height;
    return css;
}

async function evalExprString(expr: string, ctx: ExpressionContext): Promise<unknown> {
    if (!expr || !expr.startsWith('=')) return expr;
    const { result, error } = await evaluateExpression(expr.slice(1), ctx);
    if (error) throw new Error(error);
    return result;
}

async function evalVisible(visible: boolean | string | undefined, ctx: ExpressionContext): Promise<boolean> {
    if (visible === undefined || visible === true) return true;
    if (visible === false) return false;
    const result = await evalExprString(visible as string, ctx);
    return result !== false && result !== 0 && result !== '' && result !== null && result !== undefined;
}

const Shimmer: React.FC<{ height?: number }> = ({ height = 32 }) => (
    <div className="eui-rb-viewer-shimmer" style={{ height }} aria-hidden="true" />
);

export const ComponentRenderer: React.FC<{ component: ReportComponent; depth?: number }> = ({ component, depth = 0 }) => {
    const parentCtx = useViewerContext();
    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(false);

    const hasOwnVariables = !!component.variables && component.variables.length > 0;

    const ctx = useMemo<typeof parentCtx>(() => {
        if (!hasOwnVariables) return parentCtx;
        const ownNames = new Set(component.variables!.map((v) => v.name));
        const ownBucket = parentCtx.componentVariableValues?.[component.id] ?? {};
        const mergedVariables: Record<string, unknown> = { ...parentCtx.variables };
        for (const name of ownNames) {
            mergedVariables[name] = ownBucket[name];
        }
        const newFrame = { componentId: component.id, names: ownNames };
        const newChain = [...parentCtx.variableScopeChain, newFrame];

        const writeGlobal = parentCtx.writeGlobalVariable;
        const writeComponent = parentCtx.writeComponentVariable;
        const globalNames = parentCtx.globalVariableNames;

        const scopedSet = (variableName: string, value: unknown) => {
            for (let i = newChain.length - 1; i >= 0; i--) {
                if (newChain[i].names.has(variableName)) {
                    writeComponent?.(newChain[i].componentId, variableName, value);
                    return;
                }
            }
            if (globalNames.has(variableName)) {
                writeGlobal?.(variableName, value);
                return;
            }
            writeGlobal?.(variableName, value);
        };

        const notify = parentCtx.notifyVariableChange;
        const scopedDrill = (variableName: string, value: unknown) => {
            scopedSet(variableName, value);
            notify?.(variableName, value);
        };

        return {
            ...parentCtx,
            variables: mergedVariables,
            variableScopeChain: newChain,
            onSetVariable: scopedSet,
            onDrillThrough: scopedDrill,
        };
    }, [parentCtx, hasOwnVariables, component.id, component.variables]);

    const exprCtx: ExpressionContext = {
        datasources: buildExpressionDatasources(ctx.datasources),
        parameters: ctx.parameters,
        variables: ctx.variables,
        builtInFields: ctx.builtInFields,
        currentRow: ctx.currentRow,
    };

    useEffect(() => {
        const styles = component.styles as ComponentStyleProps;
        if (styles.visible !== undefined) {
            setLoading(true);
            evalVisible(styles.visible, exprCtx)
                .then((v) => { setVisible(v); setLoading(false); })
                .catch(() => setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.styles, ctx.datasources, ctx.parameters, ctx.variables]);

    if (loading) return <Shimmer height={32} />;
    if (!visible) return null;

    const content = (
        <ComponentErrorBoundary componentId={component.id}>
            <ComponentContent component={component} exprCtx={exprCtx} depth={depth} />
        </ComponentErrorBoundary>
    );

    if (hasOwnVariables) {
        return <ViewerContext.Provider value={ctx}>{content}</ViewerContext.Provider>;
    }
    return content;
};

const ComponentContent: React.FC<{
    component: ReportComponent;
    exprCtx: ExpressionContext;
    depth: number;
}> = ({ component, exprCtx, depth }) => {
    const styleCss = toReactCSSProps(component.styles as ComponentStyleProps);

    switch (component.type) {
        case 'header':
            return <HeaderRenderer component={component} exprCtx={exprCtx} styleCss={styleCss} />;
        case 'text':
            return <TextRenderer component={component} exprCtx={exprCtx} styleCss={styleCss} />;
        case 'image':
            return <ImageRenderer component={component} exprCtx={exprCtx} styleCss={styleCss} />;
        case 'horizontal-line':
            return <HorizontalLineRenderer component={component} exprCtx={exprCtx} styleCss={styleCss} />;
        case 'columns':
            return <ColumnsRenderer component={component} styleCss={styleCss} depth={depth} />;
        case 'canvas':
            return <CanvasRenderer component={component} styleCss={styleCss} depth={depth} />;
        case 'tab':
            return <TabRenderer component={component} styleCss={styleCss} depth={depth} />;
        case 'repeater':
            return <RepeaterRenderer component={component} styleCss={styleCss} depth={depth} />;
        case 'table':
            return <TableRenderer component={component} styleCss={styleCss} />;
        case 'sub-report':
            return <SubReportRenderer component={component} styleCss={styleCss} />;
        case 'chart-bar':
        case 'chart-horizontal-bar':
        case 'chart-stacked-bar':
        case 'chart-pie':
        case 'chart-donut':
        case 'chart-line':
        case 'chart-area':
        case 'chart-polar-area':
        case 'chart-radar':
        case 'chart-scatter':
        case 'chart-bubble':
            return <ChartRenderer component={component} styleCss={styleCss} />;
        default:
            return (
                <div style={{ padding: '8px', color: 'var(--eui-text-muted)', fontSize: 12, fontStyle: 'italic', ...styleCss }}>
                    {component.type} — not rendered
                </div>
            );
    }
};

const headerTags: Record<string, React.ElementType> = {
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
};

const HeaderRenderer: React.FC<{
    component: ReportComponent;
    exprCtx: ExpressionContext;
    styleCss: React.CSSProperties;
}> = ({ component, exprCtx, styleCss }) => {
    const p = component.props as unknown as HeaderComponentProps;
    const content = useEvaluatedString(p.content, exprCtx, '');
    const tooltip = useEvaluatedString(p.tooltip, exprCtx, '');
    const anchorId = useEvaluatedString(p.anchorId, exprCtx, '');

    const level = p.level ?? 'h2';
    const fontSizes: Record<string, number> = { h1: 28, h2: 22, h3: 18, h4: 16, h5: 14, h6: 12 };
    const Tag = headerTags[level] ?? 'h2';

    return (
        <Tag
            id={anchorId || undefined}
            title={tooltip || undefined}
            style={{
                margin: 0,
                fontSize: fontSizes[level] ?? 18,
                fontWeight: 700,
                lineHeight: 1.3,
                color: 'var(--eui-text)',
                ...styleCss,
            }}
        >
            {content}
        </Tag>
    );
};

const TextRenderer: React.FC<{
    component: ReportComponent;
    exprCtx: ExpressionContext;
    styleCss: React.CSSProperties;
}> = ({ component, exprCtx, styleCss }) => {
    const p = component.props as unknown as TextComponentProps;
    const content = useEvaluatedString(p.content, exprCtx, '');
    const tooltip = useEvaluatedString(p.tooltip, exprCtx, '');

    return (
        <p
            title={tooltip || undefined}
            style={{
                margin: 0, fontSize: 13, lineHeight: 1.6,
                color: 'var(--eui-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                ...styleCss,
            }}
        >
            {content}
        </p>
    );
};

const ImageRenderer: React.FC<{
    component: ReportComponent;
    exprCtx: ExpressionContext;
    styleCss: React.CSSProperties;
}> = ({ component, exprCtx, styleCss }) => {
    const p = component.props as unknown as ImageComponentProps;
    const src = useEvaluatedString(p.src, exprCtx, '');
    const alt = useEvaluatedString(p.alt, exprCtx, '');
    const tooltip = useEvaluatedString(p.tooltip, exprCtx, '');
    const width = useEvaluatedString(p.width, exprCtx, '100%');
    const height = useEvaluatedString(p.height, exprCtx, 'auto');
    const href = useEvaluatedString(p.href, exprCtx, '');

    const safeSrc = sanitizeUrl(src, 'image');
    const safeHref = sanitizeUrl(href, 'link');

    if (!safeSrc) return null;

    const img = (
        <img
            src={safeSrc}
            alt={alt}
            title={tooltip || undefined}
            style={{
                display: 'block',
                width: width || '100%',
                height: height || 'auto',
                objectFit: (p.objectFit as React.CSSProperties['objectFit']) ?? 'contain',
                ...styleCss,
            }}
        />
    );

    if (safeHref) {
        return (
            <a
                href={safeHref}
                target={p.openInNewTab ? '_blank' : undefined}
                rel={p.openInNewTab ? 'noopener noreferrer' : undefined}
                style={{ display: 'inline-block' }}
            >
                {img}
            </a>
        );
    }
    return img;
};

const HorizontalLineRenderer: React.FC<{
    component: ReportComponent;
    exprCtx: ExpressionContext;
    styleCss: React.CSSProperties;
}> = ({ component, exprCtx, styleCss }) => {
    const p = component.props as unknown as HorizontalLineComponentProps;
    const label = useEvaluatedString(p.label, exprCtx, '');
    const color = useEvaluatedString(p.color, exprCtx, 'var(--eui-border-subtle)');
    const lineStyle = p.style ?? 'solid';
    return (
        <div
            style={{
                marginTop: p.marginTop ?? 8,
                marginBottom: p.marginBottom ?? 8,
                ...styleCss,
            }}
            role="separator"
            aria-label={label || undefined}
        >
            {label ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <hr style={{
                        flex: 1,
                        border: 'none',
                        borderTop: `${p.thickness ?? 1}px ${lineStyle} ${color}`,
                        margin: 0,
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--eui-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {label}
                    </span>
                    <hr style={{
                        flex: 1,
                        border: 'none',
                        borderTop: `${p.thickness ?? 1}px ${lineStyle} ${color}`,
                        margin: 0,
                    }} />
                </div>
            ) : (
                <hr style={{
                    border: 'none',
                    borderTop: `${p.thickness ?? 1}px ${lineStyle} ${color}`,
                    margin: 0,
                }} />
            )}
        </div>
    );
};

const ColumnsRenderer: React.FC<{
    component: ReportComponent;
    styleCss: React.CSSProperties;
    depth: number;
}> = ({ component, styleCss, depth }) => {
    const columns = component.children ?? [];
    const count = columns.length || 1;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 16, ...styleCss }}>
            {columns.map((col) => (
                <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(col.children ?? []).map((child) => (
                        <ComponentRenderer key={child.id} component={child} depth={depth + 1} />
                    ))}
                </div>
            ))}
        </div>
    );
};

const CanvasRenderer: React.FC<{
    component: ReportComponent;
    styleCss: React.CSSProperties;
    depth: number;
}> = ({ component, styleCss, depth }) => {
    const p = component.props as unknown as CanvasComponentProps;
    const children = component.children ?? [];
    return (
        <div style={{
            position: 'relative',
            width: p.width ?? '100%',
            height: p.height ?? '400px',
            ...styleCss,
        }}>
            {children.map((child) => {
                const layout = (child.props.canvasLayout as CanvasItemLayout | undefined) ?? { x: 0, y: 0, width: 200, height: 100 };
                return (
                    <div
                        key={child.id}
                        style={{
                            position: 'absolute',
                            left: layout.x,
                            top: layout.y,
                            width: layout.width,
                            height: layout.height,
                            overflow: 'hidden',
                        }}
                    >
                        <ComponentRenderer component={child} depth={depth + 1} />
                    </div>
                );
            })}
        </div>
    );
};

const TabRenderer: React.FC<{
    component: ReportComponent;
    styleCss: React.CSSProperties;
    depth: number;
}> = ({ component, styleCss, depth }) => {
    const p = component.props as unknown as TabComponentProps;
    const tabs = p.tabs ?? [];
    const panels = component.children ?? [];
    const [activeTabId, setActiveTabId] = useState<string>(p.defaultTabId ?? tabs[0]?.id ?? '');
    const activePanel = panels.find((panel) => panel.props.tabId === activeTabId);

    return (
        <div style={styleCss} className="eui-rv-tab">
            <div className="eui-rv-tab-tabs" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`eui-rv-tab-btn${activeTabId === tab.id ? ' active' : ''}`}
                        role="tab"
                        aria-selected={activeTabId === tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="eui-rv-tab-panel" role="tabpanel">
                {activePanel && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(activePanel.children ?? []).map((child) => (
                            <ComponentRenderer key={child.id} component={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
