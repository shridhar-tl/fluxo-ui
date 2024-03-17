import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './SpeedDial.scss';

type SpeedDialVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
type SpeedDialSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpeedDialPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center';
type SpeedDialDirection = 'up' | 'down' | 'left' | 'right';
type SpeedDialTrigger = 'hover' | 'click';
type SpeedDialLayout = 'linear' | 'circle' | 'semi-circle';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

interface SpeedDialItem {
    icon: IconComponent | React.ReactElement;
    label?: string;
    variant?: SpeedDialVariant;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    ariaLabel?: string;
}

interface SpeedDialProps {
    icon?: IconComponent | React.ReactElement;
    openIcon?: IconComponent | React.ReactElement;
    items: SpeedDialItem[];
    variant?: SpeedDialVariant;
    size?: SpeedDialSize;
    position?: SpeedDialPosition;
    direction?: SpeedDialDirection;
    trigger?: SpeedDialTrigger;
    layout?: SpeedDialLayout;
    fixed?: boolean;
    disabled?: boolean;
    showLabels?: boolean;
    showTooltip?: boolean;
    mask?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
    ariaLabel?: string;
    id?: string;
}

const defaultPlusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="eui-speed-dial-icon-svg">
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

const defaultCloseIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="eui-speed-dial-icon-svg">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const renderIcon = (icon: IconComponent | React.ReactElement) => {
    if (React.isValidElement(icon)) return icon;
    const Icon = icon as React.ElementType;
    return <Icon className="eui-speed-dial-icon-svg" />;
};

const getCirclePosition = (index: number, total: number, radius: number, layout: SpeedDialLayout) => {
    let startAngle: number;
    let endAngle: number;

    if (layout === 'semi-circle') {
        startAngle = -Math.PI;
        endAngle = -Math.PI / 2;
    } else {
        startAngle = -Math.PI;
        endAngle = -Math.PI / 2;
    }

    const angle = total > 1
        ? startAngle + (index / (total - 1)) * (endAngle - startAngle)
        : startAngle + (endAngle - startAngle) / 2;

    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
    };
};

function SpeedDial({
    icon,
    openIcon,
    items,
    variant = 'primary',
    size = 'md',
    position = 'bottom-right',
    direction = 'up',
    trigger = 'hover',
    layout = 'linear',
    fixed = false,
    disabled = false,
    showLabels = true,
    showTooltip = false,
    mask = false,
    open: controlledOpen,
    onOpenChange,
    className,
    ariaLabel,
    id,
}: SpeedDialProps) {
    const isControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const containerRef = useRef<HTMLDivElement>(null!);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined!);

    const setOpen = useCallback((val: boolean) => {
        if (!isControlled) setInternalOpen(val);
        onOpenChange?.(val);
    }, [isControlled, onOpenChange]);

    const toggle = useCallback(() => {
        if (disabled) return;
        setOpen(!isOpen);
    }, [disabled, isOpen, setOpen]);

    const handleTriggerMouseEnter = () => {
        if (trigger !== 'hover' || disabled) return;
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setOpen(true);
    };

    const handleContainerMouseLeave = () => {
        if (trigger !== 'hover' || disabled) return;
        hoverTimeoutRef.current = setTimeout(() => setOpen(false), 150);
    };

    const handleActionsMouseEnter = () => {
        if (trigger !== 'hover' || disabled) return;
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };

    const handleItemClick = (item: SpeedDialItem, e: React.MouseEvent<HTMLButtonElement>) => {
        item.onClick?.(e);
        setOpen(false);
    };

    useEffect(() => {
        if (trigger !== 'click' || !isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [trigger, isOpen, setOpen]);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const isLinear = layout === 'linear';

    const getItemStyle = (index: number): React.CSSProperties | undefined => {
        if (!isOpen) {
            if (!isLinear) return { transform: 'scale(0)', opacity: 0 };
            return undefined;
        }

        if (!isLinear) {
            const radiusMap: Record<string, number> = { xs: 60, sm: 70, md: 90, lg: 110, xl: 130 };
            const radius = radiusMap[size] || 90;
            const { x, y } = getCirclePosition(index, items.length, radius, layout);
            return {
                transform: `translate(${x}px, ${y}px) scale(1)`,
                opacity: 1,
                transitionDelay: `${index * 30}ms`,
            };
        }

        return {
            transitionDelay: `${index * 30}ms`,
        };
    };

    const rootClasses = classNames(
        'eui-speed-dial',
        `eui-speed-dial-${size}`,
        `eui-speed-dial-variant-${variant}`,
        `eui-speed-dial-direction-${direction}`,
        {
            'eui-speed-dial-open': isOpen,
            'eui-speed-dial-fixed': fixed,
            [`eui-speed-dial-${position}`]: fixed,
            'eui-speed-dial-disabled': disabled,
            'eui-speed-dial-linear': isLinear,
            'eui-speed-dial-radial': !isLinear,
        },
        className,
    );

    const mainIcon = icon || defaultPlusIcon;
    const mainOpenIcon = openIcon || defaultCloseIcon;

    return (
        <>
            {mask && isOpen && <div className="eui-speed-dial-mask" onClick={() => setOpen(false)} />}
            <div
                ref={containerRef}
                className={rootClasses}
                id={id}
                onMouseLeave={handleContainerMouseLeave}
                onKeyDown={handleKeyDown}
            >
                <div className="eui-speed-dial-actions" role="menu" aria-label={ariaLabel || 'Speed dial actions'} onMouseEnter={handleActionsMouseEnter}>
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={classNames('eui-speed-dial-action-wrapper', {
                                'eui-speed-dial-action-open': isOpen,
                            })}
                            style={getItemStyle(index)}
                        >
                            {showLabels && item.label && (
                                <span className="eui-speed-dial-action-label">{item.label}</span>
                            )}
                            <button
                                type="button"
                                className={classNames(
                                    'eui-speed-dial-action',
                                    `eui-speed-dial-action-variant-${item.variant || 'default'}`,
                                    { 'eui-speed-dial-action-disabled': item.disabled },
                                )}
                                onClick={(e) => handleItemClick(item, e)}
                                disabled={item.disabled}
                                role="menuitem"
                                aria-label={item.ariaLabel || item.label}
                                title={showTooltip ? item.label : undefined}
                            >
                                <span className="eui-speed-dial-action-icon">{renderIcon(item.icon)}</span>
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className={classNames('eui-speed-dial-trigger', `eui-speed-dial-trigger-variant-${variant}`)}
                    onClick={trigger === 'click' ? toggle : undefined}
                    onMouseEnter={handleTriggerMouseEnter}
                    disabled={disabled}
                    aria-label={ariaLabel || 'Open actions'}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                >
                    <span className={classNames('eui-speed-dial-trigger-icon', { 'eui-speed-dial-trigger-rotated': isOpen })}>
                        {isOpen ? renderIcon(mainOpenIcon) : renderIcon(mainIcon)}
                    </span>
                </button>
            </div>
        </>
    );
}

export { SpeedDial };
export type { SpeedDialProps, SpeedDialItem, SpeedDialVariant, SpeedDialSize, SpeedDialPosition, SpeedDialDirection, SpeedDialTrigger, SpeedDialLayout };
