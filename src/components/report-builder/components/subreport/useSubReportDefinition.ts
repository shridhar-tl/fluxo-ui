import { useCallback, useEffect, useState } from 'react';
import { useReportBuilderContext } from '../../report-builder-context';
import type { ReportDefinition } from '../../report-definition-types';

export interface SubReportDefinitionState {
    definition: ReportDefinition | null;
    loading: boolean;
    error: string | null;
    reload: () => void;
}

export function useBuilderSubReportDefinition(subReportId: string | undefined): SubReportDefinitionState {
    const { subReportHooks } = useReportBuilderContext();
    const resolve = subReportHooks.resolveSubReport;
    const [version, setVersion] = useState(0);
    const [state, setState] = useState<{ key: string; definition: ReportDefinition | null; error: string | null } | null>(null);
    const key = `${subReportId ?? ''}:${version}`;

    useEffect(() => {
        if (!subReportId || !resolve) return;
        let cancelled = false;
        resolve(subReportId)
            .then((definition) => { if (!cancelled) setState({ key, definition, error: null }); })
            .catch((err: unknown) => {
                if (!cancelled) setState({ key, definition: null, error: err instanceof Error ? err.message : String(err) });
            });
        return () => { cancelled = true; };
    }, [subReportId, resolve, key]);

    const reload = useCallback(() => setVersion((v) => v + 1), []);
    const current = state?.key === key ? state : null;

    return {
        definition: current?.definition ?? null,
        loading: !!subReportId && !!resolve && !current,
        error: current?.error ?? null,
        reload,
    };
}
