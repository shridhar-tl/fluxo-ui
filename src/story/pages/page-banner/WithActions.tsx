import React, { useState } from 'react';
import { Button, PageBanner } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { PageBanner, Button } from 'fluxo-ui';

<PageBanner
  type="warning"
  title="Update Available"
  message="A new version is available."
  actions={
    <div className="flex gap-2">
      <Button size="sm" variant="primary">Update Now</Button>
      <Button size="sm" variant="default">Later</Button>
    </div>
  }
/>`;

const WithActions: React.FC = () => {
    const [updateVisible, setUpdateVisible] = useState(true);
    const [cookieVisible, setCookieVisible] = useState(true);
    const [trialVisible, setTrialVisible] = useState(true);

    return (
        <>
            <ComponentDemo
                title="Banner with Actions"
                description="Add action buttons using the actions prop to let users take immediate action."
            >
                <div className="space-y-4">
                    {updateVisible && (
                        <PageBanner
                            type="warning"
                            title="Update Available"
                            message="A new version of the application is available. Update now to get the latest features and security fixes."
                            actions={
                                <div className="flex gap-2">
                                    <Button size="sm" variant="primary" onClick={() => setUpdateVisible(false)}>
                                        Update Now
                                    </Button>
                                    <Button size="sm" variant="default" onClick={() => setUpdateVisible(false)}>
                                        Later
                                    </Button>
                                </div>
                            }
                            onDismiss={() => setUpdateVisible(false)}
                        />
                    )}

                    {cookieVisible && (
                        <PageBanner
                            type="info"
                            title="Cookie Consent"
                            message="We use cookies to enhance your browsing experience. By continuing, you agree to our cookie policy."
                            actions={
                                <div className="flex gap-2">
                                    <Button size="sm" variant="primary" onClick={() => setCookieVisible(false)}>
                                        Accept All
                                    </Button>
                                    <Button size="sm" variant="default" layout="outlined" onClick={() => setCookieVisible(false)}>
                                        Customize
                                    </Button>
                                </div>
                            }
                            onDismiss={() => setCookieVisible(false)}
                        />
                    )}

                    {trialVisible && (
                        <PageBanner
                            type="error"
                            title="Trial Expired"
                            message="Your free trial has ended. Upgrade to continue using premium features."
                            dismissible={false}
                            actions={
                                <Button size="sm" variant="primary" onClick={() => setTrialVisible(false)}>
                                    Upgrade Now
                                </Button>
                            }
                        />
                    )}

                    {(!updateVisible || !cookieVisible || !trialVisible) && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                setUpdateVisible(true);
                                setCookieVisible(true);
                                setTrialVisible(true);
                            }}
                        >
                            Reset All Banners
                        </Button>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default WithActions;
