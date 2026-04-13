import React from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Splitter style={{ height: '300px' }}>
  <SplitterPanel defaultSize="200px">
    <div className="p-4">Sidebar</div>
  </SplitterPanel>
  <SplitterPanel>
    <Splitter layout="vertical" style={{ height: '100%' }}>
      <SplitterPanel>
        <div className="p-4">Editor</div>
      </SplitterPanel>
      <SplitterPanel defaultSize="100px">
        <div className="p-4">Terminal</div>
      </SplitterPanel>
    </Splitter>
  </SplitterPanel>
</Splitter>`;

const NestedSplitters: React.FC = () => {
    return (
        <>
            <ComponentDemo title="IDE-style layout — sidebar + editor + terminal">
                <div className="h-64 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter style={{ height: '100%' }}>
                        <SplitterPanel defaultSize="200px">
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Sidebar</p>
                                <p className="text-sm opacity-60">File explorer</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel>
                            <Splitter layout="vertical" style={{ height: '100%' }}>
                                <SplitterPanel>
                                    <div className="h-full p-4">
                                        <p className="font-semibold mb-1">Editor</p>
                                        <p className="text-sm opacity-60">Main editor area</p>
                                    </div>
                                </SplitterPanel>
                                <SplitterPanel defaultSize="100px">
                                    <div className="h-full p-4">
                                        <p className="font-semibold mb-1">Terminal</p>
                                        <p className="text-sm opacity-60">Output panel</p>
                                    </div>
                                </SplitterPanel>
                            </Splitter>
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

export default NestedSplitters;
