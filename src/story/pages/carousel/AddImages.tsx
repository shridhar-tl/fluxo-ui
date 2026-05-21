import React, { useCallback, useEffect, useState } from 'react';
import type { CarouselSlide } from '../../../components';
import { Carousel } from '../../../components';
import { TrashIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Carousel } from 'fluxo-ui';
import { TrashIcon } from 'fluxo-ui/icons';

const addFromFiles = (files: File[]) => {
  Promise.all(
    files.map(
      (file) =>
        new Promise<CarouselSlide>((resolve) => {
          const url = URL.createObjectURL(file);
          resolve({ id: crypto.randomUUID(), type: 'image', src: url, name: file.name });
        }),
    ),
  ).then((next) => setSlides((prev) => [...prev, ...next]));
};

// Drag-drop and the trailing file-picker tile are handled by the carousel.
// Forward clipboard paste to the same callback for paste-anywhere support.
useEffect(() => {
  const onPaste = (e: ClipboardEvent) => {
    const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'));
    if (files.length) addFromFiles(files);
  };
  window.addEventListener('paste', onPaste);
  return () => window.removeEventListener('paste', onPaste);
}, []);

<Carousel
  slides={slides}
  navigation="thumbnails"
  aspectRatio="16/10"
  onAddImages={addFromFiles}
  thumbnailActions={[{ icon: <TrashIcon />, label: 'Delete', variant: 'danger', onClick: (_s, i) => remove(i) }]}
/>`;

let counter = 0;

const AddImages: React.FC = () => {
    const [slides, setSlides] = useState<CarouselSlide[]>([]);
    const [lastAction, setLastAction] = useState<string>('Drag an image here, paste from clipboard, or click the add tile.');

    const addFromFiles = useCallback((files: File[]) => {
        const next = files.map<CarouselSlide>((file) => {
            counter += 1;
            return { id: `add-${counter}`, type: 'image', src: URL.createObjectURL(file), name: file.name || `image-${counter}` };
        });
        if (next.length === 0) return;
        setSlides((prev) => [...prev, ...next]);
        setLastAction(`Added ${next.length} image${next.length === 1 ? '' : 's'} (${next.map((s) => s.name).join(', ')}).`);
    }, []);

    const remove = useCallback((index: number) => {
        setSlides((prev) => {
            const target = prev[index];
            if (target?.src?.startsWith('blob:')) URL.revokeObjectURL(target.src);
            return prev.filter((_, i) => i !== index);
        });
        setLastAction(`Removed image at index ${index}.`);
    }, []);

    useEffect(() => {
        const onPaste = (e: ClipboardEvent) => {
            const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'));
            if (files.length > 0) addFromFiles(files);
        };
        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, [addFromFiles]);

    return (
        <>
            <ComponentDemo
                title="Add Images (drop · paste · pick)"
                description="Set onAddImages to turn the carousel into an attachment surface: drag-and-drop onto the viewport, an add tile that opens the file picker, and (via a consumer paste listener) clipboard paste — all feeding the same callback."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="w-full max-w-2xl mx-auto">
                        <Carousel
                            slides={slides}
                            navigation="thumbnails"
                            thumbnailPosition="bottom"
                            showThumbnailInfo
                            aspectRatio="16/10"
                            onAddImages={addFromFiles}
                            addImagesDropLabel="Drop image to attach"
                            thumbnailActions={[
                                {
                                    icon: <TrashIcon />,
                                    label: 'Delete',
                                    variant: 'danger',
                                    onClick: (_slide, index) => remove(index),
                                },
                            ]}
                        />
                    </div>
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            color: 'var(--eui-text)',
                        }}
                    >
                        Last action: <strong>{lastAction}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default AddImages;
