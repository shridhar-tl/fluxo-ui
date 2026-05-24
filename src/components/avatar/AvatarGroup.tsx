import classNames from 'classnames';
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Avatar, AvatarProps, AvatarShape, AvatarSize } from './Avatar';
import '../eui-base.scss';
import './Avatar.scss';

export interface AvatarGroupProps {
    children?: React.ReactNode;
    items?: AvatarProps[];
    max?: number;
    overlap?: number;
    direction?: 'ltr' | 'rtl';
    size?: AvatarSize | number;
    shape?: AvatarShape;
    onAvatarClick?: (item: AvatarProps, index: number, e: React.MouseEvent) => void;
    onOverflowClick?: () => void;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

const sizePxMap: Record<AvatarSize, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
};

const AvatarGroup: React.FC<AvatarGroupProps> = ({
    children,
    items,
    max,
    overlap = 8,
    direction = 'ltr',
    size = 'md',
    shape = 'circle',
    onAvatarClick,
    onOverflowClick,
    id,
    className,
    ariaLabel,
}) => {
    const generatedId = useId();
    const groupId = id ?? `avatar-group-${generatedId}`;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const allItems: AvatarProps[] = items
        ? items
        : (React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<AvatarProps>[]).map((child) => ({
              ...child.props,
          }));

    const visible = max ? allItems.slice(0, Math.max(0, max - 1)) : allItems;
    const hidden = max ? allItems.slice(Math.max(0, max - 1)) : [];
    const overflowCount = hidden.length;

    const dimension = typeof size === 'number' ? size : sizePxMap[size];

    useLayoutEffect(() => {
        if (!popoverOpen || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX,
        });
    }, [popoverOpen]);

    useEffect(() => {
        if (!popoverOpen) return;
        const handleScroll = () => {
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX,
            });
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPopoverOpen(false);
        };
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        document.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [popoverOpen]);

    useClickOutside(popoverRef, () => setPopoverOpen(false), popoverOpen);

    const handleOverflowClick = () => {
        if (onOverflowClick) {
            onOverflowClick();
        } else {
            setPopoverOpen((v) => !v);
        }
    };

    const containerClass = classNames(
        'eui-avatar-group',
        `eui-avatar-group-direction-${direction}`,
        className,
    );

    return (
        <>
            <div
                id={groupId}
                role="group"
                aria-label={ariaLabel ?? `${allItems.length} users`}
                className={containerClass}
                style={{ '--eui-avatar-overlap': `${overlap}px` } as React.CSSProperties}
            >
                {visible.map((item, idx) => {
                    const itemClick = item.onClick;
                    const handleClick = onAvatarClick
                        ? (e: React.MouseEvent) => {
                              itemClick?.(e);
                              onAvatarClick(item, idx, e);
                          }
                        : itemClick;
                    return (
                        <span key={idx} className="eui-avatar-group-slot">
                            <Avatar {...item} size={size} shape={shape} onClick={handleClick} />
                        </span>
                    );
                })}
                {overflowCount > 0 && (
                    <button
                        ref={triggerRef}
                        type="button"
                        className={classNames('eui-avatar-group-overflow', `eui-avatar-shape-${shape}`)}
                        style={{ width: dimension, height: dimension }}
                        aria-label={`Show ${overflowCount} more`}
                        aria-haspopup={onOverflowClick ? undefined : 'dialog'}
                        aria-expanded={onOverflowClick ? undefined : popoverOpen}
                        onClick={handleOverflowClick}
                    >
                        +{overflowCount}
                    </button>
                )}
            </div>

            {popoverOpen && !onOverflowClick &&
                createPortal(
                    <div
                        ref={popoverRef}
                        role="dialog"
                        aria-label={`${overflowCount} additional users`}
                        className="eui-avatar-group-popover"
                        style={{ top: position.top, left: position.left }}
                    >
                        <div className="eui-avatar-group-popover-list">
                            {hidden.map((item, idx) => {
                                const realIndex = visible.length + idx;
                                const itemClick = item.onClick;
                                const handleClick = onAvatarClick
                                    ? (e: React.MouseEvent) => {
                                          itemClick?.(e);
                                          onAvatarClick(item, realIndex, e);
                                          setPopoverOpen(false);
                                      }
                                    : itemClick;
                                const isClickable = Boolean(handleClick);
                                const content = (
                                    <>
                                        <Avatar {...item} size="sm" shape={shape} />
                                        <div className="eui-avatar-group-popover-item-text">
                                            <span className="eui-avatar-group-popover-item-name">{item.name || item.alt || 'User'}</span>
                                            {item.status && (
                                                <span className="eui-avatar-group-popover-item-status">
                                                    {item.status}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                );
                                if (isClickable) {
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            className="eui-avatar-group-popover-item eui-avatar-group-popover-item-button"
                                            onClick={handleClick}
                                        >
                                            {content}
                                        </button>
                                    );
                                }
                                return (
                                    <div key={idx} className="eui-avatar-group-popover-item">
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
};

export { AvatarGroup };
export default AvatarGroup;
