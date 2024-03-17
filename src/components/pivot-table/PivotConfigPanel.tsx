import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { detectFieldType, getAllFields, getAvailableAggregateFunctions } from './pivot-engine';
import PivotFilterEditor from './PivotFilterEditor';
import type { AggregateFunction, FieldDefinition, PivotConfig, PivotFilter, PivotPlugin, PivotZone } from './pivot-table-types';

interface PivotConfigPanelProps {
    data: Record<string, unknown>[];
    config: PivotConfig;
    fieldDefinitions?: FieldDefinition[];
    plugins: PivotPlugin[];
    disabledFunctions: string[];
    onConfigChange: (config: PivotConfig) => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    permissions: {
        allowDragDrop: boolean;
        allowAddRows: boolean;
        allowAddColumns: boolean;
        allowAddValues: boolean;
        allowAddFilters: boolean;
        allowRemoveFields: boolean;
        allowChangeAggregation: boolean;
    };
}

const zoneLabels: Record<PivotZone, string> = {
    rows: 'Row Fields',
    columns: 'Column Fields',
    values: 'Value Fields',
    filters: 'Filter Fields',
    available: 'Available Fields',
};

const zoneIcons: Record<PivotZone, React.ReactNode> = {
    rows: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>,
    columns: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M6 3v18M18 3v18" /></svg>,
    values: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M4 12h16M12 4v16" /></svg>,
    filters: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>,
    available: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8M8 12h8" /></svg>,
};

const gripIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
        <circle cx="8" cy="6" r="1.5" /><circle cx="16" cy="6" r="1.5" />
        <circle cx="8" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" />
        <circle cx="8" cy="18" r="1.5" /><circle cx="16" cy="18" r="1.5" />
    </svg>
);

const removeIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const PivotConfigPanel: React.FC<PivotConfigPanelProps> = ({
    data,
    config,
    fieldDefinitions,
    plugins,
    disabledFunctions,
    onConfigChange,
    collapsed,
    onToggleCollapse,
    permissions,
}) => {
    const [dragItem, setDragItem] = useState<{ field: string; sourceZone: PivotZone; aggFn?: AggregateFunction } | null>(null);
    const [dragOverZone, setDragOverZone] = useState<PivotZone | null>(null);
    const [collapsedZones, setCollapsedZones] = useState<Set<PivotZone>>(new Set());

    const toggleZoneCollapse = useCallback((zone: PivotZone) => {
        setCollapsedZones((prev) => {
            const next = new Set(prev);
            if (next.has(zone)) next.delete(zone);
            else next.add(zone);
            return next;
        });
    }, []);

    const allDataFields = useMemo(() => getAllFields(data), [data]);
    const fieldTypeMap = useMemo(() => {
        const map: Record<string, string> = {};
        for (const f of allDataFields) {
            const def = fieldDefinitions?.find((d) => d.field === f);
            map[f] = def?.dataType || detectFieldType(data, f);
        }
        return map;
    }, [data, allDataFields, fieldDefinitions]);

    const fieldLabelMap = useMemo(() => {
        const map: Record<string, string> = {};
        for (const f of allDataFields) {
            const def = fieldDefinitions?.find((d) => d.field === f);
            map[f] = def?.label || f.charAt(0).toUpperCase() + f.slice(1).replace(/([A-Z])/g, ' $1');
        }
        return map;
    }, [allDataFields, fieldDefinitions]);

    const usedFields = useMemo(() => {
        const set = new Set<string>();
        config.rows.forEach((r) => set.add(r));
        config.columns.forEach((c) => set.add(c));
        config.values.forEach((v) => set.add(v.field));
        config.filters?.forEach((f) => set.add(f.field));
        return set;
    }, [config]);

    const availableFields = useMemo(
        () => allDataFields.filter((f) => !usedFields.has(f)),
        [allDataFields, usedFields],
    );

    const aggregateFunctions = useMemo(
        () => getAvailableAggregateFunctions(plugins, disabledFunctions),
        [plugins, disabledFunctions],
    );

    const handleDragStart = useCallback(
        (e: React.DragEvent, field: string, sourceZone: PivotZone, aggFn?: AggregateFunction) => {
            if (!permissions.allowDragDrop) return;
            setDragItem({ field, sourceZone, aggFn });
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', field);
        },
        [permissions.allowDragDrop],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetZone: PivotZone) => {
            e.preventDefault();
            setDragOverZone(null);
            if (!dragItem || dragItem.sourceZone === targetZone) { setDragItem(null); return; }

            let newConfig = removeFieldFromZone(
                { ...config, rows: [...config.rows], columns: [...config.columns], values: [...config.values], filters: config.filters ? [...config.filters] : [] },
                dragItem.field,
                dragItem.sourceZone,
            );
            newConfig = addFieldToZone(newConfig, dragItem.field, targetZone, dragItem.aggFn || 'sum', fieldLabelMap[dragItem.field] || dragItem.field, fieldTypeMap[dragItem.field] || 'string');
            setDragItem(null);

            for (const plugin of plugins) {
                if (plugin.onConfigChange) {
                    onConfigChange(plugin.onConfigChange(newConfig));
                    return;
                }
            }
            onConfigChange(newConfig);
        },
        [dragItem, config, fieldLabelMap, fieldTypeMap, plugins, onConfigChange],
    );

    const handleRemoveField = useCallback(
        (field: string, zone: PivotZone) => {
            if (!permissions.allowRemoveFields) return;
            const newConfig = removeFieldFromZone(
                { ...config, rows: [...config.rows], columns: [...config.columns], values: [...config.values], filters: config.filters ? [...config.filters] : [] },
                field,
                zone,
            );
            onConfigChange(newConfig);
        },
        [config, permissions.allowRemoveFields, onConfigChange],
    );

    const handleAggregationChange = useCallback(
        (field: string, newFn: AggregateFunction) => {
            if (!permissions.allowChangeAggregation) return;
            onConfigChange({
                ...config,
                values: config.values.map((v) => v.field === field ? { ...v, aggregateFunction: newFn } : v),
            });
        },
        [config, permissions.allowChangeAggregation, onConfigChange],
    );

    const handleFilterChange = useCallback(
        (index: number, filter: PivotFilter) => {
            const filters = [...(config.filters || [])];
            filters[index] = filter;
            onConfigChange({ ...config, filters });
        },
        [config, onConfigChange],
    );

    const handleFilterRemove = useCallback(
        (index: number) => {
            const filters = [...(config.filters || [])];
            filters.splice(index, 1);
            onConfigChange({ ...config, filters });
        },
        [config, onConfigChange],
    );

    const handleDragEnd = useCallback(() => {
        setDragItem(null);
        setDragOverZone(null);
    }, []);

    const renderFieldChip = (field: string, zone: PivotZone, aggFn?: AggregateFunction, idx?: number) => {
        const type = fieldTypeMap[field] || 'string';
        const label = fieldLabelMap[field] || field;

        return (
            <div
                key={`${zone}-${field}-${idx ?? 0}`}
                className={cn('eui-pivot-config-chip', `eui-pivot-config-chip-${type}`)}
                draggable={permissions.allowDragDrop}
                onDragStart={(e) => handleDragStart(e, field, zone, aggFn)}
                onDragEnd={handleDragEnd}
            >
                <span className="eui-pivot-config-chip-grip">{gripIcon}</span>
                <span className="eui-pivot-config-chip-label">{label}</span>
                <span className="eui-pivot-config-chip-type">{type}</span>
                {zone === 'values' && permissions.allowChangeAggregation && (
                    <select
                        className="eui-pivot-config-chip-agg"
                        value={aggFn || 'sum'}
                        onChange={(e) => handleAggregationChange(field, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {aggregateFunctions.map((fn) => (
                            <option key={fn.name} value={fn.name}>{fn.label}</option>
                        ))}
                    </select>
                )}
                {permissions.allowRemoveFields && zone !== 'available' && (
                    <button
                        className="eui-pivot-config-chip-remove"
                        onClick={(e) => { e.stopPropagation(); handleRemoveField(field, zone); }}
                        type="button"
                        aria-label={`Remove ${label}`}
                    >
                        {removeIcon}
                    </button>
                )}
            </div>
        );
    };

    const renderZone = (zone: PivotZone, fields: string[], aggFns?: Record<string, AggregateFunction>) => {
        const canAdd = zone === 'rows' ? permissions.allowAddRows
            : zone === 'columns' ? permissions.allowAddColumns
            : zone === 'values' ? permissions.allowAddValues
            : zone === 'filters' ? permissions.allowAddFilters
            : true;

        return (
            <div
                className={cn('eui-pivot-config-zone', {
                    'eui-pivot-config-zone-over': dragOverZone === zone,
                    'eui-pivot-config-zone-disabled': !canAdd,
                    'eui-pivot-config-zone-collapsed': collapsedZones.has(zone),
                })}
                onDragOver={canAdd ? handleDragOver : undefined}
                onDragEnter={canAdd ? (e) => { e.preventDefault(); setDragOverZone(zone); } : undefined}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={canAdd ? (e) => handleDrop(e, zone) : undefined}
            >
                <div
                    className="eui-pivot-config-zone-header"
                    onClick={() => toggleZoneCollapse(zone)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={!collapsedZones.has(zone)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleZoneCollapse(zone); } }}
                >
                    <span className={cn('eui-pivot-config-zone-chevron', { 'eui-pivot-config-zone-chevron-open': !collapsedZones.has(zone) })}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </span>
                    <span className="eui-pivot-config-zone-icon">{zoneIcons[zone]}</span>
                    <span className="eui-pivot-config-zone-label">{zoneLabels[zone]}</span>
                    <span className="eui-pivot-config-zone-count">{fields.length}</span>
                </div>
                {!collapsedZones.has(zone) && (
                    <div className="eui-pivot-config-zone-chips">
                        {fields.length === 0 && (
                            <div className="eui-pivot-config-zone-empty">
                                {zone === 'available' ? 'All fields assigned' : 'Drop fields here'}
                            </div>
                        )}
                        {fields.map((f, idx) => renderFieldChip(f, zone, aggFns?.[f], idx))}
                    </div>
                )}
            </div>
        );
    };

    const renderFilterZone = () => {
        const filters = config.filters || [];

        return (
            <div
                className={cn('eui-pivot-config-zone', {
                    'eui-pivot-config-zone-over': dragOverZone === 'filters',
                    'eui-pivot-config-zone-disabled': !permissions.allowAddFilters,
                    'eui-pivot-config-zone-collapsed': collapsedZones.has('filters'),
                })}
                onDragOver={permissions.allowAddFilters ? handleDragOver : undefined}
                onDragEnter={permissions.allowAddFilters ? (e) => { e.preventDefault(); setDragOverZone('filters'); } : undefined}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={permissions.allowAddFilters ? (e) => handleDrop(e, 'filters') : undefined}
            >
                <div
                    className="eui-pivot-config-zone-header"
                    onClick={() => toggleZoneCollapse('filters')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={!collapsedZones.has('filters')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleZoneCollapse('filters'); } }}
                >
                    <span className={cn('eui-pivot-config-zone-chevron', { 'eui-pivot-config-zone-chevron-open': !collapsedZones.has('filters') })}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </span>
                    <span className="eui-pivot-config-zone-icon">{zoneIcons.filters}</span>
                    <span className="eui-pivot-config-zone-label">{zoneLabels.filters}</span>
                    <span className="eui-pivot-config-zone-count">{filters.length}</span>
                </div>
                {!collapsedZones.has('filters') && <div className="eui-pivot-config-zone-chips">
                    {filters.length === 0 && (
                        <div className="eui-pivot-config-zone-empty">Drop fields here to filter</div>
                    )}
                    {filters.map((filter, idx) => (
                        <PivotFilterEditor
                            key={`${filter.field}-${idx}`}
                            filter={filter}
                            fieldType={fieldTypeMap[filter.field] || 'string'}
                            data={data}
                            fieldLabel={fieldLabelMap[filter.field] || filter.field}
                            onChange={(f) => handleFilterChange(idx, f)}
                            onRemove={() => handleFilterRemove(idx)}
                        />
                    ))}
                </div>}
            </div>
        );
    };

    if (collapsed) {
        return (
            <div className="eui-pivot-config-panel eui-pivot-config-panel-collapsed">
                <button
                    className="eui-pivot-config-toggle"
                    onClick={onToggleCollapse}
                    type="button"
                    aria-label="Expand config panel"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            </div>
        );
    }

    const valueAggFns: Record<string, AggregateFunction> = {};
    config.values.forEach((v) => { valueAggFns[v.field] = v.aggregateFunction || 'sum'; });

    return (
        <div className="eui-pivot-config-panel">
            <div className="eui-pivot-config-header">
                <span className="eui-pivot-config-title">Pivot Configuration</span>
                {onToggleCollapse && (
                    <button
                        className="eui-pivot-config-collapse-btn"
                        onClick={onToggleCollapse}
                        type="button"
                        aria-label="Collapse config panel"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                )}
            </div>
            <div className="eui-pivot-config-body">
                {renderZone('available', availableFields)}
                {renderZone('rows', config.rows)}
                {renderZone('columns', config.columns)}
                {renderZone('values', config.values.map((v) => v.field), valueAggFns)}
                {renderFilterZone()}
            </div>
        </div>
    );
};

function removeFieldFromZone(config: PivotConfig, field: string, zone: PivotZone): PivotConfig {
    switch (zone) {
        case 'rows': return { ...config, rows: config.rows.filter((r) => r !== field) };
        case 'columns': return { ...config, columns: config.columns.filter((c) => c !== field) };
        case 'values': return { ...config, values: config.values.filter((v) => v.field !== field) };
        case 'filters': return { ...config, filters: (config.filters || []).filter((f) => f.field !== field) };
        default: return config;
    }
}

function addFieldToZone(config: PivotConfig, field: string, zone: PivotZone, aggFn: AggregateFunction, label: string, fieldType: string): PivotConfig {
    switch (zone) {
        case 'rows': return { ...config, rows: [...config.rows, field] };
        case 'columns': return { ...config, columns: [...config.columns, field] };
        case 'values': return { ...config, values: [...config.values, { field, label, aggregateFunction: aggFn }] };
        case 'filters': {
            const defaultOp = fieldType === 'number' ? 'gte' as const : 'eq' as const;
            const defaultVal = fieldType === 'number' ? 0 : '';
            return { ...config, filters: [...(config.filters || []), { field, operator: defaultOp, value: defaultVal }] };
        }
        default: return config;
    }
}

export default PivotConfigPanel;
