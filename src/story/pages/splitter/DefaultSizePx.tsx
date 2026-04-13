import React from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Splitter style={{ height: '200px' }}>
  <SplitterPanel defaultSize="280px">
    <div className="p-4">Sidebar — starts at 280px</div>
  </SplitterPanel>
  <SplitterPanel>
    <div className="p-4">Content Area</div>
  </SplitterPanel>
</Splitter>`;

const DefaultSizePx: React.FC = () => {
    return (
        <>
            <ComponentDemo title="defaultSize='280px' on first panel">
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter style={{ height: '100%' }}>
                        <SplitterPanel defaultSize="280px">
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Sidebar</p>
                                <p className="text-sm opacity-60">Starts at 280 px wide.</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Content Area</p>
                                <p className="text-sm opacity-60">Expands to fill the remaining width.</p>
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

export default DefaultSizePx;
