import classNames from 'classnames';
import React from 'react';
import './Link.scss';

type LinkProps = React.HTMLProps<HTMLAnchorElement> & { newTab?: boolean };

function Link({
    href,
    disabled,
    newTab,
    children,
    className,
    onClick,
    target,
    rel,
    tabIndex,
    ...others
}: LinkProps) {
    const resolvedTarget = newTab && !disabled ? '_blank' : target;
    const resolvedRel = newTab && !disabled ? (rel ? `${rel} noreferrer noopener` : 'noreferrer noopener') : rel;
    const resolvedTabIndex = disabled ? -1 : tabIndex;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.stopPropagation();
        if (disabled) {
            e.preventDefault();
            return;
        }
        onClick?.(e);
    };

    return (
        <a
            {...others}
            href={disabled ? undefined : href}
            className={classNames('eui-link', className, {
                'eui-link-disabled': disabled,
            })}
            target={resolvedTarget}
            rel={resolvedRel}
            aria-disabled={disabled || undefined}
            tabIndex={resolvedTabIndex}
            onClick={handleClick}
        >
            {children}
            {newTab && !disabled && (
                <span className="eui-visually-hidden"> (opens in new tab)</span>
            )}
        </a>
    );
}

export default Link;
