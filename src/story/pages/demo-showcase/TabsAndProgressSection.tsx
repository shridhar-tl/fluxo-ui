import React, { useState } from 'react';
import { ProgressBar, TabPage, TabView } from '../../../components';
import type { TabViewVariant } from '../../../components';
import { Size } from '../../../types';

const variants: { label: string; variant: TabViewVariant }[] = [
    { label: 'Default', variant: 'default' },
    { label: 'Pills', variant: 'pills' },
    { label: 'Segment', variant: 'segment' },
    { label: 'Editor', variant: 'editor' },
];

const TabsAndProgressSection: React.FC<{ size?: Size }> = ({ size = 'md' }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<TabViewVariant>('default');

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2 opacity-80">Tab Style</label>
                <div className="flex gap-2 flex-wrap mb-4">
                    {variants.map(({ label, variant }) => (
                        <button
                            key={variant}
                            onClick={() => setSelectedVariant(variant)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                selectedVariant === variant
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'border-current opacity-50 hover:opacity-80'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <TabView variant={selectedVariant} activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                    <TabPage header="Overview">
                        <div className="p-4 space-y-4">
                            <h4 className="font-semibold">Project Overview</h4>
                            <p className="text-sm opacity-70">Track project completion across teams and milestones.</p>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Frontend</span><span>85%</span>
                                    </div>
                                    <ProgressBar size={size} value={85} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Backend</span><span>62%</span>
                                    </div>
                                    <ProgressBar size={size} value={62} variant="success" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Testing</span><span>40%</span>
                                    </div>
                                    <ProgressBar size={size} value={40} variant="warning" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Deployment</span><span>15%</span>
                                    </div>
                                    <ProgressBar size={size} value={15} variant="danger" />
                                </div>
                            </div>
                        </div>
                    </TabPage>
                    <TabPage header="Timeline">
                        <div className="p-4">
                            <h4 className="font-semibold mb-3">Recent Activity</h4>
                            <div className="space-y-3 text-sm">
                                {[
                                    { time: '2 hours ago', text: 'Alice deployed v2.3.1 to staging' },
                                    { time: '5 hours ago', text: 'Bob merged PR #142 — Auth refactor' },
                                    { time: 'Yesterday', text: 'Carol completed design review for Dashboard' },
                                    { time: '2 days ago', text: 'David resolved 3 critical bugs in API' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p>{item.text}</p>
                                            <p className="text-xs opacity-50">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabPage>
                    <TabPage header="Settings">
                        <div className="p-4">
                            <h4 className="font-semibold mb-2">Project Settings</h4>
                            <p className="text-sm opacity-70">Configure project-level preferences and integrations.</p>
                        </div>
                    </TabPage>
                </TabView>
            </div>
        </div>
    );
};

export default TabsAndProgressSection;
