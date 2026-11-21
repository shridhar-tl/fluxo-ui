import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import './derived-editor.scss';
import { ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, TrashIcon, WarningIcon } from '../../../../assets/icons';
import { Button } from '../../../Button';
import { Dropdown } from '../../../Dropdown';
import type { ListItem } from '../../../../types';
import { useSchemaResolver } from '../../builder-hooks';
import { derivedDatasourceType, getDerivedDependencies } from '../../data/core-plugins';
import { inferTransformSchema } from '../../data/derived-schema';
import { flattenFieldPaths } from '../../data/value-utils';
import type { DatasourceConfigUIProps } from '../../report-builder-types';
import type { DatasetField, DatasourceConfig, DerivedDatasourceConfig, DerivedTransform, DerivedTransformType } from '../../report-definition-types';
import { useBuilderTypeContext } from '../props/ExpressionField';
import {
    GroupEditor,
    JoinEditor,
    PivotEditor,
    UnionEditor,
    UnpivotEditor,
    WindowEditor,
} from './AdvancedTransformEditors';
import { ComputedEditor, DistinctEditor, FilterEditor, FlattenEditor, LimitEditor, PickEditor, SortEditor } from './BasicTransformEditors';
import { transformCatalog, transformLabels, transformTypeOptions } from './transform-catalog';
import type { TransformEditorProps } from './transform-editor-types';
import { validateTransform } from './transform-validation';

function dependsOn(candidateId: string, targetId: string, all: DatasourceConfig[], seen = new Set<string>()): boolean {
    if (candidateId === targetId) return true;
    if (seen.has(candidateId)) return false;
    seen.add(candidateId);
    const cfg = all.find((d) => d.id === candidateId);
    if (!cfg || cfg.type !== derivedDatasourceType) return false;
    return getDerivedDependencies(cfg.config as unknown as DerivedDatasourceConfig).some((dep) => dependsOn(dep, targetId, all, seen));
}

function useStepFields(config: DerivedDatasourceConfig, datasources: DatasourceConfig[]): DatasetField[][] {
    const resolver = useSchemaResolver();
    const [steps, setSteps] = useState<DatasetField[][]>([]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            const source = config.sourceDatasourceId ? await resolver.resolveFields(config.sourceDatasourceId) : [];
            const out: DatasetField[][] = [source];
            let current = source;
            for (const t of config.transforms ?? []) {
                current = await inferTransformSchema(t, current, {
                    resolveFields: resolver.resolveFields,
                    getDatasourceName: (id) => datasources.find((d) => d.id === id)?.name ?? id,
                });
                out.push(current);
            }
            if (!cancelled) setSteps(out);
        };
        run();
        return () => { cancelled = true; };
    }, [config, resolver, datasources]);

    return steps;
}

function renderTransformEditor(props: TransformEditorProps<DerivedTransform>): React.ReactNode {
    const { transform } = props;
    switch (transform.type) {
        case 'filter': return <FilterEditor {...props} transform={transform} />;
        case 'computed': return <ComputedEditor {...props} transform={transform} />;
        case 'pick': return <PickEditor {...props} transform={transform} />;
        case 'sort': return <SortEditor {...props} transform={transform} />;
        case 'group': return <GroupEditor {...props} transform={transform} />;
        case 'join': return <JoinEditor {...props} transform={transform} />;
        case 'union': return <UnionEditor {...props} transform={transform} />;
        case 'flatten': return <FlattenEditor {...props} transform={transform} />;
        case 'distinct': return <DistinctEditor {...props} transform={transform} />;
        case 'limit': return <LimitEditor {...props} transform={transform} />;
        case 'pivot': return <PivotEditor {...props} transform={transform} />;
        case 'unpivot': return <UnpivotEditor {...props} transform={transform} />;
        case 'window': return <WindowEditor {...props} transform={transform} />;
        default: return null;
    }
}

interface StepCardProps {
    index: number;
    count: number;
    transform: DerivedTransform;
    inputFields: DatasetField[];
    datasourceOptions: ListItem[];
    idPrefix: string;
    onChange: (t: DerivedTransform) => void;
    onMove: (to: number) => void;
    onRemove: () => void;
}

