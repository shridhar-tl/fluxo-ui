import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import CustomLabels from './CustomLabels';
import DisabledStates from './DisabledStates';
import FormIntegration from './FormIntegration';
import SettingsPanel from './SettingsPanel';


import _InputSwitch_props_json from './../../../components/InputSwitch.props.json';
const { inputSwitchProps } = _InputSwitch_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple on/off toggle' },
    { id: 'settings-panel', title: 'Settings Panel', description: 'Multiple switches in a layout' },
    { id: 'custom-labels', title: 'Custom Labels', description: 'Custom on/off label text' },
    { id: 'disabled-states', title: 'Disabled States', description: 'Disabled on and off states' },
    { id: 'form-integration', title: 'Form Integration', description: 'Switch with form labels' },
    { id: 'usage', title: 'Usage', description: 'Code examples' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API reference' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Binary Toggle',
        description: 'Clean on/off toggle with smooth animated thumb transition for clear visual feedback',
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
    },
    {
        title: 'Custom Labels',
        description: 'onLabel and offLabel props let you display contextual text like Yes/No, Active/Inactive, or Enabled/Disabled',
        icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z',
    },
    {
        title: 'Disabled State',
        description: 'Disabled prop prevents interaction while preserving the current value in both on and off positions',
        icon: 'M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636',
    },
    {
        title: 'Form Compatible',
        description: 'Supports name attribute for native form submission and integrates cleanly with label elements',
        icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z',
    },
    {
        title: 'Controlled Component',
        description: 'Fully controlled via checked and onChange props — no internal state to fight against',
        icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
    },
    {
        title: 'Accessibility',
        description: 'Uses native checkbox semantics with ARIA role="switch", keyboard toggling, and focus ring',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
        title: 'Theming',
        description: 'Full dark/light and 5 brand themes supported via CSS variables with zero extra configuration',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
];

const basicUsageCode = `import { InputSwitch } from 'fluxo-ui';

function MyComponent() {
  const [enabled, setEnabled] = useState(false);

  return (
    <InputSwitch
      checked={enabled}
      onChange={(e) => setEnabled(e.value)}
    />
  );
}`;

const advancedUsageCode = `import { InputSwitch } from 'fluxo-ui';

function MyComponent() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label>Enable Notifications</label>
        <InputSwitch
          checked={settings.notifications}
          onChange={(e) => handleSettingChange('notifications', e.value)}
          onLabel="On"
          offLabel="Off"
        />
      </div>

      <div className="flex items-center justify-between">
        <label>Dark Mode</label>
        <InputSwitch
          checked={settings.darkMode}
          onChange={(e) => handleSettingChange('darkMode', e.value)}
          onLabel="Enabled"
          offLabel="Disabled"
        />
      </div>
    </div>
  );
}`;

const InputSwitchPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    InputSwitch
                </h1>
                <p className={cn('text-xl leading-relaxed', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A toggle switch component for binary choices, providing an alternative to checkboxes for on/off states.
                </p>
            </div>

            <section id="basic-usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Basic Usage</h2>
                <BasicUsage />
            </section>

            <section id="settings-panel" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Settings Panel</h2>
                <SettingsPanel />
            </section>

            <section id="custom-labels" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Custom Labels</h2>
                <CustomLabels />
            </section>

            <section id="disabled-states" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Disabled States
                </h2>
                <DisabledStates />
            </section>

            <section id="form-integration" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Form Integration
                </h2>
                <FormIntegration />
            </section>

            <section id="usage" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Usage</h2>
                <div className="space-y-4">
                    <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Basic Usage</h3>
                    <CodeBlock code={basicUsageCode} language="typescript" />
                </div>
                <div className="mt-6 space-y-4">
                    <h3 className={cn('text-lg font-medium', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>Advanced Usage</h3>
                    <CodeBlock code={advancedUsageCode} language="typescript" />
                </div>
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock code={`import { InputSwitch } from 'fluxo-ui';`} />
            </section>

            <section id="props" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Props</h2>
                <PropsTable props={inputSwitchProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default InputSwitchPage;
