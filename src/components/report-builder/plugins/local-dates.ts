const localDatePattern = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

/** Serialises a date as local wall-clock text (`yyyy-MM-dd` or `yyyy-MM-ddTHH:mm:ss`), which survives JSON without a timezone shift. */
export function toLocalDateText(date: Date): string {
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) return day;
    return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function parseLocalDateText(value: unknown): Date | null {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value !== 'string') return null;
    const match = localDatePattern.exec(value.trim());
    if (!match) return null;
    const [, y, m, d, hh, mi, ss] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh ?? 0), Number(mi ?? 0), Number(ss ?? 0));
    if (date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) return null;
    return date;
}
