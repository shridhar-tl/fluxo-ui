import classNames from 'classnames';
import React, { useId } from 'react';
import {
    AlertIcon,
    BlockIcon,
    CheckCircleIcon,
    InfoIcon,
    SearchIcon,
    WarningIcon,
} from '../../assets/icons';
import { ButtonVariant } from '../../types';
import { Button } from '../Button';
import Icon from '../Icon';
import './EmptyState.scss';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export type EmptyStateLayout = 'vertical' | 'horizontal';
export type EmptyStateSize = 'sm' | 'md' | 'lg';
export type EmptyStateVariant = 'default' | 'noResults' | 'error' | 'success' | 'restricted' | 'info';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface EmptyStateAction {
    label: string;
    onClick?: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    href?: string;
}

export interface EmptyStateProps {
    title: string;
    description?: string | React.ReactNode;
    icon?: IconComponent | React.ReactElement;
    illustration?: React.ReactNode;
    action?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    layout?: EmptyStateLayout;
    size?: EmptyStateSize;
    variant?: EmptyStateVariant;
    id?: string;
    className?: string;
    headingLevel?: HeadingLevel;
}

const variantConfig: Record<EmptyStateVariant, { icon: IconComponent; defaultActionVariant: ButtonVariant; toneClass: string }> = {
    default: {
        icon: InfoIcon,
        defaultActionVariant: 'primary',
        toneClass: 'eui-empty-state-tone-default',
    },
    noResults: {
        icon: SearchIcon,
        defaultActionVariant: 'primary',
        toneClass: 'eui-empty-state-tone-default',
    },
    error: {
        icon: AlertIcon,
        defaultActionVariant: 'danger',
        toneClass: 'eui-empty-state-tone-error',
    },
    success: {
        icon: CheckCircleIcon,
        defaultActionVariant: 'success',
        toneClass: 'eui-empty-state-tone-success',
    },
    restricted: {
        icon: BlockIcon,
        defaultActionVariant: 'primary',
        toneClass: 'eui-empty-state-tone-restricted',
    },
    info: {
        icon: WarningIcon,
        defaultActionVariant: 'info',
        toneClass: 'eui-empty-state-tone-info',
    },
};

const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    illustration,
    action,
    secondaryAction,
    layout = 'vertical',
    size = 'md',
    variant = 'default',
    id,
    className,
    headingLevel = 3,
}) => {
    const generatedId = useId();
    const stateId = id ?? `empty-state-${generatedId}`;
    const config = variantConfig[variant];

    const headingTagName = `h${headingLevel}`;

    const visualNode = illustration ? (
        <div className="eui-empty-state-illustration" aria-hidden="true">
            {illustration}
        </div>
    ) : (
        <div className={classNames('eui-empty-state-icon-wrap', config.toneClass)} aria-hidden="true">
            <Icon icon={icon ?? config.icon} className="eui-empty-state-icon" />
        </div>
    );

    return (
        <div
            id={stateId}
            className={classNames(
                'eui-empty-state',
                `eui-empty-state-layout-${layout}`,
                `eui-empty-state-size-${size}`,
                `eui-empty-state-variant-${variant}`,
                className,
            )}
        >
            {visualNode}
            <div className="eui-empty-state-content">
                {React.createElement(headingTagName, { className: 'eui-empty-state-title' }, title)}
                {description && <div className="eui-empty-state-description">{description}</div>}
                {(action || secondaryAction) && (
                    <div className="eui-empty-state-actions">
                        {action && (
                            <Button
                                variant={action.variant ?? config.defaultActionVariant}
                                onClick={action.onClick}
                                isLoading={action.loading}
                                disabled={action.disabled}
                                href={action.href}
                                size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
                            >
                                {action.label}
                            </Button>
                        )}
                        {secondaryAction && (
                            <Button
                                variant={secondaryAction.variant ?? 'secondary'}
                                layout="plain"
                                onClick={secondaryAction.onClick}
                                href={secondaryAction.href}
                                size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
                            >
                                {secondaryAction.label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export { EmptyState };
export default EmptyState;
