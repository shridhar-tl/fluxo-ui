import React, { useCallback, useMemo } from 'react';
import { evaluateExpression } from '../expression/expression-parser';
import type { ExpressionContext } from '../expression/expression-types';
import type { ComponentStyleProps, ReportComponent } from '../report-definition-types';
import { toReactCSSProps } from './component-styles';
import { buildExpressionDatasources, useViewerContext } from './ViewerExpressionContext';

const noRows: Record<string, unknown>[] = [];

export const PluginComponentRenderer: React.FC<{ component: ReportComponent }> = ({ component }) => {
    const viewerCtx = useViewerContext();
    const styleCss = useMemo(() => toReactCSSProps(component.styles as ComponentStyleProps), [component.styles]);
    const exprCtx = useMemo<ExpressionContext>(
        () => ({
            datasources: buildExpressionDatasources(viewerCtx.datasources),
            parameters: viewerCtx.parameters,
            variables: viewerCtx.variables,
            builtInFields: viewerCtx.builtInFields,
            currentRow: viewerCtx.currentRow,
        }),
        [viewerCtx.datasources, viewerCtx.parameters, viewerCtx.variables, viewerCtx.builtInFields, viewerCtx.currentRow],
    );
    const plugin = viewerCtx.componentPlugins?.find((p) => p.type === component.type);
    const { datasources, datasourceConfigs, loadingDatasources, errorDatasources } = viewerCtx;

    const nameOf = useCallback((id: string | undefined) => (id ? datasourceConfigs.find((d) => d.id === id)?.name : undefined), [datasourceConfigs]);

    const getRows = useCallback(
        (id: string | undefined) => {
            const name = nameOf(id);
            return (name && datasources[name]?.rows) || noRows;
        },
        [nameOf, datasources],
    );

    const isLoading = useCallback((id: string | undefined) => !!id && loadingDatasources.has(id), [loadingDatasources]);
    const getError = useCallback((id: string | undefined) => (id ? errorDatasources.get(id) : undefined), [errorDatasources]);

    const evaluate = useCallback(
        async (expression: string, row?: Record<string, unknown>) => {
            const input = expression.startsWith('=') ? expression.slice(1) : expression;
            const ctx: ExpressionContext = row ? { ...exprCtx, currentRow: row } : exprCtx;
            const { result, error } = await evaluateExpression(input, ctx);
            if (error) throw new Error(error);
            return result;
        },
        [exprCtx],
    );

    const exportMode = !!viewerCtx.exportMode;
    const renderProps = useMemo(
        () => ({ component, style: styleCss, getRows, isLoading, getError, evaluate, exportMode }),
        [component, styleCss, getRows, isLoading, getError, evaluate, exportMode],
    );

    if (!plugin) {
        return (
            <div className="eui-rv-plugin-missing" style={styleCss}>
                The &quot;{component.type}&quot; component is not available in this application.
            </div>
        );
    }

    const Renderer = plugin.Renderer;
    return <Renderer {...renderProps} />;
};
