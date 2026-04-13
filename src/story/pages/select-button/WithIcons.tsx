import React, { useState } from 'react';
import { SelectButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { iconOptions } from './select-button-story-data';

const code = `const HeartIcon = (props) => (
  <svg {...props}>
    {/* icon path */}
  </svg>
);

const options = [
  { label: 'Heart', value: 'heart', icon: HeartIcon },
  { label: 'Star', value: 'star', icon: StarIcon },
  { label: 'Fire', value: 'fire', icon: FireIcon },
];

<SelectButton
  items={options}
  value={value}
  onChange={(e) => setValue(e.value)}
/>`;

const WithIcons: React.FC = () => {
    const [iconValue, setIconValue] = useState('heart');

    return (
        <>
            <ComponentDemo title="Buttons with Icons">
                <SelectButton items={iconOptions} value={iconValue} onChange={(e) => setIconValue(e.value)} />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default WithIcons;
