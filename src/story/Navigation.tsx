import cn from 'classnames';
import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrightSunIcon, ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon, NightLightIcon, SearchIcon } from '../assets/icons';
import { ColorTheme, colorThemes, useStoryTheme } from './StoryThemeContext';

interface NavItem {
    label: string;
    path: string;
}

interface NavSection {
    title: string;
    key: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: 'Getting Started',
        key: 'getting-started',
        items: [
            { label: 'Highlights', path: '/' },
            { label: 'Overview', path: '/overview' },
            { label: 'Installation', path: '/installation' },
            { label: 'AI / MCP Integration', path: '/mcp-integration' },
        ],
    },
    {
        title: 'Form Inputs',
        key: 'form-inputs',
        items: [
            { label: 'Text Input', path: '/components/textinput' },
            { label: 'Numeric Input', path: '/components/numericinput' },
            { label: 'Masked Input', path: '/components/maskedinput' },
            { label: 'Password', path: '/components/password' },
            { label: 'Password Strength', path: '/components/password-strength' },
            { label: 'Password Requirements', path: '/components/password-requirements' },
            { label: 'Textarea', path: '/components/textarea' },
            { label: 'Field Label', path: '/components/fieldlabel' },
            { label: 'Input Group', path: '/components/inputgroup' },
            { label: 'Slider', path: '/components/slider' },
            { label: 'Rating', path: '/components/rating' },
            { label: 'Signature Pad', path: '/components/signature-pad' },
            { label: 'Week Day Selector', path: '/components/week-day-selector' },
        ],
    },
    {
        title: 'Selection',
        key: 'selection',
        items: [
            { label: 'Checkbox', path: '/components/checkbox' },
            { label: 'MultiState Checkbox', path: '/components/multistatecheckbox' },
            { label: 'Radio Button', path: '/components/radiobutton' },
            { label: 'Input Switch', path: '/components/inputswitch' },
            { label: 'Select Button', path: '/components/selectbutton' },
            { label: 'Toggle Button', path: '/components/togglebutton' },
            { label: 'Dropdown', path: '/components/dropdown' },
            { label: 'Multiselect', path: '/components/multiselect' },
            { label: 'Autocomplete', path: '/components/autocomplete' },
            { label: 'AutocompleteMulti', path: '/components/autocomplete-multi' },
            { label: 'List Box', path: '/components/listbox' },
            { label: 'Chips', path: '/components/chips' },
        ],
    },
    {
        title: 'Date, Time & Color',
        key: 'pickers',
        items: [
            { label: 'Date Range Picker', path: '/components/daterangepicker' },
            { label: 'Time Picker', path: '/components/time-picker' },
            { label: 'Color Picker', path: '/components/color-picker' },
            { label: 'Calendar', path: '/components/calendar' },
        ],
    },
    {
        title: 'Data & Reports',
        key: 'data-reports',
        items: [
            { label: 'Table', path: '/components/table' },
            { label: 'Pivot Table', path: '/components/pivot-table' },
            { label: 'TreeView', path: '/components/tree-view' },
        ],
    },
    {
        title: 'Report Builder',
        key: 'report-builder',
        items: [
            { label: 'Overview', path: '/components/report-builder-examples/overview' },
            { label: 'Report Builder', path: '/components/report-builder' },
            { label: 'Report Viewer', path: '/components/report-viewer' },
            { label: 'Combined Examples', path: '/components/report-builder-examples' },
            { label: 'Tables', path: '/components/report-builder-examples/tables' },
            { label: 'Charts', path: '/components/report-builder-examples/charts' },
            { label: 'Mixed Charts', path: '/components/report-builder-examples/mixed-charts' },
            { label: 'Sub-reports', path: '/components/report-builder-examples/sub-reports' },
            { label: 'Parameters', path: '/components/report-builder-examples/parameters' },
            { label: 'Variables & Visibility', path: '/components/report-builder-examples/variables' },
            { label: 'Expressions', path: '/components/report-builder-examples/expressions' },
            { label: 'Repeater', path: '/components/report-builder-examples/repeater' },
        ],
    },
    {
        title: 'Editors',
        key: 'editors',
        items: [
            { label: 'Markdown Editor', path: '/components/markdown' },
            { label: 'HTML Editor', path: '/components/html-editor' },
            { label: 'JSON Editor', path: '/components/json-editor' },
            { label: 'Diff Viewer', path: '/components/diff-viewer' },
        ],
    },
    {
        title: 'Charts & Boards',
        key: 'charts-boards',
        items: [
            { label: 'Gantt Chart', path: '/components/gantt-chart' },
            { label: 'Kanban Board', path: '/components/kanban-board' },
            { label: 'Timeline', path: '/components/timeline' },
            { label: 'Progress Bar', path: '/components/progress-bar' },
            { label: 'Countdown Timer', path: '/components/countdown-timer' },
            { label: 'Knob', path: '/components/knob' },
            { label: 'Activity Gauge', path: '/components/activity-gauge' },
        ],
    },
    {
        title: 'Codes',
        key: 'codes',
        items: [
            { label: 'QR Code', path: '/components/qr-code' },
            { label: 'QR Scanner', path: '/components/qr-scanner' },
            { label: 'Barcode', path: '/components/barcode' },
        ],
    },
    {
        title: 'Media',
        key: 'media',
        items: [
            { label: 'Avatar', path: '/components/avatar' },
            { label: 'Carousel', path: '/components/carousel' },
            { label: 'Lightbox', path: '/components/lightbox' },
            { label: 'Image Editor', path: '/components/image-editor' },
            { label: 'Canvas Draw', path: '/components/canvas-draw' },
            { label: 'File Upload', path: '/components/file-upload' },
        ],
    },
    {
        title: 'Navigation',
        key: 'navigation',
        items: [
            { label: 'Tab View', path: '/components/tab-view' },
            { label: 'Stepper', path: '/components/stepper' },
            { label: 'Breadcrumb', path: '/components/breadcrumb' },
            { label: 'Menu Nav', path: '/components/menu-nav' },
            { label: 'Step Tour', path: '/components/tour' },
        ],
    },
    {
        title: 'Feedback',
        key: 'feedback',
        items: [
            { label: 'Snackbar', path: '/components/snackbar' },
            { label: 'Notification Center', path: '/components/notification-center' },
            { label: 'Page Banner', path: '/components/page-banner' },
            { label: 'Tooltip', path: '/components/tooltip' },
            { label: 'Shimmer', path: '/components/shimmer' },
            { label: 'Empty State', path: '/components/empty-state' },
        ],
    },
    {
        title: 'Overlays',
        key: 'overlays',
        items: [
            { label: 'Modal', path: '/components/modal' },
            { label: 'Drawer', path: '/components/drawer' },
            { label: 'Popover', path: '/components/popover' },
            { label: 'Confirm Popover', path: '/components/confirm-popover' },
            { label: 'Context Menu', path: '/components/context-menu' },
        ],
    },
    {
        title: 'Layout',
        key: 'layout',
        items: [
            { label: 'Splitter', path: '/components/splitter' },
            { label: 'Collapsible Panel', path: '/components/collapsible-panel' },
            { label: 'Accordion', path: '/components/accordion' },
            { label: 'Card', path: '/components/card' },
            { label: 'Docked Layout', path: '/components/docked-layout' },
        ],
    },
    {
        title: 'Actions & Interaction',
        key: 'interactive',
        items: [
            { label: 'Button', path: '/components/button' },
            { label: 'Split Button', path: '/components/split-button' },
            { label: 'Fab & Speed Dial', path: '/components/fab-speed-dial' },
            { label: 'Dock', path: '/components/dock' },
            { label: 'Command Palette', path: '/components/command-palette' },
            { label: 'Scroll To Top', path: '/components/scroll-to-top' },
            { label: 'Drag & Drop', path: '/components/drag-drop' },
            { label: 'Sortable', path: '/components/sortable' },
            { label: 'Deferred View', path: '/components/deferred-view' },
            { label: 'Infinite Scroll', path: '/components/infinite-scroll' },
            { label: 'Animate On View', path: '/components/animate-on-view' },
        ],
    },
    {
        title: 'State Management',
        key: 'state-management',
        items: [
            { label: 'Basic Store', path: '/store/basic' },
            { label: 'Slices', path: '/store/slice' },
            { label: 'Middleware', path: '/store/middleware' },
            { label: 'Model Store', path: '/store/model' },
        ],
    },
    {
        title: 'Services',
        key: 'services',
        items: [{ label: 'Dependency Injection', path: '/services/dependency-injection' }],
    },
    {
        title: 'Hooks & Utils',
        key: 'hooks-utils',
        items: [{ label: 'Hooks & Utilities', path: '/hooks-utils' }],
    },
    {
        title: 'Showcase',
        key: 'showcase',
        items: [
            { label: 'Component Demo', path: '/demo' },
            { label: 'Calendar Playground', path: '/components/calendar-playground' },
            { label: 'Pivot Table Playground', path: '/components/pivot-table-playground' },
        ],
    },
    {
        title: 'Design System',
        key: 'design-system',
        items: [{ label: 'Icons', path: '/icons' }],
    },
];

