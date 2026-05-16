import React, { useMemo, useState } from 'react';
import { DownloadIcon, ExternalLinkIcon, FilterIcon, ShareIcon } from '../../../assets/icons';
import { DashboardLayout } from '../../../components/dashboard-layout';
import type { DashboardLayouts, DashboardWidget } from '../../../components/dashboard-layout';
import { Dropdown } from '../../../components/Dropdown';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<DashboardWidget
  id="sales"
  title="Sales"
  headerActions={
    <>
      <button className="eui-dashboard-widget-action" aria-label="Filter">
        <FilterIcon width={14} height={14} aria-hidden="true" />
      </button>
      <Dropdown
        value={range}
        options={[{ label: '7 days', value: '7d' }, { label: '30 days', value: '30d' }]}
        onChange={setRange}
        size="xs"
      />
      <button className="eui-dashboard-widget-action" aria-label="Export">
        <DownloadIcon width={14} height={14} aria-hidden="true" />
      </button>
    </>
  }
>
  ...
</DashboardWidget>`;

const layouts: DashboardLayouts = {
    lg: [
        { id: 'sales', x: 0, y: 0, w: 6, h: 4 },
        { id: 'visitors', x: 6, y: 0, w: 6, h: 4 },
        { id: 'orders', x: 0, y: 4, w: 12, h: 4 },
    ],
};

const rangeOptions = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
];

const HeaderActions: React.FC = () => {
    const [range, setRange] = useState<string>('7d');
    const [filterOn, setFilterOn] = useState<boolean>(false);

    const widgets = useMemo<DashboardWidget[]>(
        () => [
            {
                id: 'sales',
                title: 'Sales',
                description: 'Custom action buttons + filter toggle + export',
                headerActions: (
                    <>
                        <button
                            type="button"
                            className="eui-dashboard-widget-action"
                            aria-label="Toggle filter"
                            aria-pressed={filterOn}
                            title="Toggle filter"
                            onClick={() => setFilterOn((v) => !v)}
                        >
                            <FilterIcon width={14} height={14} aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="eui-dashboard-widget-action"
                            aria-label="Export"
                            title="Export CSV"
                            onClick={() => alert('Exporting...')}
                        >
                            <DownloadIcon width={14} height={14} aria-hidden="true" />
                        </button>
                    </>
                ),
                children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--eui-text)' }}>$12,480</div>
                        <div style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>
                            Filter: <strong style={{ color: filterOn ? 'var(--eui-primary)' : 'var(--eui-text-muted)' }}>{filterOn ? 'on' : 'off'}</strong>
                        </div>
                    </div>
                ),
            },
            {
                id: 'visitors',
                title: 'Visitors',
                description: 'Inline dropdown control in the header',
                headerActions: (
                    <div onMouseDown={(e) => e.stopPropagation()} style={{ minWidth: 110 }}>
                        <Dropdown
                            value={range}
                            options={rangeOptions}
                            onChange={(e) => setRange(String(e.value))}
                            size="xs"
                            ariaLabel="Time range"
                        />
                    </div>
                ),
                children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--eui-text)' }}>4,231</div>
                        <div style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>
                            Range: <strong style={{ color: 'var(--eui-text)' }}>{rangeOptions.find((o) => o.value === range)?.label}</strong>
                        </div>
                    </div>
                ),
            },
            {
                id: 'orders',
                title: 'Recent Orders',
                description: 'Custom link + share',
                headerActions: (
                    <>
                        <a
                            href="#orders"
                            className="eui-dashboard-widget-action"
                            aria-label="Open orders page"
                            title="Open orders page"
                            onClick={(e) => e.preventDefault()}
                            style={{ textDecoration: 'none' }}
                        >
                            <ExternalLinkIcon width={14} height={14} aria-hidden="true" />
                        </a>
                        <button
                            type="button"
                            className="eui-dashboard-widget-action"
                            aria-label="Share"
                            title="Share"
                            onClick={() => alert('Sharing...')}
                        >
                            <ShareIcon width={14} height={14} aria-hidden="true" />
                        </button>
                    </>
                ),
                children: (
                    <div style={{ fontSize: 13, color: 'var(--eui-text-muted)' }}>
                        Try collapsing one of the widgets above — the widget below floats up to fill the freed row.
                    </div>
                ),
            },
        ],
        [filterOn, range],
    );

    return (
        <ComponentDemo
            title="Custom Header Actions & Collapse Compaction"
            description="Pass any React node to headerActions to add filter toggles, dropdowns, export buttons, share links — anything. Collapsing a widget shrinks it to its header bar and the layout compacts vertically, so widgets below float up."
            centered={false}
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                    style={{
                        minHeight: 440,
                        background: 'var(--eui-bg)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 8,
                        padding: 12,
                    }}
                >
                    <DashboardLayout
                        widgets={widgets}
                        defaultLayouts={layouts}
                        toolbarTitle="Header actions"
                        rowHeight={48}
                    />
                </div>
                <div
                    style={{
                        padding: '10px 14px',
                        background: 'var(--eui-bg-subtle)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--eui-text-muted)',
                    }}
                >
                    Tip: wrap interactive controls in <code style={{ color: 'var(--eui-text)' }}>eui-dashboard-widget-action</code> to
                    inherit the built-in icon-button styling. Pointer events inside the header actions slot do not start a drag.
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default HeaderActions;
