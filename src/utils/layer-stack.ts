type EscapeHandler = () => void;

interface Layer {
    onEscape: { current: EscapeHandler | undefined };
}

const layers: Layer[] = [];
let listening = false;

const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
    const top = layers[layers.length - 1];
    if (!top) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    top.onEscape.current?.();
};

export const pushLayer = (onEscape: { current: EscapeHandler | undefined }): (() => void) => {
    if (!listening && typeof document !== 'undefined') {
        document.addEventListener('keydown', handleKeyDown);
        listening = true;
    }
    const layer: Layer = { onEscape };
    layers.push(layer);
    return () => {
        const index = layers.indexOf(layer);
        if (index >= 0) layers.splice(index, 1);
    };
};

export const hasOpenLayer = (): boolean => layers.length > 0;
