import React, { useState } from 'react';
import { TabPage, TabView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const homeIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const chartIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const settingsIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const userIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const bellIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const badgeIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const leftIconCode = `<TabView>
  <TabPage header="Home" leftIcon={<HomeIcon />}>Home</TabPage>
  <TabPage header="Analytics" leftIcon={<ChartIcon />}>Analytics</TabPage>
  <TabPage header="Settings" leftIcon={<SettingsIcon />}>Settings</TabPage>
</TabView>`;

const bothIconsCode = `<TabView>
  <TabPage header="Profile" leftIcon={<UserIcon />} rightIcon={<BadgeIcon />}>
    Profile
  </TabPage>
  <TabPage header="Notifications" leftIcon={<BellIcon />} rightIcon={<BadgeIcon />}>
    Notifications
  </TabPage>
</TabView>`;

const WithIcons: React.FC = () => {
    const [leftIdx, setLeftIdx] = useState(0);
    const [bothIdx, setBothIdx] = useState(0);
    const [disabledIdx, setDisabledIdx] = useState(0);

    return (
        <>
            <div className="space-y-6">
                <ComponentDemo title="Left Icons" description="SVG icons on the left side of tab headers">
                    <TabView activeIndex={leftIdx} onTabChange={(e) => setLeftIdx(e.index)}>
                        <TabPage header="Home" leftIcon={homeIcon}>
                            <div className="p-4">
                                <p>Welcome to the home page with a home icon.</p>
                            </div>
                        </TabPage>
                        <TabPage header="Analytics" leftIcon={chartIcon}>
                            <div className="p-4">
                                <p>View analytics data with a chart icon.</p>
                            </div>
                        </TabPage>
                        <TabPage header="Settings" leftIcon={settingsIcon}>
                            <div className="p-4">
                                <p>Configure your settings with a gear icon.</p>
                            </div>
                        </TabPage>
                    </TabView>
                </ComponentDemo>

                <ComponentDemo title="Left & Right Icons" description="Icons on both sides of tab headers">
                    <TabView activeIndex={bothIdx} onTabChange={(e) => setBothIdx(e.index)}>
                        <TabPage header="Profile" leftIcon={userIcon} rightIcon={badgeIcon}>
                            <div className="p-4">
                                <p>User profile with both left and right icons.</p>
                            </div>
                        </TabPage>
                        <TabPage header="Notifications" leftIcon={bellIcon} rightIcon={badgeIcon}>
                            <div className="p-4">
                                <p>Notifications with bell icon and badge indicator.</p>
                            </div>
                        </TabPage>
                        <TabPage header="Settings" leftIcon={settingsIcon}>
                            <div className="p-4">
                                <p>Settings with only a left icon.</p>
                            </div>
                        </TabPage>
                    </TabView>
                </ComponentDemo>

                <ComponentDemo title="With Disabled Tab" description="Tabs with icons and a disabled state">
                    <TabView activeIndex={disabledIdx} onTabChange={(e) => setDisabledIdx(e.index)}>
                        <TabPage header="Home" leftIcon={homeIcon}>
                            <div className="p-4"><p>Active tab content.</p></div>
                        </TabPage>
                        <TabPage header="Analytics" leftIcon={chartIcon}>
                            <div className="p-4"><p>Analytics content.</p></div>
                        </TabPage>
                        <TabPage header="Restricted" leftIcon={settingsIcon} disabled>
                            <div className="p-4"><p>This tab is disabled.</p></div>
                        </TabPage>
                    </TabView>
                </ComponentDemo>
            </div>
            <div className="mt-4 space-y-4">
                <CodeBlock code={leftIconCode} language="tsx" />
                <CodeBlock code={bothIconsCode} language="tsx" />
            </div>
        </>
    );
};

export default WithIcons;
