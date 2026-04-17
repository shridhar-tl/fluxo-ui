import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Dropdown } from '../../Dropdown';
import { NumericInput } from '../../NumericInput';
import { TextInput } from '../../TextInput';
import type { ListItem } from '../../../types';
import { ExpressionEditor } from '../expression/ExpressionEditor';
import { useReportBuilderContext, useRBStore } from '../report-builder-context';
import { findComponent, updateComponentInTree } from '../report-component-helpers';
import type { ReportBuilderState } from '../report-builder-types';
import type { ComponentStyleProps } from '../report-definition-types';

type StyleCategory = 'typography' | 'background' | 'border' | 'spacing' | 'sizing' | 'visibility';

const categories: Array<{ key: StyleCategory; label: string }> = [
    { key: 'typography', label: 'Typography' },
    { key: 'background', label: 'Background' },
    { key: 'border', label: 'Border' },
    { key: 'spacing', label: 'Spacing' },
    { key: 'sizing', label: 'Sizing' },
    { key: 'visibility', label: 'Visibility' },
];

const fontWeightOptions: ListItem[] = [
    { value: '', label: 'Inherited' },
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: '100', label: '100' },
    { value: '200', label: '200' },
    { value: '300', label: '300' },
    { value: '400', label: '400' },
    { value: '500', label: '500' },
    { value: '600', label: '600' },
    { value: '700', label: '700' },
    { value: '800', label: '800' },
    { value: '900', label: '900' },
];

const fontStyleOptions: ListItem[] = [
    { value: '', label: 'Inherited' },
    { value: 'normal', label: 'Normal' },
    { value: 'italic', label: 'Italic' },
];

const borderStyleOptions: ListItem[] = [
    { value: '', label: 'None' },
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
];

export const StylesPallet: React.FC = () => {
    const { store } = useReportBuilderContext();
    const selectedItemId = useRBStore((s) => s.selectedItemId);
    const selectedItemType = useRBStore((s) => s.selectedItemType);
    const components = useRBStore((s) => s.definition.components);
    const [openCategory, setOpenCategory] = useState<StyleCategory>('typography');

    const component = selectedItemId ? findComponent(components, selectedItemId) : null;

    const updateStyle = useCallback((patch: Partial<ComponentStyleProps>) => {
        if (!selectedItemId) return;
        store.setState((prev: ReportBuilderState) => ({
            ...prev,
            definition: {
                ...prev.definition,
                components: updateComponentInTree(prev.definition.components, selectedItemId, (c) => ({
                    ...c,
                    styles: { ...c.styles, ...patch },
                })),
                metadata: { ...prev.definition.metadata, updatedAt: new Date().toISOString() },
            },
        }));
    }, [store, selectedItemId]);

    if (selectedItemType !== 'component' || !component) {
        return (
            <div className="eui-rb-props-pallet-empty">
                <span>Select a component to edit its styles</span>
            </div>
        );
    }

    const s = component.styles as ComponentStyleProps;

    return (
        <div className="eui-rb-styles-pallet">
            {categories.map((cat) => (
                <StyleSection
                    key={cat.key}
                    label={cat.label}
                    open={openCategory === cat.key}
                    onToggle={() => setOpenCategory(openCategory === cat.key ? ('' as StyleCategory) : cat.key)}
                >
                    {cat.key === 'typography' && (
                        <TypographySection styles={s} onChange={updateStyle} />
                    )}
                    {cat.key === 'background' && (
                        <BackgroundSection styles={s} onChange={updateStyle} />
                    )}
                    {cat.key === 'border' && (
                        <BorderSection styles={s} onChange={updateStyle} />
                    )}
                    {cat.key === 'spacing' && (
                        <SpacingSection styles={s} onChange={updateStyle} />
                    )}
                    {cat.key === 'sizing' && (
                        <SizingSection styles={s} onChange={updateStyle} />
                    )}
                    {cat.key === 'visibility' && (
                        <VisibilitySection styles={s} onChange={updateStyle} />
                    )}
                </StyleSection>
            ))}
        </div>
    );
};

