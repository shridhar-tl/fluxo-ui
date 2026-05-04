import React from 'react';
import { createPortal } from 'react-dom';
import { TextInput } from '../../TextInput';
import type { EmojiCategory, EmojiCustomCategory } from '../types';
import { EMOJI_CATEGORIES } from '../utils/emoji-data';
import { readStored, writeStored } from '../utils/persistence';

const RECENT_KEY = 'fluxo-chat-emoji-recent';
const RECENT_MAX = 16;

interface EmojiPickerProps {
    anchorRef: React.RefObject<HTMLElement | null>;
    open: boolean;
    onClose: () => void;
    onSelect: (emoji: string) => void;
    categories?: EmojiCategory[];
    customCategories?: EmojiCustomCategory[];
}

export function EmojiPicker({ anchorRef, open, onClose, onSelect, categories, customCategories }: EmojiPickerProps) {
    const [recent, setRecent] = React.useState<string[]>(() => readStored<string[]>(true, RECENT_KEY) || []);
    const [search, setSearch] = React.useState('');
    const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);

    const enabledCats: EmojiCategory[] = categories?.length ? categories : ['smileys', 'gestures', 'objects', 'symbols', 'nature', 'food'];
    const allCats: { id: string; label: string; emojis: string[]; isCustom?: boolean }[] = React.useMemo(() => {
        const out: { id: string; label: string; emojis: string[]; isCustom?: boolean }[] = [];
        if (recent.length) out.push({ id: 'recent', label: 'Recent', emojis: recent });
        const replacedIds = new Set((customCategories || []).filter((c) => c.replace).map((c) => c.replace));
        for (const id of enabledCats) {
            if (replacedIds.has(id)) continue;
            const cat = EMOJI_CATEGORIES[id];
            if (cat) out.push({ id, label: cat.label, emojis: cat.emojis });
        }
        for (const c of customCategories || []) {
            out.push({ id: c.id, label: c.label, emojis: c.emojis, isCustom: true });
        }
        return out;
    }, [enabledCats, customCategories, recent]);

    const [activeId, setActiveId] = React.useState<string>(allCats[0]?.id || 'smileys');

    React.useEffect(() => {
        if (!open) return;
        const compute = () => {
            const el = anchorRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const panelW = 320;
            const panelH = 360;
            const top = Math.max(8, rect.top + window.scrollY - panelH - 6);
            let left = rect.left + window.scrollX + rect.width / 2 - panelW / 2;
            left = Math.max(8, Math.min(left, window.innerWidth - panelW - 8));
            setPos({ top, left });
        };
        compute();
        window.addEventListener('resize', compute);
        window.addEventListener('scroll', compute, true);
        return () => {
            window.removeEventListener('resize', compute);
            window.removeEventListener('scroll', compute, true);
        };
    }, [open, anchorRef]);

    React.useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (panelRef.current?.contains(t)) return;
            if (anchorRef.current?.contains(t)) return;
            onClose();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, anchorRef, onClose]);

    const handlePick = (emoji: string) => {
        const next = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, RECENT_MAX);
        setRecent(next);
        writeStored(true, RECENT_KEY, next);
        onSelect(emoji);
    };

    if (!open || !pos || typeof document === 'undefined') return null;

    const active = allCats.find((c) => c.id === activeId) || allCats[0];
    const baseList = search ? allCats.flatMap((c) => c.emojis) : active.emojis;
    const filtered = search ? baseList.filter((e) => e.includes(search)) : baseList;

    return createPortal(
        <div className="eui-chat-emoji-picker" ref={panelRef} style={{ top: pos.top, left: pos.left }} role="dialog" aria-label="Emoji picker">
            <div className="eui-chat-emoji-tabs" role="tablist">
                {allCats.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        role="tab"
                        aria-selected={activeId === c.id}
                        className={'eui-chat-emoji-tab ' + (activeId === c.id ? 'eui-chat-active' : '')}
                        onClick={() => setActiveId(c.id)}
                        title={c.label}
                    >
                        <span className="eui-chat-emoji-tab-emoji">{c.id === 'recent' ? '🕘' : c.emojis[0] || '·'}</span>
                    </button>
                ))}
            </div>
            <div className="eui-chat-emoji-search">
                <TextInput value={search} onChange={(e) => setSearch(e?.value ?? '')} placeholder="Search" />
            </div>
            <div className="eui-chat-emoji-grid" role="grid">
                {filtered.map((e, i) => (
                    <button key={`${e}-${i}`} type="button" className="eui-chat-emoji-cell" onClick={() => handlePick(e)} aria-label={e}>
                        {e}
                    </button>
                ))}
            </div>
        </div>,
        document.body,
    );
}
