import React from 'react';
import { Button } from '../../../components/Button';
import type { PdfDocument } from '../../../pdf';
import { savePdf } from '../../../pdf';

interface PdfPreviewProps {
    build: () => PdfDocument;
    fileName: string;
    height?: number;
    autoRender?: boolean;
    actionLabel?: string;
}

interface PreviewState {
    url: string | null;
    error: string | null;
    pages: number;
    bytes: number;
}

const initialState: PreviewState = { url: null, error: null, pages: 0, bytes: 0 };

export const PdfPreview: React.FC<PdfPreviewProps> = ({
    build,
    fileName,
    height = 460,
    autoRender = true,
    actionLabel = 'Generate preview',
}) => {
    const [state, setState] = React.useState<PreviewState>(initialState);
    const objectUrlRef = React.useRef<string | null>(null);

    const revoke = React.useCallback(() => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
    }, []);

    const render = React.useCallback(() => {
        try {
            const doc = build();
            const bytes = doc.build();
            const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' });

            revoke();
            const url = URL.createObjectURL(blob);
            objectUrlRef.current = url;

            setState({ url, error: null, pages: doc.pageCount, bytes: bytes.length });
        } catch (error) {
            setState({ url: null, error: error instanceof Error ? error.message : String(error), pages: 0, bytes: 0 });
        }
    }, [build, revoke]);

    React.useEffect(() => {
        if (autoRender) render();
        return revoke;
    }, [autoRender, render, revoke]);

    const download = React.useCallback(() => {
        savePdf(build().build(), fileName);
    }, [build, fileName]);

    return (
        <div className="w-full flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 items-center">
                <Button size="sm" onClick={render}>
                    {actionLabel}
                </Button>
                <Button size="sm" variant="primary" onClick={download}>
                    Download PDF
                </Button>
                {state.pages > 0 && (
                    <span className="text-xs text-(--eui-text-muted)">
                        {state.pages} page{state.pages === 1 ? '' : 's'} · {(state.bytes / 1024).toFixed(1)} KB
                    </span>
                )}
            </div>

            {state.error && (
                <div role="alert" className="px-3 py-2.5 rounded-md bg-red-600/10 text-red-600 text-[13px]">
                    {state.error}
                </div>
            )}

            {state.url && (
                <object
                    data={state.url}
                    type="application/pdf"
                    aria-label={`Preview of ${fileName}`}
                    className="w-full rounded-lg border border-(--eui-border) bg-(--eui-bg-subtle)"
                    style={{ height }}
                >
                    <p className="p-4 text-[13px] text-(--eui-text-muted)">
                        Inline preview is unavailable in this browser. Use Download PDF to open the file.
                    </p>
                </object>
            )}
        </div>
    );
};
