import classNames from 'classnames';
import React, { Children, isValidElement, ReactNode } from 'react';
import { BaseComponentProps } from '../types';
import { getComponentClasses, getComponentStyles, splitBaseAndNativeProps } from '../utils';
import './InputGroup.scss';

interface InputGroupProps extends BaseComponentProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
    children: ReactNode;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}

const isAddon = (element: React.ReactElement): boolean => {
    const type = element.type as unknown;
    if (typeof type === 'string') {
        if (type === 'span' || type === 'div' || type === 'label' || type === 'small' || type === 'p') return true;
        return false;
    }
    const props = element.props as Record<string, unknown> | null;
    if (props && (props['data-input-group-addon'] === true || props['data-input-group-addon'] === '')) {
        return true;
    }
    return false;
};

const flattenChildren = (children: ReactNode): React.ReactElement[] => {
    const result: React.ReactElement[] = [];
    Children.forEach(children, (child) => {
        if (!isValidElement(child)) return;
        if (child.type === React.Fragment) {
            result.push(...flattenChildren((child.props as { children?: ReactNode }).children));
        } else {
            result.push(child);
        }
    });
    return result;
};

export const InputGroup: React.FC<InputGroupProps> = ({
    children,
    disabled = false,
    className,
    ariaLabel,
    ariaLabelledBy,
    ...rest
}) => {
    const { styleProps: baseProps, nativeProps } = splitBaseAndNativeProps(rest);
    const containerClasses = getComponentClasses(
        { ...baseProps, disabled },
        classNames('eui-input-group', {
            'eui-input-group-disabled': disabled,
        }),
    );

    const componentStyles = { ...getComponentStyles({ ...baseProps, disabled }), padding: undefined, height: undefined, fontSize: undefined };
    const childArray = flattenChildren(children);

    const renderChildren = () =>
        childArray.map((child, index) => {
            if (isAddon(child)) {
                return (
                    <div key={index} className="eui-input-group-addon">
                        {child}
                    </div>
                );
            }
            return <React.Fragment key={index}>{child}</React.Fragment>;
        });

    return (
        <div
            {...nativeProps}
            className={classNames(containerClasses, className)}
            style={{ ...nativeProps.style, ...componentStyles }}
            role="group"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-disabled={disabled || undefined}
        >
            {renderChildren()}
        </div>
    );
};
