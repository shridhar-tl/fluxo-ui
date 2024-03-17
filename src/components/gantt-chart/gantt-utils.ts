import {
    GanttDateCell, GanttWeekGroup, GanttViewMode, GanttTask,
    FlatTask
} from './gantt-types';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function normalizeDate(d: Date | string): Date {
    const date = typeof d === 'string' ? new Date(d) : new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function diffDays(a: Date, b: Date): number {
    const msPerDay = 86400000;
    return Math.round((normalizeDate(a).getTime() - normalizeDate(b).getTime()) / msPerDay);
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day + 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfQuarter(date: Date): Date {
    const q = Math.floor(date.getMonth() / 3) * 3;
    return new Date(date.getFullYear(), q, 1);
}

function getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
}

export function generateDateCells(
    start: Date,
    end: Date,
    isHoliday: (date: Date) => boolean
): GanttDateCell[] {
    const cells: GanttDateCell[] = [];
    const startNorm = normalizeDate(start);
    const endNorm = normalizeDate(end);
    const today = normalizeDate(new Date());
    let current = new Date(startNorm);
    let index = 0;

    while (current <= endNorm) {
        const dayOfWeek = current.getDay();
        cells.push({
            date: new Date(current),
            dateStr: current.toISOString().split('T')[0],
            dayNum: current.getDate(),
            dayName: dayNames[dayOfWeek],
            monthName: monthNames[current.getMonth()],
            year: current.getFullYear(),
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            isHoliday: isHoliday(current),
            isToday: isSameDay(current, today),
            columnIndex: index,
        });
        current = addDays(current, 1);
        index++;
    }

    return cells;
}

export function generateWeekGroups(dateCells: GanttDateCell[], viewMode: GanttViewMode): GanttWeekGroup[] {
    if (dateCells.length === 0) return [];

    const groups: GanttWeekGroup[] = [];

    switch (viewMode) {
        case 'day': {
            let currentLabel = '';
            let currentSpan = 0;

            for (const cell of dateCells) {
                const label = `${monthNamesFull[cell.date.getMonth()]} ${cell.year}`;
                if (label !== currentLabel) {
                    if (currentLabel) {
                        groups.push({ label: currentLabel, span: currentSpan });
                    }
                    currentLabel = label;
                    currentSpan = 1;
                } else {
                    currentSpan++;
                }
            }
            if (currentLabel) {
                groups.push({ label: currentLabel, span: currentSpan });
            }
            break;
        }
        case 'week': {
            let currentLabel = '';
            let currentSpan = 0;

            for (const cell of dateCells) {
                const ws = startOfWeek(cell.date);
                const label = `${monthNames[ws.getMonth()]} ${ws.getDate()} - ${monthNames[addDays(ws, 6).getMonth()]} ${addDays(ws, 6).getDate()}`;
                if (label !== currentLabel) {
                    if (currentLabel) {
                        groups.push({ label: currentLabel, span: currentSpan });
                    }
                    currentLabel = label;
                    currentSpan = 1;
                } else {
                    currentSpan++;
                }
            }
            if (currentLabel) {
                groups.push({ label: currentLabel, span: currentSpan });
            }
            break;
        }
        case 'month': {
            let currentLabel = '';
            let currentSpan = 0;

            for (const cell of dateCells) {
                const label = `${cell.year}`;
                if (label !== currentLabel) {
                    if (currentLabel) {
                        groups.push({ label: currentLabel, span: currentSpan });
                    }
                    currentLabel = label;
                    currentSpan = 1;
                } else {
                    currentSpan++;
                }
            }
            if (currentLabel) {
                groups.push({ label: currentLabel, span: currentSpan });
            }
            break;
        }
        case 'quarter': {
            let currentLabel = '';
            let currentSpan = 0;

            for (const cell of dateCells) {
                const label = `${cell.year}`;
                if (label !== currentLabel) {
                    if (currentLabel) {
                        groups.push({ label: currentLabel, span: currentSpan });
                    }
                    currentLabel = label;
                    currentSpan = 1;
                } else {
                    currentSpan++;
                }
            }
            if (currentLabel) {
                groups.push({ label: currentLabel, span: currentSpan });
            }
            break;
        }
        case 'year': {
            groups.push({ label: 'Years', span: dateCells.length });
            break;
        }
    }

    return groups;
}

export function generateSecondaryHeaders(dateCells: GanttDateCell[], viewMode: GanttViewMode): GanttWeekGroup[] {
    if (dateCells.length === 0) return [];

    switch (viewMode) {
        case 'day':
            return dateCells.map(cell => ({
                label: `${cell.dayNum}\n${cell.dayName}`,
                span: 1,
            }));
        case 'week': {
            const groups: GanttWeekGroup[] = [];
            let currentLabel = '';
            let currentSpan = 0;

            for (const cell of dateCells) {
                const ws = startOfWeek(cell.date);
                const label = `W${getWeekNumber(ws)}`;
                if (label !== currentLabel) {
                    if (currentLabel) {
                        groups.push({ label: currentLabel, span: currentSpan });
                    }
                    currentLabel = label;
                    currentSpan = 1;
                } else {
                    currentSpan++;
                }
            }
            if (currentLabel) {
                groups.push({ label: currentLabel, span: currentSpan });
            }
            return groups;
        }
        case 'month':
            return dateCells.map(cell => ({
                label: `${monthNames[cell.date.getMonth()]}`,
                span: 1,
            }));
        case 'quarter':
            return dateCells.map(cell => ({
                label: `Q${getQuarter(cell.date)}`,
                span: 1,
            }));
        case 'year':
            return dateCells.map(cell => ({
                label: `${cell.year}`,
                span: 1,
            }));
    }
}

function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function generateMonthCells(start: Date, end: Date, _isHoliday?: (date: Date) => boolean): GanttDateCell[] {
    const cells: GanttDateCell[] = [];
    let current = startOfMonth(normalizeDate(start));
    const endNorm = endOfMonth(normalizeDate(end));
    const today = normalizeDate(new Date());
    let index = 0;

    while (current <= endNorm) {
        const eom = endOfMonth(current);
        cells.push({
            date: new Date(current),
            dateStr: current.toISOString().split('T')[0],
            dayNum: current.getDate(),
            dayName: monthNames[current.getMonth()],
            monthName: monthNames[current.getMonth()],
            year: current.getFullYear(),
            isWeekend: false,
            isHoliday: false,
            isToday: current.getMonth() === today.getMonth() && current.getFullYear() === today.getFullYear(),
            columnIndex: index,
        });
        current = new Date(eom.getFullYear(), eom.getMonth() + 1, 1);
        index++;
    }

    return cells;
}

export function generateQuarterCells(start: Date, end: Date): GanttDateCell[] {
    const cells: GanttDateCell[] = [];
    let current = startOfQuarter(normalizeDate(start));
    const endNorm = normalizeDate(end);
    const today = normalizeDate(new Date());
    let index = 0;

    while (current <= endNorm) {
        const q = getQuarter(current);
        cells.push({
            date: new Date(current),
            dateStr: current.toISOString().split('T')[0],
            dayNum: current.getDate(),
            dayName: `Q${q}`,
            monthName: `Q${q}`,
            year: current.getFullYear(),
            isWeekend: false,
            isHoliday: false,
            isToday: getQuarter(today) === q && today.getFullYear() === current.getFullYear(),
            columnIndex: index,
        });
        current = new Date(current.getFullYear(), current.getMonth() + 3, 1);
        index++;
    }

    return cells;
}

export function generateYearCells(start: Date, end: Date): GanttDateCell[] {
    const cells: GanttDateCell[] = [];
    const startYear = normalizeDate(start).getFullYear();
    const endYear = normalizeDate(end).getFullYear();
    const todayYear = new Date().getFullYear();
    let index = 0;

    for (let y = startYear; y <= endYear; y++) {
        const d = new Date(y, 0, 1);
        cells.push({
            date: d,
            dateStr: d.toISOString().split('T')[0],
            dayNum: 1,
            dayName: `${y}`,
            monthName: 'Jan',
            year: y,
            isWeekend: false,
            isHoliday: false,
            isToday: y === todayYear,
            columnIndex: index,
        });
        index++;
    }

    return cells;
}

export function flattenTasks(
    tasks: GanttTask[],
    collapsedIds: Set<string>,
    depth = 0,
    parentId?: string
): FlatTask[] {
    const result: FlatTask[] = [];
    let index = 0;

    function walk(items: GanttTask[], d: number, pId?: string, parentCollapsed = false) {
        for (const task of items) {
            const hasChildren = !!task.children?.length;
            const isCollapsed = collapsedIds.has(task.id);
            const isVisible = !parentCollapsed;

            result.push({
                task,
                depth: d,
                index: index++,
                parentId: pId,
                hasChildren,
                isCollapsed,
                isVisible,
            });

            if (hasChildren && task.children) {
                walk(task.children, d + 1, task.id, parentCollapsed || isCollapsed);
            }
        }
    }

    walk(tasks, depth, parentId);
    return result;
}

export function getTaskBarPosition(
    task: GanttTask,
    startDate: Date,
    columnWidth: number,
    viewMode: GanttViewMode
): { left: number; width: number; startCol: number; endCol: number } | null {
    const taskStart = normalizeDate(task.start);
    const taskEnd = normalizeDate(task.end);

    if (taskEnd < taskStart) return null;

    switch (viewMode) {
        case 'day': {
            const startCol = diffDays(taskStart, startDate);
            const duration = diffDays(taskEnd, taskStart) + 1;
            return {
                left: startCol * columnWidth,
                width: duration * columnWidth,
                startCol,
                endCol: startCol + duration - 1,
            };
        }
        case 'week': {
            const startCol = diffDays(taskStart, startDate);
            const duration = diffDays(taskEnd, taskStart) + 1;
            return {
                left: startCol * columnWidth,
                width: duration * columnWidth,
                startCol,
                endCol: startCol + duration - 1,
            };
        }
        case 'month': {
            const ms = startOfMonth(startDate);
            const taskMs = startOfMonth(taskStart);
            const monthsDiff = (taskMs.getFullYear() - ms.getFullYear()) * 12 + (taskMs.getMonth() - ms.getMonth());
            const daysInStartMonth = endOfMonth(taskStart).getDate();
            const startFraction = (taskStart.getDate() - 1) / daysInStartMonth;
            const taskEndMonth = startOfMonth(taskEnd);
            const endMonthsDiff = (taskEndMonth.getFullYear() - ms.getFullYear()) * 12 + (taskEndMonth.getMonth() - ms.getMonth());
            const daysInEndMonth = endOfMonth(taskEnd).getDate();
            const endFraction = taskEnd.getDate() / daysInEndMonth;

            const left = (monthsDiff + startFraction) * columnWidth;
            const right = (endMonthsDiff + endFraction) * columnWidth;

            return {
                left,
                width: Math.max(right - left, columnWidth * 0.1),
                startCol: monthsDiff,
                endCol: endMonthsDiff,
            };
        }
        case 'quarter': {
            const qs = startOfQuarter(startDate);
            const taskQs = startOfQuarter(taskStart);
            const quartersDiff = ((taskQs.getFullYear() - qs.getFullYear()) * 12 + (taskQs.getMonth() - qs.getMonth())) / 3;

            const qEnd = new Date(taskQs.getFullYear(), taskQs.getMonth() + 3, 0);
            const daysInQuarter = diffDays(qEnd, taskQs) + 1;
            const startFraction = diffDays(taskStart, taskQs) / daysInQuarter;

            const taskEndQs = startOfQuarter(taskEnd);
            const endQDiff = ((taskEndQs.getFullYear() - qs.getFullYear()) * 12 + (taskEndQs.getMonth() - qs.getMonth())) / 3;
            const qEndEnd = new Date(taskEndQs.getFullYear(), taskEndQs.getMonth() + 3, 0);
            const daysInEndQuarter = diffDays(qEndEnd, taskEndQs) + 1;
            const endFraction = (diffDays(taskEnd, taskEndQs) + 1) / daysInEndQuarter;

            const left = (quartersDiff + startFraction) * columnWidth;
            const right = (endQDiff + endFraction) * columnWidth;

            return {
                left,
                width: Math.max(right - left, columnWidth * 0.1),
                startCol: Math.floor(quartersDiff),
                endCol: Math.floor(endQDiff),
            };
        }
        case 'year': {
            const startYear = startDate.getFullYear();
            const taskYear = taskStart.getFullYear();
            const yearsDiff = taskYear - startYear;
            const daysInYear = isLeapYear(taskYear) ? 366 : 365;
            const dayOfYear = getDayOfYear(taskStart);
            const startFraction = (dayOfYear - 1) / daysInYear;

            const taskEndYear = taskEnd.getFullYear();
            const endYearsDiff = taskEndYear - startYear;
            const daysInEndYear = isLeapYear(taskEndYear) ? 366 : 365;
            const endDayOfYear = getDayOfYear(taskEnd);
            const endFraction = endDayOfYear / daysInEndYear;

            const left = (yearsDiff + startFraction) * columnWidth;
            const right = (endYearsDiff + endFraction) * columnWidth;

            return {
                left,
                width: Math.max(right - left, columnWidth * 0.05),
                startCol: yearsDiff,
                endCol: endYearsDiff,
            };
        }
    }
}

function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / 86400000);
}

