import React from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Splitter style={{ height: '200px' }}>
  <SplitterPanel defaultSize="30%">
    <div className="p-4">30% Panel</div>
  </SplitterPanel>
  <SplitterPanel>
    <div className="p-4">70% Panel</div>
  </SplitterPanel>
</Splitter>`;

const DefaultSizePct: React.FC = () => {
    return (
        <>
            <ComponentDemo title="defaultSize='30%' on first panel">
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter style={{ height: '100%' }}>
                        <SplitterPanel defaultSize="30%">
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">30% Panel</p>
                                <p className="text-sm opacity-60">Starts at 30% of container width.</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">70% Panel</p>
                                <p className="text-sm opacity-60">Fills the remaining 70%.</p>
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

export default DefaultSizePct;