const themeColors: Record<ColorTheme, { dot: string; label: string }> = {
    blue: { dot: 'bg-blue-500', label: 'Blue' },
    lara: { dot: 'bg-cyan-500', label: 'Lara' },
    green: { dot: 'bg-green-500', label: 'Green' },
    purple: { dot: 'bg-purple-500', label: 'Purple' },
    orange: { dot: 'bg-orange-500', label: 'Orange' },
    indigo: { dot: 'bg-indigo-500', label: 'Indigo' },
    rose: { dot: 'bg-rose-500', label: 'Rose' },
    amber: { dot: 'bg-amber-500', label: 'Amber' },
    teal: { dot: 'bg-teal-500', label: 'Teal' },
    emerald: { dot: 'bg-emerald-500', label: 'Emerald' },
    fuchsia: { dot: 'bg-fuchsia-500', label: 'Fuchsia' },
    slate: { dot: 'bg-slate-500', label: 'Slate' },
};

interface NavigationProps {
    onNavClick?: () => void;
}

const normalizePath = (path: string): string => {
    if (!path) return '/';
    const trimmed = path.replace(/\/+$/, '');
    return trimmed === '' ? '/' : trimmed;
};

const findActiveSectionKey = (pathname: string): string | undefined => {
    const normalized = normalizePath(pathname);
    const active = navSections.find((s) => s.items.some((i) => normalizePath(i.path) === normalized));
    return active?.key;
};

