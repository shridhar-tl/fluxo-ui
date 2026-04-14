import classNames from 'classnames';
import React, { memo } from 'react';

export interface ToolbarButtonProps {
    icon?: React.ReactNode;
    label: string;
    title?: string;
    shortcut?: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    showLabel?: boolean;
}

const ToolbarButtonInner: React.FC<ToolbarButtonProps> = ({
    icon,
    label,
    title,
    shortcut,
    onClick,
    active = false,
    disabled = false,
    showLabel = false,
}) => {
    const tooltip = title ?? label;
    const finalTitle = shortcut ? tooltip + ' (' + shortcut + ')' : tooltip;
    return (
        <button
            type="button"
            className={classNames('eui-editor-toolbar-btn', {
                'is-active': active,
                'is-disabled': disabled,
                'has-label': showLabel,
            })}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
            title={finalTitle}
            onMouseDown={(e) => e.preventDefault()}
        >
            {icon && <span className="eui-editor-toolbar-btn-icon">{icon}</span>}
            {showLabel && <span className="eui-editor-toolbar-btn-label">{label}</span>}
        </button>
    );
};

export const ToolbarButton = memo(ToolbarButtonInner);

export const ToolbarDivider: React.FC = memo(() => <span className="eui-editor-toolbar-divider" aria-hidden="true" />);

export interface ToolbarGroupProps {
    children: React.ReactNode;
    className?: string;
}

const ToolbarGroupInner: React.FC<ToolbarGroupProps> = ({ children, className }) => (
    <div className={classNames('eui-editor-toolbar-group', className)}>{children}</div>
);

export const ToolbarGroup = memo(ToolbarGroupInner);
