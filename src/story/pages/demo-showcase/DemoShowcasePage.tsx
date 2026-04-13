import cn from 'classnames';
import React, { useState } from 'react';
import { SelectButton } from '../../../components';
import { showSnackbar } from '../../../components/snackbar';
import { Size } from '../../../types';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import FormSection from './FormSection';
import TableSection from './TableSection';
import TabsAndProgressSection from './TabsAndProgressSection';

const sectionNavItems: SectionNavItem[] = [
    { id: 'user-form', title: 'User Form', description: 'Form controls showcase' },
    { id: 'data-table', title: 'Data Table', description: 'Table with actions' },
    { id: 'tabs-progress', title: 'Tabs & Progress', description: 'Tab variants and progress bars' },
];

const sizeItems = [
    { label: 'XS', value: 'xs' },
    { label: 'SM', value: 'sm' },
    { label: 'MD', value: 'md' },
    { label: 'LG', value: 'lg' },
    { label: 'XL', value: 'xl' },
];

const DemoShowcasePage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [size, setSize] = useState<Size>('md');

    const handleSave = (data: Record<string, unknown>) => {
        console.log('Form data:', data);
        const filledFields = Object.entries(data).filter(([, v]) => {
            if (Array.isArray(v)) return v.length > 0;
            if (typeof v === 'boolean') return true;
            return !!v;
        }).length;
        showSnackbar(
            `${filledFields} fields saved successfully`,
            'Save Complete',
            { type: 'success', position: 'topRight' },
        );
    };

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                    <h1 className={cn('text-2xl md:text-4xl font-bold', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        Component Showcase
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className={cn('text-sm font-medium', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Size:</span>
                        <SelectButton items={sizeItems} value={size} onChange={(e) => setSize(e.value as Size)} />
                    </div>
                </div>
                <p className={cn('text-lg', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A comprehensive demo combining form inputs, selection controls, data tables, tabs, and progress indicators in a single realistic view.
                </p>
            </div>

            <section id="user-form" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    User Form
                </h2>
                <div className={cn('p-3 md:p-6 rounded-lg border', {
                    'bg-gray-800/50 border-gray-700': isDark,
                    'bg-white border-gray-200': !isDark,
                })}>
                    <FormSection onSave={handleSave} size={size} />
                </div>

            </section>

            <section id="data-table" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Employee Directory
                </h2>
                <TableSection size={size} />
            </section>

            <section id="tabs-progress" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Project Dashboard
                </h2>
                <div className={cn('p-3 md:p-6 rounded-lg border', {
                    'bg-gray-800/50 border-gray-700': isDark,
                    'bg-white border-gray-200': !isDark,
                })}>
                    <TabsAndProgressSection size={size} />
                </div>
            </section>
        </PageLayout>
    );
};

export default DemoShowcasePage;
