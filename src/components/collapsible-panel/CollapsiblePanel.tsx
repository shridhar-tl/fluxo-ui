import classNames from 'classnames';
import React, { useCallback, useContext, useId, useMemo, useRef, useState } from 'react';
import './collapsible-panel.scss';

export type CollapsiblePanelVariant = 'default' | 'bordered' | 'elevated' | 'ghost' | 'separated';
export type CollapsiblePanelSize = 'sm' | 'md' | 'lg';
export type CollapsiblePanelIconPosition = 'start' | 'end';

export interface CollapsiblePanelProps {
    children: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    variant?: CollapsiblePanelVariant;
    size?: CollapsiblePanelSize;
    iconPosition?: CollapsiblePanelIconPosition;
    expandIcon?: React.ReactNode;
    collapseIcon?: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onToggle?: (open: boolean) => void;
    disabled?: boolean;
    headerActions?: React.ReactNode;
    headerTemplate?: (props: { isOpen: boolean; toggle: () => void }) => React.ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    style?: React.CSSProperties;
    lazy?: boolean;
    destroyOnCollapse?: boolean;
    id?: string;
}

interface GroupContextValue {
    variant?: CollapsiblePanelVariant;
    size?: CollapsiblePanelSize;
    iconPosition?: CollapsiblePanelIconPosition;
    activeKeys: Set<string>;
    toggle: (key: string) => void;
    accordion: boolean;
}

const GroupContext = React.createContext<GroupContextValue | null>(null);

const defaultExpandIcon = (
    <svg className="eui-cp-chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
    children,
    title,
    subtitle,
    icon,
    variant: variantProp,
    size: sizeProp,
    iconPosition: iconPositionProp,
    expandIcon,
    collapseIcon,
    defaultOpen = false,
    open: controlledOpen,
    onToggle,
    disabled = false,
    headerActions,
    headerTemplate,
    className,
    headerClassName,
    contentClassName,
    style,
    lazy = false,
    destroyOnCollapse = false,
    id: idProp,
}) => {
    const autoId = useId();
    const panelId = idProp || autoId;
    const headerId = `${panelId}-header`;
    const contentId = `${panelId}-content`;

    const group = useContext(GroupContext);

    const variant = variantProp ?? group?.variant ?? 'default';
    const size = sizeProp ?? group?.size ?? 'md';
    const iconPosition = iconPositionProp ?? group?.iconPosition ?? 'end';

    const isGroupControlled = group !== null;
    const groupKey = panelId;

    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const hasRendered = useRef(false);

    const isOpen = isGroupControlled
        ? group.activeKeys.has(groupKey)
        : controlledOpen !== undefined
            ? controlledOpen
            : internalOpen;

    if (isOpen) {
        hasRendered.current = true;
    }

    const toggle = useCallback(() => {
        if (disabled) return;

        if (isGroupControlled) {
            group.toggle(groupKey);
        } else if (controlledOpen !== undefined) {
            onToggle?.(!controlledOpen);
        } else {
            setInternalOpen((prev) => {
                const next = !prev;
                onToggle?.(next);
                return next;
            });
        }
    }, [disabled, isGroupControlled, group, groupKey, controlledOpen, onToggle]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        },
        [toggle],
    );

    const shouldRender = lazy ? hasRendered.current : true;
    const shouldShow = destroyOnCollapse ? isOpen : true;

    const toggleIndicator = useMemo(() => {
        if (expandIcon || collapseIcon) {
            return isOpen ? (collapseIcon ?? expandIcon) : expandIcon;
        }
        return defaultExpandIcon;
    }, [isOpen, expandIcon, collapseIcon]);

    const headerContent = headerTemplate ? (
        headerTemplate({ isOpen, toggle })
    ) : (
        <>
            {iconPosition === 'start' && (
                <span className={classNames('eui-cp-indicator', { 'eui-cp-indicator-open': isOpen })}>
                    {toggleIndicator}
                </span>
            )}
            {icon && <span className="eui-cp-icon">{icon}</span>}
            <span className="eui-cp-title-group">
                <span className="eui-cp-title">{title}</span>
                {subtitle && <span className="eui-cp-subtitle">{subtitle}</span>}
            </span>
            {headerActions && (
                <span className="eui-cp-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    {headerActions}
                </span>
            )}
            {iconPosition === 'end' && (
                <span className={classNames('eui-cp-indicator', { 'eui-cp-indicator-open': isOpen })}>
                    {toggleIndicator}
                </span>
            )}
        </>
    );

    return (
        <div
            className={classNames(
                'eui-collapsible-panel',
                `eui-cp-${variant}`,
                `eui-cp-size-${size}`,
                {
                    'eui-cp-open': isOpen,
                    'eui-cp-disabled': disabled,
                },
                className,
            )}
            style={style}
            id={panelId}
        >
            <div
                className={classNames('eui-cp-header', headerClassName)}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-expanded={isOpen}
                aria-controls={contentId}
                aria-disabled={disabled || undefined}
                id={headerId}
                onClick={toggle}
                onKeyDown={handleKeyDown}
            >
                {headerContent}
            </div>
            <div
                className={classNames('eui-cp-body', { 'eui-cp-body-open': isOpen })}
                role="region"
                aria-labelledby={headerId}
                id={contentId}
            >
                <div className={classNames('eui-cp-content', contentClassName)}>
                    {shouldRender && shouldShow && children}
                </div>
            </div>
        </div>
    );
};

CollapsiblePanel.displayName = 'CollapsiblePanel';

// ---------------------------------------------------------------------------
// Group / Accordion
// ---------------------------------------------------------------------------

export interface CollapsiblePanelGroupProps {
    children: React.ReactNode;
    variant?: CollapsiblePanelVariant;
    size?: CollapsiblePanelSize;
    iconPosition?: CollapsiblePanelIconPosition;
    accordion?: boolean;
    defaultOpenKeys?: string[];
    className?: string;
    style?: React.CSSProperties;
    gap?: number;
    onChange?: (openKeys: string[]) => void;
}

export const CollapsiblePanelGroup: React.FC<CollapsiblePanelGroupProps> = ({
    children,
    variant = 'default',
    size = 'md',
    iconPosition = 'end',
    accordion = false,
    defaultOpenKeys = [],
    className,
    style,
    gap,
    onChange,
}) => {
    const [activeKeys, setActiveKeys] = useState<Set<string>>(() => new Set(defaultOpenKeys));

    const toggle = useCallback(
        (key: string) => {
            setActiveKeys((prev) => {
                const next = new Set(prev);
                if (next.has(key)) {
                    next.delete(key);
                } else {
                    if (accordion) next.clear();
                    next.add(key);
                }
                onChange?.([...next]);
                return next;
            });
        },
        [accordion, onChange],
    );

    const ctxValue = useMemo<GroupContextValue>(
        () => ({ variant, size, iconPosition, activeKeys, toggle, accordion }),
        [variant, size, iconPosition, activeKeys, toggle, accordion],
    );

    const groupStyle = useMemo<React.CSSProperties>(
        () => ({
            ...style,
            ...(gap !== undefined ? { gap: `${gap}px` } : {}),
        }),
        [style, gap],
    );

    return (
        <GroupContext.Provider value={ctxValue}>
            <div
                className={classNames('eui-cp-group', className)}
                style={groupStyle}
                role="presentation"
            >
                {children}
            </div>
        </GroupContext.Provider>
    );
};

CollapsiblePanelGroup.displayName = 'CollapsiblePanelGroup';
