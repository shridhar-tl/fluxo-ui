import React, { useMemo, useState } from 'react';
import { Button, StepTour } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { callbackSteps, darkEventColor, lightEventColor, eventLabel } from './tour-story-data';
import type { LogEntry } from './tour-story-data';

const code = `const steps: TourStep[] = [
  {
    selector: '#feature-a',
    title: 'Feature A',
    content: 'This is Feature A.',
    onNext: () => analytics.track('tour_step_next', { step: 1 }),
    onSkip: () => analytics.track('tour_skip', { step: 1 }),
  },
  {
    selector: '#feature-b',
    title: 'Feature B',
    content: 'This is Feature B.',
    onPrev: () => analytics.track('tour_step_prev', { step: 2 }),
    onNext: () => analytics.track('tour_step_next', { step: 2 }),
  },
];`;

const StepCallbacks: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [cbOpen, setCbOpen] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);

    const mutedText = isDark ? 'text-gray-400' : 'text-gray-500';
    const tagBg = isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    const logBg = isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200';
    const eventColor = isDark ? darkEventColor : lightEventColor;

    const addLog = (step: number, event: LogEntry['event']) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLog((prev) => [{ step, event, time }, ...prev].slice(0, 20));
    };

    const trackedCallbackSteps = useMemo(() => callbackSteps.map((s, i) => ({
        ...s,
        onNext: () => setLog((prev) => [{ step: i + 1, event: 'next' as const, time: new Date().toLocaleTimeString('en-US', { hour12: false }) }, ...prev].slice(0, 20)),
        onPrev: () => setLog((prev) => [{ step: i + 1, event: 'prev' as const, time: new Date().toLocaleTimeString('en-US', { hour12: false }) }, ...prev].slice(0, 20)),
        onSkip: () => setLog((prev) => [{ step: i + 1, event: 'skip' as const, time: new Date().toLocaleTimeString('en-US', { hour12: false }) }, ...prev].slice(0, 20)),
    })), []);

    return (
        <>
            <ComponentDemo
                title="Per-step lifecycle callbacks"
                description="Start the tour and navigate between steps — live events appear in the log below."
                centered={false}
            >
                <div className="w-full space-y-4 p-2">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span id="cb-step-1" className={`px-3 py-1.5 rounded-full text-xs font-medium ${tagBg}`}>Step 1</span>
                        <span id="cb-step-2" className={`px-3 py-1.5 rounded-full text-xs font-medium ${tagBg}`}>Step 2</span>
                        <span id="cb-step-3" className={`px-3 py-1.5 rounded-full text-xs font-medium ${tagBg}`}>Step 3</span>
                        <div className="ml-auto flex items-center gap-2">
                            {log.length > 0 && (
                                <button
                                    className={`text-xs ${mutedText} hover:${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                                    onClick={() => setLog([])}
                                    type="button"
                                >
                                    Clear log
                                </button>
                            )}
                            <Button
                                variant="primary"
                                layout="outlined"
                                size="sm"
                                onClick={() => {
                                    setLog([]);
                                    setCbOpen(true);
                                }}
                            >
                                Start Tour
                            </Button>
                        </div>
                    </div>

                    <div className={`rounded-lg p-3 min-h-24 font-mono text-xs overflow-y-auto max-h-36 ${logBg}`}>
                        {log.length === 0 ? (
                            <span className={mutedText}>No events yet. Start the tour to see callbacks fire.</span>
                        ) : (
                            log.map((entry, i) => (
                                <div key={i} className="flex items-center gap-2 py-0.5">
                                    <span className={mutedText}>{entry.time}</span>
                                    <span className={`font-semibold ${eventColor[entry.event]}`}>
                                        {eventLabel[entry.event]}
                                    </span>
                                    <span className={mutedText}>— step {entry.step}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {cbOpen && (
                    <StepTour
                        steps={trackedCallbackSteps}
                        isOpen={cbOpen}
                        onClose={() => {
                            addLog(trackedCallbackSteps.length, 'done');
                            setCbOpen(false);
                        }}
                    />
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default StepCallbacks;
