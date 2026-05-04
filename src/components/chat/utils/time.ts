export function formatTime(dateTime: string | number | Date | undefined | null): string | null {
    if (!dateTime) return null;
    const d = typeof dateTime === 'string' || typeof dateTime === 'number' ? new Date(dateTime) : dateTime;
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;
    let hours = d.getHours();
    let minutes: number | string = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

export function formatBytes(bytes: number | undefined | null): string {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
}

export function formatRelative(dateTime: string | number | Date | undefined | null): string {
    if (!dateTime) return '';
    const d = typeof dateTime === 'string' || typeof dateTime === 'number' ? new Date(dateTime) : dateTime;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return d.toLocaleDateString();
}
