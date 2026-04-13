import cn from 'classnames';
import React, { Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lightbox } from '../../components';
import PageLayout from '../PageLayout';
import type { SectionNavItem } from '../SectionNav';
import { useStoryTheme } from '../StoryThemeContext';

const sectionNavItems: SectionNavItem[] = [
    { id: 'hero', title: 'Overview', description: 'Introduction' },
    { id: 'highlights', title: 'Highlights', description: 'Key features' },
    { id: 'components', title: 'Components', description: 'All available components' },
    { id: 'hooks', title: 'Hooks & Utils', description: 'Hooks and utility functions' },
    { id: 'store', title: 'State Management', description: 'Custom store solution' },
    { id: 'services', title: 'Services', description: 'Dependency injection' },
    { id: 'quick-start', title: 'Quick Start', description: 'Installation & setup' },
];

const largeComponents = new Set([
    'Table',
    'Gantt Chart',
    'Calendar',
    'Pivot Table',
    'TreeView',
    'Canvas Draw',
    'Image Editor',
    'JSON Editor',
    'Tab View',
    'Sortable',
    'Stepper',
]);

const heavyComponents = new Set(['Kanban Board', 'Drag & Drop', 'Step Tour']);

const previewMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
    '/components/textinput': () => import('./text-input/BasicUsage'),
    '/components/numericinput': () => import('./numeric-input/BasicUsage'),
    '/components/maskedinput': () => import('./masked-input/PrefilledValue'),
    '/components/password': () => import('./password/BasicUsage'),
    '/components/textarea': () => import('./textarea/BasicUsage'),
    '/components/fieldlabel': () => import('./field-label/BasicLabel'),
    '/components/inputgroup': () => import('./input-group/EmailInput'),
    '/components/slider': () => import('./slider/BasicUsage'),
    '/components/checkbox': () => import('./checkbox/BasicUsage'),
    '/components/multistatecheckbox': () => import('./multi-state-checkbox/BasicUsage'),
    '/components/radiobutton': () => import('./radio-button/BasicUsage'),
    '/components/inputswitch': () => import('./input-switch/BasicUsage'),
    '/components/selectbutton': () => import('./select-button/BasicUsage'),
    '/components/togglebutton': () => import('./toggle-button/BasicUsage'),
    '/components/dropdown': () => import('./dropdown/BasicUsage'),
    '/components/multiselect': () => import('./multiselect/BasicUsage'),
    '/components/autocomplete': () => import('./autocomplete/BasicUsage'),
    '/components/listbox': () => import('./list-box/SearchableList'),
    '/components/chips': () => import('./chips/BasicUsage'),
    '/components/daterangepicker': () => import('./date-range-picker/BasicUsage'),
    '/components/table': () => import('./table/BasicUsage'),
    '/components/gantt-chart': () => import('./gantt-chart/BasicUsage'),
    '/components/calendar': () => import('./calendar/BasicUsage'),
    '/components/tab-view': () => import('./tab-view/BasicUsage'),
    '/components/progress-bar': () => import('./progress-bar/BasicUsage'),
    '/components/stepper': () => import('./stepper/BasicUsage'),
    '/components/shimmer': () => import('./shimmer/ProfileCard'),
    '/components/tree-view': () => import('./tree-view/BasicUsage'),
    '/components/timeline': () => import('./timeline/BasicUsage'),
    '/components/carousel': () => import('./carousel/BasicUsage'),
    '/components/pivot-table': () => import('./pivot-table/BasicUsage'),
    '/components/button': () => import('./button/BasicUsage'),
    '/components/fab-speed-dial': () => import('./fab-speed-dial/FabBasic'),
    '/components/splitter': () => import('./splitter/HorizontalSplit'),
    '/components/deferred-view': () => import('./deferred-view/BasicUsageDemo'),
    '/components/infinite-scroll': () => import('./infinite-scroll/BasicUsage'),
    '/components/file-upload': () => import('./file-upload/BasicUsage'),
    '/components/animate-on-view': () => import('./animate-on-view/BasicUsage'),
    '/components/modal': () => import('./modal/BasicUsage'),
    '/components/drawer': () => import('./drawer/BasicUsage'),
    '/components/tooltip': () => import('./tooltip/BasicUsage'),
    '/components/popover': () => import('./popover/BasicUsage'),
    '/components/snackbar': () => import('./snackbar/PositionsDemo'),
    '/components/confirm-popover': () => import('./confirm-popover/ConfirmCustomDemo'),
    '/components/context-menu': () => import('./context-menu/RightClickMenu'),
    '/components/breadcrumb': () => import('./breadcrumb/BasicUsage'),
    '/components/notification-center': () => import('./notification-center/BasicUsage'),
    '/components/page-banner': () => import('./page-banner/BasicUsage'),
    '/components/menu-nav': () => import('./menu-nav/BasicUsage'),
    '/components/lightbox': () => import('./lightbox/BasicUsage'),
    '/components/canvas-draw': () => import('./canvas-draw/DrawingCanvas'),
    '/components/json-editor': () => import('./json-editor/BasicUsage'),
    '/components/image-editor': () => import('./image-editor/BasicUsage'),
    '/components/sortable': () => import('./sortable/BasicSortable'),
    '/components/collapsible-panel': () => import('./collapsible-panel/BasicUsage'),
};

