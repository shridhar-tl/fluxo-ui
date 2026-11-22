import React, { useMemo } from 'react';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import type { ReportBuilderState } from '../report-builder-types';
import { collectReportProblems, type ReportProblem } from '../report-problems';

export const ConsolePanel: React.FC = () => {
    const { store } = useReportBuilderContext();
    const definition = useRBStore((s) => s.definition);
    const problems = useMemo(() => collectReportProblems(definition), [definition]);

    const select = (problem: ReportProblem) => {
        store.setState((prev: ReportBuilderState) => ({ ...prev, selectedItemId: problem.itemId, selectedItemType: problem.itemType }));
    };

    if (problems.length === 0) {
        return (
            <div className="eui-rb-console">
                <div className="eui-rb-console-empty">No problems found in the report.</div>
            </div>
        );
    }

    const errors = problems.filter((p) => p.level === 'error').length;
    const warnings = problems.length - errors;
    return (
        <div className="eui-rb-console">
            <div className="eui-rb-console-summary">
                {errors} error{errors === 1 ? '' : 's'}, {warnings} warning{warnings === 1 ? '' : 's'}. Select a problem to open the item.
            </div>
            <ul className="eui-rb-console-output" aria-label="Report problems">
                {problems.map((problem, i) => (
                    <li key={`${problem.itemId}-${i}`}>
                        <button type="button" className={`eui-rb-console-entry eui-rb-console-${problem.level}`} onClick={() => select(problem)}>
                            <span className="eui-rb-console-level">{problem.level === 'error' ? 'Error' : 'Warning'}</span>
                            {problem.message}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
