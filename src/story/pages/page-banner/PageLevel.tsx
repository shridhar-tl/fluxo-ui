import React, { useState } from 'react';
import { Button, PageBanner } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const pageLevelCode = `import { PageBanner } from 'ether-ui';

<PageBanner
  type="error"
  message="Service maintenance scheduled for tonight."
  pageLevel
  onDismiss={() => setVisible(false)}
/>`;

const borderedCode = `import { PageBanner } from 'ether-ui';

<PageBanner
  type="info"
  message="Bordered banner with a left accent."
  bordered
/>`;

const PageLevel: React.FC = () => {
    const [pageLevelVisible, setPageLevelVisible] = useState(false);
    const [pageLevelType, setPageLevelType] = useState<'info' | 'success' | 'warning' | 'error'>('error');

    return (
        <>
            <ComponentDemo title="Page-Level Banner" description="Page-level banners use createPortal to render at the top of the page, above all other content.">
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="primary"
                        onClick={() => { setPageLevelType('error'); setPageLevelVisible(true); }}
                    >
                        Show Error Banner
                    </Button>
                    <Button
                        variant="primary"
                        layout="outlined"
                        onClick={() => { setPageLevelType('warning'); setPageLevelVisible(true); }}
                    >
                        Show Warning Banner
                    </Button>
                    <Button
                        variant="primary"
                        layout="outlined"
                        onClick={() => { setPageLevelType('info'); setPageLevelVisible(true); }}
                    >
                        Show Info Banner
                    </Button>
                    <Button
                        variant="primary"
                        layout="outlined"
                        onClick={() => { setPageLevelType('success'); setPageLevelVisible(true); }}
                    >
                        Show Success Banner
                    </Button>
                </div>
                {pageLevelVisible && (
                    <PageBanner
                        type={pageLevelType}
                        title="Page-Level Notification"
                        message="This banner is rendered via createPortal at the top of the page body."
                        pageLevel
                        visible={pageLevelVisible}
                        onDismiss={() => setPageLevelVisible(false)}
                    />
                )}
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={pageLevelCode} language="tsx" />
            </div>

            <ComponentDemo title="Bordered Banner" description="Add a left border accent using the bordered prop.">
                <div className="space-y-4">
                    <PageBanner
                        type="info"
                        message="Bordered info banner with a left accent line."
                        bordered
                        dismissible={false}
                    />
                    <PageBanner
                        type="success"
                        message="Bordered success banner with a left accent line."
                        bordered
                        dismissible={false}
                    />
                    <PageBanner
                        type="warning"
                        message="Bordered warning banner with a left accent line."
                        bordered
                        dismissible={false}
                    />
                    <PageBanner
                        type="error"
                        message="Bordered error banner with a left accent line."
                        bordered
                        dismissible={false}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={borderedCode} language="tsx" />
            </div>
        </>
    );
};

export default PageLevel;
