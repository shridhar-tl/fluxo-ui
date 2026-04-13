import cn from 'classnames';
import React, { useState } from 'react';
import { Stepper } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { detailedSteps } from './stepper-story-data';

const code = `import { Stepper } from 'fluxo-ui';

const steps = [
  { label: 'Account Setup', description: 'Create your account credentials' },
  { label: 'Personal Info', description: 'Fill in your personal details' },
  { label: 'Preferences', description: 'Customize your experience', optional: true },
  { label: 'Confirmation', description: 'Review and confirm' },
];

<Stepper steps={steps} activeStep={1} />`;

const BasicUsage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [active, setActive] = useState(1);

    return (
        <>
            <ComponentDemo title="Basic Stepper" description="Simple numbered stepper with descriptions" centered={false}>
                <div className="w-full p-4">
                    <Stepper steps={detailedSteps} activeStep={active} />
                    <div className="flex gap-3 mt-6 justify-center">
                        <button
                            className={cn('px-3 py-1.5 text-sm rounded-md', {
                                'bg-gray-700 text-gray-200': isDark,
                                'bg-gray-200 text-gray-700': !isDark,
                            })}
                            onClick={() => setActive(Math.max(0, active - 1))}
                        >
                            Back
                        </button>
                        <button
                            className="px-3 py-1.5 text-sm rounded-md bg-blue-500 text-white"
                            onClick={() => setActive(Math.min(detailedSteps.length - 1, active + 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
