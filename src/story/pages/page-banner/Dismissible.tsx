import React, { useCallback, useState } from 'react';
import { Button, PageBanner } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const dismissibleCode = `import { PageBanner } from 'fluxo-ui';

const [visible, setVisible] = useState(true);

<PageBanner
  type="info"
  message="Click the X to dismiss this banner."
  dismissible
  visible={visible}
  onDismiss={() => setVisible(false)}
/>`;

const autoDismissCode = `import { PageBanner } from 'fluxo-ui';

<PageBanner
  type="success"
  message="This banner will auto-dismiss in 5 seconds."
  autoDismiss={5000}
  onDismiss={() => console.log('Dismissed!')}
/>`;

const Dismissible: React.FC = () => {
    const [dismissibleVisible, setDismissibleVisible] = useState(true);
    const [autoVisible, setAutoVisible] = useState(true);
    const [nonDismissibleKey] = useState(0);

    const resetDismissible = useCallback(() => {
        setDismissibleVisible(true);
    }, []);

    const resetAuto = useCallback(() => {
        setAutoVisible(false);
        setTimeout(() => setAutoVisible(true), 100);
    }, []);

    return (
        <>
            <ComponentDemo title="Dismissible Banner" description="Banners can be dismissed by clicking the close button.">
                <div className="space-y-4">
                    <PageBanner
                        type="info"
                        message="Click the X button to dismiss this banner."
                        dismissible
                        visible={dismissibleVisible}
                        onDismiss={() => setDismissibleVisible(false)}
                    />
                    {!dismissibleVisible && (
                        <Button variant="primary" size="sm" onClick={resetDismissible}>
                            Show Again
                        </Button>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={dismissibleCode} language="tsx" />
            </div>

            <ComponentDemo title="Auto-Dismiss" description="Banners can auto-dismiss after a set duration with a progress bar indicator.">
                <div className="space-y-4">
                    {autoVisible && (
                        <PageBanner
                            type="success"
                            message="This banner will auto-dismiss in 5 seconds. Watch the progress bar!"
                            autoDismiss={5000}
                            onDismiss={() => setAutoVisible(false)}
                        />
                    )}
                    {!autoVisible && (
                        <Button variant="primary" size="sm" onClick={resetAuto}>
                            Trigger Auto-Dismiss Banner
                        </Button>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={autoDismissCode} language="tsx" />
            </div>

            <ComponentDemo title="Non-Dismissible" description="Set dismissible to false to prevent the user from closing the banner.">
                <PageBanner
                    key={nonDismissibleKey}
                    type="warning"
                    message="This banner cannot be dismissed by the user. It remains visible until programmatically hidden."
                    dismissible={false}
                />
            </ComponentDemo>
        </>
    );
};

export default Dismissible;
