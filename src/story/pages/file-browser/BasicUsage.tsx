import React, { useState } from 'react';
import { Button, FileBrowser } from '../../../components';
import type { FileBrowserView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { sampleFiles } from './file-browser-story-data';

const code = `import { FileBrowser } from 'fluxo-ui';
import type { FileBrowserItem, FileBrowserView } from 'fluxo-ui';

const [selected, setSelected] = useState<string[]>([]);
const [view, setView] = useState<FileBrowserView>('thumbnail');

<FileBrowser
    items={files}
    view={view}
    onViewChange={setView}
    showViewSwitcher
    selectedIds={selected}
    onSelectionChange={setSelected}
    videoPreview
    onItemOpen={(item) => console.log('open', item.name)}
    renderActions={(item) => <Button label="Open" size="xs" layout="plain" />}
/>`;

const BasicUsage: React.FC = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [view, setView] = useState<FileBrowserView>('thumbnail');

    return (
        <>
            <ComponentDemo
                title="Files in thumbnail, list and details views"
                description="A selectable browser with file-kind icons, image/video thumbnails, inline video playback, per-item actions and full keyboard navigation. Toggle the view from the toolbar."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FileBrowser
                        items={sampleFiles}
                        view={view}
                        onViewChange={setView}
                        showViewSwitcher
                        selectedIds={selected}
                        onSelectionChange={setSelected}
                        videoPreview
                        renderActions={() => <Button label="Open" size="xs" layout="plain" />}
                    />
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            color: 'var(--eui-text)',
                        }}
                    >
                        View: <strong>{view}</strong> · Selected:{' '}
                        <strong>{selected.length ? selected.join(', ') : 'none'}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
