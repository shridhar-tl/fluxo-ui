import cn from 'classnames';
import React, { useState } from 'react';
import { ToggleButton } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `import { ToggleButton } from 'ether-ui';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <ToggleButton
      checked={checked}
      onChange={(e) => setChecked(e.value)}
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [basicToggle, setBasicToggle] = useState(false);

    return (
        <>
            <ComponentDemo title="Default Toggle Button">
                <div className="flex flex-col items-center gap-4">
                    <ToggleButton checked={basicToggle} onChange={(e) => setBasicToggle(e.value)} />
                    <p className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>Current state: {basicToggle ? 'On' : 'Off'}</p>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
