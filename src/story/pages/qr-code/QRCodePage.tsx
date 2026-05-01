import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Customization from './Customization';
import Download from './Download';
import ErrorCorrection from './ErrorCorrection';
import Shapes from './Shapes';
import WithLogo from './WithLogo';

import _QRCode_props_json from './../../../components/qr-code/QRCode.props.json';
const { qrCodeProps } = _QRCode_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Encode any string live' },
    { id: 'shapes', title: 'Module Shapes', description: 'Square, rounded, dots' },
    { id: 'error-correction', title: 'Error Correction', description: 'L / M / Q / H' },
    { id: 'customization', title: 'Customization', description: 'Color, size, margin' },
    { id: 'logo', title: 'Logo Overlay', description: 'Centered logo with safe area' },
    { id: 'download', title: 'Download', description: 'Export to PNG / SVG / JPEG' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'No Dependencies',
        description: 'Pure-TypeScript Reed–Solomon encoder — no external runtime.',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25',
    },
    {
        title: 'All Versions 1–40',
        description: 'Auto-picks the smallest QR version that fits your value at the chosen EC level.',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128',
    },
    {
        title: 'Logo Overlay',
        description: 'Centered logo with auto-bumped error-correction so the code keeps scanning.',
        icon: 'M12 6v6h4.5',
    },
    {
        title: 'Themeable',
        description: 'Foreground/background accept any CSS color — including the eui-* variables for dark mode.',
        icon: 'M2.25 15.75',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const QRCodePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                QR Code
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Encode any string as a QR code matrix and render it as inline SVG, with optional logo overlay.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="shapes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Module Shapes</h2>
            <Shapes />
        </section>

        <section id="error-correction" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Error Correction</h2>
            <ErrorCorrection />
        </section>

        <section id="customization" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Customization</h2>
            <Customization />
        </section>

        <section id="logo" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Logo Overlay</h2>
            <WithLogo />
        </section>

        <section id="download" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Download</h2>
            <Download />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { QRCode } from 'fluxo-ui';\nimport type { QRCodeProps, QRCodeShape, QRCodeLogo } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={qrCodeProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default QRCodePage;