const LazyPreview: React.FC<{ path: string }> = ({ path }) => {
    const LazyComponent = useMemo(() => {
        const loader = previewMap[path];
        if (!loader) return null;
        return React.lazy(loader);
    }, [path]);

    if (!LazyComponent) return <div className="p-8 text-center text-sm text-gray-500">Preview not available</div>;

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

interface ComponentCardProps {
    title: string;
    description: string;
    path: string;
    isDark: boolean;
    badge?: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ title, description, path, isDark, badge }) => {
    const isLarge = largeComponents.has(title);
    const isHeavy = heavyComponents.has(title);
    const hasPreview = !!previewMap[path] && !isHeavy;

    const cardContent = (
        <Link
            to={path}
            className={cn('group p-4 rounded-lg border transition-all duration-200 block', {
                'bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/6': isDark,
                'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md': !isDark,
            })}
        >
            <div className="flex items-start justify-between mb-1.5">
                <h4
                    className={cn('text-sm font-semibold group-hover:text-[var(--eui-primary)] transition-colors', {
                        'text-gray-200': isDark,
                        'text-gray-800': !isDark,
                    })}
                >
                    {title}
                </h4>
                {badge && (
                    <span
                        className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', {
                            'bg-emerald-500/20 text-emerald-400': isDark,
                            'bg-emerald-50 text-emerald-600': !isDark,
                        })}
                    >
                        {badge}
                    </span>
                )}
            </div>
            <p className={cn('text-xs leading-relaxed', { 'text-gray-500': true })}>{description}</p>
        </Link>
    );

    if (!hasPreview) return cardContent;

    return (
        <Lightbox
            trigger="hover"
            position="auto"
            hoverDelay={400}
            hoverCloseDelay={300}
            showCloseButton={false}
            zoomOut={isLarge}
            zoomScale={isLarge ? 0.35 : 1}
            zoomWidth={isLarge ? '1280px' : undefined}
            zoomHeight={isLarge ? '900px' : undefined}
            width={isLarge ? 500 : 480}
            height={isLarge ? 350 : undefined}
            header={
                <div className="flex items-center justify-between">
                    <span>{title}</span>
                    <Link to={path} className="text-xs font-medium hover:underline" style={{ color: 'var(--eui-primary)' }}>
                        Open full page →
                    </Link>
                </div>
            }
            contentClassName="eui-lightbox-preview-mode"
            content={
                <div style={{ padding: isLarge ? 0 : '0.5rem', overflow: 'auto', maxHeight: isLarge ? undefined : '400px' }}>
                    <LazyPreview path={path} />
                </div>
            }
        >
            {cardContent}
        </Lightbox>
    );
};

