import React, { useRef, useState } from 'react';
import { Button, Popover } from '../../../components';
import { ListItem } from '../../../types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { colorItems } from './popover-story-data';

const code = `const [isOpen, setIsOpen] = useState(false);
const triggerRef = useRef<HTMLButtonElement>(null);

<div className="flex gap-3">
  <Button ref={triggerRef} onClick={() => setIsOpen(true)}>
    Open Popover
  </Button>
  <Button variant="danger" layout="outlined"
    onClick={() => setIsOpen(false)}>
    Close Popover
  </Button>
</div>

<Popover
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  triggerElement={triggerRef.current}
  items={colorItems}
  onSelect={(item) => {
    setSelected(item);
    setIsOpen(false);
  }}
/>`;

const ControlledPopover: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<ListItem | null>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);

    return (
        <>
            <ComponentDemo title="Controlled open and close" description="Programmatically control the popover with separate open and close buttons.">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-3">
                        <span ref={triggerRef}>
                            <Button variant="primary" onClick={() => setIsOpen(true)}>
                                Open Popover
                            </Button>
                        </span>
                        <Button variant="danger" layout="outlined" onClick={() => setIsOpen(false)}>
                            Close Popover
                        </Button>
                    </div>
                    <Popover
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        triggerElement={triggerRef.current}
                        items={colorItems}
                        onSelect={(item) => {
                            setSelected(item);
                            setIsOpen(false);
                        }}
                        selectedIndex={colorItems.findIndex((i) => i.value === selected?.value)}
                    />
                    {selected && <span className="text-sm opacity-70">Selected: {selected.label}</span>}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ControlledPopover;
