import cn from 'classnames';
import React, { useState } from 'react';
import { Button, StepTour } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { basicSteps } from './tour-story-data';

const code = `import { StepTour } from 'ether-ui';
import type { TourStep } from 'ether-ui/types';

const steps: TourStep[] = [
  {
    selector: '#dashboard-header',
    title: 'Dashboard Overview',
    content: 'This is your main dashboard with key metrics.',
    placement: 'bottom',
    order: 1,
  },
  {
    selector: '#sidebar-nav',
    title: 'Navigation',
    content: 'Jump to any section from this sidebar.',
    placement: 'right',
    order: 2,
  },
];

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Start Tour</Button>

{isOpen && (
  <StepTour
    steps={steps}
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
  />
)}`;

const BasicTour: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [basicOpen, setBasicOpen] = useState(false);

    const mutedText = isDark ? 'text-gray-400' : 'text-gray-500';
    const headingText = isDark ? 'text-gray-100' : 'text-gray-900';
    const cardBg = isDark ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm';
    const navBg = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200';
    const navActiveItem = isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700';
    const navItem = isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800';

    return (
        <>
            <ComponentDemo
                title="Interactive dashboard tour"
                description="Click 'Start Tour' to walk through each highlighted element."
                centered={false}
            >
                <div className="w-full space-y-4 p-2">
                    <div id="tour-dashboard-header" className={`flex items-center justify-between px-4 py-3 rounded-lg ${cardBg}`}>
                        <span className={cn('font-semibold text-sm', headingText)}>My Dashboard</span>
                        <div id="tour-profile-menu" className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                JD
                            </div>
                            <span className={`text-xs ${mutedText}`}>John Doe</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div id="tour-nav-links" className={`w-32 shrink-0 rounded-lg p-3 space-y-1 ${navBg}`}>
                            {['Overview', 'Reports', 'Analytics', 'Settings'].map((item, i) => (
                                <div
                                    key={item}
                                    className={`text-xs px-2 py-1.5 rounded cursor-pointer ${i === 0 ? navActiveItem : navItem}`}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div id="tour-stats-panel" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Users', value: '14,209', delta: '+8%' },
                                    { label: 'Revenue', value: '$98.4k', delta: '+12%' },
                                    { label: 'Orders', value: '3,741', delta: '+5%' },
                                ].map(({ label, value, delta }) => (
                                    <div key={label} className={`rounded-lg p-3 ${cardBg}`}>
                                        <div className={`text-xs ${mutedText}`}>{label}</div>
                                        <div className={cn('text-base font-bold', headingText)}>{value}</div>
                                        <div className="text-xs text-green-500">{delta}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <div id="tour-action-bar" className="flex items-center gap-2">
                                    <Button variant="primary" size="sm">New Report</Button>
                                    <Button variant="secondary" layout="outlined" size="sm">Export</Button>
                                    <Button variant="secondary" layout="outlined" size="sm">Filter</Button>
                                </div>
                                <div className="ml-auto">
                                    <Button variant="primary" layout="outlined" size="sm" onClick={() => setBasicOpen(true)}>
                                        Start Tour
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {basicOpen && (
                    <StepTour steps={basicSteps} isOpen={basicOpen} onClose={() => setBasicOpen(false)} />
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default BasicTour;
