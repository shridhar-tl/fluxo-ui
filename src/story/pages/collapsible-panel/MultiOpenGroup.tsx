import React from 'react';
import { CollapsiblePanel, CollapsiblePanelGroup } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CollapsiblePanelGroup variant="separated" defaultOpenKeys={['m-1', 'm-2']}>
  <CollapsiblePanel id="m-1" title="Panel A">...</CollapsiblePanel>
  <CollapsiblePanel id="m-2" title="Panel B">...</CollapsiblePanel>
  <CollapsiblePanel id="m-3" title="Panel C">...</CollapsiblePanel>
</CollapsiblePanelGroup>`;

const MultiOpenGroup: React.FC = () => (
    <>
        <ComponentDemo title="Multi-Open Group" centered={false}>
            <div className="w-full">
                <CollapsiblePanelGroup variant="separated" defaultOpenKeys={['mo-a', 'mo-b']}>
                    <CollapsiblePanel id="mo-a" title="Database Configuration" subtitle="Connection strings, pooling, and timeouts">
                        <p className="text-sm leading-relaxed">
                            Configure your primary and replica database connections. Connection pool size defaults to 10
                            with a 30-second idle timeout.
                        </p>
                    </CollapsiblePanel>
                    <CollapsiblePanel id="mo-b" title="Cache Layer" subtitle="Redis and in-memory cache settings">
                        <p className="text-sm leading-relaxed">
                            Redis cluster mode is enabled by default. In-memory cache uses LRU eviction with a 256 MB cap.
                        </p>
                    </CollapsiblePanel>
                    <CollapsiblePanel id="mo-c" title="Message Queue" subtitle="Kafka topics and consumer groups">
                        <p className="text-sm leading-relaxed">
                            Topics auto-create is disabled in production. Consumer group rebalance strategy is cooperative-sticky.
                        </p>
                    </CollapsiblePanel>
                </CollapsiblePanelGroup>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} />
        </div>
    </>
);

export default MultiOpenGroup;
