import React from 'react';
import { ScrollToTop, ScrollToTopLayout, ScrollToTopVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ScrollToTop variant="primary" />
<ScrollToTop variant="success" layout="outlined" />
<ScrollToTop layout="glass" />
<ScrollToTop gradient={{ from: '#3b82f6', to: '#a855f7' }} />`;

const variants: ScrollToTopVariant[] = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'];
const layouts: ScrollToTopLayout[] = ['solid', 'outlined', 'glass'];

const Variants: React.FC = () => (
    <>
        <ComponentDemo
            title="Variants × Layouts"
            description="The component is shown here in 'inline' mode so the visual treatments are easy to compare. In production, mode='fixed' (default) anchors it to a viewport corner."
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {layouts.map((layout) => (
                    <div key={layout} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>layout="{layout}"</span>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {variants.map((v) => (
                                <ScrollToTop
                                    key={v}
                                    variant={v}
                                    layout={layout}
                                    mode="inline"
                                    showAfter={0}
                                    size="md"
                                    ariaLabel={`Scroll to top - ${v}`}
                                    className="eui-scroll-to-top-visible"
                                />
                            ))}
                        </div>
                    </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>Custom color & gradient</span>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <ScrollToTop mode="inline" showAfter={0} color="#ec4899" className="eui-scroll-to-top-visible" />
                        <ScrollToTop
                            mode="inline"
                            showAfter={0}
                            gradient={{ from: '#3b82f6', to: '#a855f7' }}
                            className="eui-scroll-to-top-visible"
                        />
                        <ScrollToTop
                            mode="inline"
                            showAfter={0}
                            gradient={{ from: '#22c55e', to: '#0ea5e9', angle: 60 }}
                            label="Top"
                            className="eui-scroll-to-top-visible"
                        />
                        <ScrollToTop
                            mode="inline"
                            showAfter={0}
                            color="#f59e0b"
                            layout="outlined"
                            className="eui-scroll-to-top-visible"
                        />
                    </div>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Variants;
