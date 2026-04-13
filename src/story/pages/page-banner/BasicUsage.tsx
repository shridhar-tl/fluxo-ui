import React from 'react';
import { PageBanner } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { PageBanner } from 'fluxo-ui';

<PageBanner type="info" message="This is an informational banner." />
<PageBanner type="success" message="Operation completed successfully!" />
<PageBanner type="warning" message="Please review before proceeding." />
<PageBanner type="error" message="Something went wrong. Please try again." />
<PageBanner type="default" message="This is a default banner." />`;

const BasicUsage: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Banner Types" description="PageBanner supports five types: info, success, warning, error, and default.">
                <div className="space-y-4">
                    <PageBanner
                        type="info"
                        message="This is an informational banner with helpful context for the user."
                        dismissible={false}
                    />
                    <PageBanner
                        type="success"
                        message="Operation completed successfully! Your changes have been saved."
                        dismissible={false}
                    />
                    <PageBanner
                        type="warning"
                        message="Please review your input before proceeding. Some fields may need attention."
                        dismissible={false}
                    />
                    <PageBanner
                        type="error"
                        message="Something went wrong while processing your request. Please try again."
                        dismissible={false}
                    />
                    <PageBanner type="default" message="This is a default banner for general-purpose messaging." dismissible={false} />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
