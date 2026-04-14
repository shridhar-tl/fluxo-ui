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
            { label: 'Overview', path: '/' },
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
            { label: 'Textarea', path: '/components/textarea' },
            { label: 'Field Label', path: '/components/fieldlabel' },
            { label: 'Input Group', path: '/components/inputgroup' },
            { label: 'Slider', path: '/components/slider' },
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
            { label: 'Date Range Picker', path: '/components/daterangepicker' },
        ],
    },
    {
        title: 'Data Display',
        key: 'data-display',
        items: [
            { label: 'Table', path: '/components/table' },
            { label: 'Gantt Chart', path: '/components/gantt-chart' },
            { label: 'Kanban Board', path: '/components/kanban-board' },
            { label: 'Calendar', path: '/components/calendar' },
            { label: 'Canvas Draw', path: '/components/canvas-draw' },
            { label: 'JSON Editor', path: '/components/json-editor' },
            { label: 'Tab View', path: '/components/tab-view' },
            { label: 'Progress Bar', path: '/components/progress-bar' },
            { label: 'Stepper', path: '/components/stepper' },
            { label: 'Shimmer', path: '/components/shimmer' },
            { label: 'TreeView', path: '/components/tree-view' },
            { label: 'Timeline', path: '/components/timeline' },
            { label: 'Carousel', path: '/components/carousel' },
            { label: 'Image Editor', path: '/components/image-editor' },
            { label: 'Pivot Table', path: '/components/pivot-table' },
        ],
    },
    {
        title: 'Interactive',
        key: 'interactive',
        items: [
            { label: 'Button', path: '/components/button' },
            { label: 'Fab & Speed Dial', path: '/components/fab-speed-dial' },
            { label: 'Drag & Drop', path: '/components/drag-drop' },
            { label: 'Sortable', path: '/components/sortable' },
            { label: 'Splitter', path: '/components/splitter' },
            { label: 'Step Tour', path: '/components/tour' },
            { label: 'Deferred View', path: '/components/deferred-view' },
            { label: 'Infinite Scroll', path: '/components/infinite-scroll' },
            { label: 'File Upload', path: '/components/file-upload' },
            { label: 'Animate On View', path: '/components/animate-on-view' },
            { label: 'Collapsible Panel', path: '/components/collapsible-panel' },
        ],
    },
    {
        title: 'Overlays',
        key: 'overlays',
        items: [
            { label: 'Modal', path: '/components/modal' },
            { label: 'Tooltip', path: '/components/tooltip' },
            { label: 'Snackbar', path: '/components/snackbar' },
            { label: 'Popover', path: '/components/popover' },
            { label: 'Confirm Popover', path: '/components/confirm-popover' },
            { label: 'Context Menu', path: '/components/context-menu' },
            { label: 'Drawer', path: '/components/drawer' },
            { label: 'Breadcrumb', path: '/components/breadcrumb' },
            { label: 'Notification Center', path: '/components/notification-center' },
            { label: 'Page Banner', path: '/components/page-banner' },
            { label: 'Menu Nav', path: '/components/menu-nav' },
            { label: 'Lightbox', path: '/components/lightbox' },
        ],
    },
    {
        title: 'State Management',
        key: 'state-management',
        items: [
            { label: 'Basic Store', path: '/store/basic' },
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

const Navigation: React.FC<NavigationProps> = ({ onNavClick }) => {
    const location = useLocation();
    const { isDark, toggleTheme, colorTheme, setColorTheme } = useStoryTheme();
    const [search, setSearch] = useState('');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set([
            'getting-started',
            'form-inputs',
            'selection',
            'data-display',
            'interactive',
            'overlays',
            'state-management',
            'services',
            'hooks-utils',
            'design-system',
        ]),
    );

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
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
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
                                        const isActive = location.pathname === item.path;
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
