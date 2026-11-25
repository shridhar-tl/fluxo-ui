import React from 'react';

export type IconProp = React.ReactNode | React.ComponentType<React.SVGProps<SVGSVGElement>>;

const isComponentType = (icon: IconProp): icon is React.ComponentType<React.SVGProps<SVGSVGElement>> =>
    typeof icon === 'function' || (typeof icon === 'object' && icon !== null && !React.isValidElement(icon) && '$$typeof' in icon);

export const renderIcon = (icon: IconProp | undefined, className: string): React.ReactNode => {
    if (icon === undefined || icon === null || icon === false || icon === true) return null;
    if (isComponentType(icon)) {
        const IconComponent = icon;
        return (
            <span className={className} aria-hidden="true">
                <IconComponent />
            </span>
        );
    }
    return (
        <span className={className} aria-hidden="true">
            {icon}
        </span>
    );
};
