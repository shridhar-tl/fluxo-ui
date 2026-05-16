import React, { useState } from 'react';
import { ActionSheet, Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<ActionSheet
    open={open}
    onClose={close}
    title="Account"
    actions={[
        { label: 'Switch account' },
        { label: 'Sign out', destructive: true, onSelect: signOut },
        { label: 'Delete account', destructive: true, disabled: true, description: 'Pending verification' },
    ]}
/>`;

const DestructiveStates: React.FC = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <ComponentDemo title="Destructive & disabled" description="Mark a single action as destructive for the danger color, disabled for non-interactive rows, and add a description for context.">
                <Button label="Open destructive sheet" variant="danger" onClick={() => setOpen(true)} />
                <ActionSheet open={open} onClose={() => setOpen(false)} title="Account" actions={[
                    { label: 'Switch account' },
                    { label: 'Sign out', destructive: true },
                    { label: 'Delete account', destructive: true, disabled: true, description: 'Pending verification' },
                ]} />
            </ComponentDemo>
            <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
        </>
    );
};

export default DestructiveStates;
