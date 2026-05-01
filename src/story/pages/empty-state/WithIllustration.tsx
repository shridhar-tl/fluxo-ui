import React from 'react';
import { EmptyState } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<EmptyState
  title="Custom illustration"
  description="Replace the icon with any ReactNode."
  illustration={
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="50" fill="var(--eui-primary-subtle)" stroke="var(--eui-primary-border)" />
      <path d="M70 75 L90 95 L130 60" stroke="var(--eui-primary)" strokeWidth="6" fill="none" />
    </svg>
  }
  action={{ label: 'Get started', onClick: () => {} }}
/>`;

const Illustration = () => (
    <svg viewBox="0 0 200 160" width="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="es-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--eui-primary-subtle)" />
                <stop offset="100%" stopColor="var(--eui-bg-subtle)" />
            </linearGradient>
        </defs>
        <rect x="20" y="20" width="160" height="120" rx="14" fill="url(#es-bg)" stroke="var(--eui-border-subtle)" />
        <circle cx="80" cy="80" r="22" fill="var(--eui-primary-subtle)" stroke="var(--eui-primary-border)" />
        <rect x="115" y="65" width="50" height="8" rx="4" fill="var(--eui-border-subtle)" />
        <rect x="115" y="80" width="40" height="8" rx="4" fill="var(--eui-border-subtle)" />
        <rect x="115" y="95" width="35" height="8" rx="4" fill="var(--eui-border-subtle)" />
    </svg>
);

const WithIllustration: React.FC = () => (
    <>
        <ComponentDemo title="Custom Illustration" description="Pass any ReactNode as the illustration slot.">
            <EmptyState
                title="Nothing to show — yet"
                description="Connect a data source to start exploring metrics, charts, and insights."
                illustration={<Illustration />}
                action={{ label: 'Connect a source', variant: 'primary', onClick: () => {} }}
                secondaryAction={{ label: 'Watch demo', onClick: () => {} }}
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default WithIllustration;
