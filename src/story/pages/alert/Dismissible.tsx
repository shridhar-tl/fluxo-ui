import React, { useCallback, useState } from 'react';

import { Alert, Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowStyle, stackStyle } from '../../demo-styles';
import { toastMessages } from './alert-story-data';

interface QueuedAlert {
    id: number;
    index: number;
}

const code = `const [open, setOpen] = useState(true);

<Alert type="success" title="Profile updated" closable open={open} onClose={() => setOpen(false)} />

<Alert type="info" title="Saved" autoClose={5000} pauseOnHover showProgress closable onClosed={remove} />

<Alert type="warning" title="Scheduled maintenance" closable closeLabel="Dismiss maintenance notice" defaultOpen restoreFocus={false} />`;

const Dismissible: React.FC = () => {
    const [open, setOpen] = useState(true);
    const [queue, setQueue] = useState<QueuedAlert[]>([]);
    const [nextId, setNextId] = useState(1);
    const [noticeKey, setNoticeKey] = useState(0);

    const push = useCallback(() => {
        setQueue((prev) => [...prev, { id: nextId, index: nextId % toastMessages.length }]);
        setNextId((n) => n + 1);
    }, [nextId]);

    const remove = useCallback((id: number) => setQueue((prev) => prev.filter((item) => item.id !== id)), []);

    return (
        <>
            <ComponentDemo title="Dismissible & Auto-close" description="Close manually, control visibility, or auto-dismiss with a progress bar that pauses on hover and focus.">
                <div style={stackStyle}>
                    <Alert
                        type="success"
                        variant="left-accent"
                        title="Profile updated"
                        description="Your changes are live across all devices."
                        closable
                        open={open}
                        onClose={() => setOpen(false)}
                    />
                    <div style={rowStyle}>
                        <Button label={open ? 'Hide alert' : 'Show alert'} size="sm" layout="outlined" onClick={() => setOpen((v) => !v)} />
                        <Button label="Push auto-closing alert" size="sm" variant="primary" onClick={push} />
                    </div>
                    <Alert
                        key={noticeKey}
                        type="warning"
                        variant="soft"
                        title="Scheduled maintenance"
                        description="Uncontrolled: it hides itself when dismissed. Sunday 02:00–03:00 UTC."
                        closable
                        closeLabel="Dismiss maintenance notice"
                        defaultOpen
                        restoreFocus={false}
                    />
                    <div style={rowStyle}>
                        <Button label="Restore maintenance notice" size="sm" layout="plain" onClick={() => setNoticeKey((k) => k + 1)} />
                    </div>
                    {queue.map((item) => {
                        const message = toastMessages[item.index];
                        return (
                            <Alert
                                key={item.id}
                                type={message.type}
                                variant="soft"
                                size="sm"
                                elevated
                                title={message.title}
                                description="This alert closes itself after 5 seconds."
                                autoClose={5000}
                                closable
                                onClosed={() => remove(item.id)}
                            />
                        );
                    })}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Dismissible;
