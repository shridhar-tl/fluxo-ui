import React, { useState } from 'react';
import { Chips } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicUsageCode } from './chips-story-data';

const BasicUsage: React.FC = () => {
    const [basicChips, setBasicChips] = useState(['React', 'TypeScript']);
    const [customChips, setCustomChips] = useState(['Apple', 'Banana', 'Cherry']);

    return (
        <>
            <div className="grid gap-8">
                <ComponentDemo title="Basic Chips" description="Simple chips with add and remove functionality">
                    <div className="w-full max-w-96">
                        <Chips value={basicChips} placeholder="Add programming languages..." onChange={(e) => setBasicChips(e.value)} />
                    </div>
                </ComponentDemo>

                <ComponentDemo title="Fruit Tags" description="Chips with custom placeholder and preset values">
                    <div className="w-full max-w-96">
                        <Chips value={customChips} placeholder="Add fruits..." onChange={(e) => setCustomChips(e.value)} />
                    </div>
                </ComponentDemo>
            </div>

            <div className="mt-4">
                <CodeBlock code={basicUsageCode} language="typescript" />
            </div>
        </>
    );
};

export default BasicUsage;
