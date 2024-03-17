import classNames from 'classnames';
import React from 'react';
import './shimmer.scss';

function ShimmerDiv({ className, level = 2, children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
    return (
        <div className={classNames('eui-shimmer', `eui-shimmer-level-${level}`, className)} {...rest}>
            {children}
            <div className="eui-shimmer-overlay" />
        </div>
    );
}

export default ShimmerDiv;