const StyleSection: React.FC<{
    label: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ label, open, onToggle, children }) => (
    <div className="eui-rb-styles-section">
        <button
            className={classNames('eui-rb-styles-section-header', { open })}
            onClick={onToggle}
            aria-expanded={open}
        >
            <span>{label}</span>
            <span className="eui-rb-styles-section-chevron">{open ? '▲' : '▼'}</span>
        </button>
        {open && <div className="eui-rb-styles-section-body">{children}</div>}
    </div>
);

interface SectionProps {
    styles: ComponentStyleProps;
    onChange: (patch: Partial<ComponentStyleProps>) => void;
}

const TypographySection: React.FC<SectionProps> = ({ styles, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PropRow label="Font Family">
            <TextInput
                value={styles.fontFamily ?? ''}
                onChange={(e) => onChange({ fontFamily: e.value || undefined })}
                placeholder="Inherited"
                aria-label="Font family"
                size="sm"
            />
        </PropRow>
        <PropRow label="Font Size (px)">
            <NumericInput
                value={styles.fontSize ?? undefined}
                onChange={(e) => onChange({ fontSize: e.value || undefined })}
                placeholder="Inherited"
                min={8}
                max={200}
                aria-label="Font size"
                size="sm"
            />
        </PropRow>
        <PropRow label="Font Weight">
            <Dropdown
                options={fontWeightOptions}
                value={styles.fontWeight ?? ''}
                onChange={(e) => onChange({ fontWeight: (e.value || undefined) as ComponentStyleProps['fontWeight'] })}
                aria-label="Font weight"
                size="sm"
            />
        </PropRow>
        <PropRow label="Font Style">
            <Dropdown
                options={fontStyleOptions}
                value={styles.fontStyle ?? ''}
                onChange={(e) => onChange({ fontStyle: (e.value || undefined) as ComponentStyleProps['fontStyle'] })}
                aria-label="Font style"
                size="sm"
            />
        </PropRow>
        <PropRow label="Text Align">
            <div style={{ display: 'flex', gap: 4 }}>
                {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                    <Button
                        key={align}
                        size="xs"
                        layout={styles.textAlign === align ? 'default' : 'outlined'}
                        variant={styles.textAlign === align ? 'primary' : 'default'}
                        onClick={() => onChange({ textAlign: styles.textAlign === align ? undefined : align })}
                        aria-pressed={styles.textAlign === align}
                        style={{ flex: 1 }}
                        label={align.charAt(0).toUpperCase()}
                    />
                ))}
            </div>
        </PropRow>
        <PropRow label="Text Color">
            <ColorInput
                value={styles.textColor}
                onChange={(v) => onChange({ textColor: v })}
                aria-label="Text color"
            />
        </PropRow>
    </div>
);

