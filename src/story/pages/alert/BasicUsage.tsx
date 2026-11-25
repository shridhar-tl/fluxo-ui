import React from 'react';

import { Alert } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { stackStyle } from '../../demo-styles';
import { alertTypes } from './alert-story-data';

const code = `import { Alert } from 'fluxo-ui';

<Alert type="info" title="Scheduled maintenance" description="The dashboard will be read-only on Sunday." />
<Alert type="success" title="Payment received" description="Invoice #4821 has been paid." />
<Alert type="warning" title="Storage almost full" description="You have used 92% of your storage." />
<Alert type="error" title="Deployment failed" description="The build step exited with code 1." />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Alert Types" description="Each type has its own icon, color and an appropriate ARIA role.">
            <div style={stackStyle}>
                {alertTypes.map((alert) => (
                    <Alert key={alert.type} type={alert.type} title={alert.title} description={alert.description} />
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
