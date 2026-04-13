import cn from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStoryTheme } from './StoryThemeContext';

export interface SectionNavItem {
    id: string;
    title: string;
    description?: string;
}

interface SectionNavProps {
    items: SectionNavItem[];
}

function getActiveSection(items: SectionNavItem[]): string {
    const offset = 120;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

    if (atBottom) {
        for (let i = items.length - 1; i >= 0; i--) {
            const el = document.getElementById(items[i].id);
            if (el && el.getBoundingClientRect().top < window.innerHeight) {
                return items[i].id;
            }
        }
    }

    let activeId = items[0]?.id ?? '';

    for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= offset) {
            activeId = item.id;
        } else {
            break;
        }
    }

    return activeId;
}

const SectionNav: React.FC<SectionNavProps> = ({ items }) => {
    const { isDark } = useStoryTheme();
    const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
    const isClickScrolling = useRef(false);
    const scrollSettleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number>(0);

    const handleClick = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        isClickScrolling.current = true;
        setActiveId(id);

        el.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const onScrollEnd = () => {
            if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current);
            scrollSettleRef.current = setTimeout(() => {
                window.removeEventListener('scroll', onScrollEnd);
                isClickScrolling.current = false;
            }, 80);
        };

        window.addEventListener('scroll', onScrollEnd, { passive: true });
        onScrollEnd();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (isClickScrolling.current) return;
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                setActiveId(getActiveSection(items));
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafRef.current);
            if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current);
        };
    }, [items]);

    if (items.length === 0) return null;

    return (
        <nav
            className={cn(
                'eui-story-section-nav sticky top-8 w-56 shrink-0 hidden xl:block',
                'max-h-[calc(100vh-4rem)] overflow-y-auto'
            )}
        >
            <h4
                className={cn('text-xs font-semibold uppercase tracking-wider mb-3 px-3', {
                    'text-gray-500': isDark,
                    'text-gray-400': !isDark,
                })}
            >
                On this page
            </h4>
            <ul className="space-y-0.5">
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => handleClick(item.id)}
                                className={cn(
                                    'w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors duration-150 cursor-pointer',
                                    'border-l-2',
                                    {
                                        'border-indigo-500 text-indigo-400 font-medium bg-indigo-500/8': isActive && isDark,
                                        'border-indigo-500 text-indigo-600 font-medium bg-indigo-50': isActive && !isDark,
                                        'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/4': !isActive && isDark,
                                        'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100': !isActive && !isDark,
                                    }
                                )}
                                title={item.description}
                            >
                                {item.title}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default SectionNav;
