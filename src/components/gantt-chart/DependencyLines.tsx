import { memo, useMemo } from 'react';
import { useGanttContext } from './GanttContext';
import { FlatTask } from './gantt-types';
import { getTaskBarPosition } from './gantt-utils';

interface DependencyPath {
    id: string;
    d: string;
    color: string;
    arrowD: string;
}

function DependencyLines() {
    const {
        flatTasks, showDependencies, columnWidth, rowHeight,
        startDate, viewMode, totalWidth, totalHeight,
    } = useGanttContext();

    const paths = useMemo(() => {
        if (!showDependencies) return [];

        const taskMap = new Map<string, { flat: FlatTask; visibleIndex: number }>();
        let vIndex = 0;
        for (const ft of flatTasks) {
            if (ft.isVisible) {
                taskMap.set(ft.task.id, { flat: ft, visibleIndex: vIndex });
                vIndex++;
            }
        }

        const result: DependencyPath[] = [];
        const arrowSize = 5;

        for (const ft of flatTasks) {
            if (!ft.isVisible || !ft.task.dependencies?.length) continue;

            const targetInfo = taskMap.get(ft.task.id);
            if (!targetInfo) continue;

            const targetPos = getTaskBarPosition(ft.task, startDate, columnWidth, viewMode);
            if (!targetPos) continue;

            for (const dep of ft.task.dependencies) {
                const sourceInfo = taskMap.get(dep.targetId);
                if (!sourceInfo) continue;

                const sourcePos = getTaskBarPosition(sourceInfo.flat.task, startDate, columnWidth, viewMode);
                if (!sourcePos) continue;

                const sourceRowCenter = sourceInfo.visibleIndex * rowHeight + rowHeight / 2;
                const targetRowCenter = targetInfo.visibleIndex * rowHeight + rowHeight / 2;

                const depType = dep.type ?? 'finish-to-start';
                const color = dep.color ?? 'var(--eui-text-muted)';

                let startX: number;
                let endX: number;

                switch (depType) {
                    case 'finish-to-start':
                        startX = sourcePos.left + sourcePos.width;
                        endX = targetPos.left;
                        break;
                    case 'start-to-start':
                        startX = sourcePos.left;
                        endX = targetPos.left;
                        break;
                    case 'finish-to-finish':
                        startX = sourcePos.left + sourcePos.width;
                        endX = targetPos.left + targetPos.width;
                        break;
                    case 'start-to-finish':
                        startX = sourcePos.left;
                        endX = targetPos.left + targetPos.width;
                        break;
                }

                const midX = startX + (endX - startX) / 2;
                const curveRadius = Math.min(8, Math.abs(endX - startX) / 4, Math.abs(targetRowCenter - sourceRowCenter) / 4);

                let d: string;
                if (Math.abs(sourceRowCenter - targetRowCenter) < 2) {
                    d = `M ${startX} ${sourceRowCenter} L ${endX - arrowSize} ${targetRowCenter}`;
                } else {
                    const goingDown = targetRowCenter > sourceRowCenter;
                    const r = curveRadius;
                    d = `M ${startX} ${sourceRowCenter} `
                        + `L ${midX - r} ${sourceRowCenter} `
                        + `Q ${midX} ${sourceRowCenter} ${midX} ${sourceRowCenter + (goingDown ? r : -r)} `
                        + `L ${midX} ${targetRowCenter - (goingDown ? r : -r)} `
                        + `Q ${midX} ${targetRowCenter} ${midX + r} ${targetRowCenter} `
                        + `L ${endX - arrowSize} ${targetRowCenter}`;
                }

                const arrowD = `M ${endX - arrowSize} ${targetRowCenter - arrowSize} L ${endX} ${targetRowCenter} L ${endX - arrowSize} ${targetRowCenter + arrowSize}`;

                result.push({
                    id: `${dep.targetId}-${ft.task.id}-${depType}`,
                    d,
                    color,
                    arrowD,
                });
            }
        }

        return result;
    }, [flatTasks, showDependencies, columnWidth, rowHeight, startDate, viewMode]);

    if (!paths.length) return null;

    return (
        <svg
            className="eui-gantt-dependencies"
            style={{ width: totalWidth, height: totalHeight }}
        >
            {paths.map(path => (
                <g key={path.id}>
                    <path
                        d={path.d}
                        fill="none"
                        stroke={path.color}
                        strokeWidth={1.5}
                    />
                    <path
                        d={path.arrowD}
                        fill="none"
                        stroke={path.color}
                        strokeWidth={1.5}
                    />
                </g>
            ))}
        </svg>
    );
}

export default memo(DependencyLines);
