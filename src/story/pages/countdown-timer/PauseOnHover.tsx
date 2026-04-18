import React from 'react';
import { CountdownTimer } from '../../../components/CountdownTimer';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `// Pauses automatically while the user hovers over the timer
<CountdownTimer
  duration={60}
  variant="circular"
  pauseOnHover={true}
/>`;

const PauseOnHover: React.FC = () => (
    <>
        <ComponentDemo
            title="Pause on Hover"
            description="Hover over the timer to pause it automatically — useful in interactive UIs where the user might need a moment."
        >
            <CountdownTimer
                duration={60}
                variant="circular"
                size="md"
                pauseOnHover
            />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default PauseOnHover;
