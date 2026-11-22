import React, { useId, useMemo, useState } from 'react';

import classNames from 'classnames';

import '../../eui-base.scss';
import './function-reference.scss';
import { ChevronRightIcon, SearchIcon } from '../../../assets/icons';
import { Dropdown } from '../../Dropdown';
import { TextInput } from '../../TextInput';
import { expressionFunctions } from './builtin-functions';
import type { BuiltinFunction } from './expression-types';
import { ExpressionSyntaxGuide } from './ExpressionSyntaxGuide';
import { FunctionReferenceItem } from './FunctionReferenceItem';

export interface FunctionReferenceProps {
    functions?: BuiltinFunction[];
    onInsert?: (fn: BuiltinFunction) => void;
    autoFocusSearch?: boolean;
    className?: string;
}

const allCategories = '';
const applicationCategory = 'Application';

function categoryOf(fn: BuiltinFunction): string {
    return fn.category ?? applicationCategory;
}

function matchRank(fn: BuiltinFunction, query: string): number {
    const name = fn.name.toLowerCase();
    if (name === query) return 0;
    if (name.startsWith(query)) return 1;
    return name.includes(query) ? 2 : 3;
}

function searchText(fn: BuiltinFunction): string {
    return [fn.name, fn.description, categoryOf(fn), ...fn.params.map((p) => `${p.name} ${p.description ?? ''}`)].join(' ').toLowerCase();
}

export const FunctionReference: React.FC<FunctionReferenceProps> = ({ functions, onInsert, autoFocusSearch, className }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState(allCategories);
    const [showGuide, setShowGuide] = useState(false);
    const guideId = useId();

    const all = useMemo(() => functions ?? expressionFunctions(), [functions]);
    const categories = useMemo(() => Array.from(new Set(all.map(categoryOf))), [all]);
    const indexed = useMemo(() => all.map((fn) => ({ fn, text: searchText(fn) })), [all]);
    const categoryOptions = useMemo(
        () => [
            { value: allCategories, label: `All categories (${all.length})` },
            ...categories.map((c) => ({ value: c, label: `${c} (${all.filter((fn) => categoryOf(fn) === c).length})` })),
        ],
        [all, categories],
    );

    const normalizedQuery = query.trim().toLowerCase();

    const visible = useMemo(() => {
        const terms = normalizedQuery.split(/\s+/).filter(Boolean);
        return indexed
            .filter(({ fn, text }) => (!category || categoryOf(fn) === category) && terms.every((t) => text.includes(t)))
            .map(({ fn }) => ({ fn, rank: normalizedQuery ? matchRank(fn, normalizedQuery) : 0 }))
            .sort((a, b) => a.rank - b.rank);
    }, [indexed, normalizedQuery, category]);

    const grouped = useMemo(() => {
        const map = new Map<string, { rank: number; items: BuiltinFunction[] }>();
        for (const { fn, rank } of visible) {
            const key = categoryOf(fn);
            const group = map.get(key) ?? { rank, items: [] };
            group.items.push(fn);
            map.set(key, group);
        }
        return categories
            .filter((c) => map.has(c))
            .map((c, order) => ({ category: c, order, ...(map.get(c) ?? { rank: 0, items: [] }) }))
            .sort((a, b) => a.rank - b.rank || a.order - b.order);
    }, [visible, categories]);

    const openName = normalizedQuery && (visible.length === 1 ? visible[0].fn.name : visible.find((v) => v.rank === 0)?.fn.name);

    return (
        <div className={classNames('eui-fn-ref', className)}>
            <div className="eui-fn-ref-toolbar">
                <TextInput
                    value={query}
                    onChange={(e) => setQuery(e.value)}
                    placeholder="Search functions"
                    aria-label="Search functions"
                    leftIcon={<SearchIcon aria-hidden="true" />}
                    clearable
                    onClear={() => setQuery('')}
                    autoFocus={autoFocusSearch}
                    size="sm"
                />
                <Dropdown
                    className="eui-fn-ref-category"
                    options={categoryOptions}
                    value={category}
                    onChange={(e) => setCategory(e.value ?? allCategories)}
                    ariaLabel="Function category"
                    size="sm"
                />
            </div>
            <div className="eui-fn-ref-body">
                <button
                    type="button"
                    className="eui-fn-ref-guide-toggle"
                    aria-expanded={showGuide}
                    aria-controls={guideId}
                    onClick={() => setShowGuide((v) => !v)}
                >
                    <ChevronRightIcon className={classNames('eui-fn-ref-chevron', { open: showGuide })} aria-hidden="true" />
                    How to write an expression
                </button>
                {showGuide && (
                    <div id={guideId}>
                        <ExpressionSyntaxGuide />
                    </div>
                )}
                <p className="eui-fn-ref-count" aria-live="polite">
                    {visible.length === 1 ? '1 function' : `${visible.length} functions`}
                </p>
                {grouped.map(({ category: groupName, items }) => (
                    <section key={groupName} className="eui-fn-ref-group" aria-label={`${groupName} functions`}>
                        <h3 className="eui-fn-ref-group-title">{groupName}</h3>
                        <ul className="eui-fn-ref-list">
                            {items.map((fn) => (
                                <FunctionReferenceItem key={`${fn.name}-${openName === fn.name}`} fn={fn} defaultOpen={openName === fn.name} onInsert={onInsert} />
                            ))}
                        </ul>
                    </section>
                ))}
                {visible.length === 0 && (
                    <p className="eui-fn-ref-empty">No function matches &ldquo;{query.trim()}&rdquo;.</p>
                )}
            </div>
        </div>
    );
};

FunctionReference.displayName = 'FunctionReference';