const Navigation: React.FC<NavigationProps> = ({ onNavClick }) => {
    const location = useLocation();
    const { isDark, toggleTheme, colorTheme, setColorTheme } = useStoryTheme();
    const [search, setSearch] = useState('');
    const activeSectionKey = findActiveSectionKey(location.pathname);
    const [userExpandedSections, setUserExpandedSections] = useState<Set<string>>(() => new Set<string>(['getting-started']));
    const [collapsedOverrides, setCollapsedOverrides] = useState<Set<string>>(() => new Set<string>());

    const expandedSections = useMemo(() => {
        const combined = new Set(userExpandedSections);
        if (activeSectionKey && !collapsedOverrides.has(activeSectionKey)) {
            combined.add(activeSectionKey);
        }
        return combined;
    }, [userExpandedSections, collapsedOverrides, activeSectionKey]);

    const filteredSections = useMemo(() => {
        if (!search.trim()) return navSections;
        const q = search.toLowerCase();
        return navSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) => item.label.toLowerCase().includes(q)),
            }))
            .filter((section) => section.items.length > 0);
    }, [search]);

    const toggleSection = (key: string) => {
        const isCurrentlyExpanded = expandedSections.has(key);
        if (isCurrentlyExpanded) {
            setUserExpandedSections((prev) => {
                if (!prev.has(key)) return prev;
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
            if (key === activeSectionKey) {
                setCollapsedOverrides((prev) => {
                    if (prev.has(key)) return prev;
                    const next = new Set(prev);
                    next.add(key);
                    return next;
                });
            }
        } else {
            setUserExpandedSections((prev) => {
                if (prev.has(key)) return prev;
                const next = new Set(prev);
                next.add(key);
                return next;
            });
            if (key === activeSectionKey) {
                setCollapsedOverrides((prev) => {
                    if (!prev.has(key)) return prev;
                    const next = new Set(prev);
                    next.delete(key);
                    return next;
                });
            }
        }
    };

    return (
        <div
            className={cn('h-full flex flex-col transition-colors duration-200', {
                'bg-[#0d0f14] text-gray-100': isDark,
                'bg-white text-gray-900': !isDark,
            })}
        >
            <div
                className={cn('flex items-center justify-between px-5 py-4 border-b', {
                    'border-white/8': isDark,
                    'border-gray-200': !isDark,
                })}
            >
                <div className="flex items-center gap-2.5">
                    <img src="/logo.svg" alt="Fluxo UI" className="w-7 h-7 rounded-lg shadow-md" />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <div
                                className={cn('text-sm font-semibold tracking-tight leading-tight', {
                                    'text-white': isDark,
                                    'text-gray-900': !isDark,
                                })}
                            >
                                Fluxo UI
                            </div>
                            <span
                                title={`Version ${__FLUXO_UI_VERSION__}`}
                                className={cn(
                                    'inline-flex items-center px-1.5 py-px rounded-full text-[9px] font-semibold tracking-wide leading-none border',
                                    {
                                        'bg-white/10 text-gray-200 border-white/15': isDark,
                                        'bg-gray-900/5 text-gray-700 border-gray-900/10': !isDark,
                                    },
                                )}
                            >
                                v{__FLUXO_UI_VERSION__}
                            </span>
                        </div>
                        <div
                            className={cn('text-[10px] leading-tight mt-0.5', {
                                'text-gray-500': isDark,
                                'text-gray-400': !isDark,
                            })}
                        >
                            Component Library
                        </div>
                    </div>
                </div>

                <button
                    onClick={toggleTheme}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 shrink-0', {
                        'bg-white/6 hover:bg-white/12 text-gray-400 hover:text-amber-300': isDark,
                        'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-indigo-600': !isDark,
                    })}
                >
                    {isDark ? <BrightSunIcon className="w-4 h-4" /> : <NightLightIcon className="w-4 h-4" />}
                </button>
            </div>

            <div className="px-4 pt-3 pb-2">
                <div
                    className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm ring-1 transition-all duration-150', {
                        'bg-white/5 ring-white/8 focus-within:ring-indigo-500/50 focus-within:bg-white/8': isDark,
                        'bg-gray-50 ring-gray-200 focus-within:ring-indigo-400 focus-within:bg-white': !isDark,
                    })}
                >
                    <SearchIcon
                        className={cn('w-3.5 h-3.5 shrink-0', {
                            'text-gray-500': isDark,
                            'text-gray-400': !isDark,
                        })}
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={cn('flex-1 bg-transparent outline-none text-xs', {
                            'text-gray-200 placeholder:text-gray-600': isDark,
                            'text-gray-700 placeholder:text-gray-400': !isDark,
                        })}
                    />
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-3 eui-story-nav-scroll">
                {filteredSections.map((section) => {
                    const isExpanded = expandedSections.has(section.key) || !!search.trim();

                    return (
                        <div key={section.key} className="mb-2">
                            <button
                                onClick={() => toggleSection(section.key)}
                                className={cn(
                                    'flex items-center w-full px-2 py-1.5 rounded text-[10px] font-semibold uppercase tracking-widest transition-colors select-none gap-1',
                                    {
                                        'text-gray-600 hover:text-gray-400': isDark,
                                        'text-gray-400 hover:text-gray-600': !isDark,
                                    },
                                )}
                            >
                                <span className="flex-1 text-left">{section.title}</span>
                                {isExpanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
                            </button>

                            {isExpanded && (
                                <div className="mt-0.5 mb-3 space-y-0.5">
                                    {section.items.map((item) => {
                                        const isActive = normalizePath(location.pathname) === normalizePath(item.path);
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={onNavClick}
                                                className={cn(
                                                    'flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-md transition-all duration-100',
                                                    {
                                                        'bg-indigo-500/15 text-indigo-300 font-medium': isActive && isDark,
                                                        'bg-indigo-50 text-indigo-700 font-medium border border-indigo-100':
                                                            isActive && !isDark,
                                                        'text-gray-500 hover:text-gray-200 hover:bg-white/5': !isActive && isDark,
                                                        'text-gray-600 hover:text-gray-900 hover:bg-gray-100': !isActive && !isDark,
                                                    },
                                                )}
                                            >
                                                <span
                                                    className={cn('w-1 h-1 rounded-full flex-shrink-0 transition-opacity', {
                                                        'bg-indigo-400 opacity-100': isActive && isDark,
                                                        'bg-indigo-600 opacity-100': isActive && !isDark,
                                                        'bg-transparent opacity-0': !isActive,
                                                    })}
                                                />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div
                className={cn('px-4 py-3 border-t', {
                    'border-white/8': isDark,
                    'border-gray-200': !isDark,
                })}
            >
                <div
                    className={cn('text-[10px] font-semibold uppercase tracking-widest mb-2 px-1', {
                        'text-gray-600': isDark,
                        'text-gray-400': !isDark,
                    })}
                >
                    Theme
                </div>
                <div className="grid grid-cols-3 gap-1">
                    {colorThemes.map((t) => (
                        <button
                            key={t}
                            onClick={() => setColorTheme(t)}
                            aria-label={`${themeColors[t].label} theme`}
                            title={themeColors[t].label}
                            className={cn('flex items-center gap-1 px-1.5 py-1 rounded text-[10px] transition-all duration-150 border', {
                                'border-white/20 bg-white/10 font-semibold': colorTheme === t && isDark,
                                'border-gray-300 bg-gray-100 font-semibold text-gray-800': colorTheme === t && !isDark,
                                'border-transparent hover:bg-white/6 text-gray-500 hover:text-gray-300': colorTheme !== t && isDark,
                                'border-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600': colorTheme !== t && !isDark,
                            })}
                        >
                            <span className={cn('w-2 h-2 rounded-full shrink-0', themeColors[t].dot)} />
                            <span className="truncate">{themeColors[t].label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div
                className={cn('px-5 py-2.5 border-t', {
                    'border-white/8': isDark,
                    'border-gray-200': !isDark,
                })}
            >
                <a
                    href="https://utilsware.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn('flex items-center gap-1.5 text-[10px] font-medium transition-colors', {
                        'text-gray-500 hover:text-indigo-400': isDark,
                        'text-gray-400 hover:text-indigo-600': !isDark,
                    })}
                >
                    <span>A product by</span>
                    <span
                        className={cn('font-semibold', {
                            'text-gray-300': isDark,
                            'text-gray-600': !isDark,
                        })}
                    >
                        Utilsware
                    </span>
                    <ExternalLinkIcon className="w-2.5 h-2.5" />
                </a>
            </div>
        </div>
    );
};

export default Navigation;
