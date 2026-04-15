import cn from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
import { Sortable } from '../drag-drop';
import type { DragItem, DropResult } from '../drag-drop';
import { detectFieldType, getAllFields, getAvailableAggregateFunctions } from './pivot-engine';
import PivotFilterEditor from './PivotFilterEditor';
import type { AggregateFunction, FieldDefinition, PivotConfig, PivotField, PivotFilter, PivotPlugin, PivotZone } from './pivot-table-types';

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

interface PivotDragPayload {
    field: string;
    aggFn?: AggregateFunction;
    filter?: PivotFilter;
}

const PIVOT_FIELD_TYPE = 'pivot-field';

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
    values: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" /><path d="M4 12h16M12 4v16" /></svg>,
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

const chevronIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
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

    const emitConfig = useCallback(
        (next: PivotConfig) => {
            let result = next;
            for (const plugin of plugins) {
                if (plugin.onConfigChange) {
                    result = plugin.onConfigChange(result);
                }
            }
            onConfigChange(result);
        },
        [plugins, onConfigChange],
    );

    const cloneConfig = useCallback(
        (): PivotConfig => ({
            ...config,
            rows: [...config.rows],
            columns: [...config.columns],
            values: config.values.map((v) => ({ ...v })),
            filters: config.filters ? config.filters.map((f) => ({ ...f })) : [],
        }),
        [config],
    );

    const removeFieldFromZone = useCallback((cfg: PivotConfig, field: string, zone: PivotZone): PivotConfig => {
        switch (zone) {
            case 'rows': return { ...cfg, rows: cfg.rows.filter((r) => r !== field) };
            case 'columns': return { ...cfg, columns: cfg.columns.filter((c) => c !== field) };
            case 'values': return { ...cfg, values: cfg.values.filter((v) => v.field !== field) };
            case 'filters': return { ...cfg, filters: (cfg.filters || []).filter((f) => f.field !== field) };
            default: return cfg;
        }
    }, []);

    const insertFieldIntoZone = useCallback(
        (cfg: PivotConfig, payload: PivotDragPayload, zone: PivotZone, index: number): PivotConfig => {
            const field = payload.field;
            const label = fieldLabelMap[field] || field;
            const fieldType = fieldTypeMap[field] || 'string';
            switch (zone) {
                case 'rows': {
                    const rows = [...cfg.rows];
                    rows.splice(index, 0, field);
                    return { ...cfg, rows };
                }
                case 'columns': {
                    const cols = [...cfg.columns];
                    cols.splice(index, 0, field);
                    return { ...cfg, columns: cols };
                }
                case 'values': {
                    const values = [...cfg.values];
                    values.splice(index, 0, { field, label, aggregateFunction: payload.aggFn || 'sum' });
                    return { ...cfg, values };
                }
                case 'filters': {
                    const filters = [...(cfg.filters || [])];
                    const existing = payload.filter;
                    if (existing) {
                        filters.splice(index, 0, { ...existing });
                    } else {
                        const defaultOp = fieldType === 'number' ? 'gte' as const : 'eq' as const;
                        const defaultVal = fieldType === 'number' ? 0 : '';
                        filters.splice(index, 0, { field, operator: defaultOp, value: defaultVal });
                    }
                    return { ...cfg, filters };
                }
                default:
                    return cfg;
            }
        },
        [fieldLabelMap, fieldTypeMap],
    );

    const canAcceptInZone = useCallback(
        (zone: PivotZone): boolean => {
            switch (zone) {
                case 'rows': return permissions.allowAddRows;
                case 'columns': return permissions.allowAddColumns;
                case 'values': return permissions.allowAddValues;
                case 'filters': return permissions.allowAddFilters;
                case 'available': return true;
                default: return false;
            }
        },
        [permissions],
    );

    const extractPayload = useCallback((source: DragItem, sourceZone: PivotZone): PivotDragPayload | null => {
        const raw = source.item;
        if (raw == null) return null;
        if (typeof raw === 'string') {
            return { field: raw };
        }
        if (typeof raw === 'object') {
            const obj = raw as Record<string, unknown>;
            if (sourceZone === 'values' && typeof obj.field === 'string') {
                return { field: obj.field, aggFn: obj.aggregateFunction as AggregateFunction | undefined };
            }
            if (sourceZone === 'filters' && typeof obj.field === 'string') {
                return { field: obj.field, filter: raw as PivotFilter };
            }
            if (typeof obj.field === 'string') {
                return { field: obj.field };
            }
        }
        return null;
    }, []);

    const handleCrossZoneDrop = useCallback(
        (source: DragItem, target: DropResult, targetZone: PivotZone) => {
            if (!canAcceptInZone(targetZone)) return;
            const sourceArgs = source.args as { sourceZone?: PivotZone } | undefined;
            const sourceZone = sourceArgs?.sourceZone;
            if (!sourceZone) return;
            if (sourceZone === targetZone) return;
            const payload = extractPayload(source, sourceZone);
            if (!payload) return;

            let next = cloneConfig();
            if (sourceZone !== 'available') {
                next = removeFieldFromZone(next, payload.field, sourceZone);
            }
            if (targetZone !== 'available') {
                const insertIdx = typeof target.index === 'number' ? Math.max(0, target.index) : 0;
                next = insertFieldIntoZone(next, payload, targetZone, insertIdx);
            }
            emitConfig(next);
        },
        [canAcceptInZone, cloneConfig, removeFieldFromZone, insertFieldIntoZone, emitConfig, extractPayload],
    );

    const handleRowsChange = useCallback(
        (items: string[]) => {
            emitConfig({ ...config, rows: items });
        },
        [config, emitConfig],
    );

    const handleColumnsChange = useCallback(
        (items: string[]) => {
            emitConfig({ ...config, columns: items });
        },
        [config, emitConfig],
    );

    const handleValuesChange = useCallback(
        (items: PivotField[]) => {
            emitConfig({ ...config, values: items });
        },
        [config, emitConfig],
    );

    const handleFiltersChange = useCallback(
        (items: PivotFilter[]) => {
            emitConfig({ ...config, filters: items });
        },
        [config, emitConfig],
    );

    const handleRemoveField = useCallback(
        (field: string, zone: PivotZone) => {
            if (!permissions.allowRemoveFields) return;
            emitConfig(removeFieldFromZone(cloneConfig(), field, zone));
        },
        [permissions.allowRemoveFields, cloneConfig, removeFieldFromZone, emitConfig],
    );

    const handleAggregationChange = useCallback(
        (field: string, newFn: AggregateFunction) => {
            if (!permissions.allowChangeAggregation) return;
            emitConfig({
                ...config,
                values: config.values.map((v) => v.field === field ? { ...v, aggregateFunction: newFn } : v),
            });
        },
        [config, permissions.allowChangeAggregation, emitConfig],
    );

    const handleFilterChangeAt = useCallback(
        (index: number, filter: PivotFilter) => {
            const filters = [...(config.filters || [])];
            filters[index] = filter;
            emitConfig({ ...config, filters });
        },
        [config, emitConfig],
    );

    const handleFilterRemoveAt = useCallback(
        (index: number) => {
            const filters = [...(config.filters || [])];
            filters.splice(index, 1);
            emitConfig({ ...config, filters });
        },
        [config, emitConfig],
    );

    const renderChipBody = (field: string, zone: PivotZone, aggFn?: AggregateFunction) => {
        const type = fieldTypeMap[field] || 'string';
        const label = fieldLabelMap[field] || field;
        return (
            <div className={cn('eui-pivot-config-chip', `eui-pivot-config-chip-${type}`)}>
                <span className="eui-pivot-config-chip-grip" aria-hidden="true">{gripIcon}</span>
                <span className="eui-pivot-config-chip-label">{label}</span>
                <span className="eui-pivot-config-chip-type">{type}</span>
                {zone === 'values' && permissions.allowChangeAggregation && (
                    <select
                        className="eui-pivot-config-chip-agg"
                        value={aggFn || 'sum'}
                        onChange={(e) => handleAggregationChange(field, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        aria-label={`Aggregation for ${label}`}
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
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        type="button"
                        aria-label={`Remove ${label}`}
                    >
                        {removeIcon}
                    </button>
                )}
            </div>
        );
    };

    const renderZoneHeader = (zone: PivotZone, count: number) => (
        <div
            className="eui-pivot-config-zone-header"
            onClick={() => toggleZoneCollapse(zone)}
            role="button"
            tabIndex={0}
            aria-expanded={!collapsedZones.has(zone)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleZoneCollapse(zone); } }}
        >
            <span className={cn('eui-pivot-config-zone-chevron', { 'eui-pivot-config-zone-chevron-open': !collapsedZones.has(zone) })}>
                {chevronIcon}
            </span>
            <span className="eui-pivot-config-zone-icon">{zoneIcons[zone]}</span>
            <span className="eui-pivot-config-zone-label">{zoneLabels[zone]}</span>
            <span className="eui-pivot-config-zone-count">{count}</span>
        </div>
    );

    const zoneClass = (zone: PivotZone, disabled: boolean) =>
        cn('eui-pivot-config-zone', {
            'eui-pivot-config-zone-disabled': disabled,
            'eui-pivot-config-zone-collapsed': collapsedZones.has(zone),
        });

    const dndEnabled = permissions.allowDragDrop;

    const renderAvailableZone = () => {
        const zone: PivotZone = 'available';
        const items = availableFields;
        const disabled = false;
        return (
            <div className={zoneClass(zone, disabled)}>
                {renderZoneHeader(zone, items.length)}
                {!collapsedZones.has(zone) && (
                    <Sortable<string>
                        className="eui-pivot-config-zone-chips"
                        items={items}
                        itemType={PIVOT_FIELD_TYPE}
                        args={{ sourceZone: zone }}
                        gap="2px"
                        dropIndicator="line"
                        emptyHint="All fields assigned"
                        onChange={() => { /* available is derived; reordering has no effect */ }}
                        onDrop={(src, tgt) => handleCrossZoneDrop(src, tgt, zone)}
                        canDragItem={() => dndEnabled}
                    >
                        {(field) => renderChipBody(field, zone)}
                    </Sortable>
                )}
            </div>
        );
    };

    const renderRowsZone = () => {
        const zone: PivotZone = 'rows';
        const disabled = !permissions.allowAddRows;
        return (
            <div className={zoneClass(zone, disabled)}>
                {renderZoneHeader(zone, config.rows.length)}
                {!collapsedZones.has(zone) && (
                    <Sortable<string>
                        className="eui-pivot-config-zone-chips"
                        items={config.rows}
                        itemType={PIVOT_FIELD_TYPE}
                        args={{ sourceZone: zone }}
                        gap="2px"
                        dropIndicator="line"
                        emptyHint="Drop fields here"
                        onChange={handleRowsChange}
                        onDrop={(src, tgt) => handleCrossZoneDrop(src, tgt, zone)}
                        canDragItem={() => dndEnabled}
                        canDropItem={() => !disabled}
                    >
                        {(field) => renderChipBody(field, zone)}
                    </Sortable>
                )}
            </div>
        );
    };

    const renderColumnsZone = () => {
        const zone: PivotZone = 'columns';
        const disabled = !permissions.allowAddColumns;
        return (
            <div className={zoneClass(zone, disabled)}>
                {renderZoneHeader(zone, config.columns.length)}
                {!collapsedZones.has(zone) && (
                    <Sortable<string>
                        className="eui-pivot-config-zone-chips"
                        items={config.columns}
                        itemType={PIVOT_FIELD_TYPE}
                        args={{ sourceZone: zone }}
                        gap="2px"
                        dropIndicator="line"
                        emptyHint="Drop fields here"
                        onChange={handleColumnsChange}
                        onDrop={(src, tgt) => handleCrossZoneDrop(src, tgt, zone)}
                        canDragItem={() => dndEnabled}
                        canDropItem={() => !disabled}
                    >
                        {(field) => renderChipBody(field, zone)}
                    </Sortable>
                )}
            </div>
        );
    };

    const renderValuesZone = () => {
        const zone: PivotZone = 'values';
        const disabled = !permissions.allowAddValues;
        return (
            <div className={zoneClass(zone, disabled)}>
                {renderZoneHeader(zone, config.values.length)}
                {!collapsedZones.has(zone) && (
                    <Sortable<PivotField>
                        className="eui-pivot-config-zone-chips"
                        items={config.values}
                        itemType={PIVOT_FIELD_TYPE}
                        args={{ sourceZone: zone }}
                        gap="2px"
                        dropIndicator="line"
                        emptyHint="Drop fields here"
                        onChange={handleValuesChange}
                        onDrop={(src, tgt) => handleCrossZoneDrop(src, tgt, zone)}
                        canDragItem={() => dndEnabled}
                        canDropItem={() => !disabled}
                    >
                        {(vf) => renderChipBody(vf.field, zone, vf.aggregateFunction)}
                    </Sortable>
                )}
            </div>
        );
    };

    const renderFiltersZone = () => {
        const zone: PivotZone = 'filters';
        const filters = config.filters || [];
        const disabled = !permissions.allowAddFilters;
        return (
            <div className={zoneClass(zone, disabled)}>
                {renderZoneHeader(zone, filters.length)}
                {!collapsedZones.has(zone) && (
                    <Sortable<PivotFilter>
                        className="eui-pivot-config-zone-chips"
                        items={filters}
                        idProp="field"
                        itemType={PIVOT_FIELD_TYPE}
                        args={{ sourceZone: zone }}
                        gap="2px"
                        dropIndicator="line"
                        emptyHint="Drop fields here to filter"
                        onChange={handleFiltersChange}
                        onDrop={(src, tgt) => handleCrossZoneDrop(src, tgt, zone)}
                        canDragItem={() => dndEnabled}
                        canDropItem={() => !disabled}
                    >
                        {(filter, idx) => (
                            <PivotFilterEditor
                                filter={filter}
                                fieldType={fieldTypeMap[filter.field] || 'string'}
                                data={data}
                                fieldLabel={fieldLabelMap[filter.field] || filter.field}
                                onChange={(f) => handleFilterChangeAt(idx, f)}
                                onRemove={() => handleFilterRemoveAt(idx)}
                            />
                        )}
                    </Sortable>
                )}
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
                {renderAvailableZone()}
                {renderRowsZone()}
                {renderColumnsZone()}
                {renderValuesZone()}
                {renderFiltersZone()}
            </div>
        </div>
    );
};

export default PivotConfigPanel;
