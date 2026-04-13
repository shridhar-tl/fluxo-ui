import React, { useState } from 'react';
import { Checkbox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Checkbox } from 'fluxo-ui';

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      checked={checked}
      onChange={(e) => setChecked(e.value)}
      label="I agree to the terms and conditions"
    />
  );
}`;

const BasicUsage: React.FC = () => {
    const [basicChecked, setBasicChecked] = useState(false);

    return (
        <>
            <ComponentDemo title="Basic Checkbox">
                <div className="space-y-4">
                    <Checkbox
                        checked={basicChecked}
                        onChange={(e) => setBasicChecked(e.value)}
                        label="I agree to the terms and conditions"
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Basic Example" code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
