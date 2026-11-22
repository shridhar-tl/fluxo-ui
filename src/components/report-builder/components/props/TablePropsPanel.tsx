import React, { useCallback, useMemo } from 'react';
import { Checkbox } from '../../../Checkbox';
import { Dropdown } from '../../../Dropdown';
import { TextInput } from '../../../TextInput';
import type { ListItem } from '../../../../types';
import { useReportBuilderContext } from '../../report-builder-context';
import { useBuilderDatasources, useDatasourceFieldPaths, useSuggestedColumns } from '../../builder-hooks';
import { updateComponentInTree } from '../../report-component-helpers';
import type { ReportBuilderState } from '../../report-builder-types';
import type {
    ReportComponent,
    TableColumnNode,
    TableComponentProps,
    TableExtraRow,
    TableRowGroup,
    VariableConfig,
} from '../../report-definition-types';
import {
    columnTreeToLegacy,
    flattenColumns,
    getEffectiveColumnTree,
} from '../../table-helpers';
import { ComponentVariablesEditor } from './ComponentVariablesEditor';
import { ExpressionField } from './ExpressionField';
import { FieldPathList } from './FieldPathList';
import { PropsTabs } from './PropsTabs';
import type { PropsTabItem } from './PropsTabs';
import { TableColumnTreeEditor } from './TableColumnTreeEditor';
import { TableExtraRowsEditor } from './TableExtraRowsEditor';
import { TableRowGroupsEditor } from './TableRowGroupsEditor';

interface Props {
    component: ReportComponent;
}

const pivotAggOptions: ListItem[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'count', label: 'Count' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
];

