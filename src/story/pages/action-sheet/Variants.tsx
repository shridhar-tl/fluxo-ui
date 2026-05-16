import React, { useState } from 'react';
import { ActionSheet, Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const iosCode = `<ActionSheet
    open={open}
    onClose={close}
    variant="ios"
    actions={[
        { label: 'Reply', onSelect: reply },
        { label: 'Forward', onSelect: forward },
    ]}
/>`;

const materialCode = `<ActionSheet
    open={open}
    onClose={close}
    variant="material"
    title="Add new"
    actions={[
        { label: 'New folder', onSelect: ... },
        { label: 'New document', onSelect: ... },
    ]}
/>`;

const plainCode = `<ActionSheet
    open={open}
    onClose={close}
    variant="plain"
    actions={[
        { label: 'Mark as read', onSelect: ... },
        { label: 'Archive', onSelect: ... },
    ]}
/>`;

const Variants: React.FC = () => {
    const [ios, setIos] = useState(false);
    const [mat, setMat] = useState(false);
    const [plain, setPlain] = useState(false);

    return (
        <>
            <ComponentDemo title="iOS variant" description="Centered actions card with a separate cancel pill — the default.">
                <Button label="Open iOS sheet" onClick={() => setIos(true)} />
                <ActionSheet open={ios} onClose={() => setIos(false)} variant="ios" actions={[
                    { label: 'Reply' }, { label: 'Forward' }, { label: 'Mark as unread' },
                ]} />
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={iosCode} language="tsx" /></div>

            <ComponentDemo title="Material variant" description="Edge-to-edge bottom sheet with left-aligned rows." className="mt-4">
                <Button label="Open Material sheet" variant="secondary" onClick={() => setMat(true)} />
                <ActionSheet open={mat} onClose={() => setMat(false)} variant="material" title="Add new" actions={[
                    { label: 'New folder' }, { label: 'New document' }, { label: 'Upload file' },
                ]} />
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={materialCode} language="tsx" /></div>

            <ComponentDemo title="Plain variant" description="Merges the cancel button into the same card." className="mt-4">
                <Button label="Open plain sheet" variant="info" onClick={() => setPlain(true)} />
                <ActionSheet open={plain} onClose={() => setPlain(false)} variant="plain" actions={[
                    { label: 'Mark as read' }, { label: 'Archive' },
                ]} />
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={plainCode} language="tsx" /></div>
        </>
    );
};

export default Variants;
