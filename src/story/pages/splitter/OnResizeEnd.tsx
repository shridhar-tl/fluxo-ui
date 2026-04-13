import React, { useState } from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const [savedSize, setSavedSize] = useState<number | null>(null);

<Splitter
  style={{ height: '200px' }}
  onResizeEnd={(size) => {
    setSavedSize(size);
    localStorage.setItem('splitter-size', String(size));
  }}
>
  <SplitterPanel>
    <div className="p-4">Panel A</div>
  </SplitterPanel>
  <SplitterPanel>
    <div className="p-4">Panel B</div>
  </SplitterPanel>
</Splitter>`;

const OnResizeEnd: React.FC = () => {
    const [resizeLog, setResizeLog] = useState<number | null>(null);

    return (
        <>
            <ComponentDemo title="onResizeEnd — fires when drag ends">
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter style={{ height: '100%' }} onResizeEnd={(size) => setResizeLog(Math.round(size))}>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Drag me</p>
                                <p className="text-sm opacity-60">Release the gutter to fire the callback.</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Right Panel</p>
                                <p className="text-sm opacity-60">
                                    {resizeLog !== null
                                        ? `onResizeEnd → first panel: ${resizeLog}px`
                                        : 'Drag and release to see the callback value.'}
                                </p>
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

export default OnResizeEnd;
