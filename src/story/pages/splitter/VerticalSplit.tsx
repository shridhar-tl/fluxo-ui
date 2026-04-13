import React from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Splitter layout="vertical" style={{ height: '300px' }}>
  <SplitterPanel>
    <div className="p-4">Top Panel</div>
  </SplitterPanel>
  <SplitterPanel>
    <div className="p-4">Bottom Panel</div>
  </SplitterPanel>
</Splitter>`;

const VerticalSplit: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Vertical Split">
                <div className="h-64 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter layout="vertical" style={{ height: '100%' }}>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Top Panel</p>
                                <p className="text-sm opacity-60">Drag the horizontal gutter to resize.</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Bottom Panel</p>
                                <p className="text-sm opacity-60">Fills the remaining vertical space.</p>
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

export default VerticalSplit;
