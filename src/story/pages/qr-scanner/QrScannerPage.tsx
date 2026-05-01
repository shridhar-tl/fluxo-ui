import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import ContinuousScan from './ContinuousScan';
import Customization from './Customization';
import ImperativeApi from './ImperativeApi';

import _QrScanner_props_json from './../../../components/qr-scanner/QrScanner.props.json';
const { qrScannerProps } = _QrScanner_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Scan a QR with the rear camera' },
    { id: 'continuous', title: 'Continuous Mode', description: 'Keep scanning after each detection' },
    { id: 'customization', title: 'Customization', description: 'Overlay, aspect ratio, camera' },
    { id: 'imperative', title: 'Imperative API', description: 'Drive the scanner via ref' },
    { id: 'browser-support', title: 'Browser Support', description: 'BarcodeDetector availability' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'No Dependencies',
        description: 'Uses the native BarcodeDetector + getUserMedia APIs — zero third-party code.',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25',
    },
    {
        title: 'Mobile First',
        description: 'Rear camera by default, torch toggle, camera switch, 44×44 touch targets, and a focus reticle that adapts to portrait or landscape.',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128',
    },
    {
        title: 'Single or Continuous',
        description: 'Scan once and stop, or keep reading codes back-to-back with built-in duplicate debouncing.',
        icon: 'M12 6v6h4.5',
    },
    {
        title: 'Themeable',
        description: 'Reticle and controls inherit your active brand theme via --eui-* CSS variables — works in light and dark mode.',
        icon: 'M2.25 15.75',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };
const calloutStyle: React.CSSProperties = {
    padding: '14px 18px',
    background: 'var(--eui-bg-subtle)',
    border: '1px solid var(--eui-border-subtle)',
    borderRadius: 8,
    color: 'var(--eui-text)',
    fontSize: 14,
    lineHeight: 1.6,
};

const supportCode = `// Feature detection
import { isQrScanSupported, isCameraAvailable } from 'fluxo-ui/utils';

if (isQrScanSupported() && isCameraAvailable()) {
  // safe to render <QrScanner />
}`;

const QrScannerPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                QR Scanner
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Turn the device camera on, decode QR codes in real time, and return the value — entirely with native browser APIs and no third-party dependency.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="continuous" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Continuous Mode</h2>
            <ContinuousScan />
        </section>

        <section id="customization" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Customization</h2>
            <Customization />
        </section>

        <section id="imperative" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Imperative API</h2>
            <ImperativeApi />
        </section>

        <section id="browser-support" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Browser Support</h2>
            <div style={calloutStyle}>
                <p style={{ margin: 0 }}>
                    QrScanner is built on the native <code>BarcodeDetector</code> and <code>getUserMedia</code> APIs. No JavaScript decoder is bundled.
                </p>
                <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                    <li>Chrome &amp; Edge (desktop and Android) — supported.</li>
                    <li>Safari 17+ on iOS and macOS — supported.</li>
                    <li>Firefox — not yet supported. The component renders an &quot;unsupported&quot; message.</li>
                    <li>Requires a secure (HTTPS or localhost) context.</li>
                    <li>Inside Capacitor / Ionic apps it works on the same matrix — declare camera permission in <code>Info.plist</code> (iOS) and <code>AndroidManifest.xml</code>.</li>
                </ul>
                <div style={{ marginTop: 12 }}>
                    <CodeBlock code={supportCode} language="tsx" />
                </div>
            </div>
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { QrScanner } from 'fluxo-ui';\nimport type { QrScannerProps, QrScannerHandle, QrScannerStatus } from 'fluxo-ui';\nimport { startQrScan, scanQrCodeOnce, isQrScanSupported, isCameraAvailable, listVideoInputDevices } from 'fluxo-ui/utils';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={qrScannerProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default QrScannerPage;
