import React from 'react';
import {
    BarChartIcon,
    CalendarLineIcon,
    DonutChartIcon,
    LineChartUpIcon,
    PieChartIcon,
    UsersIcon,
    WrenchIcon,
} from '../../../assets/icons';
import type { DashboardLayouts, DashboardWidget } from '../../../components/dashboard-layout';

const sparkPath = 'M2 22 L8 14 L14 18 L20 6 L26 12 L32 4';

const StatCard: React.FC<{ label: string; value: string; delta: string; up?: boolean }> = ({ label, value, delta, up }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--eui-text)' }}>{value}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: up ? '#10b981' : '#ef4444' }}>{delta}</span>
        </div>
        <svg viewBox="0 0 32 24" width="100%" height="40" aria-hidden="true">
            <path d={sparkPath} fill="none" stroke="var(--eui-primary)" strokeWidth="1.5" />
        </svg>
    </div>
);

const Sales: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
        <StatCard label="Today" value="$12,480" delta="+18%" up />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 10, background: 'var(--eui-bg-subtle)', borderRadius: 6, border: '1px solid var(--eui-border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>Orders</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--eui-text)' }}>284</div>
            </div>
            <div style={{ padding: 10, background: 'var(--eui-bg-subtle)', borderRadius: 6, border: '1px solid var(--eui-border-subtle)' }}>
                <div style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>Avg ticket</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--eui-text)' }}>$43.94</div>
            </div>
        </div>
    </div>
);

const Visitors: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--eui-text)' }}>4,231</span>
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>+12%</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>Unique visitors last 24h</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flex: 1, marginTop: 8 }}>
            {[28, 38, 22, 65, 48, 70, 55, 82, 60, 95, 78, 88].map((h, i) => (
                <div
                    key={i}
                    style={{
                        flex: 1,
                        height: `${h}%`,
                        background: 'var(--eui-primary)',
                        opacity: 0.6 + (i / 24),
                        borderRadius: '2px 2px 0 0',
                    }}
                />
            ))}
        </div>
    </div>
);

