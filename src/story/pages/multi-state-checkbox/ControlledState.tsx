import React, { useState } from 'react';
import { Button, MultiStateCheckbox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicStates } from './multi-state-checkbox-story-data';

const code = `import { MultiStateCheckbox, Button } from 'ether-ui';

function MyComponent() {
  const [value, setValue] = useState(null);

  return (
    <div>
      <MultiStateCheckbox
        items={states}
        value={value}
        onChange={(e) => setValue(e.value)}
      />
      <Button label="Reset" onClick={() => setValue(null)} />
      <MultiStateCheckbox
        items={states}
        value={value}
        disabled
      />
    </div>
  );
}`;

const ControlledState: React.FC = () => {
    const [value, setValue] = useState<string | null>(null);

    return (
        <>
            <ComponentDemo title="Controlled & Disabled States">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-500">Controlled</span>
                        <div className="flex items-center gap-4 flex-wrap">
                            <MultiStateCheckbox
                                items={basicStates}
                                value={value}
                                onChange={(e) => setValue(e.value)}
                            />
                            <Button
                                label="Reset"
                                variant="secondary"
                                size="sm"
                                onClick={() => setValue(null)}
                            />
                        </div>
                        <p className="text-sm text-gray-500">
                            Current value: <strong>{value === null ? 'null' : String(value)}</strong>
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-500">Disabled</span>
                        <MultiStateCheckbox
                            items={basicStates}
                            value="yes"
                            disabled
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Controlled & Disabled Example" code={code} />
            </div>
        </>
    );
};

export default ControlledState;
