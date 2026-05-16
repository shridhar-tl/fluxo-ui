import React from 'react';
import { PullToRefresh } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const code = `<PullToRefresh
    threshold={90}
    maxPull={160}
    refreshingText="Syncing your inbox…"
    pullingText="Keep pulling"
    releaseText="Release to sync"
    onRefresh={sync}
>{...}</PullToRefresh>`;

const CustomThresholds: React.FC = () => (
    <>
        <ComponentDemo title="Custom thresholds & labels" description="Raise the threshold to require a longer pull, cap the maxPull travel, and customize each indicator label.">
            <div style={{
                width: '100%',
                height: 220,
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--eui-bg-subtle)',
            }}>
                <PullToRefresh
                    threshold={90}
                    maxPull={160}
                    refreshingText="Syncing your inbox…"
                    pullingText="Keep pulling"
                    releaseText="Release to sync"
                    onRefresh={() => wait(1400)}
                >
                    <div style={{ padding: 16, color: 'var(--eui-text)' }}>
                        Pull at least 90px to trigger. Try a fast flick to see velocity-based dismissal.
                    </div>
                </PullToRefresh>
            </div>
        </ComponentDemo>
        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default CustomThresholds;
