import cn from 'classnames';
import React, { Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lightbox } from '../../components';
import PageLayout from '../PageLayout';
import type { SectionNavItem } from '../SectionNav';
import { useStoryTheme } from '../StoryThemeContext';

const sectionNavItems: SectionNavItem[] = [
    { id: 'hero', title: 'Overview', description: 'Why Fluxo UI stands out' },
    { id: 'flagships', title: 'Flagship Components', description: 'The headline experiences' },
    { id: 'extras', title: 'More Highlights', description: 'Other standout pieces' },
    { id: 'platform', title: 'Platform Features', description: 'Store & dependency injection' },
    { id: 'explore', title: 'Explore Further', description: 'Browse the full library' },
];

interface FlagshipItem {
    title: string;
    tagline: string;
    description: string;
    path: string;
    highlights: string[];
    accent: string;
    previewLoader?: () => Promise<{ default: React.ComponentType }>;
    zoom?: boolean;
}

const flagshipComponents: FlagshipItem[] = [
    {
        title: 'Report Builder & Viewer',
        tagline: 'Design. Parameterize. Render. Export.',
        description:
            'A complete BI toolkit in one pair: a visual drag-and-drop designer with pluggable datasources, parameter panels, row/column groups, expression-driven cells, visibility rules, and JSON-serializable definitions — plus a runtime Viewer that takes those definitions and renders them with sorting, filtering, drill-through, and PDF export for end users.',
        path: '/components/report-builder',
        highlights: [
            'Visual designer',
            'Datasource plugins',
            'Expression engine',
            'JSON definition',
            'Runtime viewer',
            'PDF export',
            'Drill-through',
        ],
        accent: '#6366f1',
        previewLoader: undefined,
        zoom: true,
    },
    {
        title: 'Pivot Table',
        tagline: 'Aggregate. Drill. Compare.',
        description:
            'A high-performance pivoting engine with multi-level row/column groupings, multiple aggregations per measure, filtering, and expand/collapse. Turn flat data into decision-ready summaries in a single prop.',
        path: '/components/pivot-table',
        highlights: ['Multi-level groups', 'Multiple aggregations', 'Expand/collapse', 'Filtering'],
        accent: '#0ea5e9',
        previewLoader: () => import('./pivot-table/BasicUsage'),
        zoom: true,
    },
    {
        title: 'Gantt Chart',
        tagline: 'Plan timelines visually.',
        description:
            'Interactive project timelines with hierarchical tasks, dependencies, drag-to-reschedule, multiple view modes (day, week, month, quarter), date markers, and read-only rendering. Production-ready for real roadmaps.',
        path: '/components/gantt-chart',
        highlights: ['Task dependencies', 'Drag to reschedule', 'Hierarchical tasks', 'Multiple views'],
        accent: '#f97316',
        previewLoader: () => import('./gantt-chart/BasicUsage'),
        zoom: true,
    },
    {
        title: 'Kanban Board',
        tagline: 'Drag cards across columns.',
        description:
            'Fully interactive board with drag-and-drop between columns, column locking, card blocking, custom templates, sticky headers, collapsible columns, and a vertical layout variant for mobile.',
        path: '/components/kanban-board',
        highlights: ['Drag & drop', 'Custom templates', 'Column limits', 'Sticky headers'],
        accent: '#10b981',
        previewLoader: () => import('./kanban-board/BasicUsage'),
        zoom: true,
    },
    {
        title: 'Calendar',
        tagline: 'Events, schedules, and plugins.',
        description:
            'A full-featured event calendar with month/week/day/timeline views, drag-and-drop event editing, external drag sources, a plugin system for custom views, date backgrounds, and an imperative API for programmatic control.',
        path: '/components/calendar',
        highlights: ['Plugin system', 'Drag & drop', 'Multiple views', 'Imperative API'],
        accent: '#ef4444',
        previewLoader: () => import('./calendar/BasicUsage'),
        zoom: true,
    },
    {
        title: 'HTML Editor',
        tagline: 'Rich WYSIWYG, sanitized output.',
        description:
            'A full-featured rich text editor — bold, headings, lists, tables, images, links, colors, alignment, undo/redo — that emits sanitized HTML. Drop it in for any content authoring experience.',
        path: '/components/html-editor',
        highlights: ['Full toolbar', 'Tables & images', 'Sanitized output', 'Split preview'],
        accent: '#ec4899',
    },
    {
        title: 'Markdown Editor',
        tagline: 'Write, preview, upload.',
        description:
            'Markdown editor with a rich toolbar, image upload, syntax highlighting, and a synchronized split-view preview. Ideal for docs, comments, and content pipelines.',
        path: '/components/markdown',
        highlights: ['Toolbar', 'Image upload', 'Split preview', 'Keyboard shortcuts'],
        accent: '#14b8a6',
    },
    {
        title: 'Image Editor',
        tagline: 'Crop. Rotate. Annotate.',
        description:
            'A browser-side image editor with cropping, rotation, blur, and freehand annotation overlays. Built on a layered canvas pipeline — export the edited image back as a file or dataURL.',
        path: '/components/image-editor',
        highlights: ['Crop & rotate', 'Blur tool', 'Annotations', 'Export to file'],
        accent: '#a855f7',
        zoom: true,
    },
];

