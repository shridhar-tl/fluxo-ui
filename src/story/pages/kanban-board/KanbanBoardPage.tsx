import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import BlockedCards from './BlockedCards';
import CardActions from './CardActions';
import CollapsibleColumns from './CollapsibleColumns';
import ColumnLimits from './ColumnLimits';
import CompactMode from './CompactMode';
import CustomColumnHeader from './CustomColumnHeader';
import CustomTemplates from './CustomTemplates';
import DetailedCards from './DetailedCards';
import InteractiveBoard from './InteractiveBoard';
import LockedColumns from './LockedColumns';
import StickyHeaders from './StickyHeaders';
import VerticalLayout from './VerticalLayout';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Introduction and feature highlights' },
    { id: 'basic-usage', title: 'Basic Usage', description: 'Standard board with drag-and-drop' },
    { id: 'detailed-cards', title: 'Detailed Cards', description: 'Rich card content with descriptions' },
    { id: 'compact-mode', title: 'Compact Mode', description: 'High-density minimal cards' },
    { id: 'column-limits', title: 'WIP Limits', description: 'Work-in-progress constraints' },
    { id: 'collapsible-columns', title: 'Collapsible Columns', description: 'Collapse columns with rotated titles' },
    { id: 'blocked-cards', title: 'Blocked Cards', description: 'Visual blocked state on cards' },
    { id: 'locked-columns', title: 'Locked Columns', description: 'Read-only archival columns' },
    { id: 'vertical-layout', title: 'Vertical Layout', description: 'Columns stacked vertically' },
    { id: 'sticky-headers', title: 'Sticky Headers', description: 'Fixed headers with scrollable body' },
    { id: 'custom-card-template', title: 'Custom Card Template', description: 'Fully custom card rendering' },
    { id: 'custom-column-header', title: 'Custom Column Header', description: 'Custom header & empty state' },
    { id: 'card-actions', title: 'Card Actions', description: 'Custom action buttons on cards' },
    { id: 'interactive', title: 'Interactive Board', description: 'Full CRUD demo' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'board-props', title: 'Board Props', description: 'KanbanBoard API reference' },
    { id: 'card-props', title: 'Card Properties', description: 'KanbanCardData reference' },
    { id: 'column-props', title: 'Column Properties', description: 'KanbanColumnData reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Drag & Drop',
        description: 'Reorder cards within columns and drag cards between columns with smooth animations.',
        icon: 'M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5',
    },
    {
        title: 'Column WIP Limits',
        description: 'Set work-in-progress limits per column with visual warnings when exceeded.',
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    },
    {
        title: 'Priority & Labels',
        description: 'Visual priority indicators and customizable color-coded labels on cards.',
        icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z',
    },
    {
        title: 'Assignee Avatars',
        description: 'Show assignees with avatar images or auto-generated initials with overlap stacking.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
    {
        title: 'Collapsible Columns',
        description: 'Collapse columns to save space with smooth transitions and vertical title display.',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Search & Filter',
        description: 'Built-in search bar to filter cards across all columns by title or description.',
        icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
    },
    {
        title: 'Blocked Cards',
        description: 'Visually mark cards as blocked with a distinct overlay and optional color border.',
        icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    },
    {
        title: 'Locked Columns',
        description: 'Lock columns to prevent drag-and-drop, editing, and adding cards.',
        icon: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
    },
    {
        title: 'Custom Templates',
        description: 'Full control over card, header, footer, empty state, and action rendering.',
        icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
    },
    {
        title: 'Multiple Layouts',
        description: 'Horizontal (default) and vertical board layouts for different use cases.',
        icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    },
    {
        title: 'Card Sizes',
        description: 'Three built-in card sizes: compact, default, and detailed.',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
    },
    {
        title: 'Accessibility',
        description: 'ARIA labels, keyboard navigation, focus-visible outlines, and semantic HTML.',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
];

const boardProps = {
    columns: {
        type: 'KanbanColumnData[]',
        required: true,
        description: 'Array of column definitions with id, title, color, icon, limit, collapsed, locked.',
    },
    cards: {
        type: 'KanbanCardData[]',
        required: true,
        description: 'Array of card data with id, title, columnId, order, priority, labels, assignees, etc.',
    },
    layout: { type: '"horizontal" | "vertical"', default: 'horizontal', description: 'Board layout direction.' },
    cardSize: {
        type: '"compact" | "default" | "detailed"',
        default: 'default',
        description: 'Card display density. Compact hides labels/progress, detailed shows descriptions.',
    },
    className: { type: 'string', description: 'Additional CSS class for the board container.' },
    columnWidth: { type: 'number | string', description: 'Fixed column width (px or CSS value).' },
    columnMinHeight: { type: 'number | string', description: 'Minimum column body height.' },
    maxColumnHeight: { type: 'number | string', description: 'Maximum column body scroll height.' },
    draggable: { type: 'boolean', default: true, description: 'Enable drag-and-drop for cards.' },
    columnDraggable: { type: 'boolean', default: false, description: 'Enable drag-and-drop reordering of columns.' },
    allowAddCard: { type: 'boolean', default: false, description: 'Show "Add card" button in each column footer.' },
    allowAddColumn: { type: 'boolean', default: false, description: 'Show "Add Column" button at the end.' },
    allowDeleteCard: { type: 'boolean', default: false, description: 'Show delete button on card hover.' },
    allowDeleteColumn: { type: 'boolean', default: false, description: 'Show delete button in column headers.' },
    allowEditColumn: { type: 'boolean', default: false, description: 'Enable double-click to edit column title.' },
    allowCollapse: { type: 'boolean', default: false, description: 'Show collapse/expand toggle in column headers.' },
    showCardCount: { type: 'boolean', default: false, description: 'Display card count badge in column headers.' },
    showColumnLimit: { type: 'boolean', default: false, description: 'Display WIP limit alongside card count.' },
    showSearch: { type: 'boolean', default: false, description: 'Show search input above the board.' },
    stickyColumnHeaders: { type: 'boolean', default: false, description: 'Make column headers sticky on scroll.' },
    cardTemplate: { type: '(card, column) => ReactNode', description: 'Custom render function for card content.' },
    columnHeaderTemplate: { type: '(column, count) => ReactNode', description: 'Custom render function for column headers.' },
    columnFooterTemplate: { type: '(column, cards) => ReactNode', description: 'Custom render function for column footers.' },
    emptyColumnTemplate: { type: '(column) => ReactNode', description: 'Custom render function for empty columns.' },
    cardActionsTemplate: { type: '(card, column) => ReactNode', description: 'Custom actions rendered in card footer area.' },
    onCardMove: { type: '(event: KanbanCardMoveEvent) => void', description: 'Called when a card is moved between columns.' },
    onCardReorder: { type: '(event: KanbanCardReorderEvent) => void', description: 'Called when cards are reordered within a column.' },
    onCardClick: { type: '(event: KanbanCardClickEvent) => void', description: 'Called when a card is clicked.' },
    onCardDoubleClick: { type: '(event: KanbanCardClickEvent) => void', description: 'Called when a card is double-clicked.' },
    onCardCreate: { type: '(event: KanbanCardCreateEvent) => void', description: 'Called when a new card is created via the add button.' },
    onCardDelete: { type: '(event: KanbanCardDeleteEvent) => void', description: 'Called when a card delete button is clicked.' },
    onColumnReorder: { type: '(event: KanbanColumnReorderEvent) => void', description: 'Called when columns are reordered via drag.' },
    onColumnCreate: { type: '(event: KanbanColumnCreateEvent) => void', description: 'Called when a new column is created.' },
    onColumnDelete: { type: '(event: KanbanColumnDeleteEvent) => void', description: 'Called when a column is deleted.' },
    onColumnUpdate: { type: '(event: KanbanColumnUpdateEvent) => void', description: 'Called when a column title is edited.' },
    onColumnCollapse: { type: '(columnId, collapsed) => void', description: 'Called when a column is collapsed or expanded.' },
    onSearchChange: { type: '(filter: KanbanSearchFilter) => void', description: 'Called when the search input changes.' },
};

const cardProps = {
    id: { type: 'string | number', required: true, description: 'Unique identifier for the card.' },
    title: { type: 'string', required: true, description: 'Card title displayed prominently.' },
    columnId: { type: 'string | number', required: true, description: 'ID of the column this card belongs to.' },
    order: { type: 'number', required: true, description: 'Sort position within the column.' },
    description: { type: 'string', description: 'Card description shown in detailed view.' },
    priority: { type: '"critical" | "high" | "medium" | "low" | "none"', description: 'Priority level with visual indicator.' },
    labels: { type: 'KanbanLabel[]', description: 'Color-coded labels shown on the card.' },
    assignee: { type: 'KanbanAssignee', description: 'Single assignee with name and optional avatar.' },
    assignees: { type: 'KanbanAssignee[]', description: 'Multiple assignees with stacked display.' },
    dueDate: { type: 'Date | string', description: 'Due date with overdue/soon indicators.' },
    coverImage: { type: 'string', description: 'Cover image URL shown in detailed mode.' },
    progress: { type: 'number', description: 'Completion percentage (0-100) shown as a progress bar.' },
    subtaskCount: { type: 'number', description: 'Total number of subtasks.' },
    subtaskCompleted: { type: 'number', description: 'Number of completed subtasks.' },
    commentCount: { type: 'number', description: 'Number of comments shown as a badge.' },
    attachmentCount: { type: 'number', description: 'Number of attachments shown as a badge.' },
    blocked: { type: 'boolean', default: false, description: 'Mark the card as blocked with a visual overlay.' },
    color: { type: 'string', description: 'Left border color for the card.' },
};

const columnProps = {
    id: { type: 'string | number', required: true, description: 'Unique identifier for the column.' },
    title: { type: 'string', required: true, description: 'Column header title.' },
    color: { type: 'string', description: 'Accent color for the column header indicator.' },
    icon: { type: 'ReactNode', description: 'Icon displayed next to the column title.' },
    limit: { type: 'number', description: 'Maximum number of cards (WIP limit). Visual warning when exceeded.' },
    collapsed: { type: 'boolean', default: false, description: 'Initial collapsed state of the column.' },
    locked: { type: 'boolean', default: false, description: 'Prevent all interactions (drag, edit, add, delete).' },
};

const KanbanBoardPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <div className="mb-2">
                    <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        Kanban Board
                    </h1>
                    <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                        A fully-featured Kanban board component with drag-and-drop, customizable cards, column WIP limits, priority
                        indicators, assignee avatars, collapsible columns, and search filtering.
                    </p>
                </div>
            </div>

            <section className="scroll-mt-8" id="basic-usage">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    A standard Kanban board with drag-and-drop, card counts, search filtering, and collapsible columns.
                </p>
                <BasicUsage />
            </section>

            <section className="scroll-mt-8" id="detailed-cards">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Detailed Card View
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>cardSize="detailed"</code> to show descriptions, progress bars, subtask counts, and stacked assignee avatars.
                </p>
                <DetailedCards />
            </section>

            <section className="scroll-mt-8" id="compact-mode">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Compact Mode</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>cardSize="compact"</code> for a minimal card display ideal for high-density boards.
                </p>
                <CompactMode />
            </section>

            <section className="scroll-mt-8" id="column-limits">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>WIP Limits</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Set a <code>limit</code> on columns to enforce work-in-progress constraints. Columns that exceed their limit display a
                    visual warning indicator.
                </p>
                <ColumnLimits />
            </section>

            <section className="scroll-mt-8" id="collapsible-columns">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Collapsible Columns
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Enable <code>allowCollapse</code> to add collapse/expand toggles in column headers. Collapsed columns shrink to a narrow
                    strip with a vertically rotated title. Set <code>collapsed: true</code> on a column for an initially collapsed state.
                    Click a collapsed column to expand it.
                </p>
                <CollapsibleColumns />
            </section>

            <section className="scroll-mt-8" id="blocked-cards">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Blocked Cards</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Set <code>blocked: true</code> on a card to visually indicate it is blocked. Combine with <code>color</code> for a
                    colored left border.
                </p>
                <BlockedCards />
            </section>

            <section className="scroll-mt-8" id="locked-columns">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Locked Columns</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Set <code>locked: true</code> on a column to prevent all interactions including drag-and-drop, editing, and adding
                    cards.
                </p>
                <LockedColumns />
            </section>

            <section className="scroll-mt-8" id="vertical-layout">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Vertical Layout
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>layout="vertical"</code> to stack columns vertically instead of horizontally. Useful for priority triage
                    boards or narrow containers.
                </p>
                <VerticalLayout />
            </section>

            <section className="scroll-mt-8" id="sticky-headers">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Sticky Column Headers
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Enable <code>stickyColumnHeaders</code> with <code>maxColumnHeight</code> to keep headers visible while scrolling
                    through cards.
                </p>
                <StickyHeaders />
            </section>

            <section className="scroll-mt-8" id="custom-card-template">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Custom Card Template
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>cardTemplate</code> to render fully custom card content with any layout.
                </p>
                <CustomTemplates />
            </section>

            <section className="scroll-mt-8" id="custom-column-header">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Custom Column Header &amp; Empty State
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>columnHeaderTemplate</code> and <code>emptyColumnTemplate</code> for full control over column rendering.
                </p>
                <CustomColumnHeader />
            </section>

            <section className="scroll-mt-8" id="card-actions">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Custom Card Actions
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>cardActionsTemplate</code> to add custom action buttons in the card footer area.
                </p>
                <CardActions />
            </section>

            <section className="scroll-mt-8" id="interactive">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Interactive Board
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Full interactive demo with all CRUD operations: drag cards between columns, add/delete cards and columns, edit column
                    titles, and reorder columns.
                </p>
                <InteractiveBoard />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { KanbanBoard } from 'fluxo-ui';

// Type imports
import type {
  KanbanBoardProps,
  KanbanCardData,
  KanbanCardId,
  KanbanColumnData,
  KanbanColumnId,
  KanbanCardMoveEvent,
  KanbanCardReorderEvent,
  KanbanCardClickEvent,
  KanbanCardCreateEvent,
  KanbanCardDeleteEvent,
  KanbanColumnCreateEvent,
  KanbanColumnDeleteEvent,
  KanbanColumnUpdateEvent,
  KanbanColumnReorderEvent,
  KanbanSearchFilter,
  KanbanLabel,
  KanbanAssignee,
  KanbanPriority,
  KanbanLayout,
  KanbanCardSize,
} from 'fluxo-ui';`}
                />
            </section>

            <section className="scroll-mt-8" id="board-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    KanbanBoard Props
                </h2>
                <PropsTable props={boardProps} />
            </section>

            <section className="scroll-mt-8" id="card-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    KanbanCardData Properties
                </h2>
                <PropsTable props={cardProps} />
            </section>

            <section className="scroll-mt-8" id="column-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    KanbanColumnData Properties
                </h2>
                <PropsTable props={columnProps} />
            </section>

            <section className="scroll-mt-8" id="features">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default KanbanBoardPage;
