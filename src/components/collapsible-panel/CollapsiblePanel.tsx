import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon } from '../../assets/icons';
import '../eui-base.scss';
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
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface GroupContextValue {
    variant?: CollapsiblePanelVariant;
    size?: CollapsiblePanelSize;
    iconPosition?: CollapsiblePanelIconPosition;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    activeKeys: Set<string>;
    toggle: (key: string) => void;
    accordion: boolean;
    registerHeader: (id: string, el: HTMLButtonElement | null) => void;
    onHeaderKeyDown: (id: string, e: React.KeyboardEvent) => void;
}

const GroupContext = React.createContext<GroupContextValue | null>(null);

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
    headingLevel: headingLevelProp,
}) => {
    const autoId = useId();
    const safeAutoId = autoId.replace(/[^a-zA-Z0-9_-]/g, '');
    const panelId = idProp || `eui-cp-${safeAutoId}`;
    const headerId = `${panelId}-header`;
    const contentId = `${panelId}-content`;

    const group = useContext(GroupContext);

    const variant = variantProp ?? group?.variant ?? 'default';
    const size = sizeProp ?? group?.size ?? 'md';
    const iconPosition = iconPositionProp ?? group?.iconPosition ?? 'end';
    const headingLevel = headingLevelProp ?? group?.headingLevel ?? 3;
    const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const isGroupControlled = group !== null;
    const groupKey = panelId;

    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const hasRendered = useRef(false);
    const headerButtonRef = useRef<HTMLButtonElement | null>(null);

    const isOpen = isGroupControlled
        ? group.activeKeys.has(groupKey)
        : controlledOpen !== undefined
            ? controlledOpen
            : internalOpen;

    if (isOpen) {
        hasRendered.current = true;
    }

    useEffect(() => {
        if (!group) return;
        group.registerHeader(groupKey, headerButtonRef.current);
        return () => {
            group.registerHeader(groupKey, null);
        };
    }, [group, groupKey]);

    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
        const oneIconProvided = !!expandIcon !== !!collapseIcon;
        if (oneIconProvided) {
            console.warn('[CollapsiblePanel] Provide both `expandIcon` and `collapseIcon` together to avoid an inconsistent indicator across states.');
        }
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

    const handleHeaderKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (group) {
                group.onHeaderKeyDown(groupKey, e);
            }
        },
        [group, groupKey],
    );

    const shouldRender = lazy ? hasRendered.current : true;
    const shouldShow = destroyOnCollapse ? isOpen : true;

    const toggleIndicator = useMemo(() => {
        if (expandIcon || collapseIcon) {
            return isOpen ? (collapseIcon ?? expandIcon) : (expandIcon ?? collapseIcon);
        }
        return <ChevronDownIcon className="eui-cp-chevron" aria-hidden="true" />;
    }, [isOpen, expandIcon, collapseIcon]);

    const headerInner = headerTemplate ? (
        headerTemplate({ isOpen, toggle })
    ) : (
        <>
            {iconPosition === 'start' && (
                <span className={classNames('eui-cp-indicator', { 'eui-cp-indicator-open': isOpen })} aria-hidden="true">
                    {toggleIndicator}
                </span>
            )}
            {icon && <span className="eui-cp-icon" aria-hidden="true">{icon}</span>}
            <span className="eui-cp-title-group">
                <span className="eui-cp-title">{title}</span>
                {subtitle && <span className="eui-cp-subtitle">{subtitle}</span>}
            </span>
            {iconPosition === 'end' && (
                <span className={classNames('eui-cp-indicator', { 'eui-cp-indicator-open': isOpen })} aria-hidden="true">
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
            <div className="eui-cp-header-row">
                <HeadingTag className="eui-cp-heading">
                    <button
                        ref={headerButtonRef}
                        type="button"
                        className={classNames('eui-cp-header', headerClassName)}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        disabled={disabled}
                        id={headerId}
                        onClick={toggle}
                        onKeyDown={handleHeaderKeyDown}
                    >
                        {headerInner}
                    </button>
                </HeadingTag>
                {headerTemplate ? null : headerActions ? (
                    <div className="eui-cp-actions" onClick={(e) => e.stopPropagation()}>
                        {headerActions}
                    </div>
                ) : null}
            </div>
            <div
                className={classNames('eui-cp-body', { 'eui-cp-body-open': isOpen })}
                aria-labelledby={headerId}
                id={contentId}
                inert={!isOpen}
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
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
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
    headingLevel,
}) => {
    const [activeKeys, setActiveKeys] = useState<Set<string>>(() => new Set(defaultOpenKeys));
    const headerOrderRef = useRef<string[]>([]);
    const headerRefsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

    const registerHeader = useCallback((id: string, el: HTMLButtonElement | null) => {
        if (el) {
            headerRefsRef.current.set(id, el);
            if (!headerOrderRef.current.includes(id)) {
                headerOrderRef.current.push(id);
            }
        } else {
            headerRefsRef.current.delete(id);
            headerOrderRef.current = headerOrderRef.current.filter((x) => x !== id);
        }
    }, []);

    const onHeaderKeyDown = useCallback((id: string, e: React.KeyboardEvent) => {
        const order = headerOrderRef.current;
        const idx = order.indexOf(id);
        if (idx === -1) return;
        const focusAt = (i: number) => {
            const targetId = order[i];
            if (!targetId) return;
            headerRefsRef.current.get(targetId)?.focus();
        };
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusAt((idx + 1) % order.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusAt((idx - 1 + order.length) % order.length);
        } else if (e.key === 'Home') {
            e.preventDefault();
            focusAt(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            focusAt(order.length - 1);
        }
    }, []);

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
        () => ({ variant, size, iconPosition, headingLevel, activeKeys, toggle, accordion, registerHeader, onHeaderKeyDown }),
        [variant, size, iconPosition, headingLevel, activeKeys, toggle, accordion, registerHeader, onHeaderKeyDown],
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
            >
                {children}
            </div>
        </GroupContext.Provider>
    );
};

CollapsiblePanelGroup.displayName = 'CollapsiblePanelGroup';
