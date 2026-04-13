# Fluxo UI

A comprehensive, accessible React component library built with TypeScript. Includes **60+ production-ready UI components**, a custom state management solution, a dependency injection container, 12 color themes, dark mode, and full keyboard navigation.

- **Website & Live Demos:** [fluxo-ui.utilsware.com](https://fluxo-ui.utilsware.com/)
- **Repository:** [github.com/shridhar-tl/fluxo-ui](https://github.com/shridhar-tl/fluxo-ui)

## Highlights

- 60+ accessible, production-ready components
- Full TypeScript support with first-class types
- 12 built-in color themes + dark mode out of the box
- Custom state management (batched updates, computed properties, middleware)
- Dependency injection container with singleton, scoped & transient lifetimes
- WAI-ARIA compliant, keyboard navigable
- Tree-shakable with multiple entry points (`fluxo-ui/hooks`, `fluxo-ui/store`, `fluxo-ui/icons`, ...)

## Prerequisites

- **React** `>= 18.0.0`
- **react-dom** `>= 18.0.0`

Optional peer dependencies (only needed if you use the related components):

- `react-dnd` and `react-dnd-html5-backend` — for drag-and-drop components
- `html2canvas` — for image/canvas export features

## Installation

Using **npm**:

```bash
npm install fluxo-ui
```

Using **yarn**:

```bash
yarn add fluxo-ui
```

Using **pnpm**:

```bash
pnpm add fluxo-ui
```

Using **bun**:

```bash
bun add fluxo-ui
```

## Usage

Import the stylesheet once in your application entry file, then use components anywhere:

```tsx
import 'fluxo-ui/styles';
import { Button, TextInput } from 'fluxo-ui';

export default function App() {
    return (
        <div>
            <TextInput placeholder="Enter your name" />
            <Button label="Submit" />
        </div>
    );
}
```

### Using a theme

Apply a theme and dark mode by adding classes to the `body` element:

```tsx
document.body.classList.add('theme-blue', 'mode-dark');
```

Available themes: `theme-blue`, `theme-green`, `theme-orange`, `theme-purple`, `theme-lara` (and more).

### Global managers (snackbar, tooltip, context menu)

Mount the managers once at your app root, then trigger them imperatively from anywhere:

```tsx
import { SnackbarManager, showSnackbar } from 'fluxo-ui';

function Root() {
    return (
        <>
            <SnackbarManager />
            <button onClick={() => showSnackbar({ message: 'Saved!', type: 'success' })}>
                Save
            </button>
        </>
    );
}
```

### Hooks

```tsx
import { useDebounce, useMobile, useClickOutside } from 'fluxo-ui/hooks';

const debouncedQuery = useDebounce(query, 300);
const isMobile = useMobile();
```

### State management

```tsx
import { create } from 'fluxo-ui/store';

const useCounter = create({ count: 0 });

function Counter() {
    const count = useCounter((s) => s.count);
    return <button onClick={() => useCounter.setState({ count: count + 1 })}>{count}</button>;
}
```

## Components

> For live examples, props, and API documentation for each component, visit [fluxo-ui.utilsware.com](https://fluxo-ui.utilsware.com/).

### Form Inputs

| Component | Description |
| --- | --- |
| Text Input | Single-line text field with validation and icons |
| Numeric Input | Number input with step buttons and formatting |
| Masked Input | Input with format masks (phone, date, etc.) |
| Password | Password field with visibility toggle and strength |
| Textarea | Multi-line text area with auto-resize |
| Field Label | Accessible form field labels and hints |
| Input Group | Group inputs with addons and buttons |
| Slider | Single/range slider with marks and labels |

### Selection

| Component | Description |
| --- | --- |
| Checkbox | Standard checkbox with label and indeterminate |
| MultiState Checkbox | Cycle through multiple states on click |
| Radio Button | Single-selection radio groups |
| Input Switch | Toggle switch with on/off states |
| Select Button | Button-style single/multi selection |
| Toggle Button | Pressable toggle with icon support |
| Dropdown | Single select dropdown with search |
| Multiselect | Multi-item selection with chips |
| Autocomplete | Input with filtered suggestions |
| List Box | Scrollable selection list |
| Chips | Tag-style input for multiple values |
| Date Range Picker | Date range selection with presets |

### Data Display

| Component | Description |
| --- | --- |
| Table | Data grid with sort, filter, pagination |
| Gantt Chart | Project timeline and task visualization |
| Kanban Board | Drag-and-drop task board with columns |
| Calendar | Full-featured event calendar |
| Canvas Draw | Drawing and annotation overlay |
| JSON Editor | Interactive JSON viewer and editor |
| Tab View | Tabbed content with multiple variants |
| Progress Bar | Determinate and indeterminate progress |
| Stepper | Multi-step wizard navigation |
| Shimmer / Skeleton | Loading placeholders and skeletons |
| TreeView | Hierarchical tree with expand/collapse |
| Timeline | Vertical/horizontal event sequence |
| Carousel | Image/video slider with thumbnails |
| Pivot Table | Aggregation, pivoting, expand/collapse |
| Image Editor | Crop, rotate, blur, annotate images |

### Interactive

| Component | Description |
| --- | --- |
| Button | Primary action element with variants |
| Fab & Speed Dial | Floating action buttons |
| Drag & Drop | Draggable and droppable containers |
| Sortable | Drag-to-reorder lists and grids |
| Splitter | Resizable split panels |
| Step Tour | Guided UI walkthroughs |
| Deferred View | Lazy-render with visibility detection |
| Infinite Scroll | Load-more on scroll with indicators |
| File Upload | Drag-and-drop file upload zone |
| Animate On View | Scroll-triggered CSS animations |
| Collapsible Panel | Expand/collapse sections & accordion |

### Overlays & Navigation

| Component | Description |
| --- | --- |
| Modal | Dialog overlays with backdrop |
| Drawer | Slide-in panel from any edge |
| Tooltip | Hover/focus information popups |
| Popover | Click-triggered content popovers |
| Snackbar | Toast notifications |
| Confirm Popover | Inline confirmation dialogs |
| Context Menu | Right-click context menus |
| Breadcrumb | Navigation breadcrumb trail |
| Notification Center | Dropdown notification panel |
| Page Banner | Page-level message banners |
| Menu Nav | Multi-level menu navigation |
| Lightbox | Hover/click preview with zoom-out |

## Hooks & Utilities

| Name | Description |
| --- | --- |
| `useDebounce` | Debounce value changes with configurable delay |
| `useMobile` | Detect mobile viewport with auto-resize |
| `useClickOutside` | Detect clicks outside a referenced element |
| `useKeyboard` | Register global keyboard event handlers |
| `withFieldLabel` | HOC to add label, error, hint to any input |
| `showSnackbar` | Trigger toast notifications imperatively |
| `showTooltip` | Show tooltips programmatically |
| `showContextMenu` | Open context menus on right-click |

## State Management

Fluxo UI ships with a lightweight, TypeScript-first state management solution:

- **Basic Store** — simple state container with batched updates, computed properties, and path subscriptions
- **Model Store** — entity-based store with built-in CRUD, persistence, validation, and list management
- **Middleware** — undo/redo, persistence, validation, throttle, debounce, broadcast, logging, devtools

## Dependency Injection

A class- and factory-based DI container with singleton, scoped, and transient lifetimes, parameterized factories, circular dependency detection, and seamless React integration via `ServiceProvider`, `useService`, and `withServices`.

## License

MIT © Shridhar TL
