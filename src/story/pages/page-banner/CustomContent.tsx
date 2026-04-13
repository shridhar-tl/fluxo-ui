import React from 'react';
import { PageBanner } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { PageBanner } from 'fluxo-ui';

<PageBanner
  type="info"
  title="Custom Title"
  message={<span>Rich <strong>HTML</strong> content in the message.</span>}
  icon={<CustomIcon />}
/>

<PageBanner
  type="success"
  message="Banner without an icon."
  showIcon={false}
/>`;

const rocketIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
);

const shieldIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const bellIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);

const CustomContent: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Custom Icons"
                description="Provide a custom icon via the icon prop to replace the default type-based icon."
            >
                <div className="space-y-4">
                    <PageBanner
                        type="info"
                        title="New Feature Available"
                        message="We just launched a brand-new dashboard with real-time analytics. Check it out!"
                        icon={rocketIcon}
                        dismissible={false}
                    />
                    <PageBanner
                        type="success"
                        title="Security Verified"
                        message="Your account has been verified and all security checks have passed."
                        icon={shieldIcon}
                        dismissible={false}
                    />
                    <PageBanner
                        type="warning"
                        title="Reminder"
                        message="You have 3 unread notifications waiting for your attention."
                        icon={bellIcon}
                        dismissible={false}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>

            <ComponentDemo title="Rich Message Content" description="The message prop accepts ReactNode, allowing rich HTML content.">
                <div className="space-y-4">
                    <PageBanner
                        type="info"
                        title="Scheduled Maintenance"
                        message={
                            <span>
                                Our servers will undergo maintenance on <strong>April 15, 2026</strong> from
                                <strong> 2:00 AM</strong> to <strong>4:00 AM UTC</strong>. Please save your work beforehand.
                            </span>
                        }
                        dismissible={false}
                    />
                    <PageBanner
                        type="error"
                        message={
                            <span>
                                Failed to connect to the database. Please check your{' '}
                                <a href="#" className="underline font-semibold">
                                    connection settings
                                </a>{' '}
                                or contact{' '}
                                <a href="#" className="underline font-semibold">
                                    support
                                </a>
                                .
                            </span>
                        }
                        dismissible={false}
                    />
                </div>
            </ComponentDemo>

            <ComponentDemo title="Without Icon" description="Set showIcon to false to hide the icon entirely.">
                <div className="space-y-4">
                    <PageBanner type="default" message="A simple text-only banner without any icon." showIcon={false} dismissible={false} />
                    <PageBanner
                        type="success"
                        title="Minimal Success"
                        message="Sometimes less is more. No icon, just the message."
                        showIcon={false}
                        dismissible={false}
                    />
                </div>
            </ComponentDemo>

            <ComponentDemo title="With Title" description="Add a title to give the banner a bold heading above the message.">
                <div className="space-y-4">
                    <PageBanner
                        type="info"
                        title="Did You Know?"
                        message="You can customize the appearance of banners using the type, bordered, and className props."
                        dismissible={false}
                    />
                    <PageBanner
                        type="error"
                        title="Payment Failed"
                        message="Your payment could not be processed. Please update your billing information and try again."
                        dismissible={false}
                        bordered
                    />
                </div>
            </ComponentDemo>
        </>
    );
};

export default CustomContent;
