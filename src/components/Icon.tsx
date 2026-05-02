import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.ReactElement | null;
    title?: string;
}

const Icon: React.FC<IconProps> = ({ icon, title, 'aria-label': ariaLabel, 'aria-hidden': ariaHidden, ...props }) => {
    if (!icon) {
        return null;
    }

    const isDecorative = !ariaLabel && !title;
    const computedAriaHidden = ariaHidden ?? (isDecorative ? true : undefined);
    const role = ariaLabel || title ? 'img' : undefined;

    if (React.isValidElement(icon)) {
        const existingProps = (icon.props || {}) as Record<string, unknown>;
        const merged: Record<string, unknown> = {
            ...props,
            ...existingProps,
        };
        if (computedAriaHidden !== undefined && existingProps['aria-hidden'] === undefined) {
            merged['aria-hidden'] = computedAriaHidden;
        }
        if (role && existingProps.role === undefined) {
            merged.role = role;
        }
        if (ariaLabel && existingProps['aria-label'] === undefined) {
            merged['aria-label'] = ariaLabel;
        }
        if (title && existingProps['aria-label'] === undefined && !ariaLabel) {
            merged['aria-label'] = title;
        }
        return React.cloneElement(icon, merged);
    }

    const IconComponent = icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;

    return (
        <IconComponent
            {...props}
            role={role}
            aria-label={ariaLabel || title}
            aria-hidden={computedAriaHidden as React.SVGProps<SVGSVGElement>['aria-hidden']}
        >
            {title ? <title>{title}</title> : null}
        </IconComponent>
    );
};

export default Icon;
