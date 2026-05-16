import React, { useState } from 'react';
import { ActionSheet, Button } from '../../../components';
import { CopyIcon, DownloadIcon, ShareIcon, TrashIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ActionSheet
    open={open}
    onClose={close}
    actions={[
        { label: 'Share', icon: <ShareIcon /> },
        { label: 'Copy link', icon: <CopyIcon /> },
        { label: 'Download', icon: <DownloadIcon /> },
        { label: 'Delete', icon: <TrashIcon />, destructive: true },
    ]}
/>`;

const WithIcons: React.FC = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <ComponentDemo title="Actions with icons" description="Pair each label with an icon — works for all variants.">
                <Button label="Open with icons" variant="secondary" onClick={() => setOpen(true)} />
                <ActionSheet open={open} onClose={() => setOpen(false)} variant="material" title="Photo" actions={[
                    { label: 'Share', icon: <ShareIcon /> },
                    { label: 'Copy link', icon: <CopyIcon /> },
                    { label: 'Download', icon: <DownloadIcon /> },
                    { label: 'Delete', icon: <TrashIcon />, destructive: true },
                ]} />
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default WithIcons;
