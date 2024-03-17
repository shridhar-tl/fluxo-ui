import classNames from 'classnames';
import React, { useMemo } from 'react';
import './Stepper.scss';

type StepperVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type StepperSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type StepperLayout = 'default' | 'rounded' | 'square' | 'rectangle' | 'dot' | 'minimal';
type StepperOrientation = 'horizontal' | 'vertical';
type StepStatus = 'pending' | 'active' | 'completed' | 'error' | 'warning';
type StepperLabelPlacement = 'bottom' | 'right' | 'alternate';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

interface StepItem {
    label?: string;
    description?: string;
    icon?: IconComponent | React.ReactElement;
    completedIcon?: IconComponent | React.ReactElement;
    status?: StepStatus;
    disabled?: boolean;
    optional?: boolean;
}

interface StepperProps {
    steps: StepItem[];
    activeStep?: number;
    variant?: StepperVariant;
    size?: StepperSize;
    layout?: StepperLayout;
    orientation?: StepperOrientation;
    labelPlacement?: StepperLabelPlacement;
    showStepNumbers?: boolean;
    showConnectors?: boolean;
    clickable?: boolean;
    linear?: boolean;
    completedIcon?: IconComponent | React.ReactElement;
    errorIcon?: IconComponent | React.ReactElement;
    onChange?: (step: number) => void;
    className?: string;
    disabled?: boolean;
    id?: string;
    ariaLabel?: string;
    connector?: React.ReactNode;
}

const defaultCheckIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="eui-stepper-icon-svg">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
);

const defaultErrorIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="eui-stepper-icon-svg">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

const defaultWarningIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="eui-stepper-icon-svg">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);

const renderStepIcon = (icon: IconComponent | React.ReactElement) => {
    if (React.isValidElement(icon)) return icon;
    const Icon = icon as React.ElementType;
    return <Icon className="eui-stepper-icon-svg" />;
};

function Stepper({
    steps,
    activeStep = 0,
    variant = 'primary',
    size = 'md',
    layout = 'default',
    orientation = 'horizontal',
    labelPlacement = 'bottom',
    showStepNumbers = true,
    showConnectors = true,
    clickable = false,
    linear = false,
    completedIcon,
    errorIcon,
    onChange,
    className,
    disabled = false,
    id,
    ariaLabel,
    connector,
}: StepperProps) {
    const resolvedSteps = useMemo(() => {
        return steps.map((step, index) => {
            if (step.status) return { ...step, resolvedStatus: step.status };
            let resolvedStatus: StepStatus = 'pending';
            if (index < activeStep) resolvedStatus = 'completed';
            else if (index === activeStep) resolvedStatus = 'active';
            return { ...step, resolvedStatus };
        });
    }, [steps, activeStep]);

    const handleStepClick = (index: number) => {
        if (disabled || !clickable || !onChange) return;
        const step = resolvedSteps[index];
        if (step.disabled) return;
        if (linear && index > activeStep + 1) return;
        onChange(index);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleStepClick(index);
        }
    };

    const renderIndicator = (step: typeof resolvedSteps[0], index: number) => {
        const { resolvedStatus, icon, completedIcon: stepCompletedIcon } = step;

        if (resolvedStatus === 'completed') {
            const cIcon = stepCompletedIcon || completedIcon || defaultCheckIcon;
            return <span className="eui-stepper-indicator-icon">{renderStepIcon(cIcon as IconComponent | React.ReactElement)}</span>;
        }

        if (resolvedStatus === 'error') {
            const eIcon = errorIcon || defaultErrorIcon;
            return <span className="eui-stepper-indicator-icon">{renderStepIcon(eIcon as IconComponent | React.ReactElement)}</span>;
        }

        if (resolvedStatus === 'warning') {
            return <span className="eui-stepper-indicator-icon">{renderStepIcon(defaultWarningIcon)}</span>;
        }

        if (icon) {
            return <span className="eui-stepper-indicator-icon">{renderStepIcon(icon)}</span>;
        }

        if (layout === 'dot') {
            return <span className="eui-stepper-dot" />;
        }

        if (showStepNumbers) {
            return <span className="eui-stepper-number">{index + 1}</span>;
        }

        return <span className="eui-stepper-dot" />;
    };

    const renderConnector = (index: number) => {
        if (!showConnectors || index >= resolvedSteps.length - 1) return null;
        if (connector) return <div className="eui-stepper-connector">{connector}</div>;
        const isCompleted = resolvedSteps[index].resolvedStatus === 'completed';
        return (
            <div className={classNames('eui-stepper-connector', { 'eui-stepper-connector-completed': isCompleted })}>
                <div className="eui-stepper-connector-line" />
            </div>
        );
    };

    const rootClasses = classNames(
        'eui-stepper',
        `eui-stepper-${size}`,
        `eui-stepper-${layout}`,
        `eui-stepper-${orientation}`,
        `eui-stepper-variant-${variant}`,
        `eui-stepper-label-${labelPlacement}`,
        {
            'eui-stepper-clickable': clickable && !disabled,
            'eui-stepper-disabled': disabled,
        },
        className,
    );

    return (
        <div className={rootClasses} id={id} role="list" aria-label={ariaLabel || 'Progress steps'}>
            {resolvedSteps.map((step, index) => {
                const isClickable = clickable && !disabled && !step.disabled && (!linear || index <= activeStep + 1);

                return (
                    <React.Fragment key={index}>
                        <div
                            className={classNames(
                                'eui-stepper-step',
                                `eui-stepper-step-${step.resolvedStatus}`,
                                {
                                    'eui-stepper-step-disabled': step.disabled,
                                    'eui-stepper-step-clickable': isClickable,
                                },
                            )}
                            role="listitem"
                            aria-current={step.resolvedStatus === 'active' ? 'step' : undefined}
                            tabIndex={isClickable ? 0 : undefined}
                            onClick={() => handleStepClick(index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                        >
                            <div className="eui-stepper-indicator-wrapper">
                                <div className={classNames('eui-stepper-indicator', `eui-stepper-indicator-${step.resolvedStatus}`)}>
                                    {renderIndicator(step, index)}
                                </div>
                            </div>
                            {(step.label || step.description) && (
                                <div className="eui-stepper-content">
                                    {step.label && (
                                        <span className="eui-stepper-label">
                                            {step.label}
                                            {step.optional && <span className="eui-stepper-optional">Optional</span>}
                                        </span>
                                    )}
                                    {step.description && <span className="eui-stepper-description">{step.description}</span>}
                                </div>
                            )}
                        </div>
                        {renderConnector(index)}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export { Stepper };
export type { StepperProps, StepItem, StepperVariant, StepperSize, StepperLayout, StepperOrientation, StepStatus, StepperLabelPlacement };
