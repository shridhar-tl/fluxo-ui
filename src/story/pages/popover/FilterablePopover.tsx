import React, { useRef, useState } from 'react';
import { Button, Popover, TextInput } from '../../../components';
import { ListItem } from '../../../types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { fruitItems } from './popover-story-data';

const code = `const [filter, setFilter] = useState('');

<Popover
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  triggerElement={triggerRef.current}
  items={fruitItems}
  filter={filter}
  onSelect={(item) => {
    setSelected(item);
    setIsOpen(false);
  }}
  emptyMessage="No fruits match your search"
>
  <div style={{ padding: '8px' }}>
    <TextInput
      value={filter}
      onChange={setFilter}
      placeholder="Search fruits..."
    />
  </div>
</Popover>`;

const FilterablePopover: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<ListItem | null>(null);
    const [filter, setFilter] = useState('');
    const triggerRef = useRef<HTMLSpanElement>(null);

    const handleClose = () => {
        setIsOpen(false);
        setFilter('');
    };

    return (
        <>
            <ComponentDemo title="Filterable popover with children" description="Use the filter prop alongside children to render a search input above the list.">
                <div className="flex flex-col items-center gap-3">
                    <span ref={triggerRef}>
                        <Button variant="primary" layout="outlined" onClick={() => setIsOpen(!isOpen)}>
                            {selected ? selected.label : 'Search & select'}
                        </Button>
                    </span>
                    <Popover
                        isOpen={isOpen}
                        onClose={handleClose}
                        triggerElement={triggerRef.current}
                        items={fruitItems}
                        filter={filter}
                        onSelect={(item) => {
                            setSelected(item);
                            handleClose();
                        }}
                        selectedIndex={fruitItems.findIndex((i) => i.value === selected?.value)}
                        emptyMessage="No fruits match your search"
                        width="220px"
                    >
                        <div style={{ padding: '8px 8px 0' }}>
                            <TextInput value={filter} onChange={(e: any) => setFilter(e.value || e)} placeholder="Search fruits..." />
                        </div>
                    </Popover>
                    {selected && <span className="text-sm opacity-70">Selected: {selected.label}</span>}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default FilterablePopover;
