# Fluxo UI

A comprehensive, accessible React component library built with TypeScript. Includes **100+ production-ready UI components**, a custom state management solution, a dependency injection container, 12 color themes, dark mode, and full keyboard navigation.

- **Website & Live Demos:** [fluxo-ui.utilsware.com](https://fluxo-ui.utilsware.com/)
- **Repository:** [github.com/shridhar-tl/fluxo-ui](https://github.com/shridhar-tl/fluxo-ui)

## Highlights

- 100+ accessible, production-ready components
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

### Cherry-Pick Components (`fluxo-cli`)

Prefer to vendor individual components into your repo instead of taking a runtime dependency on `fluxo-ui`? Use the standalone **[fluxo-cli](https://www.npmjs.com/package/fluxo-cli)** package — `npx fluxo-cli add button` drops real source files into your project. See [fluxo-ui.utilsware.com/cli-usage](https://fluxo-ui.utilsware.com/cli-usage) for the full walkthrough.

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
            <button onClick={() => showSnackbar({ message: 'Saved!', type: 'success' })}>Save</button>
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

| Component             | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| Text Input            | Single-line text field with validation and icons                           |
| Numeric Input         | Number input with step buttons and formatting                              |
| Masked Input          | Input with format masks (phone, date, etc.)                                |
| Password              | Password field with visibility toggle and optional strength meter          |
| Password Strength     | Configurable strength meter with allowed-aware tips                        |
| Password Requirements | Live rules checklist with confirm-password and bundled strength meter      |
| Textarea              | Multi-line text area with auto-resize                                      |
| Field Label           | Accessible form field labels and hints                                     |
| Input Group           | Group inputs with addons and buttons                                       |
| Slider                | Single/range slider with marks and labels                                  |
| Rating                | Star/heart/thumb rating with fractional precision                          |
| Signature Pad         | Canvas signature capture with smooth strokes, color and thickness variants |
| Week Day Selector     | Compact weekday picker with single or multi-day selection                  |

### Selection

| Component           | Description                                    |
| ------------------- | ---------------------------------------------- |
| Checkbox            | Standard checkbox with label and indeterminate |
| MultiState Checkbox | Cycle through multiple states on click         |
| Radio Button        | Single-selection radio groups                  |
| Input Switch        | Toggle switch with on/off states               |
| Select Button       | Button-style single/multi selection            |
| Toggle Button       | Pressable toggle with icon support             |
| Dropdown            | Single select dropdown with search             |
| Multiselect         | Multi-item selection with chips                |
| Autocomplete        | Input with filtered suggestions                |
| List Box            | Scrollable selection list                      |
| Chips               | Tag-style input for multiple values            |

### Date, Time & Color

| Component         | Description                                 |
| ----------------- | ------------------------------------------- |
| Date Range Picker | Date range selection with presets           |
| Time Picker       | 12/24 hour time picker with step increments |
| Color Picker      | HSV canvas with hex/RGB inputs and swatches |
| Calendar          | Full-featured event calendar                |

### Data & Reports

| Component      | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| Table          | Data grid with sort, filter, pagination                                            |
| Pivot Table    | Aggregation, pivoting, expand/collapse                                             |
| TreeView       | Hierarchical tree with expand/collapse                                             |
| Report Builder | Visual report designer with datasource plugins, parameters, and JSON export        |
| Report Viewer  | Renders report definitions with sorting, drill-through, PDF export, and parameters |

### Editors

| Component       | Description                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------- |
| Markdown Editor | Markdown editor and preview with toolbar, upload, and split view                              |
| HTML Editor     | WYSIWYG rich text editor with full formatting, tables, images, and sanitized preview          |
| JSON Editor     | Interactive JSON viewer and editor                                                            |
| Diff Viewer     | High-performance text diff with unified, split, inline variants and large-file virtualization |

### Charts & Boards

| Component       | Description                                                                     |
| --------------- | ------------------------------------------------------------------------------- |
| Gantt Chart     | Project timeline and task visualization                                         |
| Kanban Board    | Drag-and-drop task board with columns                                           |
| Timeline        | Vertical/horizontal event sequence                                              |
| Progress Bar    | Determinate and indeterminate progress                                          |
| Countdown Timer | Progress-aware countdown with circular, linear, segmented, and numeric variants |
| Knob            | Circular value indicator with optional drag editing                             |
| Activity Gauge  | Concentric multi-series ring chart                                              |

### Codes

| Component  | Description                                                                  |
| ---------- | ---------------------------------------------------------------------------- |
| QR Code    | Encode any string with optional logo overlay                                 |
| QR Scanner | Scan QR codes with the device camera using the native BarcodeDetector API   |
| Barcode    | Six 1D symbologies with built-in validation                                  |

### Media

| Component    | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| Avatar       | Circular image / initials / icon with status dots and group overflow |
| Carousel     | Image/video slider with thumbnails                                   |
| Lightbox     | Hover/click preview with zoom-out                                    |
| Image Editor | Crop, rotate, blur, annotate images                                  |
| Canvas Draw  | Drawing and annotation overlay                                       |
| File Upload  | Drag-and-drop file upload zone                                       |

### Navigation

| Component  | Description                           |
| ---------- | ------------------------------------- |
| Tab View   | Tabbed content with multiple variants |
| Stepper    | Multi-step wizard navigation          |
| Breadcrumb | Navigation breadcrumb trail           |
| Menu Nav   | Multi-level menu navigation           |
| Step Tour  | Guided UI walkthroughs                |

### Feedback

| Component           | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| Snackbar            | Toast notifications                                               |
| Notification Center | Dropdown notification panel                                       |
| Page Banner         | Page-level message banners                                        |
| Tooltip             | Hover/focus information popups                                    |
| Shimmer / Skeleton  | Loading placeholders and skeletons                                |
| Empty State         | Placeholder for empty data, errors, success, and first-run states |

### Overlays

| Component       | Description                      |
| --------------- | -------------------------------- |
| Modal           | Dialog overlays with backdrop    |
| Drawer          | Slide-in panel from any edge     |
| Popover         | Click-triggered content popovers |
| Confirm Popover | Inline confirmation dialogs      |
| Context Menu    | Right-click context menus        |

### Layout

| Component         | Description                                                                          |
| ----------------- | ------------------------------------------------------------------------------------ |
| Splitter          | Resizable split panels                                                               |
| Collapsible Panel | Expand/collapse sections & accordion                                                 |
| Accordion         | Multi-item collapsible panel group with single/multi expand and five visual variants |
| Card              | Content container with header, body, footer, cover media, and five visual variants   |
| Docked Layout     | VS Code-style panel layout — dock, auto-hide, float, resize, and re-dock panels      |
| Dashboard Layout  | Grid-based dashboard — drag, resize, show/hide widgets with per-breakpoint layouts and presets |
| Resizable         | Generic resize wrapper — 8 handles, axis lock, aspect ratio, grid snap, keyboard      |
| Moveable          | Drag wrapper for any element — bounds, axis lock, drag handle, grid snap, keyboard    |

### Actions & Interaction

| Component        | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| Button           | Primary action element with variants                         |
| Split Button     | Primary action paired with a related-actions menu            |
| Fab & Speed Dial | Floating action buttons                                      |
| Dock             | Floating bar of icons with magnification and auto-hide       |
| Command Palette  | Modal launcher with fuzzy search, recents, and global hotkey |
| Scroll To Top    | Floating FAB that returns the user to the top of the page    |
| Drag & Drop      | Draggable and droppable containers                           |
| Sortable         | Drag-to-reorder lists and grids                              |
| Deferred View    | Lazy-render with visibility detection                        |
| Infinite Scroll  | Load-more on scroll with indicators                          |
| Animate On View  | Scroll-triggered CSS animations                              |

### Chat

| Component          | Description                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Chat Window        | Fully-controlled chat surface with composer, attachments, reactions, replies, and 9 themes  |
| Chat Themes        | All 9 built-in themes side by side in light and dark mode                                    |
| Chat Launcher      | 7 floating-button variants to invite users into the chat                                     |
| Chat Conversations | Two-pane inbox with search, pinned, archived, and unread counts                              |
| Multi-Chat         | Render multiple independent chat windows on a single screen                                  |
| Chat Templates     | Built-in text/image/file/options/video templates plus your own custom renderers              |

### Mobile

| Component            | Description                                                                  |
| -------------------- | ---------------------------------------------------------------------------- |
| Nav Bar              | Mobile app bar with back, title, actions, and optional sub-row              |
| Mobile Tab Bar       | Bottom navigation with badges + four visual variants                         |
| Action Sheet         | iOS / Material / plain bottom action list with destructive states           |
| Pull To Refresh      | Promise-aware pull-down refresh with four indicator styles                   |
| Swipeable List Item  | Row with reveal-on-swipe actions and full-swipe trigger                      |
| Picker               | Wheel / flat / compact picker — single or multi-column                       |
| PIN / OTP Input      | Auto-advancing OTP boxes with paste, masking, and error state                |
| Floating Label Input | Material-style floating label — outlined, filled, underlined                 |
| Step Dots            | Tiny dot / bar / numbered position indicator                                 |
| Touch Ripple         | Drop-in Material ripple wrapper for any tappable surface                     |
| Skeleton List        | Nine ready-made skeleton list/card placeholders                              |
| Virtual List         | Windowed list with onEndReached for very long mobile feeds                   |
| Safe Area View       | Wrapper that applies env(safe-area-inset-*) for iOS notches                  |

## Hooks & Utilities

| Name              | Description                                    |
| ----------------- | ---------------------------------------------- |
| `useDebounce`     | Debounce value changes with configurable delay |
| `useMobile`       | Detect mobile viewport with auto-resize        |
| `useClickOutside` | Detect clicks outside a referenced element     |
| `useKeyboard`     | Register global keyboard event handlers        |
| `withFieldLabel`  | HOC to add label, error, hint to any input     |
| `showSnackbar`    | Trigger toast notifications imperatively       |
| `showTooltip`     | Show tooltips programmatically                 |
| `showContextMenu` | Open context menus on right-click              |

## State Management

Fluxo UI ships with a lightweight, TypeScript-first state management solution:

- **Basic Store** — simple state container with batched updates, computed properties, and path subscriptions
- **Slices** — compose multiple independent slices into one store with bidirectional sync; each slice is fully usable standalone
- **Model Store** — entity-based store with built-in CRUD, persistence, validation, and list management
- **Middleware** — undo/redo (scoped, grouped, byte-capped), persistence (versioned, scoped, debounced), optimistic updates with rollback, sync (BroadcastChannel / WebSocket / custom transport), schema validation (Zod / Valibot), throttle, debounce, logger, devtools

## Dependency Injection

A class- and factory-based DI container with singleton, scoped, and transient lifetimes, parameterized factories, circular dependency detection, and seamless React integration via `ServiceProvider`, `useService`, and `withServices`.

## License

MIT © Shridhar TL
