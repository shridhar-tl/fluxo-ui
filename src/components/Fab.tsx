import classNames from 'classnames';
import React from 'react';
import './Fab.scss';

type FabVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
type FabSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type FabPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

interface FabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'size'> {
    icon: IconComponent | React.ReactElement;
    label?: string;
    variant?: FabVariant;
    size?: FabSize;
    position?: FabPosition;
    fixed?: boolean;
    extended?: boolean;
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    ariaLabel?: string;
    id?: string;
    title?: string;
}

const renderIcon = (icon: IconComponent | React.ReactElement) => {
    if (React.isValidElement(icon)) return icon;
    const Icon = icon as React.ElementType;
    return <Icon className="eui-fab-icon-svg" />;
};

function Fab({
    icon,
    label,
    variant = 'primary',
    size = 'md',
    position = 'bottom-right',
    fixed = false,
    extended = false,
    disabled = false,
    onClick,
    className,
    ariaLabel,
    id,
    title,
    ...rest
}: FabProps) {
    const rootClasses = classNames(
        'eui-fab',
        `eui-fab-${size}`,
        `eui-fab-variant-${variant}`,
        {
            'eui-fab-extended': extended && label,
            'eui-fab-fixed': fixed,
            [`eui-fab-${position}`]: fixed,
            'eui-fab-disabled': disabled,
        },
        className,
    );

    return (
        <button
            {...rest}
            type="button"
            className={rootClasses}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel || label || 'Action button'}
            title={title || label}
            id={id}
        >
            <span className="eui-fab-icon">{renderIcon(icon)}</span>
            {extended && label && <span className="eui-fab-label">{label}</span>}
        </button>
    );
}

export { Fab };
export type { FabProps, FabVariant, FabSize, FabPosition };
