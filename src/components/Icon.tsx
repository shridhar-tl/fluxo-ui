import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    icon?: React.ComponentType<any> | React.ReactElement | null;
}

const Icon: React.FC<IconProps> = ({ icon, ...props }) => {
    if (!icon) {
        return null;
    }

    if (React.isValidElement(icon)) {
        return icon;
    }

    const IconComponent = icon as React.ComponentType<any>;

    return <IconComponent {...props} />;
};

export default Icon;
