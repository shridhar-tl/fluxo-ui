import React from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Splitter, SplitterPanel } from 'ether-ui';

<Splitter style={{ height: '200px' }}>
  <SplitterPanel>
    <div className="p-4">Left Panel</div>
  </SplitterPanel>
  <SplitterPanel>
    <div className="p-4">Right Panel</div>
  </SplitterPanel>
</Splitter>`;

const HorizontalSplit: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Horizontal Split">
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter style={{ height: '100%' }}>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Left Panel</p>
                                <p className="text-sm opacity-60">Drag the gutter to resize horizontally.</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Right Panel</p>
                                <p className="text-sm opacity-60">Fills the remaining space automatically.</p>
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

export default HorizontalSplit;
