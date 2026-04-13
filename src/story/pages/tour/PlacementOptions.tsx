import cn from 'classnames';
import React, { useState } from 'react';
import { Button, StepTour } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { placementSteps } from './tour-story-data';

const code = `const steps: TourStep[] = [
  { selector: '#el-top',    title: 'Top',    content: '...', placement: 'top'    },
  { selector: '#el-bottom', title: 'Bottom', content: '...', placement: 'bottom' },
  { selector: '#el-left',   title: 'Left',   content: '...', placement: 'left'   },
  { selector: '#el-right',  title: 'Right',  content: '...', placement: 'right'  },
];

// The tooltip falls back gracefully when the viewport has insufficient space.`;

const PlacementOptions: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [placementOpen, setPlacementOpen] = useState(false);

    const headingText = isDark ? 'text-gray-100' : 'text-gray-900';
    const cardBg = isDark ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm';
    const tagBg = isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';

    return (
        <>
            <ComponentDemo
                title="Tooltip placements — top · bottom · left · right"
                description="Tour through the four placement variants. Watch the tooltip anchor to each side."
                centered={false}
            >
                <div className="w-full p-4">
                    <div className="grid grid-cols-3 gap-4 place-items-center">
                        <div />
                        <div id="placement-top" className={cn(`px-4 py-2 rounded-lg text-sm font-medium text-center ${cardBg}`, headingText)}>Top</div>
                        <div />

                        <div id="placement-left" className={cn(`px-4 py-2 rounded-lg text-sm font-medium text-center ${cardBg}`, headingText)}>Left</div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${tagBg} text-xl`}>🎯</div>
                        <div id="placement-right" className={cn(`px-4 py-2 rounded-lg text-sm font-medium text-center ${cardBg}`, headingText)}>Right</div>

                        <div />
                        <div id="placement-bottom" className={cn(`px-4 py-2 rounded-lg text-sm font-medium text-center ${cardBg}`, headingText)}>Bottom</div>
                        <div />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Button variant="primary" layout="outlined" size="sm" onClick={() => setPlacementOpen(true)}>
                            Start Placement Tour
                        </Button>
                    </div>
                </div>

                {placementOpen && (
                    <StepTour steps={placementSteps} isOpen={placementOpen} onClose={() => setPlacementOpen(false)} />
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default PlacementOptions;
