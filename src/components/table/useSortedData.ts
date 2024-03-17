import { useMemo } from 'react';
import { getFieldValue, isNil } from '../../utils/common-fns';

function useSortedData<T>(rows: T[], field: string, isAsc: boolean = true, enabled: boolean): T[] {
    return useMemo(() => {
        if (!enabled || !field || !rows?.length) return rows;

        return [...rows].sort((a, b) => {
            const valA = getFieldValue(a, field);
            const valB = getFieldValue(b, field);

            if (isNil(valA) && isNil(valB)) return 0;
            if (isNil(valA)) return isAsc ? -1 : 1;
            if (isNil(valB)) return isAsc ? 1 : -1;

            let comparison = 0;

            if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            } else if (valA instanceof Date && valB instanceof Date) {
                comparison = valA.getTime() - valB.getTime();
            } else {
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                if (strA < strB) comparison = -1;
                else if (strA > strB) comparison = 1;
                else comparison = 0;
            }

            return isAsc ? comparison : -comparison;
        });
    }, [rows, field, isAsc, enabled]);
}

export default useSortedData;
