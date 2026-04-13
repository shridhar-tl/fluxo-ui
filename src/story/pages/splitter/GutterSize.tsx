import cn from 'classnames';
import React, { useState } from 'react';
import { Splitter, SplitterPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<Splitter gutterSize={10} style={{ height: '200px' }}>
  <SplitterPanel>
    <div className="p-4">Left Panel</div>
  </SplitterPanel>
  <SplitterPanel>
    <div className="p-4">Right Panel</div>
  </SplitterPanel>
</Splitter>`;

const GutterSize: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [gutterSize, setGutterSize] = useState(4);

    return (
        <>
            <ComponentDemo title="gutterSize — drag the slider to change gutter thickness">
                <div className="flex items-center gap-4 mb-4">
                    <label className={cn('text-sm', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                        gutterSize: {gutterSize}px
                    </label>
                    <input
                        type="range"
                        min={2}
                        max={20}
                        value={gutterSize}
                        onChange={(e) => setGutterSize(Number(e.target.value))}
                        className="w-40"
                    />
                </div>
                <div className="h-48 w-full border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                    <Splitter gutterSize={gutterSize} style={{ height: '100%' }}>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Left Panel</p>
                                <p className="text-sm opacity-60">Adjust the slider above to change gutter thickness.</p>
                            </div>
                        </SplitterPanel>
                        <SplitterPanel>
                            <div className="h-full p-4">
                                <p className="font-semibold mb-1">Right Panel</p>
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

export default GutterSize;
