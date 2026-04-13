import React from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Splitter style={{ height: '200px' }}>
  <SplitterPanel defaultSize="200px" fixed>
    <div className="p-4">Fixed (200px) — cannot be resized</div>
  </SplitterPanel>
  <SplitterPanel>
    <div className="p-4">Fluid Panel</div>
  </SplitterPanel>
</Splitter>`;

const FixedPanel: React.FC = () => {
    return (
        <>
            <ComponentDemo title="fixed panel — cannot be resized">
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter style={{ height: '100%' }}>
                        <SplitterPanel defaultSize="200px" fixed>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Fixed (200px)</p>
                                <p className="text-sm opacity-60">This panel is locked and cannot be resized.</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Fluid Panel</p>
                                <p className="text-sm opacity-60">Fills all remaining space.</p>
                            </div>
                        </SplitterPanel>
                    </Splitter>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default FixedPanel;