const StepCard: React.FC<StepCardProps> = ({ index, count, transform, inputFields, datasourceOptions, idPrefix, onChange, onMove, onRemove }) => {
    const [open, setOpen] = useState(true);
    const fieldPaths = useMemo(() => flattenFieldPaths(inputFields).map((f) => f.path), [inputFields]);
    const typeOverride = useMemo(() => ({ availableFields: fieldPaths }), [fieldPaths]);
    const typeContext = useBuilderTypeContext(typeOverride) ?? typeOverride;
    const bodyId = `${idPrefix}-body`;
    const issues = useMemo(() => validateTransform(transform), [transform]);

    return (
        <div className={classNames('eui-rb-derived-step', { invalid: issues.length > 0 })}>
            <div className="eui-rb-derived-step-header">
                <button
                    type="button"
                    className="eui-rb-derived-step-toggle"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={bodyId}
                >
                    <ChevronRightIcon aria-hidden="true" className={classNames('eui-rb-ds-chevron', { open })} />
                    <span className="eui-rb-derived-step-index">{index + 1}</span>
                    <span className="eui-rb-derived-step-title">{transformLabels[transform.type]}</span>
                    {issues.length > 0 && (
                        <span className="eui-rb-derived-step-issues" title={issues.join(' ')}>
                            <WarningIcon aria-hidden="true" />
                            <span className="eui-rb-sr-only">{issues.length} problem{issues.length === 1 ? '' : 's'}</span>
                        </span>
                    )}
                </button>
                <Button layout="plain" size="xs" onClick={() => onMove(index - 1)} disabled={index === 0} ariaLabel={`Move step ${index + 1} up`} leftIcon={<ChevronUpIcon aria-hidden="true" />} />
                <Button layout="plain" size="xs" onClick={() => onMove(index + 1)} disabled={index === count - 1} ariaLabel={`Move step ${index + 1} down`} leftIcon={<ChevronDownIcon aria-hidden="true" />} />
                <Button layout="plain" size="xs" variant="danger" onClick={onRemove} ariaLabel={`Remove step ${index + 1}`} leftIcon={<TrashIcon aria-hidden="true" />} />
            </div>
            {open && (
                <div id={bodyId} className="eui-rb-derived-step-body">
                    {issues.length > 0 && (
                        <ul className="eui-rb-derived-step-errors" role="alert">
                            {issues.map((issue) => <li key={issue}>{issue}</li>)}
                        </ul>
                    )}
                    {renderTransformEditor({ transform, onChange, fieldPaths, typeContext, datasourceOptions, idPrefix })}
                </div>
            )}
        </div>
    );
};

export const DerivedDatasourceEditor: React.FC<DatasourceConfigUIProps> = ({ datasourceId, config, onChange, datasources }) => {
    const derived = config as unknown as DerivedDatasourceConfig;
    const transforms = derived.transforms ?? [];
    const steps = useStepFields(derived, datasources);

    const datasourceOptions: ListItem[] = useMemo(
        () => datasources
            .filter((d) => d.id !== datasourceId && !dependsOn(d.id, datasourceId, datasources))
            .map((d) => ({ value: d.id, label: d.name })),
        [datasources, datasourceId],
    );

    const update = (patch: Partial<DerivedDatasourceConfig>) => onChange({ ...derived, ...patch } as unknown as Record<string, unknown>);
    const setTransforms = (next: DerivedTransform[]) => update({ transforms: next });

    const addStep = (type: DerivedTransformType) => {
        const entry = transformCatalog.find((t) => t.type === type);
        if (entry) setTransforms([...transforms, entry.create()]);
    };

    const moveStep = (from: number, to: number) => {
        if (to < 0 || to >= transforms.length) return;
        const next = [...transforms];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        setTransforms(next);
    };

    const outputFields = steps[transforms.length] ?? [];
    const sourceId = `rb-derived-source-${datasourceId}`;

    return (
        <div className="eui-rb-derived">
            <div className="eui-rb-prop-field">
                <label className="eui-rb-prop-field-label" htmlFor={sourceId}>Source datasource</label>
                <Dropdown
                    id={sourceId}
                    options={datasourceOptions}
                    value={derived.sourceDatasourceId ?? ''}
                    onChange={(e) => update({ sourceDatasourceId: e.value })}
                    placeholder="Choose the datasource to preprocess"
                    size="sm"
                    aria-describedby={!derived.sourceDatasourceId ? `${sourceId}-err` : undefined}
                />
                {!derived.sourceDatasourceId && (
                    <span id={`${sourceId}-err`} className="eui-rb-ds-config-error">Choose the datasource whose rows this one preprocesses.</span>
                )}
            </div>

            <div className="eui-rb-derived-pipeline" aria-label="Transform steps">
                {transforms.length === 0 && (
                    <div className="eui-rb-list-editor-empty">No steps yet. Rows of the source pass through unchanged.</div>
                )}
                {transforms.map((t, i) => (
                    <StepCard
                        key={i}
                        index={i}
                        count={transforms.length}
                        transform={t}
                        inputFields={steps[i] ?? []}
                        datasourceOptions={datasourceOptions}
                        idPrefix={`rb-derived-${datasourceId}-${i}`}
                        onChange={(nt) => setTransforms(transforms.map((x, idx) => (idx === i ? nt : x)))}
                        onMove={(to) => moveStep(i, to)}
                        onRemove={() => setTransforms(transforms.filter((_, idx) => idx !== i))}
                    />
                ))}
            </div>

            <Dropdown
                options={transformTypeOptions}
                value=""
                placeholder="+ Add step"
                onChange={(e) => { if (e.value) addStep(e.value as DerivedTransformType); }}
                size="sm"
                ariaLabel="Add transform step"
            />

            {outputFields.length > 0 && (
                <div className="eui-rb-derived-output" aria-live="polite">
                    Output: {outputFields.map((f) => f.name).join(', ')}
                </div>
            )}
        </div>
    );
};
