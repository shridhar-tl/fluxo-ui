import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Clickable from './Clickable';
import Group from './Group';
import Sizes from './Sizes';
import Statuses from './Statuses';

import _Avatar_props_json from './../../../components/avatar/Avatar.props.json';
const { avatarProps, avatarGroupProps } = _Avatar_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Image / initials / icon fallbacks' },
    { id: 'sizes', title: 'Sizes & Shapes', description: 'Five preset sizes + custom px' },
    { id: 'statuses', title: 'Statuses', description: 'Online / busy / away / offline' },
    { id: 'group', title: 'Avatar Group', description: 'Stacked group with overflow popover' },
    { id: 'clickable', title: 'Clickable', description: 'Render as focusable button' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Avatar Props', description: 'Avatar API' },
    { id: 'group-props', title: 'AvatarGroup Props', description: 'AvatarGroup API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Smart Fallbacks',
        description: 'Falls back from image → initials → icon when sources fail; deterministic color from the name.',
        icon: 'M9.53 16.122',
    },
    {
        title: '4 Statuses',
        description: 'Online, busy, away, and offline with screen-reader-only labels.',
        icon: 'M12 6v6h4.5',
    },
    {
        title: 'Group with Overflow',
        description: 'Cap visible avatars; remaining ones collapse into a focusable +N popover.',
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Shape & Size',
        description: 'Circle / rounded / square shapes plus five preset sizes or arbitrary pixel values.',
        icon: 'M2.25 15.75',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const AvatarPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Avatar
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A circular image-or-initials display with status indicators, plus a stacked group with overflow handling.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="sizes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes & Shapes</h2>
            <Sizes />
        </section>

        <section id="statuses" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Statuses</h2>
            <Statuses />
        </section>

        <section id="group" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Avatar Group</h2>
            <Group />
        </section>

        <section id="clickable" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Clickable</h2>
            <Clickable />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { Avatar, AvatarGroup } from 'fluxo-ui';\nimport type { AvatarProps, AvatarGroupProps, AvatarSize, AvatarShape, AvatarStatus } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Avatar Props</h2>
            <PropsTable props={avatarProps} />
        </section>

        <section id="group-props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>AvatarGroup Props</h2>
            <PropsTable props={avatarGroupProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default AvatarPage;
