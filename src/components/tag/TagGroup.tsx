import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import cn from 'classnames';

import '../eui-base.scss';
import { Tag } from './Tag';
import './TagGroup.scss';
import { TagGroupContext, type TagGroupDefaults } from './tag-context';
import type { TagGroupProps } from './tag-types';

const namedGaps = new Set(['xs', 'sm', 'md', 'lg']);

const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(
    (
        {
            children,
            max,
            expandable = true,
            renderOverflow,
            collapseLabel = 'Show less',
            gap = 'sm',
            wrap = true,
            size,
            variant,
            shape,
            color,
            ariaLabel,
            className,
            style,
            ...rest
        },
        ref,
    ) => {
        const [expanded, setExpanded] = useState(false);
        const rootRef = useRef<HTMLDivElement | null>(null);
        const pendingFocusRef = useRef<'revealed' | 'toggle' | null>(null);
        const setRootRef = useCallback(
            (node: HTMLDivElement | null) => {
                rootRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
            },
            [ref],
        );

        useEffect(() => {
            const root = rootRef.current;
            const pending = pendingFocusRef.current;
            pendingFocusRef.current = null;
            if (!root || !pending) return;
            if (pending === 'toggle') {
                root.querySelector<HTMLElement>('.eui-tag-group-more .eui-tag-action')?.focus();
                return;
            }
            const revealed = root.querySelectorAll<HTMLElement>('.eui-tag-group-item')[max ?? 0];
            const focusTarget = revealed?.querySelector<HTMLElement>('a[href], button:not([disabled])');
            if (focusTarget) {
                focusTarget.focus();
                return;
            }
            root.querySelector<HTMLElement>('.eui-tag-group-less .eui-tag-action')?.focus();
        }, [expanded, max]);

        const expand = () => {
            pendingFocusRef.current = 'revealed';
            setExpanded(true);
        };

        const collapse = () => {
            pendingFocusRef.current = 'toggle';
            setExpanded(false);
        };
        const defaults = useMemo<TagGroupDefaults>(() => ({ size, variant, shape, color }), [size, variant, shape, color]);
        const items = React.Children.toArray(children);
        const limit = max !== undefined && max >= 0 && !expanded ? max : items.length;
        const visibleItems = items.slice(0, limit);
        const hiddenCount = Math.max(0, items.length - limit);
        const collapsible = expanded && max !== undefined && items.length > max;
        const gapStyle = typeof gap === 'number' ? { ['--eui-tag-group-gap' as string]: `${gap}px` } : undefined;

        const overflowContent = renderOverflow ? renderOverflow(hiddenCount, expanded) : `+${hiddenCount}`;

        return (
            <TagGroupContext.Provider value={defaults}>
                <div
                    ref={setRootRef}
                    role="list"
                    aria-label={ariaLabel}
                    {...rest}
                    className={cn(
                        'eui-tag-group',
                        {
                            'eui-tag-group-nowrap': !wrap,
                            [`eui-tag-group-gap-${gap}`]: typeof gap === 'string' && namedGaps.has(gap),
                        },
                        className,
                    )}
                    style={{ ...gapStyle, ...style }}
                >
                    {visibleItems.map((child, index) => (
                        <span role="listitem" className="eui-tag-group-item" key={React.isValidElement(child) && child.key !== null ? child.key : index}>
                            {child}
                        </span>
                    ))}
                    {hiddenCount > 0 && (
                        <span role="listitem" className="eui-tag-group-item eui-tag-group-more">
                            <Tag
                                className="eui-tag-group-toggle"
                                variant="outline"
                                color="default"
                                onClick={expandable ? expand : undefined}
                                title={!expandable ? `${hiddenCount} more` : undefined}
                            >
                                <span aria-hidden="true">{overflowContent}</span>
                                <span className="eui-visually-hidden">{expandable ? `Show ${hiddenCount} more` : `${hiddenCount} more`}</span>
                            </Tag>
                        </span>
                    )}
                    {collapsible && (
                        <span role="listitem" className="eui-tag-group-item eui-tag-group-less">
                            <Tag className="eui-tag-group-toggle" variant="ghost" color="default" onClick={collapse}>
                                {renderOverflow ? renderOverflow(0, true) : collapseLabel}
                            </Tag>
                        </span>
                    )}
                </div>
            </TagGroupContext.Provider>
        );
    },
);

TagGroup.displayName = 'TagGroup';

export { TagGroup };
