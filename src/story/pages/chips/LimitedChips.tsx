import React from 'react';
import { Chips } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { advancedUsageCode } from './chips-story-data';

const LimitedChips: React.FC = () => {
    return (
        <>
            <div className="grid gap-8">
                <ComponentDemo title="Limited Chips" description="Maximum 3 chips allowed">
                    <div className="w-full max-w-96">
                        <Chips value={[]} placeholder="Max 3 items..." maxItems={3} onChange={(e) => console.log('Changed:', e.value)} />
                    </div>
                </ComponentDemo>

                <ComponentDemo title="Non-removable Chips" description="Chips that cannot be removed">
                    <div className="w-full max-w-96">
                        <Chips
                            value={['Fixed', 'Tags', 'Here']}
                            placeholder="Add more (but can't remove existing)..."
                            onChange={(e) => console.log('Changed:', e.value)}
                        />
                    </div>
                </ComponentDemo>
            </div>

            <div className="mt-4">
                <CodeBlock code={advancedUsageCode} language="typescript" />
            </div>
        </>
    );
};

export default LimitedChips;
