import React from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Splitter style={{ height: '200px' }}>
  <SplitterPanel minSize="150px">
    <div className="p-4">Min 150px</div>
  </SplitterPanel>
  <SplitterPanel minSize="20%">
    <div className="p-4">Min 20%</div>
  </SplitterPanel>
</Splitter>`;

const MinSize: React.FC = () => {
    return (
        <>
            <ComponentDemo title="minSize='150px' and minSize='20%'">
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter style={{ height: '100%' }}>
                        <SplitterPanel minSize="150px">
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Min 150px</p>
                                <p className="text-sm opacity-60">Cannot collapse below 150 px.</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel minSize="20%">
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Min 20%</p>
                                <p className="text-sm opacity-60">Cannot collapse below 20% of container width.</p>
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

export default MinSize;
