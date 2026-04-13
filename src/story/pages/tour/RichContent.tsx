import cn from 'classnames';
import React, { useMemo, useState } from 'react';
import { Button, StepTour } from '../../../components';
import { TourStep } from '../../../components/tour/types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `const steps: TourStep[] = [
  {
    selector: '#export-button',
    title: '🚀 New Feature',
    content: (
      <div className="space-y-2 text-sm">
        <p>This powerful feature lets you:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-500">
          <li>Export data in multiple formats</li>
          <li>Schedule automated reports</li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },
  {
    selector: '#config-panel',
    title: '⚙️ Configuration',
    content: (
      <div className="space-y-2 text-sm">
        <p>Configure this panel to match your workflow.</p>
        <div className="p-2 rounded bg-yellow-50 text-yellow-800 text-xs">
          Tip: Changes are saved automatically.
        </div>
      </div>
    ),
    placement: 'right',
  },
];`;

const RichContent: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [richOpen, setRichOpen] = useState(false);

    const mutedText = isDark ? 'text-gray-400' : 'text-gray-500';
    const headingText = isDark ? 'text-gray-100' : 'text-gray-900';
    const cardBg = isDark ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm';
    const listItemText = isDark ? 'text-gray-400' : 'text-gray-600';
    const tipBox = isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-800';
    const statusText = isDark ? 'text-green-400' : 'text-green-700';

    const richContentSteps: TourStep[] = useMemo(() => [
        {
            selector: '#rich-feature-a',
            title: '🚀 New Feature',
            content: (
                <div className="space-y-2 text-sm">
                    <p>This powerful feature lets you:</p>
                    <ul className={`list-disc list-inside space-y-1 ${listItemText}`}>
                        <li>Export data in multiple formats</li>
                        <li>Schedule automated reports</li>
                        <li>Share with your team instantly</li>
                    </ul>
                </div>
            ),
            placement: 'bottom',
        },
        {
            selector: '#rich-feature-b',
            title: '⚙️ Configuration',
            content: (
                <div className="space-y-2 text-sm">
                    <p>Configure this panel to match your workflow.</p>
                    <div className={`mt-2 p-2 rounded text-xs ${tipBox}`}>
                        Tip: Changes are saved automatically.
                    </div>
                </div>
            ),
            placement: 'right',
        },
        {
            selector: '#rich-feature-c',
            title: "✅ You're Ready",
            content: (
                <div className="space-y-2 text-sm">
                    <p>You have completed setup. Your workspace is ready to use.</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        <span className={`font-medium ${statusText}`}>All systems operational</span>
                    </div>
                </div>
            ),
            placement: 'top',
        },
    ], [listItemText, tipBox, statusText]);

    return (
        <>
            <ComponentDemo
                title="Steps with rich JSX content"
                description="Tour steps can contain lists, callouts, icons, and styled elements."
                centered={false}
            >
                <div className="w-full space-y-3 p-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div id="rich-feature-a" className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${cardBg}`}>
                            <span className="text-lg">📤</span>
                            <div>
                                <div className={cn('text-sm font-medium', headingText)}>Export</div>
                                <div className={`text-xs ${mutedText}`}>Multi-format export</div>
                            </div>
                        </div>

                        <div id="rich-feature-b" className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${cardBg}`}>
                            <span className="text-lg">⚙️</span>
                            <div>
                                <div className={cn('text-sm font-medium', headingText)}>Configure</div>
                                <div className={`text-xs ${mutedText}`}>Auto-saved settings</div>
                            </div>
                        </div>

                        <div id="rich-feature-c" className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${cardBg}`}>
                            <span className="text-lg">✅</span>
                            <div>
                                <div className={cn('text-sm font-medium', headingText)}>Status</div>
                                <div className="text-xs text-green-500">All systems go</div>
                            </div>
                        </div>

                        <div className="ml-auto">
                            <Button variant="primary" layout="outlined" size="sm" onClick={() => setRichOpen(true)}>
                                Start Tour
                            </Button>
                        </div>
                    </div>
                </div>

                {richOpen && (
                    <StepTour steps={richContentSteps} isOpen={richOpen} onClose={() => setRichOpen(false)} />
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default RichContent;
