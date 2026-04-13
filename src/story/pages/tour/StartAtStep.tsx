import cn from 'classnames';
import React, { useState } from 'react';
import { Button, StepTour } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { startAtSteps } from './tour-story-data';

const code = `const steps: TourStep[] = [
  { selector: '#header',    title: 'Dashboard Overview', content: '...', placement: 'bottom' },
  { selector: '#stats',     title: 'Key Metrics',        content: '...', placement: 'bottom' },
  { selector: '#actions',   title: 'Quick Actions',      content: '...', placement: 'top'    },
  { selector: '#sidebar',   title: 'Navigation',         content: '...', placement: 'right'  },
  { selector: '#profile',   title: 'Your Profile',       content: '...', placement: 'left'   },
];

// Restore progress from storage
const savedStep = parseInt(localStorage.getItem('tour-step') ?? '0', 10);

{isOpen && (
  <StepTour
    steps={steps}
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    initialStep={savedStep}
  />
)}`;

const StartAtStep: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [startAtOpen, setStartAtOpen] = useState(false);
    const [startAtIndex, setStartAtIndex] = useState(2);

    const mutedText = isDark ? 'text-gray-400' : 'text-gray-500';
    const headingText = isDark ? 'text-gray-100' : 'text-gray-900';
    const cardBg = isDark ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm';
    const navBg = isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200';
    const navActiveItem = isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700';
    const navItem = isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800';

    return (
        <>
            <ComponentDemo
                title="Resuming from an arbitrary step"
                description="Choose a starting step index (0-based) then launch the tour."
                centered={false}
            >
                <div className="w-full space-y-4 p-2">
                    <div id="startat-step-a" className={`flex items-center justify-between px-4 py-3 rounded-lg ${cardBg}`}>
                        <span className={cn('font-semibold text-sm', headingText)}>My Dashboard</span>
                        <div id="startat-step-e" className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
                            <span className={`text-xs ${mutedText}`}>John Doe</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div id="startat-step-d" className={`w-32 shrink-0 rounded-lg p-3 space-y-1 ${navBg}`}>
                            {['Overview', 'Reports', 'Analytics', 'Settings'].map((item, i) => (
                                <div key={item} className={`text-xs px-2 py-1.5 rounded cursor-pointer ${i === 0 ? navActiveItem : navItem}`}>{item}</div>
                            ))}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div id="startat-step-b" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                <div id="startat-step-c" className="flex items-center gap-2">
                                    <Button variant="primary" size="sm">New Report</Button>
                                    <Button variant="secondary" layout="outlined" size="sm">Export</Button>
                                    <Button variant="secondary" layout="outlined" size="sm">Filter</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {startAtSteps.map((_s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setStartAtIndex(i)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                    startAtIndex === i
                                        ? 'bg-blue-500 border-blue-500 text-white'
                                        : isDark
                                        ? 'border-gray-600 text-gray-400 hover:border-gray-400'
                                        : 'border-gray-300 text-gray-500 hover:border-gray-400'
                                }`}
                            >
                                Step {i + 1}
                            </button>
                        ))}
                    </div>

                    <div className={`rounded-lg px-4 py-3 text-sm ${cardBg}`}>
                        <span className={mutedText}>Starting from: </span>
                        <span className={cn('font-medium', headingText)}>
                            {startAtSteps[startAtIndex]?.title ?? `Step ${startAtIndex + 1}`}
                        </span>
                        <span className={` ml-2 text-xs ${mutedText}`}>(index {startAtIndex})</span>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="primary" layout="outlined" size="sm" onClick={() => setStartAtOpen(true)}>
                            Start from Step {startAtIndex + 1}
                        </Button>
                    </div>
                </div>

                {startAtOpen && (
                    <StepTour
                        steps={startAtSteps}
                        isOpen={startAtOpen}
                        onClose={() => setStartAtOpen(false)}
                        initialStep={startAtIndex}
                    />
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default StartAtStep;
