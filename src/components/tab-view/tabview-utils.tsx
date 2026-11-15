import React from 'react';

export const getVisibleTabs = (children: React.ReactNode): React.ReactElement[] => {
    return React.Children.toArray(children).filter((child: any): child is React.ReactElement<any> => {
        return React.isValidElement(child) && (child.props as any).visible !== false;
    });
};

export const isTabDisabled = (tab: React.ReactElement): boolean => {
    return (tab.props as any).disabled === true;
};

export const renderIcon = (
    icon: string | React.ComponentType<any> | React.ReactElement | undefined,
    className?: string
): React.ReactNode => {
    if (!icon) return null;

    if (typeof icon === 'string') {
        return <span className={`${icon} ${className || ''}`} />;
    }

    if (React.isValidElement(icon)) {
        return React.cloneElement(icon, {
            className: `${(icon.props as any).className || ''} ${className || ''}`.trim(),
        } as any);
    }

    if (typeof icon === 'function') {
        const IconComponent = icon;
        return <IconComponent className={className} />;
    }

    return null;
};
