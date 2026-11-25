import React from 'react';

import { ChipGroup } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { cuisineOptions } from './chip-story-data';

const code = `import { ChipGroup } from 'fluxo-ui';

<ChipGroup
    multiple
    defaultValue={['italian', 'thai']}
    options={[
        { value: 'italian', label: 'Italian' },
        { value: 'japanese', label: 'Japanese' },
        { value: 'thai', label: 'Thai' },
    ]}
    ariaLabel="Cuisine"
/>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Filter Chips" description="Toggle chips to refine a selection. Use arrow keys to move between chips.">
            <ChipGroup multiple defaultValue={['italian', 'thai']} options={cuisineOptions} color="primary" ariaLabel="Cuisine" />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
