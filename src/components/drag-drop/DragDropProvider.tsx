import { ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './drag-drop.scss';

// DragDropProvider component props
export interface DragDropProviderProps {
    /**
     * Children to wrap with DnD context
     */
    children: ReactNode;

    /**
     * Optional custom backend (defaults to HTML5Backend)
     */
    backend?: any;

    /**
     * Optional backend options
     */
    options?: any;
}

/**
 * DragDropProvider component that wraps children with react-dnd context.
 * This must be placed at the root of your app (or at least above any drag-drop components).
 *
 * @example
 * ```tsx
 * import { DragDropProvider } from 'ether-ui';
 *
 * function App() {
 *   return (
 *     <DragDropProvider>
 *       <YourApp />
 *     </DragDropProvider>
 *   );
 * }
 * ```
 */
export default function DragDropProvider({ children, backend = HTML5Backend, options }: DragDropProviderProps) {
    return (
        <DndProvider backend={backend} options={options}>
            {children}
        </DndProvider>
    );
}
