import cn from 'classnames';
import React from 'react';
import './SafeAreaView.scss';

type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left' | 'all' | 'horizontal' | 'vertical';
type SafeAreaMode = 'padding' | 'margin';
type SafeAreaTag = keyof React.JSX.IntrinsicElements;

interface SafeAreaViewProps extends React.HTMLAttributes<HTMLElement> {
    edges?: SafeAreaEdge[] | SafeAreaEdge;
    mode?: SafeAreaMode;
    as?: SafeAreaTag;
    fillBackground?: boolean;
    children?: React.ReactNode;
    className?: string;
}

const expandEdges = (raw: SafeAreaEdge[] | SafeAreaEdge | undefined): SafeAreaEdge[] => {
    const list: SafeAreaEdge[] = Array.isArray(raw) ? raw : raw ? [raw] : ['all'];
    const result = new Set<SafeAreaEdge>();
    for (const edge of list) {
        if (edge === 'all') {
            result.add('top');
            result.add('right');
            result.add('bottom');
            result.add('left');
        } else if (edge === 'horizontal') {
            result.add('left');
            result.add('right');
        } else if (edge === 'vertical') {
            result.add('top');
            result.add('bottom');
        } else {
            result.add(edge);
        }
    }
    return Array.from(result);
};

const SafeAreaView: React.FC<SafeAreaViewProps> = ({
    edges = 'all',
    mode = 'padding',
    as,
    fillBackground = false,
    className,
    children,
    style,
    ...rest
}) => {
    const Tag = (as ?? 'div') as React.ElementType;
    const list = expandEdges(edges);
    const prefix = mode === 'margin' ? 'margin' : 'padding';
    const safeStyle: React.CSSProperties = {};
    for (const edge of list) {
        const cssEdge = edge === 'top' ? 'Top' : edge === 'right' ? 'Right' : edge === 'bottom' ? 'Bottom' : 'Left';
        const insetKey = `--eui-safe-${edge}` as const;
        const insetVar = `var(${insetKey})`;
        const key = `${prefix}${cssEdge}` as keyof React.CSSProperties;
        (safeStyle as Record<string, string>)[key as string] = insetVar;
    }

    return (
        <Tag
            {...rest}
            className={cn('eui-safe-area-view', `eui-safe-area-mode-${mode}`, className, {
                'eui-safe-area-fill': fillBackground,
            })}
            style={{ ...safeStyle, ...style }}
        >
            {children}
        </Tag>
    );
};

export { SafeAreaView };
export type { SafeAreaViewProps, SafeAreaEdge, SafeAreaMode };
