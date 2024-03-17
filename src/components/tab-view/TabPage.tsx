import classNames from 'classnames';
import React from 'react';

export interface TabPageProps {
    header: React.ReactNode;
    leftIcon?: string | React.ComponentType<any> | React.ReactElement;
    rightIcon?: string | React.ComponentType<any> | React.ReactElement;
    visible?: boolean;
    disabled?: boolean;
    closable?: boolean;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const TabPage: React.FC<TabPageProps> = ({ children, className, style, visible = true, disabled = false, header, leftIcon, rightIcon, ...rest }) => {
    if (!visible) return null;

    return (
        <div
            className={classNames(
                'eui-tab-page',
                {
                    'eui-tab-page-disabled': disabled,
                },
                className,
            )}
            style={style}
            role="tabpanel"
            {...rest}
        >
            {children}
        </div>
    );
};
