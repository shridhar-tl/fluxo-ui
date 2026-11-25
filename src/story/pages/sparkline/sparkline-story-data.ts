import type { SparklineType } from '../../../components';

export const revenueSeries = [42, 48, 45, 52, 58, 55, 63, 61, 70, 74, 72, 81];
export const churnSeries = [6.2, 5.9, 6.4, 6.1, 5.4, 5.6, 5.1, 4.8, 4.9, 4.4, 4.1, 3.9];
export const latencySeries = [120, 132, 118, 141, 160, 152, 171, 168, 190, 176, 182, 205];
export const signupSeries = [18, 22, 19, 25, 30, 28, 35, 33, 31, 38, 44, 41];
export const profitSeries = [4, -2, 6, 3, -5, 8, 2, -1, 7, 5, -3, 9];
export const winLossSeries = [1, 1, -1, 1, 0, -1, 1, 1, 1, -1, 1, 1, -1, 1];
export const flatSeries = [50, 52, 49, 51, 50, 52, 50, 51, 49, 50];
export const gapSeries: (number | null)[] = [12, 15, 14, null, null, 18, 21, 19, null, 24, 26, 25];
export const trafficShare = [48, 27, 15, 10];
export const trafficLabels = ['Organic', 'Direct', 'Referral', 'Social'];

export const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const revenueData = revenueSeries.map((value, index) => ({ value, label: monthLabels[index] }));

export const typeGallery: { type: SparklineType; title: string; data: number[] }[] = [
    { type: 'line', title: 'Line', data: revenueSeries },
    { type: 'area', title: 'Area', data: signupSeries },
    { type: 'bar', title: 'Bar', data: profitSeries },
    { type: 'winloss', title: 'Win / Loss', data: winLossSeries },
    { type: 'discrete', title: 'Discrete', data: latencySeries },
    { type: 'pie', title: 'Pie', data: trafficShare },
];

export interface KpiCard {
    id: string;
    title: string;
    value: string;
    delta: string;
    positive: boolean;
    data: number[];
    type: SparklineType;
    color: string;
}

export const kpiCards: KpiCard[] = [
    { id: 'revenue', title: 'Monthly revenue', value: '$81.4k', delta: '+12.5%', positive: true, data: revenueSeries, type: 'area', color: 'primary' },
    { id: 'signups', title: 'New sign-ups', value: '1,284', delta: '+8.1%', positive: true, data: signupSeries, type: 'bar', color: 'success' },
    { id: 'churn', title: 'Churn rate', value: '3.9%', delta: '-0.2 pts', positive: true, data: churnSeries, type: 'line', color: 'info' },
    { id: 'latency', title: 'p95 latency', value: '205 ms', delta: '+12.6%', positive: false, data: latencySeries, type: 'line', color: 'danger' },
];

export interface StockRow {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change: number;
    history: number[];
    volume: number[];
}

export const stockRows: StockRow[] = [
    { id: 'nova', symbol: 'NOVA', name: 'Nova Systems', price: 184.2, change: 2.4, history: [168, 171, 170, 175, 174, 179, 182, 180, 184], volume: [3, 5, 4, 6, 5, 7, 6, 8, 7] },
    { id: 'orbt', symbol: 'ORBT', name: 'Orbit Labs', price: 62.75, change: -1.8, history: [70, 68, 69, 66, 67, 64, 65, 63, 62.75], volume: [6, 4, 5, 7, 6, 5, 8, 6, 9] },
    { id: 'zeph', symbol: 'ZEPH', name: 'Zephyr Energy', price: 23.1, change: 0.1, history: [23, 23.4, 22.8, 23.2, 22.9, 23.3, 23, 23.2, 23.1], volume: [2, 3, 2, 3, 2, 4, 3, 2, 3] },
    { id: 'lume', symbol: 'LUME', name: 'Lumen Health', price: 410.6, change: 5.6, history: [352, 360, 371, 368, 380, 392, 388, 401, 410.6], volume: [4, 6, 7, 5, 8, 9, 7, 10, 11] },
    { id: 'krat', symbol: 'KRAT', name: 'Krato Mining', price: 9.84, change: -4.2, history: [12.1, 11.8, 11.2, 11.5, 10.9, 10.4, 10.7, 10.1, 9.84], volume: [9, 8, 10, 7, 11, 12, 9, 13, 14] },
];

export const bulletRows = [
    { id: 'q1', label: 'Q1 sales', value: 82, target: 90, ranges: [60, 85, 100] },
    { id: 'q2', label: 'Q2 sales', value: 94, target: 90, ranges: [60, 85, 100] },
    { id: 'nps', label: 'NPS', value: 41, target: 50, ranges: [30, 50, 70] },
];
