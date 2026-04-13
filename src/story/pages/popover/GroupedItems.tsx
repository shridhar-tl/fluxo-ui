import React, { useRef, useState } from 'react';
import { Button, Popover } from '../../../components';
import { ListItem } from '../../../types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { allGroupItems, groupedItems } from './popover-story-data';

const code = `const groups = [
  {
    label: 'Fruits',
    items: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana' },
    ],
  },
  {
    label: 'Vegetables',
    items: [
      { label: 'Carrot', value: 'carrot' },
      { label: 'Broccoli', value: 'broccoli' },
    ],
  },
];

<Popover
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  triggerElement={triggerRef.current}
  items={allItems}
  groups={groups}
  onSelect={(item) => {
    setSelected(item);
    setIsOpen(false);
  }}
/>`;

const GroupedItems: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<ListItem | null>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);

    return (
        <>
            <ComponentDemo title="Grouped list items" description="Items organized into labeled groups with section headers.">
                <div className="flex flex-col items-center gap-3">
                    <span ref={triggerRef}>
                        <Button variant="primary" onClick={() => setIsOpen(!isOpen)}>
                            {selected ? selected.label : 'Select category item'}
                        </Button>
                    </span>
                    <Popover
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        triggerElement={triggerRef.current}
                        items={allGroupItems}
                        groups={groupedItems}
                        onSelect={(item) => {
                            setSelected(item);
                            setIsOpen(false);
                        }}
                        selectedIndex={allGroupItems.findIndex((i) => i.value === selected?.value)}
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

export default GroupedItems;
