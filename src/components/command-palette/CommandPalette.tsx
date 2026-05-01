import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SearchIcon } from '../../assets/icons';
import { useViewport } from '../../hooks/useMobile';
import Icon from '../Icon';
import './CommandPalette.scss';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export interface CommandPaletteCommand {
    id: string;
    title: string;
    subtitle?: string;
    group?: string;
    keywords?: string[];
    icon?: IconComponent | React.ReactElement;
    shortcut?: string;
    onSelect: () => void;
    disabled?: boolean;
    danger?: boolean;
}

export interface CommandPaletteRecents {
    storageKey?: string;
    limit?: number;
}

export interface CommandPaletteProps {
    commands: CommandPaletteCommand[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hotkey?: string;
    placeholder?: string;
    emptyMessage?: string | React.ReactNode;
    recents?: CommandPaletteRecents;
    groupOrder?: string[];
    maxResults?: number;
    filterFn?: (command: CommandPaletteCommand, query: string) => number;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

const parseHotkey = (hotkey: string): { key: string; ctrl: boolean; meta: boolean; alt: boolean; shift: boolean } => {
    const parts = hotkey.toLowerCase().split('+').map((p) => p.trim());
    let ctrl = false;
    let meta = false;
    let alt = false;
    let shift = false;
    let key = '';
    for (const part of parts) {
        if (part === 'mod') {
            if (isMac) meta = true;
            else ctrl = true;
        } else if (part === 'ctrl') ctrl = true;
        else if (part === 'meta' || part === 'cmd') meta = true;
        else if (part === 'alt' || part === 'option') alt = true;
        else if (part === 'shift') shift = true;
        else key = part;
    }
    return { key, ctrl, meta, alt, shift };
};

const matchesHotkey = (e: KeyboardEvent, parsed: ReturnType<typeof parseHotkey>) => {
    const eKey = e.key.toLowerCase();
    return (
        eKey === parsed.key &&
        (!parsed.ctrl || e.ctrlKey) &&
        (!parsed.meta || e.metaKey) &&
        (parsed.ctrl || !e.ctrlKey || isMac) &&
        (parsed.meta || !e.metaKey || !isMac) &&
        (!parsed.alt || e.altKey) &&
        (!parsed.shift || e.shiftKey)
    );
};

const subsequenceScore = (text: string, query: string): number => {
    if (!query) return 1;
    const t = text.toLowerCase();
    const q = query.toLowerCase();
    if (t.includes(q)) {
        const idx = t.indexOf(q);
        return 1000 - idx + (q.length / t.length) * 100;
    }
    let ti = 0;
    let qi = 0;
    let last = -1;
    let score = 0;
    while (ti < t.length && qi < q.length) {
        if (t[ti] === q[qi]) {
            if (last >= 0) score -= (ti - last - 1) * 0.5;
            last = ti;
            qi += 1;
            score += 1;
        }
        ti += 1;
    }
    if (qi < q.length) return 0;
    return score;
};

const defaultFilter = (command: CommandPaletteCommand, query: string): number => {
    if (command.disabled) return 0;
    if (!query.trim()) return 1;
    const haystack = `${command.title} ${command.keywords?.join(' ') || ''} ${command.group || ''}`;
    return subsequenceScore(haystack, query);
};

const loadRecents = (key: string): string[] => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
        return [];
    }
};

