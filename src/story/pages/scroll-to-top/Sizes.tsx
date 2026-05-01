import React from 'react';
import { ScrollToTop, ScrollToTopSize } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const sizes: ScrollToTopSize[] = ['sm', 'md', 'lg', 'xl'];

const code = `<ScrollToTop size="sm" />
<ScrollToTop size="md" />
<ScrollToTop size="lg" />
<ScrollToTop size="xl" />
<ScrollToTop size="md" label="Top" />
<ScrollToTop size="md" showProgress />`;

const Sizes: React.FC = () => (
    <>
        <ComponentDemo title="Sizes & Optional Label" description="Four sizes plus an optional text label that turns the FAB into a pill.">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                {sizes.map((s) => (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                        <ScrollToTop size={s} mode="inline" showAfter={0} className="eui-scroll-to-top-visible" />
                        <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>{s}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <ScrollToTop size="md" mode="inline" showAfter={0} label="Back to top" className="eui-scroll-to-top-visible" />
                    <span style={{ fontSize: 11, color: 'var(--eui-text-muted)' }}>label</span>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Sizes;
