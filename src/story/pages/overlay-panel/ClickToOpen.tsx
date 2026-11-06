import React, { useRef, useState } from 'react';
import { Button, OverlayPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const [isOpen, setIsOpen] = useState(false);
const targetRef = useRef<HTMLSpanElement>(null);

<span ref={targetRef}>
  <Button onClick={() => setIsOpen((value) => !value)}>Show details</Button>
</span>
<OverlayPanel
  isOpen={isOpen}
  target={targetRef.current}
  onClose={() => setIsOpen(false)}
  title="Release 4.2"
>
  <p>Planned for 20 Nov. 12 of 15 issues are done.</p>
</OverlayPanel>`;

const ClickToOpen: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const targetRef = useRef<HTMLSpanElement>(null);

    return (
        <>
            <ComponentDemo title="Click to open" description="Anchored to the button. Closes with the close button, Escape or a click outside.">
                <span ref={targetRef}>
                    <Button onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen}>
                        Show details
                    </Button>
                </span>
                <OverlayPanel isOpen={isOpen} target={targetRef.current} onClose={() => setIsOpen(false)} title="Release 4.2">
                    <p style={{ margin: 0, color: 'var(--eui-text-muted)' }}>Planned for 20 Nov. 12 of 15 issues are done.</p>
                </OverlayPanel>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ClickToOpen;
