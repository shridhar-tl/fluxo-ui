import React, { useRef, useState } from 'react';
import { Button, Popover } from '../../../components';
import { ListItem } from '../../../types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { fruitItems } from './popover-story-data';

const code = `const [isOpen, setIsOpen] = useState(false);
const [selected, setSelected] = useState<ListItem | null>(null);
const triggerRef = useRef<HTMLButtonElement>(null);

<Button ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
  {selected ? selected.label : 'Pick a fruit'}
</Button>

<Popover
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  triggerElement={triggerRef.current}
  items={fruitItems}
  onSelect={(item) => {
    setSelected(item);
    setIsOpen(false);
  }}
  selectedIndex={fruitItems.findIndex(
    (i) => i.value === selected?.value
  )}
/>`;

const BasicUsage: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<ListItem | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            <ComponentDemo title="Simple popover with selectable items" description="Click the button to open a popover list and select an item.">
                <div className="flex flex-col items-center gap-3">
                    <span ref={triggerRef}>
                        <Button onClick={() => setIsOpen(!isOpen)}>
                            {selected ? selected.label : 'Pick a fruit'}
                        </Button>
                    </span>
                    <Popover
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        triggerElement={triggerRef.current}
                        items={fruitItems}
                        onSelect={(item) => {
                            setSelected(item);
                            setIsOpen(false);
                        }}
                        selectedIndex={fruitItems.findIndex((i) => i.value === selected?.value)}
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

export default BasicUsage;
