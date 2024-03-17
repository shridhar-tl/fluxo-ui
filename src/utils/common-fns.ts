export function getPercentageChange(current?: number, previous?: number) {
    if (!previous || !current) return 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}

export function isNil(value: any) {
    return value === undefined || value === null;
}

export function stop(arg: any) {
    if (typeof arg === 'function') {
        return (e: any) => {
            stop(e);
            arg(e);
        };
    }

    arg.stopPropagation();
    arg.preventDefault();
}

export function stopPropagation(e: any) {
    e.stopPropagation();
}

export function getFieldValue(obj: any, field: string) {
    if (!obj || !field) {
        return '';
    }

    if (!field.indexOf('.')) {
        return obj[field];
    }

    const parts = field.split('.');
    let val = obj;

    for (const part of parts) {
        val = val[part];
        if (!val) {
            return;
        }
    }

    return val;
}

export function setFieldValue(obj: any, field: string, value: any): any {
    if (!field) {
        return obj;
    }

    const parts = field.split('.');

    function setRec(currentObj: any, parts: string[], value: any): any {
        const [head, ...tail] = parts;

        if (tail.length === 0) {
            return {
                ...(typeof currentObj === 'object' && currentObj !== null ? currentObj : {}),
                [head]: value,
            };
        }

        const nextObj = typeof currentObj === 'object' && currentObj !== null && currentObj[head] !== undefined ? currentObj[head] : {};

        return {
            ...(typeof currentObj === 'object' && currentObj !== null ? currentObj : {}),
            [head]: setRec(nextObj, tail, value),
        };
    }

    return setRec(obj, parts, value);
}

export function removeNilValues(obj: Record<string, any>) {
    if (!obj) {
        return obj;
    }

    return Object.keys(obj).reduce((result, key) => {
        const val = obj[key];

        if (!isNil(val)) {
            result[key] = val;
        }
        return result;
    }, {} as any);
}

export function debounce<R, T extends (...args: any[]) => Promise<R>>(fn: T, delay: number = 350): (...args: Parameters<T>) => Promise<R> {
    let timeoutId: any = null;

    return (...args: Parameters<T>): Promise<R> => {
        return new Promise<R>((resolve) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                const result = fn(...args);
                if (typeof result.then === 'function') {
                    result.then(resolve);
                } else {
                    resolve(result);
                }
            }, delay);
        });
    };
}
