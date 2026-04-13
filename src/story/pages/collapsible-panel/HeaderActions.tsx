import React, { useState } from 'react';
import { Button, CollapsiblePanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CollapsiblePanel
  title="Notifications"
  headerActions={<Button size="xs" onClick={handleClear}>Clear All</Button>}
>
  ...
</CollapsiblePanel>`;

const HeaderActions: React.FC = () => {
    const [count, setCount] = useState(5);

    return (
        <>
            <ComponentDemo title="Header Actions" centered={false}>
                <div className="space-y-3 w-full">
                    <CollapsiblePanel
                        title="Notifications"
                        subtitle={`${count} unread`}
                        variant="bordered"
                        defaultOpen
                        headerActions={
                            <Button size="xs" layout="outlined" onClick={() => setCount(0)}>
                                Clear All
                            </Button>
                        }
                    >
                        <p className="text-sm leading-relaxed">
                            Header actions sit at the trailing edge of the header, next to the toggle indicator.
                            Clicking them does not toggle the panel — event propagation is stopped automatically.
                        </p>
                    </CollapsiblePanel>
                    <CollapsiblePanel
                        title="Deployment Logs"
                        variant="separated"
                        headerActions={
                            <div className="flex gap-2">
                                <Button size="xs" layout="plain">Refresh</Button>
                                <Button size="xs" layout="outlined">Download</Button>
                            </div>
                        }
                    >
                        <p className="text-sm leading-relaxed">
                            You can place any interactive element in the header actions slot — buttons, badges, switches, or custom controls.
                        </p>
                    </CollapsiblePanel>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default HeaderActions;
