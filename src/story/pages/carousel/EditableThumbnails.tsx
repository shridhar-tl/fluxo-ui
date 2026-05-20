import React, { useState } from 'react';
import type { CarouselSlide } from '../../../components';
import { Carousel } from '../../../components';
import { EditIcon, PlusIcon, TrashIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initialSlides: CarouselSlide[] = [
    {
        id: 'e1',
        type: 'image',
        src: 'https://picsum.photos/seed/edit1/800/500',
        alt: 'Login screen',
        thumbnail: 'https://picsum.photos/seed/edit1/120/80',
        name: 'login',
    },
    {
        id: 'e2',
        type: 'image',
        src: 'https://picsum.photos/seed/edit2/800/500',
        alt: 'Dashboard',
        thumbnail: 'https://picsum.photos/seed/edit2/120/80',
        name: 'dashboard',
    },
    {
        id: 'e3',
        type: 'image',
        src: 'https://picsum.photos/seed/edit3/800/500',
        alt: 'Settings',
        thumbnail: 'https://picsum.photos/seed/edit3/120/80',
        name: 'settings',
    },
];

const code = `import { Carousel } from 'fluxo-ui';
import { EditIcon, PlusIcon, TrashIcon } from 'fluxo-ui/icons';

<Carousel
  slides={slides}
  navigation="thumbnails"
  showThumbnailInfo
  thumbnailActions={[
    {
      icon: <EditIcon />,
      label: 'Rename',
      onClick: (slide, index) => rename(index),
    },
    {
      icon: <TrashIcon />,
      label: 'Delete',
      variant: 'danger',
      onClick: (slide, index) => remove(index),
    },
  ]}
  trailingThumbnail={{
    icon: <PlusIcon />,
    label: 'Add image',
    onClick: () => addSlide(),
  }}
/>`;

let counter = initialSlides.length;

const EditableThumbnails: React.FC = () => {
    const [slides, setSlides] = useState<CarouselSlide[]>(initialSlides);
    const [lastAction, setLastAction] = useState<string>('No action yet — hover a thumbnail or click the + tile.');

    const remove = (index: number) => {
        setSlides((prev) => prev.filter((_, i) => i !== index));
        setLastAction(`Deleted thumbnail at index ${index}.`);
    };

    const rename = (index: number) => {
        setSlides((prev) =>
            prev.map((slide, i) => (i === index ? { ...slide, name: `renamed-${index + 1}` } : slide)),
        );
        setLastAction(`Renamed thumbnail at index ${index}.`);
    };

    const addSlide = () => {
        counter += 1;
        const id = `e${counter}`;
        setSlides((prev) => [
            ...prev,
            {
                id,
                type: 'image',
                src: `https://picsum.photos/seed/${id}/800/500`,
                alt: `New image ${counter}`,
                thumbnail: `https://picsum.photos/seed/${id}/120/80`,
                name: `image-${counter}`,
            },
        ]);
        setLastAction(`Added a new thumbnail (${id}).`);
    };

    return (
        <>
            <ComponentDemo
                title="Editable Thumbnails"
                description="Generic per-thumbnail action buttons plus a trailing add tile. Any icon and handler is configurable."
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
                            thumbnailActions={[
                                {
                                    icon: <EditIcon />,
                                    label: 'Rename',
                                    onClick: (_slide, index) => rename(index),
                                },
                                {
                                    icon: <TrashIcon />,
                                    label: 'Delete',
                                    variant: 'danger',
                                    onClick: (_slide, index) => remove(index),
                                },
                            ]}
                            trailingThumbnail={{
                                icon: <PlusIcon />,
                                label: 'Add image',
                                onClick: addSlide,
                            }}
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

export default EditableThumbnails;
