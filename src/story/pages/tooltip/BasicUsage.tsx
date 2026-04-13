import React from 'react';
import { Button, showTooltip, hideTooltip } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { showTooltip, hideTooltip } from 'ether-ui';

<Button
  onMouseEnter={(e) => showTooltip(e, 'Hello, I am a tooltip!')}
  onMouseLeave={() => hideTooltip({ timeout: 0 })}
>
  Hover me
</Button>`;

const BasicUsage: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Simple string tooltip">
                <Button
                    variant="primary"
                    onMouseEnter={(e) => showTooltip(e, 'Hello, I am a tooltip!')}
                    onMouseLeave={() => hideTooltip({ timeout: 0 })}
                >
                    Hover me
                </Button>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default BasicUsage;
