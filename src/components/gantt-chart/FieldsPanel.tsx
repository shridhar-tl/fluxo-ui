import { useCallback, useRef, memo, useMemo } from 'react';
import classNames from 'classnames';
import { GanttColumn, GanttColumnTemplateProps, FlatTask } from './gantt-types';
import { useGanttContext } from './GanttContext';
import { getFieldValue } from '../../utils/common-fns';

interface FieldsPanelProps {
    columns: GanttColumn[];
    width?: number | string;
    bodyRef: React.RefObject<HTMLDivElement | null>;
    headerHeight: number;
}

function FieldsPanel({ columns, bodyRef, headerHeight }: FieldsPanelProps) {
    const { flatTasks, rowHeight, collapsedIds, toggleCollapse, onExpandToggle } = useGanttContext();
    const headerRef = useRef<HTMLDivElement>(null);

    const visibleTasks = useMemo(() => flatTasks.filter(ft => ft.isVisible), [flatTasks]);

    const handleToggle = useCallback((taskId: string, hasChildren: boolean) => {
        if (!hasChildren) return;
        toggleCollapse(taskId);
        const ft = flatTasks.find(f => f.task.id === taskId);
        if (ft && onExpandToggle) {
            onExpandToggle(ft.task, collapsedIds.has(taskId));
        }
    }, [toggleCollapse, flatTasks, collapsedIds, onExpandToggle]);

    return (
        <div className="eui-gantt-fields">
            <div
                className="eui-gantt-fields-header"
                ref={headerRef}
                style={headerHeight ? { height: headerHeight, minHeight: headerHeight } : undefined}
            >
                <div className="eui-gantt-fields-header-row">
                    {columns.map(col => (
                        <div
                            key={col.field}
                            className="eui-gantt-fields-header-cell"
                            style={{
                                width: col.width ?? 150,
                                minWidth: col.minWidth ?? 80,
                                textAlign: col.align ?? 'left',
                            }}
                        >
                            {col.headerText}
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="eui-gantt-fields-body"
                ref={bodyRef}
            >
                {visibleTasks.map(ft => (
                    <FieldRow
                        key={ft.task.id}
                        flatTask={ft}
                        columns={columns}
                        rowHeight={rowHeight}
                        onToggle={handleToggle}
                    />
                ))}
            </div>
        </div>
    );
}

export default memo(FieldsPanel);

interface FieldRowProps {
    flatTask: FlatTask;
    columns: GanttColumn[];
    rowHeight: number;
    onToggle: (taskId: string, hasChildren: boolean) => void;
}

const FieldRow = memo(function FieldRow({ flatTask, columns, rowHeight, onToggle }: FieldRowProps) {
    const { task, depth, hasChildren, isCollapsed } = flatTask;

    return (
        <div
            className="eui-gantt-fields-row"
            style={{ height: rowHeight }}
        >
            {columns.map((col, colIndex) => {
                const value = getFieldValue(task, col.field) ?? getFieldValue(task.data ?? {}, col.field);
                const Template = col.template;

                const templateProps: GanttColumnTemplateProps = {
                    value,
                    task,
                    column: col,
                    depth,
                };

                const isFirstCol = colIndex === 0;
                const indent = isFirstCol ? 16 + depth * 20 : 0;

                return (
                    <div
                        key={col.field}
                        className="eui-gantt-fields-cell"
                        style={{
                            width: col.width ?? 150,
                            minWidth: col.minWidth ?? 80,
                            paddingLeft: indent,
                            textAlign: col.align ?? 'left',
                        }}
                    >
                        {isFirstCol && hasChildren && (
                            <button
                                className={classNames('eui-gantt-toggle-btn', { collapsed: isCollapsed })}
                                onClick={() => onToggle(task.id, hasChildren)}
                                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                                aria-expanded={!isCollapsed}
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                    <path d={isCollapsed ? 'M3 1L8 5L3 9Z' : 'M1 3L5 8L9 3Z'} />
                                </svg>
                            </button>
                        )}
                        {isFirstCol && !hasChildren && <span className="eui-gantt-toggle-spacer" />}
                        <span className="eui-gantt-fields-cell-content">
                            {Template ? <Template {...templateProps} /> : String(value ?? '')}
                        </span>
                    </div>
                );
            })}
        </div>
    );
});