export function columnToDate(
    _columnIndex: number,
    startDate: Date,
    columnWidth: number,
    pixelOffset: number,
    viewMode: GanttViewMode
): Date {
    switch (viewMode) {
        case 'day':
        case 'week': {
            const col = Math.round(pixelOffset / columnWidth);
            return addDays(normalizeDate(startDate), col);
        }
        case 'month': {
            const monthOffset = pixelOffset / columnWidth;
            const ms = startOfMonth(normalizeDate(startDate));
            const totalMonths = ms.getMonth() + Math.floor(monthOffset);
            const years = Math.floor(totalMonths / 12);
            const months = totalMonths % 12;
            const frac = monthOffset - Math.floor(monthOffset);
            const d = new Date(ms.getFullYear() + years, months, 1);
            const daysInMonth = endOfMonth(d).getDate();
            d.setDate(Math.max(1, Math.round(frac * daysInMonth)));
            return d;
        }
        case 'quarter': {
            const qOffset = pixelOffset / columnWidth;
            const qs = startOfQuarter(normalizeDate(startDate));
            const totalMonths = qs.getMonth() + Math.floor(qOffset) * 3;
            const years = Math.floor(totalMonths / 12);
            const months = totalMonths % 12;
            const d = new Date(qs.getFullYear() + years, months, 1);
            const frac = qOffset - Math.floor(qOffset);
            const qEnd = new Date(d.getFullYear(), d.getMonth() + 3, 0);
            const daysInQ = diffDays(qEnd, d) + 1;
            d.setDate(Math.max(1, Math.round(frac * daysInQ)));
            return d;
        }
        case 'year': {
            const yOffset = pixelOffset / columnWidth;
            const year = normalizeDate(startDate).getFullYear() + Math.floor(yOffset);
            const frac = yOffset - Math.floor(yOffset);
            const daysInYear = isLeapYear(year) ? 366 : 365;
            const dayOfYear = Math.max(1, Math.round(frac * daysInYear));
            const d = new Date(year, 0, dayOfYear);
            return d;
        }
    }
}