const Channels: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
        {[
            { name: 'Direct', value: 42, color: '#3b82f6' },
            { name: 'Organic', value: 28, color: '#10b981' },
            { name: 'Referral', value: 18, color: '#f59e0b' },
            { name: 'Social', value: 12, color: '#a855f7' },
        ].map((c) => (
            <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--eui-text)' }}>{c.name}</span>
                    <span style={{ color: 'var(--eui-text-muted)' }}>{c.value}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--eui-bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.value}%`, background: c.color, borderRadius: 3 }} />
                </div>
            </div>
        ))}
    </div>
);

const RecentOrders: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
        {[
            { id: '#10245', name: 'Alex Chen', amount: '$248.00', status: 'shipped' },
            { id: '#10244', name: 'Priya Patel', amount: '$72.50', status: 'paid' },
            { id: '#10243', name: 'Sara Okafor', amount: '$1,210.00', status: 'paid' },
            { id: '#10242', name: 'Diego Romero', amount: '$96.25', status: 'pending' },
        ].map((o) => (
            <div
                key={o.id}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    background: 'var(--eui-bg-subtle)',
                    borderRadius: 6,
                    border: '1px solid var(--eui-border-subtle)',
                    fontSize: 12,
                }}
            >
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--eui-text)' }}>{o.name}</div>
                    <div style={{ color: 'var(--eui-text-muted)', fontSize: 11 }}>{o.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--eui-text)' }}>{o.amount}</div>
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color:
                                o.status === 'paid'
                                    ? '#10b981'
                                    : o.status === 'shipped'
                                        ? '#3b82f6'
                                        : '#f59e0b',
                        }}
                    >
                        {o.status}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const Calendar: React.FC = () => {
    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, height: '100%' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                <div key={d} style={{ fontSize: 10, color: 'var(--eui-text-muted)', textAlign: 'center', fontWeight: 600 }}>
                    {d}
                </div>
            ))}
            {days.map((d) => (
                <div
                    key={d}
                    style={{
                        fontSize: 11,
                        textAlign: 'center',
                        padding: '4px 0',
                        borderRadius: 4,
                        background: d === today.getDate() ? 'var(--eui-primary)' : 'transparent',
                        color: d === today.getDate() ? 'var(--eui-text-on-primary)' : 'var(--eui-text)',
                        fontWeight: d === today.getDate() ? 600 : 400,
                    }}
                >
                    {d}
                </div>
            ))}
        </div>
    );
};

const Team: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
        {[
            { name: 'Alex Chen', role: 'Engineering', online: true },
            { name: 'Priya Patel', role: 'Design', online: true },
            { name: 'Sara Okafor', role: 'Product', online: false },
            { name: 'Diego Romero', role: 'Sales', online: true },
        ].map((p) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--eui-primary-subtle)',
                        color: 'var(--eui-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        position: 'relative',
                    }}
                >
                    {p.name.split(' ').map((n) => n[0]).join('')}
                    {p.online && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: -1,
                                right: -1,
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                background: '#10b981',
                                border: '2px solid var(--eui-bg)',
                            }}
                        />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--eui-text)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>{p.role}</div>
                </div>
            </div>
        ))}
    </div>
);

const SystemHealth: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
        {[
            { label: 'CPU', value: 32 },
            { label: 'Memory', value: 68 },
            { label: 'Disk', value: 45 },
            { label: 'Network', value: 18 },
        ].map((m) => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--eui-text)' }}>{m.label}</span>
                    <span style={{ color: 'var(--eui-text-muted)' }}>{m.value}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--eui-bg-subtle)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                        style={{
                            height: '100%',
                            width: `${m.value}%`,
                            background: m.value > 80 ? '#ef4444' : m.value > 50 ? '#f59e0b' : '#10b981',
                            borderRadius: 2,
                        }}
                    />
                </div>
            </div>
        ))}
    </div>
);

export function buildDemoWidgets(options: { withSettings?: boolean } = {}): DashboardWidget[] {
    const { withSettings = false } = options;
    return [
        {
            id: 'sales',
            title: 'Sales',
            icon: LineChartUpIcon,
            description: 'Revenue summary with sparkline',
            lastUpdated: new Date(Date.now() - 1000 * 60 * 4),
            children: <Sales />,
            renderSettings: withSettings
                ? ({ closeSettings }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                            <span>Compare to prev period</span>
                            <input type="checkbox" defaultChecked />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                            <span>Show sparkline</span>
                            <input type="checkbox" defaultChecked />
                        </label>
                        <button
                            type="button"
                            onClick={closeSettings}
                            style={{
                                marginTop: 4,
                                padding: '6px 10px',
                                background: 'var(--eui-primary)',
                                color: 'var(--eui-text-on-primary)',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 12,
                            }}
                        >
                            Save
                        </button>
                    </div>
                )
                : undefined,
        },
        {
            id: 'visitors',
            title: 'Visitors',
            icon: UsersIcon,
            description: 'Unique visitor traffic',
            onRefresh: async () => {
                await new Promise((resolve) => setTimeout(resolve, 700));
            },
            lastUpdated: new Date(Date.now() - 1000 * 60 * 12),
            children: <Visitors />,
        },
        {
            id: 'channels',
            title: 'Channels',
            icon: PieChartIcon,
            description: 'Traffic source breakdown',
            children: <Channels />,
        },
        {
            id: 'orders',
            title: 'Recent Orders',
            icon: BarChartIcon,
            description: 'Latest 4 orders',
            children: <RecentOrders />,
        },
        {
            id: 'calendar',
            title: 'Calendar',
            icon: CalendarLineIcon,
            description: 'Month at a glance',
            children: <Calendar />,
        },
        {
            id: 'team',
            title: 'Team',
            icon: UsersIcon,
            description: 'Online teammates',
            children: <Team />,
        },
        {
            id: 'health',
            title: 'System Health',
            icon: WrenchIcon,
            description: 'CPU, memory, disk, network',
            chrome: 'sunken',
            children: <SystemHealth />,
        },
        {
            id: 'conversion',
            title: 'Conversion',
            icon: DonutChartIcon,
            description: 'Funnel conversion rate',
            hidden: true,
            children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--eui-text)' }}>4.8%</span>
                    <span style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>vs 4.2% last week</span>
                </div>
            ),
        },
    ];
}

export const demoDefaultLayouts: DashboardLayouts = {
    lg: [
        { id: 'sales', x: 0, y: 0, w: 4, h: 4 },
        { id: 'visitors', x: 4, y: 0, w: 4, h: 4 },
        { id: 'channels', x: 8, y: 0, w: 4, h: 4 },
        { id: 'orders', x: 0, y: 4, w: 6, h: 5 },
        { id: 'calendar', x: 6, y: 4, w: 3, h: 5 },
        { id: 'team', x: 9, y: 4, w: 3, h: 5 },
        { id: 'health', x: 0, y: 9, w: 12, h: 4 },
    ],
    md: [
        { id: 'sales', x: 0, y: 0, w: 5, h: 4 },
        { id: 'visitors', x: 5, y: 0, w: 5, h: 4 },
        { id: 'channels', x: 0, y: 4, w: 5, h: 4 },
        { id: 'orders', x: 5, y: 4, w: 5, h: 4 },
        { id: 'calendar', x: 0, y: 8, w: 5, h: 5 },
        { id: 'team', x: 5, y: 8, w: 5, h: 5 },
        { id: 'health', x: 0, y: 13, w: 10, h: 4 },
    ],
    sm: [
        { id: 'sales', x: 0, y: 0, w: 6, h: 4 },
        { id: 'visitors', x: 0, y: 4, w: 6, h: 4 },
        { id: 'channels', x: 0, y: 8, w: 6, h: 4 },
        { id: 'orders', x: 0, y: 12, w: 6, h: 5 },
        { id: 'calendar', x: 0, y: 17, w: 6, h: 5 },
        { id: 'team', x: 0, y: 22, w: 6, h: 5 },
        { id: 'health', x: 0, y: 27, w: 6, h: 4 },
    ],
    xs: [
        { id: 'sales', x: 0, y: 0, w: 2, h: 4 },
        { id: 'visitors', x: 0, y: 4, w: 2, h: 4 },
        { id: 'orders', x: 0, y: 8, w: 2, h: 5 },
        { id: 'team', x: 0, y: 13, w: 2, h: 5 },
        { id: 'health', x: 0, y: 18, w: 2, h: 4 },
        { id: 'channels', x: 0, y: 22, w: 2, h: 4 },
        { id: 'calendar', x: 0, y: 26, w: 2, h: 5 },
    ],
};
