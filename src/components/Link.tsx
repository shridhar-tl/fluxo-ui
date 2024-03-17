import classNames from 'classnames';
import React from 'react';
import './Link.scss';

function Link({ href, disabled, newTab, children, className, ...others }: React.HTMLProps<HTMLAnchorElement> & { newTab?: boolean }) {
    if (newTab && !disabled) {
        others.target = '_blank';
        others.rel = 'noreferrer';
    }

    return (
        <a
            href={disabled ? undefined : href}
            className={classNames('eui-link', className, {
                'eui-link-disabled': disabled,
            })}
            {...others}
            onClick={stopPropagation}
        >
            {children}
        </a>
    );
}

export default Link;

function stopPropagation(e: React.MouseEvent<HTMLAnchorElement>) {
    e.stopPropagation();
}
