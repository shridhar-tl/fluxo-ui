import classNames from 'classnames';
import React, { useState } from 'react';
import { ChevronRightIcon } from '../../../../assets/icons';

interface CollapsibleCardProps {
    id: string;
    title: React.ReactNode;
    badge?: string;
    subtitle?: React.ReactNode;
    open: boolean;
    onToggle: () => void;
    actions?: React.ReactNode;
    variant?: 'default' | 'group';
    className?: string;
    children: React.ReactNode;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ id, title, badge, subtitle, open, onToggle, actions, variant = 'default', className, children }) => {
    const bodyId = `${id}-body`;
    return (
        <div className={classNames('eui-rb-card', `eui-rb-card-${variant}`, { open }, className)}>
            <div className="eui-rb-card-header">
                <button type="button" className="eui-rb-card-toggle" onClick={onToggle} aria-expanded={open} aria-controls={bodyId}>
                    <ChevronRightIcon aria-hidden="true" className={classNames('eui-rb-ds-chevron', { open })} />
                    {badge && <span className="eui-rb-card-badge">{badge}</span>}
                    <span className="eui-rb-card-heading">
                        <span className="eui-rb-card-title">{title}</span>
                        {subtitle && <span className="eui-rb-card-subtitle">{subtitle}</span>}
                    </span>
                </button>
                {actions && <div className="eui-rb-card-actions">{actions}</div>}
            </div>
            {open && <div id={bodyId} className="eui-rb-card-body">{children}</div>}
        </div>
    );
};

interface CollapsibleSectionProps {
    title: string;
    count?: number;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, count, defaultOpen = false, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className={classNames('eui-rb-subsection', { open })}>
            <button type="button" className="eui-rb-subsection-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
                <ChevronRightIcon aria-hidden="true" className={classNames('eui-rb-ds-chevron', { open })} />
                <span>{title}</span>
                {count !== undefined && count > 0 && <span className="eui-rb-subsection-count">{count}</span>}
            </button>
            {open && <div className="eui-rb-subsection-body">{children}</div>}
        </div>
    );
};
