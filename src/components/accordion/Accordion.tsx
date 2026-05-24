import cn from 'classnames';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon } from '../../assets/icons';
import '../eui-base.scss';
import './Accordion.scss';

type AccordionVariant = 'default' | 'bordered' | 'filled' | 'minimal' | 'separated';
type AccordionMode = 'single' | 'multi';
type ChevronPosition = 'left' | 'right';

interface AccordionItemDef {
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
}

interface AccordionProps {
    items: AccordionItemDef[];
    mode?: AccordionMode;
    variant?: AccordionVariant;
    chevronPosition?: ChevronPosition;
    defaultOpen?: string[];
    value?: string[];
    onChange?: (openIds: string[]) => void;
    className?: string;
    ariaLabel?: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    unmountOnCollapse?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
    items,
    mode = 'single',
    variant = 'default',
    chevronPosition = 'right',
    defaultOpen,
    value,
    onChange,
    className,
    ariaLabel,
    headingLevel = 3,
    unmountOnCollapse = false,
}) => {
    const controlled = value !== undefined;
    const [internal, setInternal] = useState<string[]>(defaultOpen ?? []);
    const open = controlled ? value! : internal;
    const openSet = useMemo(() => new Set(open), [open]);
    const headersRef = useRef<(HTMLButtonElement | null)[]>([]);
    const HeadingTag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const toggle = useCallback(
        (id: string) => {
            let next: string[];
            if (openSet.has(id)) {
                next = open.filter((x) => x !== id);
            } else {
                next = mode === 'single' ? [id] : [...open, id];
            }
            if (!controlled) setInternal(next);
            onChange?.(next);
        },
        [open, openSet, mode, controlled, onChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        const focusables = headersRef.current.filter((el): el is HTMLButtonElement => !!el && !el.disabled);
        if (!focusables.length) return;
        const currentPos = focusables.indexOf(e.currentTarget);
        if (currentPos === -1) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusables[(currentPos + 1) % focusables.length]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusables[(currentPos - 1 + focusables.length) % focusables.length]?.focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            focusables[0]?.focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            focusables[focusables.length - 1]?.focus();
        }
    };

    return (
        <div
            className={cn('eui-accordion', `eui-accordion-${variant}`, className)}
            aria-label={ariaLabel}
        >
            {items.map((item, idx) => {
                const isOpen = openSet.has(item.id);
                const panelId = `eui-acc-panel-${item.id}`;
                const headerId = `eui-acc-header-${item.id}`;
                return (
                    <div key={item.id} className="eui-accordion-item">
                        <HeadingTag className="eui-accordion-item-heading">
                            <button
                                ref={(el) => {
                                    headersRef.current[idx] = el;
                                }}
                                id={headerId}
                                type="button"
                                className={cn('eui-accordion-item-header', {
                                    'eui-accordion-item-chevron-left': chevronPosition === 'left',
                                })}
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                disabled={item.disabled}
                                onClick={() => toggle(item.id)}
                                onKeyDown={handleKeyDown}
                            >
                                {item.icon && <span className="eui-accordion-item-icon">{item.icon}</span>}
                                <span className="eui-accordion-item-title">{item.title}</span>
                                <ChevronDownIcon className="eui-accordion-item-chevron" aria-hidden="true" />
                            </button>
                        </HeadingTag>
                        <div
                            id={panelId}
                            role="region"
                            aria-labelledby={headerId}
                            className={cn('eui-accordion-item-panel', { 'eui-accordion-item-panel-open': isOpen })}
                            inert={!isOpen}
                        >
                            <div>
                                {(isOpen || !unmountOnCollapse) && (
                                    <div className="eui-accordion-item-panel-inner">{item.content}</div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export { Accordion };
export type { AccordionProps, AccordionItemDef, AccordionVariant, AccordionMode, ChevronPosition };
