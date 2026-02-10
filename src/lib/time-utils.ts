import { format, addSeconds } from 'date-fns';

export function formatSeconds(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');
}

export function parseTimeToSeconds(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }
    if (parts.length === 2) {
        return (parts[0] * 60) + parts[1];
    }
    return 0;
}

export function shiftTime(timeStr: string, seconds: number): string {
    if (!timeStr || timeStr === '00:00:00' || timeStr === '') return timeStr;
    try {
        const today = new Date();
        const [h, m, s] = timeStr.split(':').map(Number);
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, s);
        const newDate = addSeconds(date, seconds);
        return format(newDate, 'HH:mm:ss');
    } catch (e) {
        return timeStr;
    }
}
