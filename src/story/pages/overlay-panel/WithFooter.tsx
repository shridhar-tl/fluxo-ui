import React, { useRef, useState } from 'react';
import { Button, Checkbox, OverlayPanel } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<OverlayPanel
  isOpen={isOpen}
  target={targetRef.current}
  onClose={() => setIsOpen(false)}
  title="Columns"
  width={240}
  placement="bottomLeft"
  footer={<Button size="sm" onClick={() => setIsOpen(false)}>Apply</Button>}
>
  <Checkbox label="Assignee" checked={assignee} onChange={(e) => setAssignee(e.value)} />
  <Checkbox label="Due date" checked={dueDate} onChange={(e) => setDueDate(e.value)} />
</OverlayPanel>`;

const WithFooter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [assignee, setAssignee] = useState(true);
    const [dueDate, setDueDate] = useState(false);
    const targetRef = useRef<HTMLSpanElement>(null);

    return (
        <>
            <ComponentDemo title="Footer actions" description="Use the footer for actions and placement to align the panel with the target.">
                <span ref={targetRef}>
                    <Button layout="outlined" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen}>
                        Choose columns
                    </Button>
                </span>
                <OverlayPanel
                    isOpen={isOpen}
                    target={targetRef.current}
                    onClose={() => setIsOpen(false)}
                    title="Columns"
                    width={240}
                    placement="bottomLeft"
                    footer={
                        <Button size="sm" onClick={() => setIsOpen(false)}>
                            Apply
                        </Button>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Checkbox label="Assignee" checked={assignee} onChange={(e) => setAssignee(e.value)} />
                        <Checkbox label="Due date" checked={dueDate} onChange={(e) => setDueDate(e.value)} />
                    </div>
                </OverlayPanel>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default WithFooter;
