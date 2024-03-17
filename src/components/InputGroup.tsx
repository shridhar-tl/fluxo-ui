import classNames from 'classnames';
import React, { Children, isValidElement, ReactNode } from 'react';
import { BaseComponentProps } from '../types';
import { getComponentClasses, getComponentStyles } from '../utils';
import './InputGroup.scss';

interface InputGroupProps extends BaseComponentProps {
    children: ReactNode;
}

export const InputGroup: React.FC<InputGroupProps> = ({ children, disabled = false, className, ...baseProps }) => {
    const containerClasses = getComponentClasses(
        { ...baseProps, disabled },
        classNames('eui-input-group', {
            'eui-input-group-disabled': disabled,
        }),
    );

    const componentStyles = { ...getComponentStyles({ ...baseProps, disabled }), padding: undefined, height: undefined, fontSize: undefined };
    const childArray = Children.toArray(children).filter(isValidElement);

    const renderChildren = () =>
        childArray.map((child, index) => {
            if (!isValidElement(child)) return child;

            const childType = child.type;
            const isAddon = childType === 'span' || childType === 'div';

            if (isAddon) {
                return (
                    <div key={index} className="eui-input-group-addon">
                        {child}
                    </div>
                );
            }

            return child;
        });

    return (
        <div className={classNames(containerClasses, className)} style={componentStyles}>
            {renderChildren()}
        </div>
    );
};
