import cn from 'classnames';
import React from 'react';
import { Button, Lightbox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { Lightbox } from 'fluxo-ui';

<Lightbox
  trigger="hover"
  content={<img src="https://picsum.photos/400/300" />}
>
  <span>Hover me</span>
</Lightbox>

<Lightbox
  trigger="click"
  position="center"
  zoomOut
  zoomScale={0.4}
  content={<LargeComponent />}
  header="Zoomed Preview"
>
  <Button>Click to preview</Button>
</Lightbox>`;

const BasicUsage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <>
            <ComponentDemo title="Lightbox Variants" description="Hover and click triggers with normal and zoomed-out views.">
                <div className="flex flex-wrap gap-6 items-start">
                    <Lightbox
                        trigger="hover"
                        content={
                            <img src="https://picsum.photos/seed/lb1/400/300" alt="Preview" style={{ width: '100%', display: 'block' }} />
                        }
                        width={400}
                        showCloseButton={false}
                    >
                        <div
                            className={cn('px-4 py-3 rounded-lg border cursor-pointer transition-all', {
                                'bg-white/5 border-white/10 hover:border-white/25': isDark,
                                'bg-white border-gray-200 hover:border-gray-400 hover:shadow': !isDark,
                            })}
                        >
                            <p className="text-sm font-medium" style={{ color: 'var(--eui-text)' }}>
                                Hover for image preview
                            </p>
                            <p className="text-xs" style={{ color: 'var(--eui-text-muted)' }}>
                                Image loads in a popover
                            </p>
                        </div>
                    </Lightbox>

                    <Lightbox
                        trigger="click"
                        position="center"
                        content={
                            <div className="p-6" style={{ backgroundColor: 'var(--eui-bg)' }}>
                                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--eui-text)' }}>
                                    Modal Content
                                </h3>
                                <p className="text-sm mb-4" style={{ color: 'var(--eui-text-muted)' }}>
                                    This opens centered like a modal. Click the backdrop or press Escape to close.
                                </p>
                                <img
                                    src="https://picsum.photos/seed/lb2/500/300"
                                    alt="Full preview"
                                    style={{ width: '100%', borderRadius: '8px' }}
                                />
                            </div>
                        }
                        width={560}
                        header="Image Preview"
                    >
                        <Button>Click for modal preview</Button>
                    </Lightbox>

                    <Lightbox
                        trigger="click"
                        position="center"
                        zoomOut
                        zoomScale={0.35}
                        zoomWidth="1200px"
                        zoomHeight="800px"
                        content={
                            <div style={{ width: '1200px', padding: '2rem', backgroundColor: 'var(--eui-bg)' }}>
                                <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--eui-text)' }}>
                                    Zoomed Out View
                                </h2>
                                <p className="text-lg mb-6" style={{ color: 'var(--eui-text-muted)' }}>
                                    This content is rendered at 1200px wide but displayed scaled down to 35%. Useful for previewing large
                                    dashboards or complex layouts.
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }, (_, i) => (
                                        <div
                                            key={i}
                                            className="p-4 rounded-lg border"
                                            style={{ borderColor: 'var(--eui-border)', backgroundColor: 'var(--eui-bg-subtle)' }}
                                        >
                                            <div className="text-xl font-bold" style={{ color: 'var(--eui-primary)' }}>
                                                Card {i + 1}
                                            </div>
                                            <p style={{ color: 'var(--eui-text-muted)' }}>
                                                This renders at full resolution then scales down
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        }
                        width={500}
                        height={400}
                        header="Zoomed Out Preview"
                    >
                        <Button variant="secondary">Click for zoomed-out view</Button>
                    </Lightbox>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