interface CategorySectionProps {
    title: string;
    icon: string;
    items: ComponentCardProps[];
    isDark: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, icon, items, isDark }) => (
    <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
            <span className="text-lg">{icon}</span>
            <h3 className={cn('text-lg font-bold', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>{title}</h3>
            <span
                className={cn('text-xs px-2 py-0.5 rounded-full', {
                    'bg-white/8 text-gray-400': isDark,
                    'bg-gray-100 text-gray-500': !isDark,
                })}
            >
                {items.length}
            </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((item) => (
                <ComponentCard key={item.title} {...item} />
            ))}
        </div>
    </div>
);

const formInputs: Omit<ComponentCardProps, 'isDark'>[] = [
    { title: 'Text Input', description: 'Single-line text field with validation and icons', path: '/components/textinput' },
    { title: 'Numeric Input', description: 'Number input with step buttons and formatting', path: '/components/numericinput' },
    { title: 'Masked Input', description: 'Input with format masks (phone, date, etc.)', path: '/components/maskedinput' },
    { title: 'Password', description: 'Password field with visibility toggle and strength', path: '/components/password' },
    { title: 'Textarea', description: 'Multi-line text area with auto-resize', path: '/components/textarea' },
    { title: 'Field Label', description: 'Accessible form field labels and hints', path: '/components/fieldlabel' },
    { title: 'Input Group', description: 'Group inputs with addons and buttons', path: '/components/inputgroup' },
    { title: 'Slider', description: 'Single/range slider with marks and labels', path: '/components/slider', badge: 'New' },
];

const selectionComponents: Omit<ComponentCardProps, 'isDark'>[] = [
    { title: 'Checkbox', description: 'Standard checkbox with label and indeterminate', path: '/components/checkbox' },
    { title: 'MultiState Checkbox', description: 'Cycle through multiple states on click', path: '/components/multistatecheckbox' },
    { title: 'Radio Button', description: 'Single-selection radio groups', path: '/components/radiobutton' },
    { title: 'Input Switch', description: 'Toggle switch with on/off states', path: '/components/inputswitch' },
    { title: 'Select Button', description: 'Button-style single/multi selection', path: '/components/selectbutton' },
    { title: 'Toggle Button', description: 'Pressable toggle with icon support', path: '/components/togglebutton' },
    { title: 'Dropdown', description: 'Single select dropdown with search', path: '/components/dropdown' },
    { title: 'Multiselect', description: 'Multi-item selection with chips', path: '/components/multiselect' },
    { title: 'Autocomplete', description: 'Input with filtered suggestions', path: '/components/autocomplete' },
    { title: 'List Box', description: 'Scrollable selection list', path: '/components/listbox' },
    { title: 'Chips', description: 'Tag-style input for multiple values', path: '/components/chips' },
    { title: 'Date Range Picker', description: 'Date range selection with presets', path: '/components/daterangepicker' },
];

const dataDisplayComponents: Omit<ComponentCardProps, 'isDark'>[] = [
    { title: 'Table', description: 'Data grid with sort, filter, pagination', path: '/components/table' },
    { title: 'Gantt Chart', description: 'Project timeline and task visualization', path: '/components/gantt-chart' },
    { title: 'Kanban Board', description: 'Drag-and-drop task board with columns', path: '/components/kanban-board' },
    { title: 'Calendar', description: 'Full-featured event calendar', path: '/components/calendar' },
    { title: 'Canvas Draw', description: 'Drawing and annotation overlay', path: '/components/canvas-draw' },
    { title: 'JSON Editor', description: 'Interactive JSON viewer and editor', path: '/components/json-editor' },
    { title: 'Tab View', description: 'Tabbed content with multiple variants', path: '/components/tab-view' },
    { title: 'Progress Bar', description: 'Determinate and indeterminate progress', path: '/components/progress-bar' },
    { title: 'Stepper', description: 'Multi-step wizard navigation', path: '/components/stepper' },
    { title: 'Shimmer / Skeleton', description: 'Loading placeholders and skeletons', path: '/components/shimmer' },
    { title: 'TreeView', description: 'Hierarchical tree with expand/collapse', path: '/components/tree-view', badge: 'New' },
    { title: 'Timeline', description: 'Vertical/horizontal event sequence', path: '/components/timeline', badge: 'New' },
    { title: 'Carousel', description: 'Image/video slider with thumbnails', path: '/components/carousel', badge: 'New' },
    { title: 'Pivot Table', description: 'Aggregation, pivoting, expand/collapse', path: '/components/pivot-table' },
    { title: 'Image Editor', description: 'Crop, rotate, blur, annotate images', path: '/components/image-editor' },
];

const interactiveComponents: Omit<ComponentCardProps, 'isDark'>[] = [
    { title: 'Button', description: 'Primary action element with variants', path: '/components/button' },
    { title: 'Fab & Speed Dial', description: 'Floating action buttons', path: '/components/fab-speed-dial' },
    { title: 'Drag & Drop', description: 'Draggable and droppable containers', path: '/components/drag-drop' },
    { title: 'Sortable', description: 'Drag-to-reorder lists and grids', path: '/components/sortable' },
    { title: 'Splitter', description: 'Resizable split panels', path: '/components/splitter' },
    { title: 'Step Tour', description: 'Guided UI walkthroughs', path: '/components/tour' },
    { title: 'Deferred View', description: 'Lazy-render with visibility detection', path: '/components/deferred-view' },
    { title: 'Infinite Scroll', description: 'Load-more on scroll with indicators', path: '/components/infinite-scroll', badge: 'New' },
    { title: 'File Upload', description: 'Drag-and-drop file upload zone', path: '/components/file-upload', badge: 'New' },
    { title: 'Animate On View', description: 'Scroll-triggered CSS animations', path: '/components/animate-on-view', badge: 'New' },
    {
        title: 'Collapsible Panel',
        description: 'Expand/collapse sections & accordion',
        path: '/components/collapsible-panel',
        badge: 'New',
    },
];

const overlayComponents: Omit<ComponentCardProps, 'isDark'>[] = [
    { title: 'Modal', description: 'Dialog overlays with backdrop', path: '/components/modal' },
    { title: 'Drawer', description: 'Slide-in panel from any edge', path: '/components/drawer', badge: 'New' },
    { title: 'Tooltip', description: 'Hover/focus information popups', path: '/components/tooltip' },
    { title: 'Popover', description: 'Click-triggered content popovers', path: '/components/popover' },
    { title: 'Snackbar', description: 'Toast notifications', path: '/components/snackbar' },
    { title: 'Confirm Popover', description: 'Inline confirmation dialogs', path: '/components/confirm-popover' },
    { title: 'Context Menu', description: 'Right-click context menus', path: '/components/context-menu' },
    { title: 'Breadcrumb', description: 'Navigation breadcrumb trail', path: '/components/breadcrumb', badge: 'New' },
    { title: 'Notification Center', description: 'Dropdown notification panel', path: '/components/notification-center', badge: 'New' },
    { title: 'Page Banner', description: 'Page-level message banners', path: '/components/page-banner' },
    { title: 'Menu Nav', description: 'Multi-level menu navigation', path: '/components/menu-nav', badge: 'New' },
    { title: 'Lightbox', description: 'Hover/click preview with zoom-out', path: '/components/lightbox', badge: 'New' },
];

const HomePage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <section className="scroll-mt-8" id="hero">
                <div className="py-8 md:py-16 max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <img src="/logo.svg" alt="Fluxo UI" className="w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg shrink-0" />
                        <div>
                            <h1
                                className={cn('text-2xl md:text-4xl font-bold tracking-tight', {
                                    'text-white': isDark,
                                    'text-gray-900': !isDark,
                                })}
                            >
                                Fluxo UI
                            </h1>
                            <p className={cn('text-sm', { 'text-gray-500': true })}>React Component Library</p>
                        </div>
                    </div>
                    <p className={cn('text-base md:text-lg leading-relaxed mb-8', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                        A comprehensive, accessible React component library built with TypeScript. Includes 60+ components, a custom state
                        management solution, 12 color themes, dark mode support, and full keyboard navigation. Hover over any component card
                        below for a quick interactive preview.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/installation"
                            className="px-6 py-2.5 bg-[var(--eui-primary)] hover:opacity-90 text-white font-semibold rounded-lg transition-all text-sm"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/components/button"
                            className={cn('px-6 py-2.5 border font-semibold rounded-lg transition-all text-sm', {
                                'border-white/15 hover:border-white/30 text-gray-300': isDark,
                                'border-gray-300 hover:border-gray-400 text-gray-700': !isDark,
                            })}
                        >
                            Browse Components
                        </Link>
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="highlights">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-8">
                    {[
                        { icon: '60+', label: 'Components', desc: 'Production-ready UI components' },
                        { icon: 'TS', label: 'TypeScript', desc: 'Full type safety and IntelliSense' },
                        { icon: 'A11Y', label: 'Accessible', desc: 'WAI-ARIA compliant components' },
                        { icon: '12', label: 'Themes', desc: 'Color themes with dark mode' },
                    ].map(({ icon, label, desc }) => (
                        <div
                            key={label}
                            className={cn('p-5 rounded-xl border text-center', {
                                'bg-white/3 border-white/8': isDark,
                                'bg-white border-gray-200 shadow-sm': !isDark,
                            })}
                        >
                            <div className="text-2xl font-bold text-[var(--eui-primary)] mb-1">{icon}</div>
                            <div className={cn('text-sm font-semibold mb-1', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                                {label}
                            </div>
                            <div className={cn('text-xs', { 'text-gray-500': true })}>{desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="scroll-mt-8" id="components">
                <div className="py-8">
                    <h2 className={cn('text-2xl font-bold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>All Components</h2>
                    <p className={cn('text-sm mb-8', { 'text-gray-500': true })}>
                        Hover over any component to see a live interactive preview. Click to view full documentation.
                    </p>

                    <CategorySection title="Form Inputs" icon="&#9998;" items={formInputs.map((i) => ({ ...i, isDark }))} isDark={isDark} />
                    <CategorySection
                        title="Selection"
                        icon="&#9745;"
                        items={selectionComponents.map((i) => ({ ...i, isDark }))}
                        isDark={isDark}
                    />
                    <CategorySection
                        title="Data Display"
                        icon="&#9638;"
                        items={dataDisplayComponents.map((i) => ({ ...i, isDark }))}
                        isDark={isDark}
                    />
                    <CategorySection
                        title="Interactive"
                        icon="&#9757;"
                        items={interactiveComponents.map((i) => ({ ...i, isDark }))}
                        isDark={isDark}
                    />
                    <CategorySection
                        title="Overlays & Navigation"
                        icon="&#9671;"
                        items={overlayComponents.map((i) => ({ ...i, isDark }))}
                        isDark={isDark}
                    />
                </div>
            </section>

            <section className="scroll-mt-8" id="hooks">
                <div className="py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <h2 className={cn('text-xl md:text-2xl font-bold', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Hooks & Utilities
                        </h2>
                        <Link to="/hooks-utils" className="text-sm font-medium text-[var(--eui-primary)] hover:underline">
                            View all with examples →
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { title: 'useDebounce', desc: 'Debounce value changes with configurable delay' },
                            { title: 'useMobile', desc: 'Detect mobile viewport with auto-resize' },
                            { title: 'useClickOutside', desc: 'Detect clicks outside a referenced element' },
                            { title: 'useKeyboard', desc: 'Register global keyboard event handlers' },
                            { title: 'withFieldLabel', desc: 'HOC to add label, error, hint to any input' },
                            { title: 'showSnackbar', desc: 'Trigger toast notifications imperatively' },
                            { title: 'showTooltip', desc: 'Show tooltips programmatically' },
                            { title: 'showContextMenu', desc: 'Open context menus on right-click' },
                        ].map(({ title, desc }) => (
                            <Link
                                key={title}
                                to="/hooks-utils"
                                className={cn('p-4 rounded-lg border transition-all duration-200 block', {
                                    'bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/6': isDark,
                                    'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md': !isDark,
                                })}
                            >
                                <code className="text-sm font-mono text-[var(--eui-primary)] font-semibold">{title}</code>
                                <p className={cn('text-xs mt-1', { 'text-gray-500': true })}>{desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="store">
                <div className="py-8">
                    <h2 className={cn('text-2xl font-bold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        State Management
                    </h2>
                    <p className={cn('text-sm mb-6', { 'text-gray-500': true })}>
                        A lightweight, TypeScript-first state management solution with batched updates, computed properties, and middleware
                        support.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <Link
                            to="/store/basic"
                            className={cn('p-5 rounded-lg border transition-all', {
                                'bg-white/3 border-white/8 hover:border-white/20': isDark,
                                'bg-white border-gray-200 hover:shadow-md': !isDark,
                            })}
                        >
                            <h4 className={cn('text-sm font-semibold mb-1', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                                Basic Store
                            </h4>
                            <p className={cn('text-xs', { 'text-gray-500': true })}>
                                Simple state container with batched updates, computed properties, and path subscriptions
                            </p>
                        </Link>
                        <Link
                            to="/store/middleware"
                            className={cn('p-5 rounded-lg border transition-all', {
                                'bg-white/3 border-white/8 hover:border-white/20': isDark,
                                'bg-white border-gray-200 hover:shadow-md': !isDark,
                            })}
                        >
                            <h4 className={cn('text-sm font-semibold mb-1', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                                Middleware
                            </h4>
                            <p className={cn('text-xs', { 'text-gray-500': true })}>
                                Undo/redo, persistence, validation, throttle, debounce, broadcast, and logging
                            </p>
                        </Link>
                        <Link
                            to="/store/model"
                            className={cn('p-5 rounded-lg border transition-all', {
                                'bg-white/3 border-white/8 hover:border-white/20': isDark,
                                'bg-white border-gray-200 hover:shadow-md': !isDark,
                            })}
                        >
                            <h4 className={cn('text-sm font-semibold mb-1', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                                Model Store
                            </h4>
                            <p className={cn('text-xs', { 'text-gray-500': true })}>
                                Entity-based store with CRUD, persistence, validation, and list management
                            </p>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="services">
                <div className="py-8">
                    <h2 className={cn('text-2xl font-bold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        Dependency Injection
                    </h2>
                    <p className={cn('text-sm mb-6', { 'text-gray-500': true })}>
                        A class and factory based DI container with singleton, scoped, and transient lifetimes, parameterized factories,
                        circular dependency detection, and React integration.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3">
                        {[
                            {
                                title: 'Class & Factory Registration',
                                desc: 'Register service classes with static dependency arrays or plain factory functions. Chainable API with interface support.',
                            },
                            {
                                title: 'Lifetime Management',
                                desc: 'Singleton, scoped, and transient lifetimes. Parameterized factories for user-scoped services.',
                            },
                            {
                                title: 'React Integration',
                                desc: 'ServiceProvider with default params, ServiceScope, useService hook, useContainer, and withServices HOC.',
                            },
                        ].map(({ title, desc }) => (
                            <Link
                                key={title}
                                to="/services/dependency-injection"
                                className={cn('p-5 rounded-lg border transition-all', {
                                    'bg-white/3 border-white/8 hover:border-white/20': isDark,
                                    'bg-white border-gray-200 hover:shadow-md': !isDark,
                                })}
                            >
                                <h4 className={cn('text-sm font-semibold mb-1', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                                    {title}
                                </h4>
                                <p className={cn('text-xs', { 'text-gray-500': true })}>{desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="quick-start">
                <div className="py-8">
                    <h2 className={cn('text-2xl font-bold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Quick Start</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div
                            className={cn('rounded-lg p-5 border', {
                                'bg-white/4 border-white/8': isDark,
                                'bg-white border-gray-200 shadow-sm': !isDark,
                            })}
                        >
                            <div
                                className={cn('text-xs font-semibold uppercase tracking-wide mb-3', {
                                    'text-gray-500': isDark,
                                    'text-gray-400': !isDark,
                                })}
                            >
                                1. Install
                            </div>
                            <code className="text-[var(--eui-primary)] font-mono text-sm">npm install fluxo-ui</code>
                        </div>
                        <div
                            className={cn('rounded-lg p-5 border', {
                                'bg-white/4 border-white/8': isDark,
                                'bg-white border-gray-200 shadow-sm': !isDark,
                            })}
                        >
                            <div
                                className={cn('text-xs font-semibold uppercase tracking-wide mb-3', {
                                    'text-gray-500': isDark,
                                    'text-gray-400': !isDark,
                                })}
                            >
                                2. Import & Use
                            </div>
                            <pre className={cn('font-mono text-xs overflow-x-auto', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                                {`import { Button } from 'fluxo-ui';

<Button label="Click me" />`}
                            </pre>
                        </div>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
};

export default HomePage;