const extraComponents: FlagshipItem[] = [
    {
        title: 'Diff Viewer',
        tagline: 'Side-by-side text diffs at scale.',
        description:
            'High-performance text diff with unified, split, and inline variants. Virtualized rendering keeps huge files smooth. Syntax-aware, line-level, and word-level highlights.',
        path: '/components/diff-viewer',
        highlights: ['Unified / split / inline', 'Virtualized', 'Word-level diff'],
        accent: '#64748b',
    },
    {
        title: 'Carousel',
        tagline: 'Media slider with thumbnails.',
        description:
            'A responsive image/video carousel with thumbnail navigation, autoplay, keyboard controls, and touch gestures. Handles aspect ratios, captions, and custom controls cleanly.',
        path: '/components/carousel',
        highlights: ['Thumbnails', 'Autoplay', 'Touch gestures'],
        accent: '#f59e0b',
    },
    {
        title: 'Canvas Draw',
        tagline: 'Freehand drawing overlay.',
        description:
            'A drawing and annotation canvas with brush variants, undo/redo, color picking, and export to image. Pair it with Image Editor for a complete annotation workflow.',
        path: '/components/canvas-draw',
        highlights: ['Brushes & colors', 'Undo / redo', 'Export as image'],
        accent: '#06b6d4',
    },
];

const LazyPreview: React.FC<{ loader: () => Promise<{ default: React.ComponentType }> }> = ({ loader }) => {
    const LazyComponent = useMemo(() => React.lazy(loader), [loader]);
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center p-12">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                </div>
            }
        >
            <LazyComponent />
        </Suspense>
    );
};

interface FlagshipCardProps {
    item: FlagshipItem;
    isDark: boolean;
    featured?: boolean;
}