const BackgroundSection: React.FC<SectionProps> = ({ styles, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PropRow label="Background Color">
            <ColorInput
                value={styles.backgroundColor}
                onChange={(v) => onChange({ backgroundColor: v })}
                aria-label="Background color"
            />
        </PropRow>
    </div>
);

const BorderSection: React.FC<SectionProps> = ({ styles, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PropRow label="Border Style">
            <Dropdown
                options={borderStyleOptions}
                value={styles.borderStyle ?? ''}
                onChange={(e) => onChange({ borderStyle: (e.value || undefined) as ComponentStyleProps['borderStyle'] })}
                aria-label="Border style"
                size="sm"
            />
        </PropRow>
        <PropRow label="Border Width (px)">
            <NumericInput
                value={styles.borderWidth ?? undefined}
                onChange={(e) => onChange({ borderWidth: e.value || undefined })}
                placeholder="0"
                min={0}
                aria-label="Border width"
                size="sm"
            />
        </PropRow>
        <PropRow label="Border Color">
            <ColorInput
                value={styles.borderColor}
                onChange={(v) => onChange({ borderColor: v })}
                aria-label="Border color"
            />
        </PropRow>
        <PropRow label="Border Radius (px)">
            <NumericInput
                value={styles.borderRadius ?? undefined}
                onChange={(e) => onChange({ borderRadius: e.value || undefined })}
                placeholder="0"
                min={0}
                aria-label="Border radius"
                size="sm"
            />
        </PropRow>
    </div>
);

const SpacingSection: React.FC<SectionProps> = ({ styles, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {(['Top', 'Right', 'Bottom', 'Left'] as const).map((side) => (
                <PropRow key={`p${side}`} label={`Padding ${side} (px)`}>
                    <NumericInput
                        value={(styles[`padding${side}` as keyof ComponentStyleProps] as number | undefined) ?? undefined}
                        onChange={(e) => onChange({ [`padding${side}`]: e.value || undefined })}
                        placeholder="0"
                        min={0}
                        aria-label={`Padding ${side}`}
                        size="sm"
                    />
                </PropRow>
            ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {(['Top', 'Right', 'Bottom', 'Left'] as const).map((side) => (
                <PropRow key={`m${side}`} label={`Margin ${side} (px)`}>
                    <NumericInput
                        value={(styles[`margin${side}` as keyof ComponentStyleProps] as number | undefined) ?? undefined}
                        onChange={(e) => onChange({ [`margin${side}`]: e.value || undefined })}
                        placeholder="0"
                        aria-label={`Margin ${side}`}
                        size="sm"
                    />
                </PropRow>
            ))}
        </div>
    </div>
);

const SizingSection: React.FC<SectionProps> = ({ styles, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PropRow label="Width">
            <TextInput
                value={styles.width ?? ''}
                onChange={(e) => onChange({ width: e.value || undefined })}
                placeholder="100% or 300px"
                aria-label="Width"
                size="sm"
            />
        </PropRow>
        <PropRow label="Height">
            <TextInput
                value={styles.height ?? ''}
                onChange={(e) => onChange({ height: e.value || undefined })}
                placeholder="auto or 200px"
                aria-label="Height"
                size="sm"
            />
        </PropRow>
    </div>
);

const VisibilitySection: React.FC<SectionProps> = ({ styles, onChange }) => {
    const [useExpr, setUseExpr] = useState(typeof styles.visible === 'string');
    const visibleBool = styles.visible === undefined ? true : styles.visible === true || styles.visible === 'true';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="eui-rb-prop-field-label">Visible</span>
                <button
                    className={classNames('eui-rb-expr-toggle', { active: useExpr })}
                    onClick={() => { setUseExpr(!useExpr); onChange({ visible: !useExpr ? '=true' : true }); }}
                    type="button"
                >
                    fx
                </button>
            </div>
            {useExpr ? (
                <ExpressionEditor
                    value={typeof styles.visible === 'string' ? styles.visible.slice(1) : 'true'}
                    onChange={(v) => onChange({ visible: `=${v}` })}
                    placeholder="Parameters.showSection"
                    aria-label="Visibility expression"
                    expectedReturnType="boolean"
                />
            ) : (
                <Checkbox
                    checked={visibleBool}
                    onChange={(e) => onChange({ visible: e.value })}
                    label={visibleBool ? 'Visible' : 'Hidden'}
                />
            )}
        </div>
    );
};

const PropRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="eui-rb-prop-field">
        <label className="eui-rb-prop-field-label">{label}</label>
        {children}
    </div>
);

const ColorInput: React.FC<{
    value: string | undefined;
    onChange: (v: string | undefined) => void;
    'aria-label'?: string;
}> = ({ value, onChange, 'aria-label': ariaLabel }) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
            type="color"
            value={value ?? '#000000'}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 32, height: 28, border: '1px solid var(--eui-border-subtle)', borderRadius: 3, cursor: 'pointer', padding: 1, background: 'var(--eui-input-bg)' }}
            aria-label={ariaLabel ?? 'Color picker'}
        />
        <TextInput
            value={value ?? ''}
            onChange={(e) => onChange(e.value || undefined)}
            placeholder="inherit"
            size="sm"
            style={{ flex: 1 }}
            aria-label={`${ariaLabel ?? 'Color'} hex`}
        />
    </div>
);
