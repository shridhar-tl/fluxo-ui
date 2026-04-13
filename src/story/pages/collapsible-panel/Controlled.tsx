import React, { useState } from 'react';
import { Button, CollapsiblePanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(!isOpen)}>
  {isOpen ? 'Collapse' : 'Expand'}
</Button>

<CollapsiblePanel
  title="Controlled Panel"
  open={isOpen}
  onToggle={setIsOpen}
>
  <p>Externally controlled open state.</p>
</CollapsiblePanel>`;

const Controlled: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <ComponentDemo title="Controlled Mode" centered={false}>
                <div className="space-y-3 w-full">
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? 'Collapse' : 'Expand'}
                        </Button>
                    </div>
                    <CollapsiblePanel
                        title="Controlled Panel"
                        subtitle="Open state is managed externally"
                        variant="elevated"
                        open={isOpen}
                        onToggle={setIsOpen}
                    >
                        <p className="text-sm leading-relaxed">
                            This panel is fully controlled — the <code className="font-mono text-xs">open</code> prop determines
                            whether it is expanded, and <code className="font-mono text-xs">onToggle</code> reports the requested
                            state change. You can still click the header to toggle, or use the external button above.
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

export default Controlled;