const FlagshipCard: React.FC<FlagshipCardProps> = ({ item, isDark, featured }) => {
    const card = (
        <Link
            to={item.path}
            className={cn(
                'group relative overflow-hidden rounded-2xl border transition-all duration-300 block h-full',
                featured ? 'p-7' : 'p-6',
                {
                    'bg-white/4 border-white/10 hover:border-white/25 hover:bg-white/6': isDark,
                    'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl': !isDark,
                },
            )}
            style={{
                boxShadow: isDark ? `0 0 0 1px ${item.accent}10 inset` : undefined,
            }}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at 20% 0%, ${item.accent}22 0%, transparent 60%)`,
                }}
            />
            <div className="relative">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{
                            background: `${item.accent}1a`,
                            color: item.accent,
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.accent }} />
                        {item.tagline}
                    </div>
                    <span
                        className={cn(
                            'text-[11px] font-semibold opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200 shrink-0',
                            { 'text-gray-300': isDark, 'text-gray-600': !isDark },
                        )}
                    >
                        Explore →
                    </span>
                </div>
                <h3
                    className={cn(featured ? 'text-2xl' : 'text-xl', 'font-extrabold tracking-tight mb-2', {
                        'text-white': isDark,
                        'text-gray-900': !isDark,
                    })}
                    style={{ color: undefined }}
                >
                    {item.title}
                </h3>
                <p
                    className={cn('text-sm leading-relaxed mb-4', {
                        'text-gray-400': isDark,
                        'text-gray-600': !isDark,
                    })}
                >
                    {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {item.highlights.map((h) => (
                        <span
                            key={h}
                            className={cn('text-[11px] px-2 py-0.5 rounded-md font-medium border', {
                                'bg-white/5 border-white/10 text-gray-300': isDark,
                                'bg-gray-50 border-gray-200 text-gray-700': !isDark,
                            })}
                        >
                            {h}
                        </span>
                    ))}
                </div>
            </div>
            <div
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-0 h-[3px] opacity-70 group-hover:opacity-100 transition-opacity"
                style={{
                    background: `linear-gradient(90deg, transparent 0%, ${item.accent} 50%, transparent 100%)`,
                }}
            />
        </Link>
    );

    if (!item.previewLoader) return card;

    return (
        <Lightbox
            trigger="hover"
            position="auto"
            hoverDelay={400}
            hoverCloseDelay={300}
            showCloseButton={false}
            zoomOut={item.zoom}
            zoomScale={item.zoom ? 0.35 : 1}
            zoomWidth={item.zoom ? '1280px' : undefined}
            zoomHeight={item.zoom ? '900px' : undefined}
            width={item.zoom ? 520 : 480}
            height={item.zoom ? 360 : undefined}
            header={
                <div className="flex items-center justify-between">
                    <span>{item.title}</span>
                    <Link to={item.path} className="text-xs font-medium hover:underline" style={{ color: 'var(--eui-primary)' }}>
                        Open full page →
                    </Link>
                </div>
            }
            contentClassName="eui-lightbox-preview-mode"
            content={
                item.zoom ? (
                    <LazyPreview loader={item.previewLoader} />
                ) : (
                    <div style={{ padding: '0.5rem', overflow: 'auto', maxHeight: '400px' }}>
                        <LazyPreview loader={item.previewLoader} />
                    </div>
                )
            }
        >
            {card}
        </Lightbox>
    );
};

const HighlightsPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    const textPrimary = cn({ 'text-white': isDark, 'text-gray-900': !isDark });
    const textBody = cn({ 'text-gray-400': isDark, 'text-gray-600': !isDark });
    const textMuted = cn({ 'text-gray-500': true });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <section className="scroll-mt-8" id="hero">
                <div className="relative py-10 md:py-16 overflow-hidden rounded-3xl">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-40"
                        style={{
                            background: isDark
                                ? 'radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(14,165,233,0.18), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(236,72,153,0.15), transparent 60%)'
                                : 'radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.12), transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(14,165,233,0.10), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(236,72,153,0.08), transparent 60%)',
                        }}
                    />
                    <div className="relative px-6 md:px-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full text-xs font-semibold bg-[var(--eui-primary)]/15 text-[var(--eui-primary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] animate-pulse" />
                            Flagship Highlights
                        </div>
                        <h1 className={cn('text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5', textPrimary)}>
                            More than a UI kit.
                            <br />
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, var(--eui-primary), #ec4899, #f97316)',
                                }}
                            >
                                A full product toolkit.
                            </span>
                        </h1>
                        <p className={cn('text-base md:text-lg leading-relaxed mb-7 max-w-2xl', textBody)}>
                            Fluxo UI ships the hard parts most teams build from scratch — a visual report designer, pivot engine, Gantt
                            timeline, Kanban board, rich HTML/Markdown editors, an image editor, a calendar, and a built-in state management
                            + dependency injection layer. Everything is themeable, accessible, and typed end-to-end.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/overview"
                                className="px-6 py-2.5 bg-[var(--eui-primary)] hover:opacity-90 text-white font-semibold rounded-lg transition-all text-sm shadow-lg shadow-[var(--eui-primary)]/25"
                            >
                                Browse all 70+ components →
                            </Link>
                            <Link
                                to="/installation"
                                className={cn('px-6 py-2.5 border font-semibold rounded-lg transition-all text-sm', {
                                    'border-white/15 hover:border-white/30 text-gray-300': isDark,
                                    'border-gray-300 hover:border-gray-400 text-gray-700': !isDark,
                                })}
                            >
                                Get started
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-10 max-w-2xl">
                            {[
                                { label: '70+', sub: 'Components' },
                                { label: 'TS', sub: 'First-class types' },
                                { label: 'A11y', sub: 'WCAG 2.1 AA' },
                                { label: '12', sub: 'Brand themes' },
                            ].map((s) => (
                                <div
                                    key={s.sub}
                                    className={cn('px-3 py-3 rounded-xl border text-center', {
                                        'bg-white/4 border-white/10': isDark,
                                        'bg-white border-gray-200': !isDark,
                                    })}
                                >
                                    <div className="text-xl font-extrabold text-[var(--eui-primary)] leading-none mb-1">{s.label}</div>
                                    <div className={cn('text-[11px] font-medium', textMuted)}>{s.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="flagships">
                <div className="py-8">
                    <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
                        <div>
                            <h2 className={cn('text-2xl md:text-3xl font-bold mb-1', textPrimary)}>Flagship Components</h2>
                            <p className={cn('text-sm max-w-2xl', textMuted)}>
                                The headline experiences that set Fluxo UI apart. Each one could be a product on its own.
                            </p>
                        </div>
                        <Link to="/overview" className="text-sm font-semibold text-[var(--eui-primary)] hover:underline">
                            View all components →
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {flagshipComponents.map((item, index) => (
                            <FlagshipCard key={item.title} item={item} isDark={isDark} featured={index < 2} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="extras">
                <div className="py-8">
                    <h2 className={cn('text-xl md:text-2xl font-bold mb-1', textPrimary)}>More Highlights</h2>
                    <p className={cn('text-sm mb-6', textMuted)}>Other standout components worth spotlighting.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {extraComponents.map((item) => (
                            <FlagshipCard key={item.title} item={item} isDark={isDark} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="platform">
                <div className="py-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-xs font-semibold bg-[var(--eui-primary)]/15 text-[var(--eui-primary)]">
                        Beyond components
                    </div>
                    <h2 className={cn('text-2xl md:text-3xl font-bold mb-2', textPrimary)}>Platform Features</h2>
                    <p className={cn('text-sm mb-6 max-w-3xl', textBody)}>
                        Fluxo UI isn't just components — it ships the plumbing most apps end up writing anyway. Two first-class building
                        blocks keep your app lean, testable, and easy to scale.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div
                            className={cn('group relative overflow-hidden rounded-2xl border p-7 transition-all duration-300', {
                                'bg-white/4 border-white/10 hover:border-white/25': isDark,
                                'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl': !isDark,
                            })}
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: 'radial-gradient(circle at 20% 0%, rgba(99,102,241,0.18) 0%, transparent 60%)',
                                }}
                            />
                            <div className="relative">
                                <div
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                                    style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6366f1' }} />
                                    State Management
                                </div>
                                <h3 className={cn('text-xl font-extrabold tracking-tight mb-2', textPrimary)}>Built-in Reactive Store</h3>
                                <p className={cn('text-sm leading-relaxed mb-4', textBody)}>
                                    A store with batched updates, path-level subscriptions, and auto-tracked computed properties — plus a
                                    Model factory for CRUD entities. Middleware for persistence, undo/redo, validation, throttle, broadcast,
                                    devtools, and logging.
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {[
                                        'Batched updates',
                                        'Path subscriptions',
                                        'Computed props',
                                        'Model CRUD',
                                        'Undo / redo',
                                        'Persistence',
                                    ].map((h) => (
                                        <span
                                            key={h}
                                            className={cn('text-[11px] px-2 py-0.5 rounded-md font-medium border', {
                                                'bg-white/5 border-white/10 text-gray-300': isDark,
                                                'bg-gray-50 border-gray-200 text-gray-700': !isDark,
                                            })}
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-4 text-xs font-semibold">
                                    <Link to="/store/basic" className="hover:underline" style={{ color: 'var(--eui-primary)' }}>
                                        Basic →
                                    </Link>
                                    <Link to="/store/middleware" className="hover:underline" style={{ color: 'var(--eui-primary)' }}>
                                        Middleware →
                                    </Link>
                                    <Link to="/store/model" className="hover:underline" style={{ color: 'var(--eui-primary)' }}>
                                        Model →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/services/dependency-injection"
                            className={cn('group relative overflow-hidden rounded-2xl border p-7 transition-all duration-300 block', {
                                'bg-white/4 border-white/10 hover:border-white/25': isDark,
                                'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl': !isDark,
                            })}
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: 'radial-gradient(circle at 20% 0%, rgba(236,72,153,0.18) 0%, transparent 60%)',
                                }}
                            />
                            <div className="relative">
                                <div
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                                    style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#ec4899' }} />
                                    Dependency Injection
                                </div>
                                <h3 className={cn('text-xl font-extrabold tracking-tight mb-2', textPrimary)}>First-class DI Container</h3>
                                <p className={cn('text-sm leading-relaxed mb-4', textBody)}>
                                    Class and factory registration with singleton, scoped, and transient lifetimes. Parameterized factories,
                                    circular-dependency detection, chainable API, and a full React integration — ServiceProvider,
                                    ServiceScope, useService, useContainer, and a withServices HOC.
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {[
                                        'Singleton / scoped / transient',
                                        'Parameterized factories',
                                        'Circular detection',
                                        'useService hook',
                                        'ServiceScope',
                                    ].map((h) => (
                                        <span
                                            key={h}
                                            className={cn('text-[11px] px-2 py-0.5 rounded-md font-medium border', {
                                                'bg-white/5 border-white/10 text-gray-300': isDark,
                                                'bg-gray-50 border-gray-200 text-gray-700': !isDark,
                                            })}
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xs font-semibold" style={{ color: 'var(--eui-primary)' }}>
                                    Explore DI →
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="explore">
                <div className="py-10">
                    <div
                        className={cn('relative overflow-hidden rounded-2xl border p-8 md:p-10 text-center', {
                            'bg-white/3 border-white/10': isDark,
                            'bg-white border-gray-200 shadow-sm': !isDark,
                        })}
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-40"
                            style={{
                                background:
                                    'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(236,72,153,0.10), transparent 60%)',
                            }}
                        />
                        <div className="relative">
                            <h2 className={cn('text-2xl md:text-3xl font-bold mb-2', textPrimary)}>Want the full picture?</h2>
                            <p className={cn('text-sm md:text-base mb-6 max-w-2xl mx-auto', textBody)}>
                                These are the headliners. The complete library has 70+ components — form inputs, tables, pickers, overlays,
                                charts, navigation, feedback, and more — every one themeable and accessible out of the box.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link
                                    to="/overview"
                                    className="px-6 py-2.5 bg-[var(--eui-primary)] hover:opacity-90 text-white font-semibold rounded-lg transition-all text-sm shadow-lg shadow-[var(--eui-primary)]/25"
                                >
                                    Browse all components
                                </Link>
                                <Link
                                    to="/mcp-integration"
                                    className={cn('px-6 py-2.5 border font-semibold rounded-lg transition-all text-sm', {
                                        'border-white/15 hover:border-white/30 text-gray-300': isDark,
                                        'border-gray-300 hover:border-gray-400 text-gray-700': !isDark,
                                    })}
                                >
                                    AI / MCP integration
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
};

export default HighlightsPage;