const saveRecents = (key: string, list: string[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch {
        // ignore storage errors
    }
};

const CommandPalette: React.FC<CommandPaletteProps> = ({
    commands,
    open: openProp,
    onOpenChange,
    hotkey = 'mod+k',
    placeholder = 'Type a command or search...',
    emptyMessage = 'No commands found',
    recents,
    groupOrder,
    maxResults = 50,
    filterFn,
    id,
    className,
    ariaLabel = 'Command palette',
}) => {
    const generatedId = useId();
    const paletteId = id ?? `cmdp-${generatedId}`;
    const listId = `${paletteId}-list`;
    const [openState, setOpenState] = useState(false);
    const [query, setQuery] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const triggerRestoreRef = useRef<HTMLElement | null>(null);
    const { isMobile } = useViewport();

    const isControlled = openProp !== undefined;
    const open = isControlled ? !!openProp : openState;

    const recentsKey = recents?.storageKey;
    const recentLimit = recents?.limit ?? 6;
    const [recentIds, setRecentIds] = useState<string[]>(() => (recentsKey ? loadRecents(recentsKey) : []));

    const setOpen = useCallback(
        (next: boolean) => {
            if (!isControlled) setOpenState(next);
            onOpenChange?.(next);
        },
        [isControlled, onOpenChange],
    );

    useEffect(() => {
        const parsed = parseHotkey(hotkey);
        const handler = (e: KeyboardEvent) => {
            if (matchesHotkey(e, parsed)) {
                e.preventDefault();
                if (!open) {
                    triggerRestoreRef.current = document.activeElement as HTMLElement;
                    setOpen(true);
                } else {
                    setOpen(false);
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [hotkey, open, setOpen]);

    useEffect(() => {
        if (open) {
            setQuery('');
            const timer = window.setTimeout(() => {
                inputRef.current?.focus();
            }, 30);
            return () => window.clearTimeout(timer);
        }
        if (triggerRestoreRef.current && typeof triggerRestoreRef.current.focus === 'function') {
            triggerRestoreRef.current.focus();
            triggerRestoreRef.current = null;
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    const ranked = useMemo(() => {
        const fn = filterFn ?? defaultFilter;
        return commands
            .map((cmd) => ({ cmd, score: fn(cmd, query) }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map(({ cmd }) => cmd);
    }, [commands, query, filterFn, maxResults]);

    const showRecents = !query.trim() && recentIds.length > 0;
    const recentCommands = useMemo(() => {
        if (!showRecents) return [];
        return recentIds
            .map((id) => commands.find((c) => c.id === id))
            .filter((c): c is CommandPaletteCommand => !!c && !c.disabled)
            .slice(0, recentLimit);
    }, [showRecents, recentIds, commands, recentLimit]);

    const groups = useMemo(() => {
        const map = new Map<string, CommandPaletteCommand[]>();
        const orderedGroups: string[] = [];

        if (showRecents && recentCommands.length > 0) {
            map.set('Recent', recentCommands);
            orderedGroups.push('Recent');
        }

        for (const cmd of ranked) {
            const g = cmd.group || 'Commands';
            if (!map.has(g)) {
                map.set(g, []);
                if (!orderedGroups.includes(g)) orderedGroups.push(g);
            }
            map.get(g)!.push(cmd);
        }

        if (groupOrder) {
            orderedGroups.sort((a, b) => {
                const ai = groupOrder.indexOf(a);
                const bi = groupOrder.indexOf(b);
                if (ai === -1 && bi === -1) return 0;
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            });
        }
        return orderedGroups.map((g) => ({ group: g, items: map.get(g) || [] }));
    }, [ranked, recentCommands, showRecents, groupOrder]);

    const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

    useEffect(() => {
        if (flatItems.length === 0) {
            setActiveId(null);
            return;
        }
        if (!activeId || !flatItems.find((c) => c.id === activeId)) {
            setActiveId(flatItems[0].id);
        }
    }, [flatItems, activeId]);

    useEffect(() => {
        if (!activeId) return;
        const node = listRef.current?.querySelector<HTMLElement>(`[data-cmd-id="${activeId}"]`);
        node?.scrollIntoView({ block: 'nearest' });
    }, [activeId]);

    const selectCommand = useCallback(
        (cmd: CommandPaletteCommand) => {
            if (cmd.disabled) return;
            setOpen(false);
            cmd.onSelect();
            if (recentsKey) {
                const next = [cmd.id, ...recentIds.filter((id) => id !== cmd.id)].slice(0, recentLimit);
                setRecentIds(next);
                saveRecents(recentsKey, next);
            }
        },
        [setOpen, recentsKey, recentIds, recentLimit],
    );

    const handleInputKey = (e: React.KeyboardEvent) => {
        if (flatItems.length === 0 && e.key !== 'Escape') return;
        const idx = activeId ? flatItems.findIndex((c) => c.id === activeId) : -1;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = (idx + 1 + flatItems.length) % flatItems.length;
            setActiveId(flatItems[next].id);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const next = (idx - 1 + flatItems.length) % flatItems.length;
            setActiveId(flatItems[next].id);
        } else if (e.key === 'Home') {
            e.preventDefault();
            setActiveId(flatItems[0].id);
        } else if (e.key === 'End') {
            e.preventDefault();
            setActiveId(flatItems[flatItems.length - 1].id);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = flatItems.find((c) => c.id === activeId);
            if (cmd) selectCommand(cmd);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        }
    };

    if (!open) return null;

    return createPortal(
        <div
            className={classNames('eui-cmdp-overlay', className, { 'eui-cmdp-overlay-mobile': isMobile })}
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
            }}
        >
            <div
                id={paletteId}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                className={classNames('eui-cmdp', { 'eui-cmdp-mobile': isMobile })}
            >
                <div className="eui-cmdp-search">
                    <Icon icon={SearchIcon} className="eui-cmdp-search-icon" aria-hidden="true" />
                    <input
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-expanded="true"
                        aria-controls={listId}
                        aria-activedescendant={activeId ? `${paletteId}-opt-${activeId}` : undefined}
                        aria-autocomplete="list"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={placeholder}
                        className="eui-cmdp-search-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleInputKey}
                    />
                    <kbd className="eui-cmdp-esc">Esc</kbd>
                </div>
                <div ref={listRef} id={listId} role="listbox" className="eui-cmdp-list">
                    {flatItems.length === 0 ? (
                        <div className="eui-cmdp-empty" role="status">
                            {emptyMessage}
                        </div>
                    ) : (
                        groups.map((g) => (
                            <div key={g.group} role="group" aria-label={g.group} className="eui-cmdp-group">
                                <div className="eui-cmdp-group-heading">{g.group}</div>
                                {g.items.map((cmd) => {
                                    const isActive = cmd.id === activeId;
                                    return (
                                        <div
                                            key={cmd.id}
                                            id={`${paletteId}-opt-${cmd.id}`}
                                            role="option"
                                            aria-selected={isActive}
                                            data-cmd-id={cmd.id}
                                            className={classNames('eui-cmdp-item', {
                                                'eui-cmdp-item-active': isActive,
                                                'eui-cmdp-item-danger': cmd.danger,
                                                'eui-cmdp-item-disabled': cmd.disabled,
                                            })}
                                            onMouseEnter={() => setActiveId(cmd.id)}
                                            onClick={() => selectCommand(cmd)}
                                        >
                                            {cmd.icon && (
                                                <span className="eui-cmdp-item-icon-wrap" aria-hidden="true">
                                                    <Icon icon={cmd.icon} className="eui-cmdp-item-icon" />
                                                </span>
                                            )}
                                            <div className="eui-cmdp-item-text">
                                                <span className="eui-cmdp-item-title">{cmd.title}</span>
                                                {cmd.subtitle && <span className="eui-cmdp-item-subtitle">{cmd.subtitle}</span>}
                                            </div>
                                            {cmd.shortcut && <kbd className="eui-cmdp-item-shortcut">{cmd.shortcut}</kbd>}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
                <div className="eui-cmdp-footer">
                    <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                    <span><kbd>↵</kbd> Select</span>
                    <span><kbd>Esc</kbd> Close</span>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export { CommandPalette };
export default CommandPalette;
