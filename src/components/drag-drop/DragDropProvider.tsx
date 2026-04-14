import { ReactNode, useEffect } from 'react';
import { ensureDocumentListeners } from './core/install';
import './drag-drop.scss';

export interface DragDropProviderProps {
    children: ReactNode;
    /** @deprecated kept for API compatibility, now a no-op */
    backend?: unknown;
    /** @deprecated kept for API compatibility, now a no-op */
    options?: unknown;
}

export default function DragDropProvider({ children }: DragDropProviderProps) {
    useEffect(() => {
        ensureDocumentListeners();
    }, []);
    return <>{children}</>;
}
