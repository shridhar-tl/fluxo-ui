import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { DragDropProvider } from './components/drag-drop';
import './styles/index.css';

document.body.classList.add('theme-blue');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <DragDropProvider>
            <App />
        </DragDropProvider>
    </StrictMode>,
);