export const TablePropsPanel: React.FC<Props> = ({ component }) => {
    const { store } = useReportBuilderContext();
    const datasources = useBuilderDatasources();
    const p = component.props as unknown as TableComponentProps;
    const columnTree = useMemo(() => getEffectiveColumnTree(p), [p]);
    const leafColumns = useMemo(() => flattenColumns(columnTree), [columnTree]);
    const fieldPaths = useDatasourceFieldPaths(p.datasourceId || undefined);
    const suggestedColumns = useSuggestedColumns(p.datasourceId || undefined);
    const groupByFields = useMemo(() => (p.groupBy === undefined ? [] : Array.isArray(p.groupBy) ? p.groupBy : [p.groupBy]), [p.groupBy]);

    const update = useCallback(
        (patch: Partial<TableComponentProps>) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    components: updateComponentInTree(prev.definition.components, component.id, (c) => ({
                        ...c,
                        props: { ...c.props, ...patch },
                    })),
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            }));
        },
        [store, component.id],
    );

    const handleColumnTreeChange = useCallback(
        (tree: TableColumnNode[]) => {
            const legacy = columnTreeToLegacy(tree);
            update({
                columnTree: tree,
                columns: legacy.columns,
                columnGroups: legacy.columnGroups.length > 0 ? legacy.columnGroups : undefined,
            });
        },
        [update],
    );

    const handleRowGroupsChange = useCallback(
        (rowGroups: TableRowGroup[]) => {
            update({ rowGroups: rowGroups.length > 0 ? rowGroups : undefined });
        },
        [update],
    );

    const handleHeadRowsChange = useCallback(
        (rows: TableExtraRow[]) => {
            update({ headRows: rows.length > 0 ? rows : undefined });
        },
        [update],
    );

    const handleFooterRowsChange = useCallback(
        (rows: TableExtraRow[]) => {
            update({ footerRows: rows.length > 0 ? rows : undefined });
        },
        [update],
    );

    const handleVariablesChange = useCallback(
        (variables: VariableConfig[]) => {
            store.setState((prev: ReportBuilderState) => ({
                ...prev,
                definition: {
                    ...prev.definition,
                    components: updateComponentInTree(prev.definition.components, component.id, (c) => ({
                        ...c,
                        variables: variables.length > 0 ? variables : undefined,
                    })),
                    metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
                },
            }));
        },
        [store, component.id],
    );

    const dsOptions: ListItem[] = useMemo(
        () => [
            { value: '', label: '— Select —' },
            ...datasources.map((ds) => ({ value: ds.id, label: ds.name })),
        ],
        [datasources],
    );

    const tabs: PropsTabItem[] = [
        {
            id: 'data',
            label: 'Data',
            render: () => (
                <div className="eui-rb-props-section">
                    <div className="eui-rb-prop-field">
                        <label className="eui-rb-prop-field-label">Datasource</label>
                        <Dropdown
                            options={dsOptions}
                            value={p.datasourceId ?? ''}
                            onChange={(e) => update({ datasourceId: e.value })}
                            ariaLabel="Select datasource"
                            size="sm"
                        />
                    </div>

                    <ExpressionField
                        label="Row Visible"
                        value={p.rowVisibleExpr ?? ''}
                        onChange={(v) => update({ rowVisibleExpr: v || undefined })}
                        placeholder="=Field.status != 'Done'"
                        expectedReturnType="boolean"
                        multiline={false}
                        hint="Rows for which this is false are hidden. Field is the row, and Variables can change it while the report is viewed."
                    />

                    <div className="eui-rb-prop-field">
                        <span className="eui-rb-prop-field-label">Quick group by</span>
                        <FieldPathList
                            values={groupByFields}
                            onChange={(values) => update({ groupBy: values.length > 0 ? values : undefined })}
                            fieldPaths={fieldPaths}
                            addLabel="Add group field"
                            itemLabel="Group field"
                            emptyText="Not grouped. Use the Rows tab for grouping with filters, sorting, keys and variables."
                        />
                    </div>

                    {groupByFields.length > 0 && (
                        <>
                            <div className="eui-rb-prop-field">
                                <Checkbox
                                    checked={p.showGroupFooter ?? false}
                                    onChange={(e) => update({ showGroupFooter: e.value })}
                                    label="Show group footer"
                                />
                            </div>
                            <ExpressionField
                                label="Group Visible"
                                value={p.groupVisibleExpr ?? ''}
                                onChange={(v) => update({ groupVisibleExpr: v || undefined })}
                                placeholder="=Field._groupKey != 'hidden'"
                                expectedReturnType="boolean"
                                multiline={false}
                            />
                        </>
                    )}

                    <div className="eui-rb-prop-field">
                        <Checkbox
                            checked={p.pivotMode ?? false}
                            onChange={(e) => update({ pivotMode: e.value })}
                            label="Pivot mode"
                        />
                        <div className="eui-rb-prop-hint">
                            Turns the rows into a cross table: a row for each value of the row field, a column for each value of the column field, and the value field aggregated where they meet.
                        </div>
                    </div>

                    {p.pivotMode && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                padding: '8px 0',
                                borderTop: '1px solid var(--eui-border-subtle)',
                            }}
                        >
                            <div className="eui-rb-props-section-title">Pivot Configuration</div>
                            <div className="eui-rb-prop-field">
                                <label className="eui-rb-prop-field-label">Row Field</label>
                                <TextInput
                                    aria-label="Pivot row field"
                                    value={p.pivotRowField ?? ''}
                                    onChange={(e) => update({ pivotRowField: e.value || undefined })}
                                    placeholder="Field for row headers"
                                    size="sm"
                                />
                            </div>
                            <div className="eui-rb-prop-field">
                                <label className="eui-rb-prop-field-label">Column Field</label>
                                <TextInput
                                    aria-label="Pivot column field"
                                    value={p.pivotColumnField ?? ''}
                                    onChange={(e) => update({ pivotColumnField: e.value || undefined })}
                                    placeholder="Field for column headers"
                                    size="sm"
                                />
                            </div>
                            <div className="eui-rb-prop-field">
                                <label className="eui-rb-prop-field-label">Value Field</label>
                                <TextInput
                                    aria-label="Pivot value field"
                                    value={p.pivotValueField ?? ''}
                                    onChange={(e) => update({ pivotValueField: e.value || undefined })}
                                    placeholder="Field to aggregate"
                                    size="sm"
                                />
                            </div>
                            <div className="eui-rb-prop-field">
                                <label className="eui-rb-prop-field-label">Aggregation</label>
                                <Dropdown
                                    options={pivotAggOptions}
                                    value={p.pivotAggregation ?? 'sum'}
                                    onChange={(e) =>
                                        update({ pivotAggregation: e.value as TableComponentProps['pivotAggregation'] })
                                    }
                                    ariaLabel="Pivot aggregation"
                                    size="sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: 'columns',
            label: `Columns (${leafColumns.length})`,
            render: () => (
                <div className="eui-rb-props-section">
                    <TableColumnTreeEditor tree={columnTree} onChange={handleColumnTreeChange} fieldPaths={fieldPaths} suggestedColumns={suggestedColumns} />
                </div>
            ),
        },
        {
            id: 'rows',
            label: 'Rows',
            render: () => (
                <div className="eui-rb-props-section">
                    <TableRowGroupsEditor
                        rowGroups={p.rowGroups ?? []}
                        datasources={datasources}
                        onChange={handleRowGroupsChange}
                    />

                    <TableExtraRowsEditor
                        title="Head Rows (above data)"
                        rows={p.headRows ?? []}
                        totalLeafColumns={leafColumns.length}
                        onChange={handleHeadRowsChange}
                    />

                    <TableExtraRowsEditor
                        title="Footer Rows (below data)"
                        rows={p.footerRows ?? []}
                        totalLeafColumns={leafColumns.length}
                        onChange={handleFooterRowsChange}
                    />
                </div>
            ),
        },
        {
            id: 'behavior',
            label: 'Behavior',
            render: () => (
                <div className="eui-rb-props-section">
                    <div className="eui-rb-prop-field">
                        <Checkbox
                            checked={p.enableSorting ?? false}
                            onChange={(e) => update({ enableSorting: e.value })}
                            label="Enable column sorting (user clicks header)"
                        />
                    </div>
                    <div className="eui-rb-prop-field">
                        <Checkbox
                            checked={p.enableCellEdit ?? false}
                            onChange={(e) => update({ enableCellEdit: e.value })}
                            label="Enable cell editing (double-click)"
                        />
                        <div className="eui-rb-prop-hint">Changes only what the report shows, for example before printing it. The data itself is not changed.</div>
                    </div>
                    <div className="eui-rb-prop-field">
                        <Checkbox
                            checked={p.enableCopyData ?? false}
                            onChange={(e) => update({ enableCopyData: e.value })}
                            label="Show Copy Data button"
                        />
                        <div className="eui-rb-prop-hint">Copies the rows shown as tab-separated text, ready to paste into a spreadsheet.</div>
                    </div>
                    <ExpressionField
                        label="Drill-through Variable"
                        value={p.onDrillThrough ?? ''}
                        onChange={(v) => update({ onDrillThrough: v || undefined })}
                        placeholder="variableName"
                        expectedReturnType="string"
                        hint="When set, clicking a row writes the row object into this report variable. The host onDrillThrough callback also fires as a notification."
                    />

                    <ComponentVariablesEditor
                        title="Component Variables"
                        description="Variables declared on this table are scoped to it. Cell-item drill / set-variable actions can target any global variable or any of these table-scoped variables."
                        variables={component.variables}
                        onChange={handleVariablesChange}
                    />
                </div>
            ),
        },
    ];

    return <PropsTabs tabs={tabs} storageKey="rb-table-props-tab" />;
};
