import type { DrawItem } from '../../../components/canvas-draw/canvas-draw-types';
import type { TimelineItem, TimelineGroup } from '../../../components/canvas-draw/MediaTimeline';

export const sampleImageUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80';

export const prebuiltItems: DrawItem[] = [
    {
        id: 'demo-arrow-1',
        object: { id: 'obj-1', type: 'arrow', strokeColor: 'red', strokeWidth: 2, x1: 0.1, y1: 0.3, x2: 0.35, y2: 0.15, arrowheadStyle: 'single' },
        showAtMs: 0, hideAtMs: null, transition: 'none', groupId: null, xPct: 0.1, yPct: 0.15, wPct: 0.25, hPct: 0.15,
    },
    {
        id: 'demo-rect-1',
        object: { id: 'obj-2', type: 'rect', strokeColor: 'blue', strokeWidth: 2, x: 0, y: 0, width: 100, height: 60, fillColor: 'transparent', rounded: false },
        showAtMs: 0, hideAtMs: null, transition: 'none', groupId: null, xPct: 0.4, yPct: 0.2, wPct: 0.2, hPct: 0.25,
    },
    {
        id: 'demo-text-1',
        object: { id: 'obj-3', type: 'text', strokeColor: 'black', strokeWidth: 0, x: 0, y: 0, width: 140, height: 30, text: 'Sample Annotation', fontFamily: 'sans-serif', fontSize: 14, fontColor: 'red', fillColor: 'transparent' },
        showAtMs: 0, hideAtMs: null, transition: 'none', groupId: null, xPct: 0.05, yPct: 0.7, wPct: 0.3, hPct: 0.1,
    },
    {
        id: 'demo-step-1',
        object: { id: 'obj-4', type: 'step', strokeColor: 'red', strokeWidth: 2, x: 0, y: 0, radius: 14, stepNumber: 1, fillColor: 'red', fontColor: 'white' },
        showAtMs: 0, hideAtMs: null, transition: 'none', groupId: null, xPct: 0.7, yPct: 0.1, wPct: null, hPct: null,
    },
];

export const timedItems: DrawItem[] = [
    {
        id: 'timed-1',
        object: { id: 'tobj-1', type: 'rect', strokeColor: 'blue', strokeWidth: 2, x: 0, y: 0, width: 100, height: 60, fillColor: 'transparent', rounded: false },
        showAtMs: 0, hideAtMs: 3000, transition: 'fade', groupId: null, xPct: 0.1, yPct: 0.15, wPct: 0.3, hPct: 0.3,
    },
    {
        id: 'timed-2',
        object: { id: 'tobj-2', type: 'arrow', strokeColor: 'red', strokeWidth: 2, x1: 0.5, y1: 0.5, x2: 0.8, y2: 0.2, arrowheadStyle: 'single' },
        showAtMs: 2000, hideAtMs: 5000, transition: 'scale', groupId: null, xPct: 0.5, yPct: 0.2, wPct: 0.3, hPct: 0.3,
    },
    {
        id: 'timed-3',
        object: { id: 'tobj-3', type: 'text', strokeColor: 'black', strokeWidth: 0, x: 0, y: 0, width: 160, height: 30, text: 'Appears at 4s', fontFamily: 'sans-serif', fontSize: 16, fontColor: 'green', fillColor: 'transparent' },
        showAtMs: 4000, hideAtMs: null, transition: 'slide-up', groupId: null, xPct: 0.3, yPct: 0.6, wPct: 0.35, hPct: 0.1,
    },
];

export const initialTimelineItems: TimelineItem[] = [
    { id: 'tl-1', label: 'Intro text', color: '#4361ee', showAtMs: 0, hideAtMs: 3000, groupId: null, transition: 'fade' },
    { id: 'tl-2', label: 'Highlight', color: '#e63946', showAtMs: 2000, hideAtMs: 6000, groupId: null, transition: 'scale' },
    { id: 'tl-3', label: 'Arrow callout', color: '#52b788', showAtMs: 5000, hideAtMs: null, groupId: null, transition: 'slide-up' },
];

export type { TimelineItem, TimelineGroup };