export function getDefaultColumnWidth(viewMode: GanttViewMode): number {
    switch (viewMode) {
        case 'day': return 36;
        case 'week': return 36;
        case 'month': return 80;
        case 'quarter': return 120;
        case 'year': return 160;
    }
}

export function computeDateRange(tasks: GanttTask[], viewMode: GanttViewMode, startDate?: Date | string, endDate?: Date | string): { start: Date; end: Date } {
    let minDate: Date | null = startDate ? normalizeDate(startDate) : null;
    let maxDate: Date | null = endDate ? normalizeDate(endDate) : null;

    function walk(items: GanttTask[]) {
        for (const task of items) {
            const ts = normalizeDate(task.start);
            const te = normalizeDate(task.end);
            if (!minDate || ts < minDate) minDate = ts;
            if (!maxDate || te > maxDate) maxDate = te;
            if (task.children?.length) walk(task.children);
        }
    }

    walk(tasks);

    if (!minDate) minDate = normalizeDate(new Date());
    if (!maxDate) maxDate = addDays(minDate, 30);

    const paddingDays = viewMode === 'day' ? 7 : viewMode === 'week' ? 14 : viewMode === 'month' ? 30 : 90;
    minDate = addDays(minDate, -paddingDays);
    maxDate = addDays(maxDate, paddingDays);

    return { start: minDate, end: maxDate };
}

export function getTodayColumnIndex(_startDate: Date, dateCells: GanttDateCell[]): number {
    const idx = dateCells.findIndex(c => c.isToday);
    return idx;
}

export function getMarkerPosition(markerDate: Date | string, startDate: Date, columnWidth: number, viewMode: GanttViewMode): number {
    const md = normalizeDate(markerDate);
    const sd = normalizeDate(startDate);

    switch (viewMode) {
        case 'day':
        case 'week':
            return diffDays(md, sd) * columnWidth;
        case 'month': {
            const ms = startOfMonth(sd);
            const monthsDiff = (md.getFullYear() - ms.getFullYear()) * 12 + (md.getMonth() - ms.getMonth());
            const daysInMonth = endOfMonth(md).getDate();
            const fraction = (md.getDate() - 1) / daysInMonth;
            return (monthsDiff + fraction) * columnWidth;
        }
        case 'quarter': {
            const qs = startOfQuarter(sd);
            const quartersDiff = ((md.getFullYear() - qs.getFullYear()) * 12 + (md.getMonth() - qs.getMonth())) / 3;
            const mqs = startOfQuarter(md);
            const qEnd = new Date(mqs.getFullYear(), mqs.getMonth() + 3, 0);
            const daysInQ = diffDays(qEnd, mqs) + 1;
            const fraction = diffDays(md, mqs) / daysInQ;
            const totalQ = Math.floor(quartersDiff) + fraction;
            return totalQ * columnWidth;
        }
        case 'year': {
            const yearsDiff = md.getFullYear() - sd.getFullYear();
            const daysInYear = isLeapYear(md.getFullYear()) ? 366 : 365;
            const fraction = (getDayOfYear(md) - 1) / daysInYear;
            return (yearsDiff + fraction) * columnWidth;
        }
    }
}

export { normalizeDate, addDays, diffDays, isSameDay };
